import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { supplierCode: string; filename: string } }
) {
  try {
    const { supplierCode, filename } = params

    console.log('📄 Signed Credit Application request:', { supplierCode, filename })

    // Build file path: data/uploads/suppliers/SUP-XXX/signedCreditApplication/filename
    const filePath = join(
      process.cwd(),
      'data',
      'uploads',
      'suppliers',
      supplierCode,
      'signedCreditApplication',
      filename
    )

    console.log('🔍 Looking for file at:', filePath)

    // Check if file exists
    if (!existsSync(filePath)) {
      console.error('❌ File not found at:', filePath)
      return NextResponse.json(
        { success: false, error: 'File not found', path: filePath },
        { status: 404 }
      )
    }

    console.log('✅ File found, serving...')

    // Read file
    const fileBuffer = await readFile(filePath)

    // Return PDF file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Error serving signed credit application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to serve file' },
      { status: 500 }
    )
  }
}

