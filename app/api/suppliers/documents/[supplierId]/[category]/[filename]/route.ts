import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { supplierId: string; category: string; filename: string } }
) {
  try {
    const { supplierId, category, filename } = params

    // Construct file path
    const filePath = join(
      process.cwd(),
      'data',
      'uploads',
      'suppliers',
      supplierId,
      category,
      filename
    )

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

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
      case 'doc':
        contentType = 'application/msword'
        break
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
    }

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to serve file' },
      { status: 500 }
    )
  }
}

