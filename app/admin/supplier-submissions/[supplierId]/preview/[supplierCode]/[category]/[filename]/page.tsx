"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Download } from "lucide-react"

export default function DocumentPreviewPage({ 
  params 
}: { 
  params: Promise<{ supplierId: string; supplierCode: string; category: string; filename: string }> 
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { supplierCode, category, filename } = resolvedParams

  // Decode the filename in case it has special characters
  const decodedFilename = decodeURIComponent(filename)
  const fileUrl = `/api/suppliers/documents/${supplierCode}/${category}/${decodedFilename}`
  
  // Determine file type
  const fileExt = decodedFilename.toLowerCase().split('.').pop()
  const isPdf = fileExt === 'pdf'
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
            {decodedFilename}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(fileUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const link = document.createElement('a')
              link.href = fileUrl
              link.download = decodedFilename
              link.click()
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        {isPdf ? (
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            title={decodedFilename}
          />
        ) : isImage ? (
          <div className="w-full h-full flex items-center justify-center p-8">
            <img
              src={fileUrl}
              alt={decodedFilename}
              className="max-w-full max-h-full object-contain shadow-2xl rounded"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Preview not available for this file type</p>
              <Button
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

