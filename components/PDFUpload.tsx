'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { usePDF } from '@/contexts/PDFContext'

interface Document {
  id: string
  name: string
  uploadedAt: string
}

export default function PDFUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { documents, setDocuments } = usePDF()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (!uploadedFile) return

    // Validate file type
    if (uploadedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    // Validate file size (50MB limit)
    if (uploadedFile.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB')
      return
    }

    setFile(uploadedFile)
    setError(null)
    setSuccess(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      // Create document metadata
      const document: Document = {
        id: Date.now().toString(),
        name: file.name,
        uploadedAt: new Date().toISOString()
      }

      // Update documents in context
      const updatedDocuments = [...documents, document]
      setDocuments(updatedDocuments)

      // Store file in IndexedDB
      const db = await openDB()
      await storeFileInIndexedDB(db, document.id, file)

      setSuccess(true)
      setFile(null)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  // IndexedDB setup
  const openDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('PDFStorage', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files')
        }
      }
    })
  }

  const storeFileInIndexedDB = async (db: IDBDatabase, id: string, file: File) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('files', 'readwrite')
      const store = transaction.objectStore('files')
      const request = store.put(file, id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-500'
              }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <div className="text-4xl">📄</div>
              <p className="text-gray-600">
                {isDragActive
                  ? 'Drop your PDF here'
                  : 'Drag and drop your PDF here, or click to select'}
              </p>
              <p className="text-sm text-gray-500">
                Maximum file size: 50MB
              </p>
            </div>
          </div>

          {/* File Preview */}
          {file && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium
                ${uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
              {uploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                'Upload PDF'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg">
          PDF uploaded successfully!
        </div>
      )}
    </div>
  )
} 