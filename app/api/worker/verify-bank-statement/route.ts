import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001';

/**
 * Proxy to worker POST /verify-bank-statement.
 * Call this from the frontend (same origin) to avoid CORS and invalid worker URL in the browser.
 */
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
          details: parseError instanceof Error ? parseError.message : 'Unknown',
        },
        { status: 400 }
      );
    }

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'A PDF file is required. Use form field name "file".' },
        { status: 400 }
      );
    }

    console.log(`Verifying bank statement via worker: ${WORKER_API_URL}/verify-bank-statement`);

    const workerFormData = new FormData();
    workerFormData.append('file', file);

    let response: Response;
    try {
      response = await fetch(`${WORKER_API_URL}/verify-bank-statement`, {
        method: 'POST',
        body: workerFormData,
      });
    } catch (fetchError) {
      console.error('Error calling worker verify-bank-statement:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to worker service',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown',
          workerUrl: WORKER_API_URL,
        },
        { status: 503 }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Worker returned non-JSON:', text.substring(0, 200));
      return NextResponse.json(
        {
          success: false,
          error: 'Worker service returned non-JSON response',
          details: `Status: ${response.status}`,
        },
        { status: 500 }
      );
    }

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.detail || `Worker error: ${response.status}`,
          data: result,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error('Verify bank statement error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify bank statement',
        details: message,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
