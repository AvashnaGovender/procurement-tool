import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplierCode: string; filename: string }> }
) {
  try {
    const { supplierCode, filename } = await params

    // Validate parameters
    if (!supplierCode || !filename) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Construct the file path
    const filePath = join(
      process.cwd(),
      'data',
      'uploads',
      'suppliers',
      supplierCode,
      'signedCreditApplication',
      filename
    )

    // Check if file exists
    if (!existsSync(filePath)) {
      console.error('Signed credit application file not found:', filePath)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Read the file
    const fileBuffer = await readFile(filePath)

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error downloading signed credit application:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
