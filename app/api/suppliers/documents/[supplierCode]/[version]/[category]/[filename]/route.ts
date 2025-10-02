import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { supplierCode: string; version: string; category: string; filename: string } }
) {
  try {
    const { supplierCode, version, category, filename } = params

    console.log('📄 Document request:', { supplierCode, version, category, filename })

    // Build file path: data/uploads/suppliers/SUP-XXX/v1/category/filename
    const filePath = join(
      process.cwd(),
      'data',
      'uploads',
      'suppliers',
      supplierCode,
      version,
      category,
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

    // Determine content type based on file extension
    const ext = filename.toLowerCase().split('.').pop()
    let contentType = 'application/octet-stream'

    switch (ext) {
      case 'pdf':
        contentType = 'application/pdf'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'doc':
        contentType = 'application/msword'
        break
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
      case 'xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        break
      case 'xls':
        contentType = 'application/vnd.ms-excel'
        break
    }

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to serve file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

