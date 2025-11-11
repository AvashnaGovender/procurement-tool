/**
 * Client for interacting with the worker service
 */

export interface UploadResponse {
  success: boolean;
  data?: {
    document_id: string;
    filename: string;
    content: string;
    status: string;
  };
  error?: string;
}

export interface ProcessResponse {
  success: boolean;
  data?: {
    document_id: string;
    analysis_results: string;
    compliance_results: string;
    risk_assessment: string;
    decision_summary: string;
  };
  error?: string;
}

export interface StatusResponse {
  success: boolean;
  data?: {
    document_id: string;
    status: string;
    progress: number;
    message: string;
  };
  error?: string;
}

export class WorkerClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // If baseUrl is provided, use it. Otherwise, determine based on environment
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else {
      // Server-side: use absolute URL, client-side: use relative URL
      if (typeof window === 'undefined') {
        // Server-side: use environment variable or default to localhost
        const apiBase = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        this.baseUrl = `${apiBase}/api/worker`;
      } else {
        // Client-side: use relative URL
        this.baseUrl = '/api/worker';
      }
    }
  }

  /**
   * Upload a document to the worker service
   */
  async uploadDocument(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response from upload:', text.substring(0, 200))
        return {
          success: false,
          error: `Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}`,
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        return {
          success: false,
          error: errorData.error || `Upload failed with status ${response.status}`,
        }
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Process a document with AI analysis
   */
  async processDocument(
    documentId: string, 
    content: string, 
    supplierEmail?: string, 
    supplierName?: string,
    formData?: any
  ): Promise<ProcessResponse & { aiMode?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: documentId,
          content: content,
          supplier_email: supplierEmail,
          supplier_name: supplierName,
          form_data: formData || {},
        }),
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response from process:', text.substring(0, 200))
        return {
          success: false,
          error: `Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}`,
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        return {
          success: false,
          error: errorData.error || errorData.details || `Processing failed with status ${response.status}`,
        }
      }

      const result = await response.json();
      
      // Extract AI mode from result
      return {
        ...result,
        aiMode: result.aiMode || result.data?.ai_processing || 'unknown'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed',
      };
    }
  }

  /**
   * Get the processing status of a document
   */
  async getStatus(documentId: string): Promise<StatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/document/${documentId}?action=status`);
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed',
      };
    }
  }

  /**
   * Get the processing results of a document
   */
  async getResults(documentId: string): Promise<ProcessResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/document/${documentId}?action=results`);
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Results fetch failed',
      };
    }
  }

  /**
   * Complete workflow: upload, process, and get results
   */
  async processDocumentWorkflow(file: File, supplierEmail?: string, supplierName?: string, formData?: any): Promise<{
    success: boolean;
    documentId?: string;
    results?: any;
    error?: string;
    aiMode?: string;
  }> {
    try {
      // Step 1: Upload document
      const uploadResult = await this.uploadDocument(file);
      if (!uploadResult.success || !uploadResult.data) {
        return {
          success: false,
          error: uploadResult.error || 'Upload failed',
        };
      }

      const documentId = uploadResult.data.document_id;

      // Step 2: Process document with form data
      const processResult = await this.processDocument(
        documentId,
        uploadResult.data.content,
        supplierEmail,
        supplierName,
        formData
      );
      
      if (!processResult.success) {
        return {
          success: false,
          error: processResult.error || 'Processing failed',
        };
      }

      // For this implementation, results are returned immediately
      // Extract AI mode from process result
      const aiMode = processResult.aiMode || (processResult.data as any)?.ai_processing || 'unknown';
      
      console.log('Worker response:', { aiMode, processResult });
      
      return {
        success: true,
        documentId,
        results: processResult.data,
        aiMode: aiMode,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow failed',
      };
    }
  }
}

// Export a default instance
export const workerClient = new WorkerClient();
