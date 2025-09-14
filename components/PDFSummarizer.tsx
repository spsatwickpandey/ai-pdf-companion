'use client'

import { useState } from 'react'
import { Groq } from 'groq-sdk'
import { usePDF } from '../contexts/PDFContext'

interface PDFSummarizerProps {
  selectedDocs: string[]
}

export default function PDFSummarizer({ selectedDocs }: PDFSummarizerProps) {
  const [summary, setSummary] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLength, setSelectedLength] = useState<'short' | 'medium' | 'long'>('medium')
  const { documents, getPDFContent } = usePDF()

  const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
    dangerouslyAllowBrowser: true
  })

  const generateSummary = async () => {
    if (selectedDocs.length === 0) return

    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      setError('GROQ API key is not configured. Please add your API key to .env.local')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get content from all selected PDFs
      const pdfContents = await Promise.all(
        selectedDocs.map(async (docId) => {
          const doc = documents.find(d => d.id === docId)
          if (!doc) throw new Error(`Document ${docId} not found`)
          
          const content = await getPDFContent(docId)
          return {
            name: doc.name,
            content: content
          }
        })
      )

      // Create context from all PDFs
      const context = pdfContents.map(pdf => 
        `Document: ${pdf.name}\nContent: ${pdf.content}`
      ).join('\n\n')

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant that summarizes PDF documents. You have access to ${selectedDocs.length} document(s). Provide a ${selectedLength} summary that captures the key points and main ideas from all documents.`
          },
          {
            role: 'user',
            content: `Please provide a ${selectedLength} summary of these PDF documents:\n\n${context}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      })

      const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a summary.'
      setSummary(response)
    } catch (error) {
      console.error('Summary generation error:', error)
      setError('Sorry, there was an error generating the summary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-medium text-gray-900">PDF Summarizer</h2>
        <p className="text-sm text-gray-500">
          {selectedDocs.length > 0
            ? `Generate a summary of ${selectedDocs.length} selected document(s)`
            : 'Select PDF documents to generate a summary'}
        </p>
      </div>

      {/* Controls */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-4">
          <select
            value={selectedLength}
            onChange={(e) => setSelectedLength(e.target.value as 'short' | 'medium' | 'long')}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            disabled={loading || selectedDocs.length === 0}
          >
            <option value="short">Short Summary</option>
            <option value="medium">Medium Summary</option>
            <option value="long">Long Summary</option>
          </select>
          <button
            onClick={generateSummary}
            disabled={loading || selectedDocs.length === 0}
            className={`px-4 py-2 rounded-lg text-white font-medium
              ${loading || selectedDocs.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
            {loading ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Summary Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedDocs.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-500">
                Please select PDF documents to generate a summary
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
              <p className="text-gray-500">Generating summary...</p>
            </div>
          </div>
        ) : summary ? (
          <div className="prose max-w-none">
            <div className="flex justify-end mb-4">
              <button
                onClick={copyToClipboard}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Copy to Clipboard
              </button>
            </div>
            <div className="whitespace-pre-wrap">{summary}</div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <p className="text-gray-500">
                Click "Generate Summary" to create a summary of your PDFs
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 