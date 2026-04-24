import { GoogleGenerativeAI } from '@google/generative-ai'

import { ApiError } from './http.js'

function getLlmProvider() {
  const explicit = (process.env.LLM_PROVIDER ?? '').trim().toLowerCase()
  if (explicit) return explicit
  if (process.env.GROQ_API_KEY) return 'groq'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  return 'none'
}

export async function generateJsonTextOrThrow(prompt: string) {
  const provider = getLlmProvider()

  if (provider === 'groq') {
    return await groqGenerateTextOrThrow(prompt)
  }
  if (provider === 'gemini') {
    return await geminiGenerateTextOrThrow(prompt)
  }

  throw new ApiError(502, 'No LLM provider is configured (set GROQ_API_KEY or GEMINI_API_KEY)')
}

async function groqGenerateTextOrThrow(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new ApiError(502, 'GROQ_API_KEY is not configured')

  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            'You must output ONLY valid JSON. No markdown, no code fences, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '')
    throw new ApiError(502, `Groq request failed: ${response.status} ${bodyText || response.statusText}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>
  }

  const text = data.choices?.[0]?.message?.content
  if (!text || !text.trim()) throw new ApiError(502, 'Groq returned empty output')
  return text
}

async function geminiGenerateTextOrThrow(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new ApiError(502, 'GEMINI_API_KEY is not configured')

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: modelName })

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    if (!text || !text.trim()) throw new ApiError(502, 'Gemini returned empty output')
    return text
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown model error'
    throw new ApiError(502, `Gemini request failed: ${message}`)
  }
}

