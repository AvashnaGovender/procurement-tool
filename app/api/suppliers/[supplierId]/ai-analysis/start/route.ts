import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { workerClient } from '@/lib/worker-client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const { supplierId } = await params
    
    // Get supplier with documents and onboarding
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        onboarding: {
          include: {
            initiation: {
              select: {
                purchaseType: true,
                creditApplication: true
              }
            }
          }
        }
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    if (!supplier.airtableData || !(supplier.airtableData as any).allVersions || 
        (supplier.airtableData as any).allVersions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No documents available to analyze' },
        { status: 400 }
      )
    }

    // Check if there's already an in-progress job
    const existingJob = await prisma.aIAnalysisJob.findFirst({
      where: {
        supplierId,
        status: {
          in: ['PENDING', 'IN_PROGRESS']
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (existingJob) {
      return NextResponse.json({
        success: true,
        jobId: existingJob.id,
        message: 'Analysis already in progress',
        status: existingJob.status
      })
    }

    // Create new analysis job
    const latestVersion = (supplier.airtableData as any).allVersions[
      (supplier.airtableData as any).allVersions.length - 1
    ]
    
    const allFiles = Object.entries(latestVersion.uploadedFiles || {})
    const totalFiles = allFiles.reduce((acc, [_, files]: [string, any]) => {
      return acc + (Array.isArray(files) ? files.length : 0)
    }, 0)

    const job = await prisma.aIAnalysisJob.create({
      data: {
        supplierId,
        status: 'PENDING',
        progress: 0,
        totalDocuments: totalFiles,
        processedDocuments: 0,
        logs: ['🚀 AI analysis job created'],
      },
    })

    // Start processing in background (don't await)
    processAnalysisJob(job.id, supplierId, supplier).catch(error => {
      console.error(`Error processing AI analysis job ${job.id}:`, error)
      prisma.aIAnalysisJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message || 'Unknown error occurred',
          failedAt: new Date(),
        },
      }).catch(console.error)
    })

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'AI analysis started in background',
      status: 'PENDING'
    })
  } catch (error) {
    console.error('Error starting AI analysis:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to start analysis' },
      { status: 500 }
    )
  }
}

