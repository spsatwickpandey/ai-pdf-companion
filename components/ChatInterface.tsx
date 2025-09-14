'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff } from 'lucide-react'
import { chatWithGroq } from '@/lib/ai-services'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{page: number, text: string}>
}

interface ChatInterfaceProps {
  documentId: string
  userId: string
  onHighlight?: (sources: Array<{page: number, text: string}>) => void
}

export default function ChatInterface({ documentId, userId, onHighlight }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }
      
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      
      setRecognition(recognition)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSpeechToText = () => {
    if (!recognition) return
    
    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Get AI response
      const response = await chatWithGroq([
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: input }
      ], '') // Placeholder for context

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sources: [] // Placeholder for sources
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Highlight sources and speak response
      if (assistantMessage.sources && assistantMessage.sources.length > 0) {
        onHighlight?.(assistantMessage.sources || [])
      }
      speakText(response)

    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.sources && (
                <div className="mt-2 text-xs opacity-70">
                  Sources: {message.sources.length} reference(s)
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="animate-pulse">Thinking...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your PDF..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleSpeechToText}
            className={`px-4 py-2 rounded-lg ${
              isListening ? 'bg-red-500 text-white' : 'bg-gray-200'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
} 