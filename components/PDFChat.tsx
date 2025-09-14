'use client'

import { useState, useRef, useEffect } from 'react'
import { Groq } from 'groq-sdk'
import { usePDF } from '../contexts/PDFContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface PDFChatProps {
  selectedDocs: string[]
}

export default function PDFChat({ selectedDocs }: PDFChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { documents, getPDFContent } = usePDF()

  const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
    dangerouslyAllowBrowser: true
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Reset chat when selected documents change
  useEffect(() => {
    setMessages([])
    setInput('')
    setError(null)
  }, [selectedDocs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || selectedDocs.length === 0) return

    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      setError('GROQ API key is not configured. Please add your API key to .env.local')
      return
    }

    const userMessage = input.trim()
    setInput('')
    setError(null)

    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, newUserMessage])
    setLoading(true)

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
            content: `You are a helpful AI assistant that helps users understand their PDF documents. You have access to ${selectedDocs.length} document(s). Provide clear, concise answers based on the content of these documents.`
          },
          ...messages.map(msg => ({ role: msg.role, content: msg.content })),
          { 
            role: 'user', 
            content: `Context from PDFs:\n${context}\n\nUser question: ${userMessage}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      })

      const response = completion.choices[0]?.message?.content || 'Sorry, I could not process your request.'
      
      // Add assistant message
      const newAssistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, newAssistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setError('Sorry, there was an error processing your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md">
      {/* Chat Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-medium text-gray-900">Chat with PDFs</h2>
        <p className="text-sm text-gray-500">
          {selectedDocs.length > 0
            ? `Ask questions about ${selectedDocs.length} selected document(s)`
            : 'Select PDF documents to start chatting'}
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedDocs.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-gray-500">
                Please select PDF documents to start chatting
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-gray-500">
                Start a conversation about your PDFs
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[80%]">
                <div
                  className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 text-gray-900">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedDocs.length > 0 ? "Ask about your PDFs..." : "Select PDFs to start chatting"}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            disabled={loading || selectedDocs.length === 0}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || selectedDocs.length === 0}
            className={`px-4 py-2 rounded-lg text-white font-medium
              ${loading || !input.trim() || selectedDocs.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
} 