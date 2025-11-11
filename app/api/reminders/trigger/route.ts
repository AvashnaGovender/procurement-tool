import { NextRequest, NextResponse } from 'next/server'

// This endpoint can be called by external cron services (like cron-job.org, EasyCron, etc.)
// Or by Vercel Cron (if deployed to Vercel)
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication token for security
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET || 'change-me-in-production'
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🕐 Cron job triggered - checking reminders...')

    // Call the reminder check endpoint
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/reminders/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Reminder check triggered successfully',
      results: data.results
    })

  } catch (error) {
    console.error('❌ Error triggering reminder check:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to trigger reminder check' },
      { status: 500 }
    )
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
}

