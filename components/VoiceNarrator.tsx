'use client'
import { useState, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react'

interface VoiceNarratorProps {
  text: string
  onPageRequest?: (direction: 'next' | 'prev') => void
}

export default function VoiceNarrator({ text, onPageRequest }: VoiceNarratorProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  const startNarration = () => {
    if ('speechSynthesis' in window) {
      // Stop any current narration
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onstart = () => {
        setIsPlaying(true)
        setIsPaused(false)
      }
      
      utterance.onend = () => {
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentUtterance(null)
      }
      
      utterance.onerror = () => {
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentUtterance(null)
      }
      
      setCurrentUtterance(utterance)
      speechSynthesis.speak(utterance)
    }
  }

  const pauseNarration = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const resumeNarration = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
      setIsPaused(false)
    }
  }

  const stopNarration = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentUtterance(null)
  }

  const handlePlayPause = () => {
    if (!isPlaying) {
      startNarration()
    } else if (isPaused) {
      resumeNarration()
    } else {
      pauseNarration()
    }
  }

  useEffect(() => {
    return () => {
      speechSynthesis.cancel()
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Voice Narrator</h3>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onPageRequest?.('prev')}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          <SkipBack size={20} />
        </button>
        
        <button
          onClick={handlePlayPause}
          className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          {isPlaying && !isPaused ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button
          onClick={() => onPageRequest?.('next')}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          <SkipForward size={20} />
        </button>
        
        <button
          onClick={stopNarration}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        {isPlaying ? (isPaused ? 'Paused' : 'Playing...') : 'Ready to narrate'}
      </div>
    </div>
  )
} 