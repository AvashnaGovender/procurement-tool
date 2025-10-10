import { NextRequest, NextResponse } from 'next/server';

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001';

// Handle both status and results for a document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'status';
    
    let endpoint = '';
    if (action === 'status') {
      endpoint = `${WORKER_API_URL}/status/${documentId}`;
    } else if (action === 'results') {
      endpoint = `${WORKER_API_URL}/results/${documentId}`;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use ?action=status or ?action=results' },
        { status: 400 }
      );
    }
    
    // Forward the request to the worker service
    const response = await fetch(endpoint, {
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
    console.error('Worker document error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get document information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
