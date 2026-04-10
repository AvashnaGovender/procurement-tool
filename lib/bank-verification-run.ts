import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001'
const WORKER_FETCH_TIMEOUT_MS = 400_000

/**
 * Runs bank statement verification for a supplier (first bank confirmation doc)
 * and saves the result. Used by the run API route and by the submit route
 * to trigger verification immediately when docs are received.
 */
export async function runBankVerification(supplierId: string): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { id: true, supplierCode: true, airtableData: true },
  })

  if (!supplier) {
    return { success: false, error: 'Supplier not found' }
  }

  const airtableData = supplier.airtableData as any
  if (!airtableData?.allVersions?.length) {
    return { success: false, error: 'No document versions available' }
  }

  const latestVersion = airtableData.allVersions[airtableData.allVersions.length - 1]
  const bankFiles = latestVersion.uploadedFiles?.bankConfirmation
  if (!Array.isArray(bankFiles) || bankFiles.length === 0) {
    return { success: false, error: 'No bank confirmation document to verify' }
  }

  const fileName = bankFiles[0]
  const filePath = join(
    process.cwd(),
    'data',
    'uploads',
    'suppliers',
    supplier.supplierCode,
    `v${latestVersion.version}`,
    'bankConfirmation',
    fileName
  )
  if (!existsSync(filePath)) {
    return { success: false, error: 'Document not found at expected path' }
  }

  const buffer = await readFile(filePath)
  const formData = new FormData()
  formData.append('file', new Blob([buffer], { type: 'application/pdf' }), fileName)

  const { fetch: undiciFetch, Agent } = await import('undici')
  const agent = new Agent({
    headersTimeout: WORKER_FETCH_TIMEOUT_MS,
    bodyTimeout: WORKER_FETCH_TIMEOUT_MS,
  })
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), WORKER_FETCH_TIMEOUT_MS)
  let verifyRes: Response
  try {
    verifyRes = await undiciFetch(`${WORKER_API_URL}/verify-bank-statement`, {
      method: 'POST',
      body: formData,
      dispatcher: agent,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!verifyRes.ok) {
    const errText = await verifyRes.text()
    return { success: false, error: `Worker verification failed: ${verifyRes.status} - ${errText.slice(0, 200)}` }
  }

  const verifyData = await verifyRes.json()
  await prisma.bankVerification.create({
    data: { supplierId: supplier.id, result: verifyData as any },
  })

  return { success: true, data: verifyData }
}
