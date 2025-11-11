import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log(`Processing document via worker: ${WORKER_API_URL}/process-document`, {
      documentId: body.document_id,
      hasContent: !!body.content,
      hasFormData: !!body.form_data
    });
    
    // Forward the request to the worker service
    const response = await fetch(`${WORKER_API_URL}/process-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log(`Worker process response status: ${response.status}`);

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Worker service returned non-JSON:', text.substring(0, 200));
      return NextResponse.json(
        { 
          success: false, 
          error: 'Worker service returned non-JSON response',
          details: `Status: ${response.status}, Content-Type: ${contentType}`,
          responsePreview: text.substring(0, 200)
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(`Worker service error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    
    console.log('Worker service response:', {
      success: true,
      ai_processing: result.ai_processing,
      hasResults: !!result.analysis_results
    });
    
    return NextResponse.json({
      success: true,
      data: result,
      aiMode: result.ai_processing || 'unknown', // 'ollama', 'simplified', or 'full'
      ai_processing: result.ai_processing, // Also include for compatibility
    });
  } catch (error: any) {
    console.error('Worker process error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Always return JSON, never HTML
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process document',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}


