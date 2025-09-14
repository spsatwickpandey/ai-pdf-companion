'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface PDFContextType {
  documents: Document[]
  setDocuments: (documents: Document[]) => void
  selectedPDF: string | null
  setSelectedPDF: (id: string | null) => void
  getPDFContent: (id: string) => Promise<ArrayBuffer>
  removeDocument: (id: string) => Promise<void>
}

interface Document {
  id: string
  name: string
  uploadedAt: string
  pageCount?: number
  fileSize?: number
}

const PDFContext = createContext<PDFContextType | undefined>(undefined)

export function PDFProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null)

  // Load documents from localStorage on mount
  useEffect(() => {
    const storedDocs = localStorage.getItem('pdfDocuments')
    if (storedDocs) {
      setDocuments(JSON.parse(storedDocs))
    }
  }, [])

  // Save documents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pdfDocuments', JSON.stringify(documents))
  }, [documents])

  const openDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('PDFStorage', 1)
      
      request.onerror = () => reject(request.error)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files')
        }
      }
      
      request.onsuccess = () => resolve(request.result)
    })
  }

  const getFileFromIndexedDB = async (db: IDBDatabase, id: string) => {
    return new Promise<File | null>((resolve, reject) => {
      if (!id) {
        reject(new Error('No document ID provided'))
        return
      }

      const transaction = db.transaction('files', 'readonly')
      const store = transaction.objectStore('files')
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  const getPDFContent = async (id: string): Promise<ArrayBuffer> => {
    try {
      if (!id) {
        throw new Error('No document ID provided')
      }

      const db = await openDB()
      const file = await getFileFromIndexedDB(db, id)
      
      if (!file) {
        throw new Error('PDF file not found')
      }

      return await file.arrayBuffer()
    } catch (error) {
      console.error('Error getting PDF content:', error)
      throw new Error('Failed to load PDF content')
    }
  }

  const removeDocument = async (id: string): Promise<void> => {
    try {
      // Remove from IndexedDB
      const db = await openDB()
      const transaction = db.transaction('files', 'readwrite')
      const store = transaction.objectStore('files')
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })

      // Remove from localStorage
      const storedDocs = localStorage.getItem('pdfDocuments')
      if (storedDocs) {
        const docs = JSON.parse(storedDocs)
        const updatedDocs = docs.filter((doc: Document) => doc.id !== id)
        localStorage.setItem('pdfDocuments', JSON.stringify(updatedDocs))
      }

      // Update state
      setDocuments(prev => prev.filter(doc => doc.id !== id))
      if (selectedPDF === id) {
        setSelectedPDF(null)
      }
    } catch (error) {
      console.error('Error removing document:', error)
      throw error
    }
  }

  return (
    <PDFContext.Provider
      value={{
        documents,
        setDocuments,
        selectedPDF,
        setSelectedPDF,
        getPDFContent,
        removeDocument
      }}
    >
      {children}
    </PDFContext.Provider>
  )
}

export function usePDF() {
  const context = useContext(PDFContext)
  if (context === undefined) {
    throw new Error('usePDF must be used within a PDFProvider')
  }
  return context
} 