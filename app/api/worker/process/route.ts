import { NextRequest, NextResponse } from 'next/server';

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the worker service
    const response = await fetch(`${WORKER_API_URL}/process-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Worker service error: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('Worker service response:', result);
    
    return NextResponse.json({
      success: true,
      data: result,
      aiMode: result.ai_processing || 'unknown', // 'ollama', 'simplified', or 'full'
      ai_processing: result.ai_processing, // Also include for compatibility
    });
  } catch (error) {
    console.error('Worker process error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


