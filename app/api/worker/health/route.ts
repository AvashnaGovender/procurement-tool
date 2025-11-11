import { NextRequest, NextResponse } from 'next/server'

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001'

export async function GET(request: NextRequest) {
  try {
    console.log(`Checking worker service health at: ${WORKER_API_URL}/health`)
    
    // Call worker service health check with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const workerResponse = await fetch(`${WORKER_API_URL}/health`, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!workerResponse.ok) {
      throw new Error(`Worker service unhealthy: ${workerResponse.status} ${workerResponse.statusText}`)
    }

    // Check content type to ensure we're getting JSON
    const contentType = workerResponse.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await workerResponse.text()
      console.error('Worker service returned non-JSON response:', text.substring(0, 200))
      throw new Error(`Worker service returned non-JSON response (content-type: ${contentType})`)
    }

    const health = await workerResponse.json()
    console.log('Worker health response:', health)

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

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isTimeout = error.name === 'AbortError' || errorMessage.includes('timeout')
    const isConnectionError = errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')
    
    console.error('Worker service health check failed:', {
      error: errorMessage,
      workerUrl: WORKER_API_URL,
      isTimeout,
      isConnectionError
    })
    
    return NextResponse.json(
      { 
        success: false,
        status: 'unhealthy',
        error: isTimeout 
          ? 'Worker service timeout - service may be slow or unreachable'
          : isConnectionError
          ? `Cannot connect to worker service at ${WORKER_API_URL} - check if Docker container is running`
          : `Worker service unavailable: ${errorMessage}`,
        worker_url: WORKER_API_URL,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

