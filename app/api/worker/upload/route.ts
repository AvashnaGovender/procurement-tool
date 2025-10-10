import { NextRequest, NextResponse } from 'next/server';

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Forward the request to the worker service
    const response = await fetch(`${WORKER_API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Worker service error: ${response.status}`);
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Worker upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload document to worker service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


