import { NextRequest, NextResponse } from 'next/server';

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    
    // Forward the request to the worker service
    const response = await fetch(`${WORKER_API_URL}/status/${documentId}`, {
      method: 'GET',
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
    console.error('Worker status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get document status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}






