// LLM Router — Groq → Mistral → Google AI → fallback
// Jamais de downtime LLM, 0€ de coût

import { logger } from '@/lib/logger'

export interface LLMOptions {
  temperature?: number
  maxTokens?:   number
  jsonMode?:    boolean
}

const PROVIDERS = ['groq', 'mistral', 'google'] as const
type Provider = typeof PROVIDERS[number]

async function callGroq(prompt: string, system: string, opts: LLMOptions): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  opts.maxTokens ?? 1000,
      temperature: opts.temperature ?? 0.7,
      response_format: opts.jsonMode ? { type: 'json_object' } : undefined,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: prompt },
      ],
    }),
  })
  if (!res.ok) throw new Error(`Groq ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content
}

async function callMistral(prompt: string, system: string, opts: LLMOptions): Promise<string> {
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model:       'mistral-large-latest',
      max_tokens:  opts.maxTokens ?? 1000,
      temperature: opts.temperature ?? 0.7,
      response_format: opts.jsonMode ? { type: 'json_object' } : undefined,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: prompt },
      ],
    }),
  })
  if (!res.ok) throw new Error(`Mistral ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content
}

async function callGoogle(prompt: string, system: string, opts: LLMOptions): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${system}\n\n${prompt}` }] }],
        generationConfig: {
          maxOutputTokens: opts.maxTokens ?? 1000,
          temperature:     opts.temperature ?? 0.7,
          responseMimeType: opts.jsonMode ? 'application/json' : 'text/plain',
        },
      }),
    }
  )
  if (!res.ok) throw new Error(`Google ${res.status}`)
  const data = await res.json()
  return data.candidates[0].content.parts[0].text
}

export async function callLLM(
  prompt: string,
  system = 'You are a helpful assistant.',
  opts: LLMOptions = {}
): Promise<string> {
  const callers: Record<Provider, typeof callGroq> = {
    groq:    callGroq,
    mistral: callMistral,
    google:  callGoogle,
  }

  for (const provider of PROVIDERS) {
    try {
      const result = await Promise.race([
        callers[provider](prompt, system, opts),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 8000)
        ),
      ])
      logger.info(`✓ LLM: ${provider}`)
      return result
    } catch (err) {
      logger.warn(`✗ LLM ${provider} failed:`, err)
    }
  }

  throw new Error('All LLM providers failed')
}
