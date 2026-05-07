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
  console.log(`[BankVerif] ▶ Starting for supplier ${supplierId}`)

  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { id: true, supplierCode: true, airtableData: true },
  })

  if (!supplier) {
    console.error(`[BankVerif] ✗ Supplier not found: ${supplierId}`)
    return { success: false, error: 'Supplier not found' }
  }
  console.log(`[BankVerif] ✓ Supplier found: ${supplier.supplierCode}`)

  const airtableData = supplier.airtableData as any
  if (!airtableData?.allVersions?.length) {
    console.error(`[BankVerif] ✗ No allVersions in airtableData`)
    return { success: false, error: 'No document versions available' }
  }

  const latestVersion = airtableData.allVersions[airtableData.allVersions.length - 1]
  console.log(`[BankVerif] ✓ Latest version: ${latestVersion.version}, uploadedFiles keys: ${Object.keys(latestVersion.uploadedFiles || {}).join(', ')}`)

  const bankFiles = latestVersion.uploadedFiles?.bankConfirmation
  if (!Array.isArray(bankFiles) || bankFiles.length === 0) {
    console.error(`[BankVerif] ✗ No bankConfirmation files in latest version`)
    return { success: false, error: 'No bank confirmation document to verify' }
  }
  console.log(`[BankVerif] ✓ Bank files found: ${bankFiles.join(', ')}`)

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
  console.log(`[BankVerif] ✓ Checking file path: ${filePath}`)
  if (!existsSync(filePath)) {
    console.error(`[BankVerif] ✗ File not found at path: ${filePath}`)
    return { success: false, error: `Document not found at expected path: ${filePath}` }
  }
  console.log(`[BankVerif] ✓ File exists, reading...`)

  const buffer = await readFile(filePath)
  const formData = new FormData()
  formData.append('file', new Blob([buffer], { type: 'application/pdf' }), fileName)

  console.log(`[BankVerif] → Calling worker at ${WORKER_API_URL}/verify-bank-statement (file: ${fileName}, ${buffer.length} bytes)`)
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
  console.log(`[BankVerif] ← Worker responded with status ${verifyRes.status}`)

  if (!verifyRes.ok) {
    const errText = await verifyRes.text()
    console.error(`[BankVerif] ✗ Worker error: ${verifyRes.status} - ${errText.slice(0, 200)}`)
    return { success: false, error: `Worker verification failed: ${verifyRes.status} - ${errText.slice(0, 200)}` }
  }

  const verifyData = await verifyRes.json()
  console.log(`[BankVerif] ✓ Worker returned result, saving to DB...`)
  await prisma.bankVerification.create({
    data: { supplierId: supplier.id, result: verifyData as any },
  })
  console.log(`[BankVerif] ✅ Complete for supplier ${supplier.supplierCode}`)

  return { success: true, data: verifyData }
}
