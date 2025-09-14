'use client'

import { useState, useEffect } from 'react'
import { usePDF } from '@/contexts/PDFContext'
import { PDFDocument } from 'pdf-lib'

interface Document {
  id: string
  name: string
  uploadedAt: string
  pageCount?: number
  fileSize?: number
}

interface PDFListProps {
  onSelectPDF?: (id: string) => void
  onEditPDF?: (id: string) => void
  onSelectForAI?: (ids: string[]) => void
  mode?: 'edit' | 'ai'
}

export default function PDFList({ onSelectPDF, onEditPDF, onSelectForAI, mode = 'edit' }: PDFListProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const { documents = [], setDocuments, removeDocument } = usePDF()

  const openDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('PDFStorage', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  const getFileFromIndexedDB = async (db: IDBDatabase, id: string) => {
    return new Promise<File | null>((resolve, reject) => {
      const transaction = db.transaction('files', 'readonly')
      const store = transaction.objectStore('files')
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const storedDocs = localStorage.getItem('pdfDocuments')
      if (!storedDocs) {
        setDocuments([])
        return
      }

      const parsedDocs = JSON.parse(storedDocs)
      
      // Load PDF metadata for each document
      const docsWithMetadata = await Promise.all(
        parsedDocs.map(async (doc: Document) => {
          try {
            const db = await openDB()
            const file = await getFileFromIndexedDB(db, doc.id)
            if (file) {
              const arrayBuffer = await file.arrayBuffer()
              const pdfDoc = await PDFDocument.load(arrayBuffer)
              return {
                ...doc,
                pageCount: pdfDoc.getPageCount(),
                fileSize: file.size
              }
            }
            return doc
          } catch (error) {
            console.error(`Error loading metadata for ${doc.name}:`, error)
            return doc
          }
        })
      )

      setDocuments(docsWithMetadata)
    } catch (error) {
      console.error('Error loading documents:', error)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, []) // Empty dependency array since we only want to load once on mount

  const handleMultiSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => option.value)
    setSelectedDocs(selectedOptions)
    onSelectForAI?.(selectedOptions)
  }

  const handleCheckboxChange = (docId: string) => {
    setSelectedDocs(prev => {
      const newSelected = prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
      
      if (onSelectForAI) {
        onSelectForAI(newSelected)
      }
      
      return newSelected
    })
  }

  const handleRemoveDocument = async (docId: string) => {
    try {
      await removeDocument(docId)
      // Remove from selected docs if it was selected
      setSelectedDocs(prev => prev.filter(id => id !== docId))
      // Update the documents list
      setDocuments(documents.filter(doc => doc.id !== docId))
    } catch (error) {
      console.error('Error removing document:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No documents uploaded yet</p>
      </div>
    )
  }

  if (mode === 'ai') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <label htmlFor="pdf-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select PDFs for AI Processing
          </label>
          <select
            id="pdf-select"
            multiple
            value={selectedDocs}
            onChange={handleMultiSelect}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            size={5}
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id} className="py-2">
                {doc.name} ({doc.pageCount} pages, {formatFileSize(doc.fileSize || 0)})
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-500">
            Hold Ctrl (Windows) or Command (Mac) to select multiple PDFs
          </p>
          {selectedDocs.length > 0 && (
            <div className="mt-4 bg-blue-50 text-blue-700 p-3 rounded-lg">
              {selectedDocs.length} document{selectedDocs.length > 1 ? 's' : ''} selected for AI processing
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {doc.name}
              </h3>
              <div className="mt-2">
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {doc.pageCount ? `${doc.pageCount} pages` : 'Loading pages...'}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    {doc.fileSize ? formatFileSize(doc.fileSize) : 'Loading size...'}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(doc.uploadedAt)}
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex space-x-2">
              {onEditPDF && (
                <button
                  onClick={() => onEditPDF(doc.id)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => handleRemoveDocument(doc.id)}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Remove document"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 