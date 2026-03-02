import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

function trimSmtpConfig(obj: Record<string, unknown>): Record<string, unknown> {
  const out = { ...obj }
  for (const key of ['host', 'user', 'pass', 'fromEmail', 'companyName', 'companyWebsite']) {
    if (typeof out[key] === 'string') out[key] = (out[key] as string).trim()
  }
  return out
}

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'data', 'smtp-config.json')
    const configData = await fs.readFile(configPath, 'utf8')
    const config = trimSmtpConfig(JSON.parse(configData)) as Record<string, unknown>
    
    return NextResponse.json({
      success: true,
      config
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
    const trimmed = trimSmtpConfig(body as Record<string, unknown>)
    
    await fs.writeFile(configPath, JSON.stringify(trimmed, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving SMTP config:', error)
    return NextResponse.json(
      { error: 'Failed to save SMTP configuration' },
      { status: 500 }
    )
  }
}
