'use client'
import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PDFViewerProps {
  fileUrl: string
  onPageChange?: (page: number) => void
  highlightedChunks?: Array<{page: number, text: string}>
}

export default function PDFViewer({ fileUrl, onPageChange, highlightedChunks }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  function changePage(offset: number) {
    const newPage = pageNumber + offset
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage)
      onPageChange?.(newPage)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Controls */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        
        <span className="font-medium">
          Page {pageNumber} of {numPages}
        </span>
        
        <button
          onClick={() => changePage(1)}
          disabled={pageNumber >= numPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>

        <div className="flex items-center space-x-2">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>−</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))}>+</button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="border rounded-lg overflow-auto max-h-[800px]">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="p-8">Loading PDF...</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  )
} 