import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'data', 'smtp-config.json')
    const configData = await fs.readFile(configPath, 'utf8')
    const config = JSON.parse(configData)
    
    return NextResponse.json({
      success: true,
      config: config
    })
  } catch (error) {
    console.error('Error loading SMTP config:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load SMTP configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const configPath = path.join(process.cwd(), 'data', 'smtp-config.json')
    
    await fs.writeFile(configPath, JSON.stringify(body, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving SMTP config:', error)
    return NextResponse.json(
      { error: 'Failed to save SMTP configuration' },
      { status: 500 }
    )
  }
}
