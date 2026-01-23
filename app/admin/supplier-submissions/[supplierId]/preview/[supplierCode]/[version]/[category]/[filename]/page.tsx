"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Download } from "lucide-react"

export default function DocumentPreviewPage({ 
  params 
}: { 
  params: Promise<{ supplierId: string; supplierCode: string; version: string; category: string; filename: string }> 
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { supplierCode, version, category, filename } = resolvedParams

  // Decode the filename in case it has special characters
  const decodedFilename = decodeURIComponent(filename)
  const fileUrl = `/api/suppliers/documents/${supplierCode}/${version}/${category}/${decodedFilename}`
  
  // Determine file type
  const fileExt = decodedFilename.toLowerCase().split('.').pop()
  const isPdf = fileExt === 'pdf'
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate max-w-md">
            {decodedFilename}
          </h1>
          <span className="text-xs text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {version.toUpperCase()}
          </span>
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
            asChild
          >
            <a href={fileUrl} download={decodedFilename}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-6">
        {isPdf ? (
          <iframe
            src={fileUrl}
            className="w-full h-full border-0 bg-white rounded shadow-lg"
            title={decodedFilename}
          />
        ) : isImage ? (
          <div className="max-w-full max-h-full flex items-center justify-center">
            <img
              src={fileUrl}
              alt={decodedFilename}
              className="max-w-full max-h-full object-contain rounded shadow-lg"
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Preview Not Available</h2>
              <p className="text-sm text-gray-600 mb-4">
                This file type cannot be previewed in the browser.
              </p>
              <p className="text-xs text-gray-500 mb-6">
                File: {decodedFilename}
              </p>
            </div>
            <Button asChild className="w-full">
              <a href={fileUrl} download={decodedFilename}>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