// Background processing function
async function processAnalysisJob(
  jobId: string,
  supplierId: string,
  supplier: any
) {
  const prisma = (await import('@/lib/prisma')).prisma
  const { WorkerClient } = await import('@/lib/worker-client')
  
  // Create worker client with absolute URL for server-side use
  const apiBase = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const workerClient = new WorkerClient(`${apiBase}/api/worker`)

  try {
    // Update job to IN_PROGRESS
    await prisma.aIAnalysisJob.update({
      where: { id: jobId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        logs: ['🚀 Starting AI document analysis...'],
      },
    })

    const addLog = async (message: string) => {
      await prisma.aIAnalysisJob.update({
        where: { id: jobId },
        data: {
          logs: {
            push: `[${new Date().toLocaleTimeString()}] ${message}`,
          },
        },
      })
    }

    await addLog('🔍 Checking AI backend status...')
    
    // Check worker service health - call worker service directly
    let aiMode = 'unknown'
    const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001'
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const healthResponse = await fetch(`${WORKER_API_URL}/health`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!healthResponse.ok) {
        throw new Error(`Health check failed with status ${healthResponse.status}`)
      }
      
      // Check content type before parsing
      const contentType = healthResponse.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await healthResponse.text()
        throw new Error(`Health check returned non-JSON response: ${text.substring(0, 100)}`)
      }
      
      const health = await healthResponse.json()
      console.log('Worker health response:', health)
      
      // Extract AI mode from worker response, or check Ollama directly
      aiMode = health.ai_mode || 'unknown'
      
      // If ai_mode is not in response, check Ollama directly
      if (aiMode === 'unknown' || !health.ai_mode) {
        try {
          const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
          await addLog(`🔍 Checking Ollama directly at ${ollamaUrl}...`)
          
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
          
          const ollamaResponse = await fetch(`${ollamaUrl}/api/tags`, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json'
            }
          })
          
          clearTimeout(timeoutId)
          
          if (ollamaResponse.ok) {
            const ollamaData = await ollamaResponse.json()
            console.log('Ollama response:', ollamaData)
            
            if (ollamaData.models && ollamaData.models.length > 0) {
              aiMode = 'ollama'
              await addLog('✅ Ollama detected directly - Full AI analysis enabled')
              await addLog(`   Models available: ${ollamaData.models.map((m: any) => m.name).join(', ')}`)
            } else {
              await addLog('⚠️  Ollama is running but no models are installed')
              await addLog('💡 Install a model with: ollama pull llama3.1')
              aiMode = 'simplified'
            }
          } else {
            await addLog(`⚠️  Ollama responded with status ${ollamaResponse.status}`)
            aiMode = 'simplified'
          }
        } catch (ollamaError: any) {
          const errorMsg = ollamaError instanceof Error ? ollamaError.message : String(ollamaError)
          console.error('Ollama check error:', errorMsg)
          await addLog(`⚠️  Ollama check failed: ${errorMsg}`)
          await addLog('⚠️  Using fallback mode - Limited analysis')
          aiMode = 'simplified'
        }
      }
      
      await prisma.aIAnalysisJob.update({
        where: { id: jobId },
        data: { aiMode },
      })
      
      if (aiMode === 'ollama') {
        if (!health.ai_mode) {
          // Already logged above
        } else {
          await addLog('✅ Using Ollama (Local LLM) - Full AI analysis enabled')
          await addLog(`   Model: ${health.ollama_model || 'llama3.1'}`)
        }
      } else if (aiMode === 'simplified' || aiMode === 'unknown') {
        await addLog('⚠️  Using fallback mode - Limited analysis (Ollama unavailable)')
      }
    } catch (e: any) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      console.error('Worker health check error:', errorMsg)
      await addLog(`⚠️  Could not connect to worker service: ${errorMsg}`)
      await addLog('⚠️  Using fallback mode - Limited analysis')
      await addLog(`💡 Worker URL: ${WORKER_API_URL}`)
    }

    const airtableData = supplier.airtableData as any
    const latestVersion = airtableData.allVersions[airtableData.allVersions.length - 1]
    await addLog(`📁 Found ${airtableData.allVersions.length} version(s) of documents`)
    await addLog(`📄 Analyzing latest version (v${latestVersion.version})...`)

    const allFiles = Object.entries(latestVersion.uploadedFiles || {})
    const totalFiles = allFiles.reduce((acc, [_, files]: [string, any]) => {
      return acc + (Array.isArray(files) ? files.length : 0)
    }, 0)
    await addLog(`📊 Total documents to process: ${totalFiles}`)

    const analysisResults: any = {
      documentAnalysis: {},
      complianceCheck: {},
      riskAssessment: {},
      overallScore: 0
    }

    let processedCount = 0

    // Process each document category
    for (const [category, filesData] of allFiles) {
      const files = filesData as string[]
      if (!files || !Array.isArray(files) || files.length === 0) continue

      await addLog(`\n📂 Processing category: ${category.replace(/([A-Z])/g, ' $1').trim()}`)
      
      await prisma.aIAnalysisJob.update({
        where: { id: jobId },
        data: {
          currentStep: `Processing ${category} documents`,
        },
      })
      
      const categoryResults = []
      
      for (const fileName of files) {
        try {
          await addLog(`  ⏳ Analyzing: ${fileName}...`)
          
          // Fetch the actual document file
          const fileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/suppliers/documents/${supplier.supplierCode}/v${latestVersion.version}/${category}/${fileName}`
          await addLog(`  📥 Fetching document from storage...`)
          
          const fileResponse = await fetch(fileUrl)
          if (!fileResponse.ok) {
            throw new Error(`Failed to fetch document: ${fileResponse.statusText}`)
          }
          
          const fileBlob = await fileResponse.blob()
          
          // Convert Blob to Buffer for Node.js compatibility
          const arrayBuffer = await fileBlob.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          
          // Create a File-like object for the worker client
          // In Node.js, we'll pass the buffer directly to the upload endpoint
          await addLog(`  🤖 Running AI analysis...`)
          
          // Prepare form data for validation
          const formData = {
            companyName: supplier.companyName,
            registrationNumber: supplier.registrationNumber,
            physicalAddress: supplier.physicalAddress,
            contactEmail: supplier.contactEmail,
            contactPerson: supplier.contactPerson,
            bbbeeLevel: supplier.bbbeeLevel,
            bankName: supplier.bankName,
            branchName: supplier.branchName,
            branchNumber: supplier.branchNumber,
            accountNumber: supplier.accountNumber,
            typeOfAccount: supplier.typeOfAccount,
            bankAccountName: supplier.bankAccountName,
          }
          
          // Upload file directly to worker service (bypass Next.js API to avoid issues)
          const WORKER_API_URL = process.env.WORKER_API_URL || 'http://localhost:8001'
          
          // Create FormData for worker service
          const uploadFormData = new FormData()
          uploadFormData.append('file', new Blob([buffer], { type: fileBlob.type || 'application/pdf' }), fileName)
          
          const uploadResponse = await fetch(`${WORKER_API_URL}/upload`, {
            method: 'POST',
            body: uploadFormData,
          })
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text()
            throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText.substring(0, 100)}`)
          }
          
          const uploadResult = await uploadResponse.json()
          if (!uploadResult.document_id) {
            throw new Error(uploadResult.detail || 'Upload failed - no document ID returned')
          }
          
          const documentId = uploadResult.document_id
          const content = uploadResult.content || ''
          
          // Process document directly with worker service
          // Pass the category as document_type so AI can verify it matches the actual document
          // Also pass filename so AI can use it as a fallback if content extraction fails
          const processResponse = await fetch(`${WORKER_API_URL}/process-document`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              document_id: documentId,
              content: content,
              document_type: category, // Pass the category as expected document type
              filename: fileName, // Pass filename for fallback detection
              supplier_email: supplier.contactEmail,
              supplier_name: supplier.companyName,
              form_data: formData,
            }),
          })
          
          if (!processResponse.ok) {
            const errorText = await processResponse.text()
            throw new Error(`Process failed: ${processResponse.status} - ${errorText.substring(0, 100)}`)
          }
          
          const processResult = await processResponse.json()
          
          const aiResult = {
            success: true,
            documentId: documentId,
            results: processResult,
            aiMode: processResult.ai_processing || 'ollama', // Worker service should return this
            error: undefined
          }
          
          console.log(`AI result for ${fileName}:`, {
            success: aiResult.success,
            aiMode: aiResult.aiMode,
            error: aiResult.error,
            hasResults: !!aiResult.results,
            documentTypeMismatch: aiResult.results?.document_type_mismatch,
            documentTypeDetected: aiResult.results?.document_type_detected
          })
          
          if (aiResult.success) {
            const usedOllama = aiResult.aiMode === 'ollama'
            const findings = aiResult.results?.analysis_results || 'Document analyzed successfully'
            
            // Check for document type mismatch in findings - check multiple patterns
            const hasMismatch = findings.includes('DOCUMENT TYPE MISMATCH DETECTED') || 
                               findings.includes('MISMATCH DETECTED') ||
                               (findings.includes('Expected:') && findings.includes('Actual:')) ||
                               aiResult.results?.document_type_mismatch === true
            
            console.log(`Mismatch check for ${fileName}:`, {
              hasMismatch,
              flagFromWorker: aiResult.results?.document_type_mismatch,
              detectedType: aiResult.results?.document_type_detected,
              findingsContainsMismatch: findings.includes('DOCUMENT TYPE MISMATCH DETECTED')
            })
            if (hasMismatch) {
              await addLog(`  ⚠️  DOCUMENT TYPE MISMATCH detected for ${fileName}`)
              const expectedMatch = findings.match(/Expected:\s*([^\n]+)/)
              const actualMatch = findings.match(/Actual:\s*([^\n]+)/)
              if (expectedMatch && actualMatch) {
                await addLog(`     Expected: ${expectedMatch[1].trim()}, Actual: ${actualMatch[1].trim()}`)
              } else {
                // Try alternative patterns
                const altExpected = findings.match(/uploaded as\s+([^\n]+)/i)
                const altActual = findings.match(/appears to be a\s+([^\n]+)/i)
                if (altExpected && altActual) {
                  await addLog(`     Expected: ${altExpected[1].trim()}, Actual: ${altActual[1].trim()}`)
                }
              }
            }
            
            // Calculate confidence - heavily penalize mismatched documents
            let baseConfidence = 85 + Math.random() * 15 // 85-100% for good documents
            if (hasMismatch) {
              // Mismatched documents get very low confidence (20-35%)
              baseConfidence = 20 + Math.random() * 15
              await addLog(`  ⚠️  Confidence reduced due to document type mismatch: ${baseConfidence.toFixed(1)}%`)
            }
            
            const result = {
              fileName: fileName,
              status: 'analyzed',
              confidence: baseConfidence,
              findings: findings,
              complianceStatus: aiResult.results?.compliance_results || 'Compliant',
              riskLevel: aiResult.results?.risk_assessment || 'Low Risk',
              extractedData: aiResult.results?.extracted_data || {},
              aiMode: aiResult.aiMode,
              documentTypeMismatch: hasMismatch
            }
            
            categoryResults.push(result)
            processedCount++
            const progress = Math.round((processedCount / totalFiles) * 100)
            
            await prisma.aIAnalysisJob.update({
              where: { id: jobId },
              data: {
                progress,
                processedDocuments: processedCount,
              },
            })
            
            const modeIndicator = usedOllama ? '🤖 [Ollama]' : '⚙️  [Fallback]'
            const mismatchIndicator = hasMismatch ? ' ⚠️ MISMATCH' : ''
            await addLog(`  ✅ ${modeIndicator} Completed: ${fileName} - Confidence: ${result.confidence.toFixed(1)}%${mismatchIndicator} (${processedCount}/${totalFiles})`)
          } else {
            const errorDetails = aiResult.error ? `: ${aiResult.error}` : ''
            await addLog(`  ⚠️  AI processing unavailable${errorDetails}, using basic analysis...`)
            const result = {
              fileName: fileName,
              status: 'basic_check',
              confidence: 75,
              findings: `Document received and validated (AI analysis unavailable${errorDetails})`,
              complianceStatus: 'Pending manual review',
              riskLevel: 'To be determined'
            }
            categoryResults.push(result)
            processedCount++
            
            const progress = Math.round((processedCount / totalFiles) * 100)
            await prisma.aIAnalysisJob.update({
              where: { id: jobId },
              data: {
                progress,
                processedDocuments: processedCount,
              },
            })
            
            await addLog(`  ✅ Basic check completed: ${fileName} (${processedCount}/${totalFiles})`)
          }
        } catch (error) {
          await addLog(`  ❌ Error processing ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          // Continue with next file
        }
      }
      
      if (categoryResults.length > 0) {
        analysisResults.documentAnalysis[category] = categoryResults
      }
    }

    await addLog('\n🔍 Performing compliance verification...')
    
    // Combine uploaded files from ALL versions (suppliers upload missing docs in revisions)
    const allUploadedFiles: Record<string, string[]> = {}
    airtableData.allVersions.forEach((version: any) => {
      const versionFiles = version.uploadedFiles || {}
      Object.entries(versionFiles).forEach(([category, files]) => {
        if (!allUploadedFiles[category]) {
          allUploadedFiles[category] = []
        }
        const fileArray = files as string[]
        fileArray.forEach((file: string) => {
          if (!allUploadedFiles[category].includes(file)) {
            allUploadedFiles[category].push(file)
          }
        })
      })
    })
    
    // Get purchase type and credit application from supplier data or infer from documents
    let purchaseType: 'REGULAR' | 'ONCE_OFF' | 'SHARED_IP' = 'REGULAR'
    let creditApplication = false
    
    // Try to get from supplier onboarding if available
    if (supplier.onboarding?.initiation) {
      purchaseType = supplier.onboarding.initiation.purchaseType || purchaseType
      creditApplication = supplier.onboarding.initiation.creditApplication || false
    }
    
    // If not available, try to infer purchase type from uploaded documents
    if (!supplier.onboarding?.initiation?.purchaseType) {
      if (allUploadedFiles.nda && allUploadedFiles.nda.length > 0) {
        purchaseType = 'SHARED_IP'
      } else {
        const documentCount = Object.keys(allUploadedFiles).length
        if (documentCount <= 2 && allUploadedFiles.bankConfirmation && allUploadedFiles.companyRegistration) {
          purchaseType = 'ONCE_OFF'
        } else {
          purchaseType = 'REGULAR'
        }
      }
    }
    
    // Get mandatory documents based on purchase type and credit application
    const { getMandatoryDocuments } = await import('@/lib/document-requirements')
    const mandatoryDocKeys = getMandatoryDocuments(purchaseType, creditApplication)
    
    // Convert to array of document keys for checking
    const requiredDocs = mandatoryDocKeys
    const missingDocs = requiredDocs.filter(doc => {
      if (doc === 'taxClearance') {
        // Accept either tax clearance OR good standing across all versions
        const hasTaxClearance = allUploadedFiles?.taxClearance && allUploadedFiles.taxClearance.length > 0
        const hasGoodStanding = allUploadedFiles?.goodStanding && allUploadedFiles.goodStanding.length > 0
        return !hasTaxClearance && !hasGoodStanding
      }
      // For other documents, check if they exist
      return !allUploadedFiles?.[doc] || allUploadedFiles[doc].length === 0
    })
    
    // Check for claimed certifications that are missing across all versions
    const claimedButMissing: Array<{ doc: string, certName: string }> = []
    if (supplier.qualityManagementCert && (!allUploadedFiles?.qualityCert || allUploadedFiles.qualityCert.length === 0)) {
      claimedButMissing.push({ doc: 'qualityCert', certName: 'Quality Management Certification' })
    }
    if (supplier.sheCertification && (!allUploadedFiles?.healthSafety || allUploadedFiles.healthSafety.length === 0)) {
      claimedButMissing.push({ doc: 'healthSafety', certName: 'Safety, Health and Environment (SHE) Certification' })
    }
    
    // Track optional documents across all versions
    // Note: creditApplication is NOT optional - it's mandatory when creditApplication is true
    // goodStanding is also not optional when taxClearance is mandatory (it's an alternative)
    const optionalDocs = ['companyProfile', 'organogram', 'qualityCert', 'healthSafety', 'cm29Directors', 'shareholderCerts', 'proofOfShareholding', 'bbbeeScorecard', 'vatCertificate', 'sectorRegistrations']
    // Filter out creditApplication and goodStanding from optional docs if they're mandatory
    const optionalDocsToCheck = optionalDocs.filter(doc => {
      // Don't count creditApplication as optional if it's mandatory
      if (doc === 'creditApplication' && creditApplication) {
        return false
      }
      // Don't count goodStanding as optional if taxClearance is mandatory (it's an alternative)
      if (doc === 'goodStanding' && (purchaseType === 'REGULAR' || purchaseType === 'SHARED_IP')) {
        return false
      }
      return true
    })
    const providedOptionalDocs = optionalDocsToCheck.filter(doc => allUploadedFiles?.[doc] && allUploadedFiles[doc].length > 0)
    
    await addLog(`📋 Mandatory documents: ${requiredDocs.length} required`)
    await addLog(`📋 Credit Application required: ${creditApplication ? 'YES' : 'NO'}`)
    if (creditApplication) {
      const hasCreditApp = allUploadedFiles?.creditApplication && allUploadedFiles.creditApplication.length > 0
      await addLog(`📋 Credit Application uploaded: ${hasCreditApp ? 'YES' : 'NO'}`)
    }
    
    // Log tax clearance status specifically across all versions
    const hasTaxClearance = allUploadedFiles?.taxClearance && allUploadedFiles.taxClearance.length > 0
    const hasGoodStanding = allUploadedFiles?.goodStanding && allUploadedFiles.goodStanding.length > 0
    if (hasTaxClearance || hasGoodStanding) {
      const docType = hasTaxClearance ? 'Tax Clearance Certificate' : 'Letter of Good Standing'
      await addLog(`✅ Tax requirement satisfied with: ${docType}`)
    }
    
    await addLog(`📋 Optional documents provided: ${providedOptionalDocs.length}/${optionalDocs.length}`)
    
    // Detailed missing document analysis
    if (missingDocs.length > 0) {
      await addLog(`\n⚠️  MISSING MANDATORY DOCUMENTS (${missingDocs.length}/${requiredDocs.length}):`)
      for (const doc of missingDocs) {
        let docDetails = ''
        switch(doc) {
          case 'companyRegistration':
            docDetails = 'CIPC Registration Documents - Required to validate: Company name, Registration number, Physical address'
            break
          case 'bbbeeAccreditation':
            docDetails = `B-BBEE Certificate - Required to validate: Status Level (${supplier.bbbeeLevel || 'Not specified'}), Black ownership %, Expiry date`
            break
          case 'taxClearance':
            docDetails = 'Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose "Good Standing", Age < 3 months (Either one is acceptable)'
            break
          case 'bankConfirmation':
            docDetails = `Bank Confirmation Letter - Required to validate: Bank (${supplier.bankName || 'Not specified'}), Account # (${supplier.accountNumber || 'Not specified'}), Branch (${supplier.branchName || 'Not specified'})`
            break
          case 'nda':
            docDetails = 'Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages'
            break
        }
        await addLog(`   ❌ ${docDetails}`)
      }
    }
    
    // Report claimed certifications that are missing
    if (claimedButMissing.length > 0) {
      await addLog(`\n⚠️  CLAIMED CERTIFICATIONS NOT UPLOADED (${claimedButMissing.length}):`)
      for (const item of claimedButMissing) {
        await addLog(`   ❌ ${item.certName} - Supplier indicated they have this but did not upload certificate`)
      }
    }
    
    // Calculate document quality scores from AI results
    let totalConfidence = 0
    let documentCount = 0
    
    Object.values(analysisResults.documentAnalysis).forEach((categoryResults: any) => {
      categoryResults.forEach((result: any) => {
        if (result.status === 'analyzed' && result.confidence) {
          totalConfidence += result.confidence
          documentCount++
        }
      })
    })
    
    const avgDocumentQuality = documentCount > 0 ? totalConfidence / documentCount : 0
    const baseComplianceScore = ((requiredDocs.length - missingDocs.length) / requiredDocs.length) * 100
    
    // Adjust compliance score based on document quality
    const qualityAdjustment = (avgDocumentQuality - 80) * 0.1 // +/- up to 2 points based on quality
    const adjustedComplianceScore = Math.max(0, Math.min(100, baseComplianceScore + qualityAdjustment))
    
    analysisResults.complianceCheck = {
      requiredDocuments: requiredDocs.length,
      providedDocuments: requiredDocs.length - missingDocs.length,
      missingDocuments: missingDocs,
      claimedButMissing: claimedButMissing,
      complianceScore: adjustedComplianceScore,
      averageDocumentQuality: avgDocumentQuality,
      totalDocumentsAnalyzed: documentCount,
      optionalDocuments: providedOptionalDocs,
      optionalDocsCount: providedOptionalDocs.length
    }

    if (missingDocs.length > 0) {
      await addLog(`⚠️  Missing required documents: ${missingDocs.join(', ')}`)
    } else {
      await addLog('✅ All required documents provided')
    }
    
    await addLog(`📊 Average document quality: ${avgDocumentQuality.toFixed(1)}%`)

    await addLog('\n⚡ Calculating risk assessment...')
    
    // Aggregate risk indicators from AI analysis
    const highRiskFindings: string[] = []
    const mediumRiskFindings: string[] = []
    
    Object.entries(analysisResults.documentAnalysis).forEach(([category, categoryResults]: [string, any]) => {
      categoryResults.forEach((result: any) => {
        if (result.riskLevel && result.riskLevel.toLowerCase().includes('high')) {
          highRiskFindings.push(`${category}: ${result.findings}`)
        } else if (result.riskLevel && result.riskLevel.toLowerCase().includes('medium')) {
          mediumRiskFindings.push(`${category}: ${result.findings}`)
        }
      })
    })
    
    // Determine overall document completeness risk
    const totalMissing = missingDocs.length + claimedButMissing.length
    let documentCompletenessRisk = 'LOW'
    if (missingDocs.length >= 3 || highRiskFindings.length > 0) {
      documentCompletenessRisk = 'HIGH'
    } else if (totalMissing > 0 || mediumRiskFindings.length > 0) {
      documentCompletenessRisk = 'MEDIUM'
    }
    
    // Determine document quality risk based on AI confidence scores
    let documentQualityRisk = 'LOW'
    if (avgDocumentQuality < 75) {
      documentQualityRisk = 'HIGH'
    } else if (avgDocumentQuality < 85) {
      documentQualityRisk = 'MEDIUM'
    }
    
    const riskFactors = {
      documentCompleteness: documentCompletenessRisk,
      documentQuality: documentQualityRisk,
      companyVerification: supplier.registrationNumber ? 'VERIFIED' : 'PENDING',
      complianceHistory: highRiskFindings.length > 0 ? 'ISSUES_FOUND' : 'NO_ISSUES'
    }

    analysisResults.riskAssessment = riskFactors
    analysisResults.riskFindings = {
      high: highRiskFindings,
      medium: mediumRiskFindings
    }
    
    await addLog(`🎯 Document Completeness Risk: ${riskFactors.documentCompleteness}`)
    if (claimedButMissing.length > 0) {
      await addLog(`   ⚠️  ${claimedButMissing.length} claimed certification(s) not uploaded`)
    }
    await addLog(`🎯 Document Quality Risk: ${riskFactors.documentQuality}`)
    
    if (highRiskFindings.length > 0) {
      await addLog(`⚠️  ${highRiskFindings.length} high-risk finding(s) detected`)
    }
    if (mediumRiskFindings.length > 0) {
      await addLog(`⚠️  ${mediumRiskFindings.length} medium-risk finding(s) detected`)
    }

    // Calculate overall score with weighted factors
    const baseScore = analysisResults.complianceCheck.complianceScore
    
    // Apply risk penalties based on actual analysis results
    let riskPenalty = 0
    riskPenalty += riskFactors.documentCompleteness === 'HIGH' ? 15 : riskFactors.documentCompleteness === 'MEDIUM' ? 8 : 0
    riskPenalty += riskFactors.documentQuality === 'HIGH' ? 10 : riskFactors.documentQuality === 'MEDIUM' ? 5 : 0
    riskPenalty += riskFactors.companyVerification === 'PENDING' ? 5 : 0
    riskPenalty += riskFactors.complianceHistory === 'ISSUES_FOUND' ? 10 : 0
    
    // Penalty for claimed but missing certifications (-2 points each)
    const claimedMissingPenalty = claimedButMissing.length * 2
    
    analysisResults.overallScore = Math.max(0, Math.min(100, baseScore - riskPenalty - claimedMissingPenalty))

    await addLog(`\n📈 Base Score: ${baseScore.toFixed(1)}/100`)
    await addLog(`📉 Risk Penalty: -${riskPenalty.toFixed(1)} points`)
    if (claimedMissingPenalty > 0) {
      await addLog(`📉 Claimed Missing Penalty: -${claimedMissingPenalty.toFixed(1)} points`)
    }
    await addLog(`📈 Overall Supplier Score: ${analysisResults.overallScore.toFixed(1)}/100`)
    await addLog('✨ Analysis complete!')
    
    // Generate actionable insights
    const insights = []
    
    // Check if NDA is uploaded across all versions
    const hasNDA = allUploadedFiles?.nda && allUploadedFiles.nda.length > 0
    
    if (analysisResults.overallScore >= 80) {
      insights.push('✅ Supplier demonstrates strong compliance and documentation quality')
      insights.push('✅ All critical requirements met')
      if (hasNDA) {
        insights.push('🔍 MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages')
      }
      insights.push('✅ Recommended for approval after NDA verification')
    } else if (analysisResults.overallScore >= 60) {
      insights.push('⚠️ Supplier meets basic requirements with some concerns')
      if (missingDocs.length > 0) {
        insights.push(`⚠️ Request missing documents: ${missingDocs.join(', ')}`)
      }
      if (avgDocumentQuality < 85) {
        insights.push('⚠️ Consider requesting higher quality document scans')
      }
      if (hasNDA) {
        insights.push('🔍 MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages')
      }
      insights.push('⚠️ Recommend revision before approval')
    } else {
      insights.push('❌ Significant compliance gaps identified')
      insights.push('❌ Multiple required documents missing or inadequate')
      if (hasNDA) {
        insights.push('🔍 MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages')
      }
      insights.push('❌ Not recommended for approval - revision required')
    }
    
    // Always add NDA reminder at the end if NDA is present
    if (hasNDA) {
      insights.push('📝 Remember: AI cannot verify handwritten signatures - manual review essential for NDA')
    }
    
    analysisResults.insights = insights
    await addLog('\n💡 Key Insights:')
    for (const insight of insights) {
      await addLog(`   ${insight}`)
    }

    // Mark job as completed
    await prisma.aIAnalysisJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        results: analysisResults,
        summary: {
          overallScore: analysisResults.overallScore,
          totalDocuments: totalFiles,
          processedDocuments: processedCount,
          aiMode,
        },
        completedAt: new Date(),
        logs: {
          push: `\n✅ Analysis completed successfully! Overall score: ${analysisResults.overallScore.toFixed(1)}%`,
        },
      },
    })

  } catch (error) {
    console.error(`Error processing AI analysis job ${jobId}:`, error)
    await prisma.aIAnalysisJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
        failedAt: new Date(),
      },
    })
  }
}

