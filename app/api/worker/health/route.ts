import { NextRequest, NextResponse } from 'next/server'

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001'

export async function GET(request: NextRequest) {
  try {
    // Call worker service health check
    const workerResponse = await fetch(`${WORKER_API_URL}/health`)

    if (!workerResponse.ok) {
      throw new Error(`Worker service unhealthy: ${workerResponse.status}`)
    }

    const health = await workerResponse.json()

    return NextResponse.json({
      success: true,
      status: 'healthy',
      data: {
        ...health,
        ai_mode: health.ai_mode || 'unknown',
        ollama_model: health.ollama_model || null,
      },
      worker_service: health,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Worker service health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Worker service unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

