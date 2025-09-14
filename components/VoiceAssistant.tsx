'use client'

import { useState, useEffect } from 'react'
import { Groq } from 'groq-sdk'
import { usePDF } from '../contexts/PDFContext'

interface VoiceAssistantProps {
  selectedDocs: string[]
}

interface Command {
  question: string
  response: string
  timestamp: string
}

export default function VoiceAssistant({ selectedDocs }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isNarrating, setIsNarrating] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [recentCommands, setRecentCommands] = useState<Command[]>([])
  const { documents, getPDFContent } = usePDF()

  const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
    dangerouslyAllowBrowser: true
  })

  // Clean response text by removing asterisks and improving formatting
  const cleanResponse = (text: string): string => {
    return text
      .replace(/\*\*/g, '') // Remove double asterisks
      .replace(/\*/g, '') // Remove single asterisks
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
      .replace(/•/g, '• ') // Add space after bullet points
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
  }

  useEffect(() => {
    let recognition: SpeechRecognition | null = null

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.onresult = (event) => {
        const current = event.resultIndex
        const transcript = event.results[current][0].transcript
        setTranscript(transcript)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }
    } else {
      setError('Speech recognition is not supported in your browser.')
    }

    if (isListening && recognition) {
      recognition.start()
    }

    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [isListening])

  const handleVoiceCommand = async () => {
    if (!transcript.trim() || selectedDocs.length === 0) return

    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      setError('GROQ API key is not configured. Please add your API key to .env.local')
      return
    }

    setError(null)
    setResponse('')

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
            content: `You are a helpful AI assistant that helps users understand their PDF documents. You have access to ${selectedDocs.length} document(s). Provide clear, concise answers based on the content of these documents. Format your response with proper paragraphs, bullet points, and emojis where appropriate. Avoid using asterisks or markdown formatting. Use proper punctuation and spacing for better readability. Keep responses concise and well-structured.`
          },
          {
            role: 'user',
            content: `Context from PDFs:\n${context}\n\nUser question: ${transcript}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      })

      const rawResponse = completion.choices[0]?.message?.content || 'Sorry, I could not process your request.'
      const cleanedResponse = cleanResponse(rawResponse)
      setResponse(cleanedResponse)

      // Add to recent commands
      const newCommand: Command = {
        question: transcript,
        response: cleanedResponse,
        timestamp: new Date().toISOString()
      }
      setRecentCommands(prev => [newCommand, ...prev].slice(0, 5))

      // Speak the response if narration is enabled
      if (isNarrating) {
        const utterance = new SpeechSynthesisUtterance(cleanedResponse)
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Voice command error:', error)
      setError('Sorry, there was an error processing your voice command. Please try again.')
    }
  }

  useEffect(() => {
    if (transcript && !isListening) {
      handleVoiceCommand()
    }
  }, [transcript, isListening])

  const toggleListening = () => {
    setIsListening(!isListening)
  }

  const toggleNarration = () => {
    setIsNarrating(!isNarrating)
    if (isNarrating) {
      window.speechSynthesis.cancel()
    } else if (response) {
      const utterance = new SpeechSynthesisUtterance(response)
      window.speechSynthesis.speak(utterance)
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
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-medium text-gray-900">Voice Assistant</h2>
        <p className="text-sm text-gray-500">
          {selectedDocs.length > 0
            ? `Ask questions about ${selectedDocs.length} selected document(s)`
            : 'Select PDF documents to start voice interaction'}
        </p>
      </div>

      {/* Voice Interface */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {selectedDocs.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🎤</div>
              <p className="text-gray-500">
                Please select PDF documents to start voice interaction
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={toggleListening}
                className={`p-4 rounded-full ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
                title={isListening ? 'Stop Listening' : 'Start Listening'}
              >
                <div className="text-4xl">
                  {isListening ? '⏹️' : '🎤'}
                </div>
              </button>
              <button
                onClick={toggleNarration}
                className={`p-4 rounded-full ${
                  isNarrating
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white transition-colors`}
                title={isNarrating ? 'Stop Narration' : 'Start Narration'}
              >
                <div className="text-4xl">
                  {isNarrating ? '🔇' : '🔊'}
                </div>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {transcript && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Your Question:</h3>
                  <p className="text-gray-900">{transcript}</p>
                </div>
              )}

              {response && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">Assistant's Response:</h3>
                  <div className="text-blue-900 whitespace-pre-wrap break-words">{response}</div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                  {error}
                </div>
              )}

              {/* Recent Commands */}
              {recentCommands.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Commands:</h3>
                  <div className="space-y-2">
                    {recentCommands.map((cmd, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-gray-900">{cmd.question}</p>
                          <span className="text-xs text-gray-500">{formatTimestamp(cmd.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{cmd.response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 