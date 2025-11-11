import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      console.error('Error parsing form data:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse form data',
          details: parseError instanceof Error ? parseError.message : 'Unknown error'
        },
        { status: 400 }
      );
    }
    
    console.log(`Uploading to worker service: ${WORKER_API_URL}/upload`);
    
    // Forward the request to the worker service
    let response: Response;
    try {
      response = await fetch(`${WORKER_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
    } catch (fetchError) {
      console.error('Error calling worker service:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to connect to worker service',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown error',
          workerUrl: WORKER_API_URL
        },
        { status: 503 }
      );
    }

    console.log(`Worker upload response status: ${response.status}`);

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
    console.log('Worker upload success:', { documentId: result.document_id });
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Worker upload error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Always return JSON, never HTML
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload document to worker service',
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






