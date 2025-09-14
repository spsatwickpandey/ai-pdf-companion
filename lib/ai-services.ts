import { Groq } from 'groq-sdk'
import { HfInference } from '@huggingface/inference'

// Initialize AI clients
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

// Generate embeddings using HuggingFace
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text
    })
    return response as number[]
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

// Generate summary using Groq
export async function generateSummary(text: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes text. Provide concise, informative summaries.'
        },
        {
          role: 'user',
          content: `Please summarize the following text:\n\n${text}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 500
    })

    return completion.choices[0]?.message?.content || 'No summary generated'
  } catch (error) {
    console.error('Error generating summary:', error)
    throw new Error('Failed to generate summary')
  }
}

// Answer questions using Groq
export async function answerQuestion(question: string, context: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions based on the provided context. If the answer cannot be found in the context, say so.'
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion: ${question}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1000
    })

    return completion.choices[0]?.message?.content || 'No answer generated'
  } catch (error) {
    console.error('Error answering question:', error)
    throw new Error('Failed to answer question')
  }
}

// Process voice command using Groq
export async function processVoiceCommand(command: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that processes voice commands. Respond with clear, actionable instructions.'
        },
        {
          role: 'user',
          content: `Process this voice command: ${command}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 500
    })

    return completion.choices[0]?.message?.content || 'Command not understood'
  } catch (error) {
    console.error('Error processing voice command:', error)
    throw new Error('Failed to process voice command')
  }
}

export async function chatWithGroq(messages: any[], context?: string) {
  const systemPrompt = context 
    ? `You are an AI assistant helping users understand their PDF documents. Use this context to answer questions: ${context}`
    : "You are a helpful AI assistant for PDF documents."

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      ...messages
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 1024,
  })

  return completion.choices[0]?.message?.content || ""
} 