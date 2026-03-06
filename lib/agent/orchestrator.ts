import { callLLM } from '@/lib/llm/router'
import { logger } from '@/lib/logger'
import { buildIcpParserPrompt, SYSTEM_ICP_PARSER, buildEmailPrompt, buildSubjectPrompt, SYSTEM_EMAIL_WRITER, buildContextSummaryPrompt, SYSTEM_CONTEXT_BUILDER } from '@/lib/llm/prompts'
import { generateEmailPatterns, validateDomain, validateEmailSmtp } from '@/lib/email/validator'
import { createAdminClient } from '@/lib/supabase/admin'

export interface IcpParsed {
  titles:          string[]
  sector:          string
  country:         string
  city?:           string
  employee_range:  { min: number; max: number }
  trigger?:        string
  search_queries:  string[]
  confidence:      number
}

export interface ProspectResult {
  company_name:   string
  company_domain: string
  contact_name:   string
  contact_title:  string
  email?:         string
  email_status:   string
  context?:       Record<string, unknown>
}

// ── Étape 1 : Parse ICP ──────────────────────────────────────
export async function parseIcp(userInput: string): Promise<IcpParsed> {
  const raw = await callLLM(
    buildIcpParserPrompt(userInput),
    SYSTEM_ICP_PARSER,
    { jsonMode: true, temperature: 0.3 }
  )
  const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
  return parsed as IcpParsed
}

// ── Étape 2 : Discovery via Bing ─────────────────────────────
export async function discoverCompanies(queries: string[]): Promise<Array<{ name: string; domain: string; description: string }>> {
  const results: Array<{ name: string; domain: string; description: string }> = []
  const seen = new Set<string>()

  for (const query of queries.slice(0, 5)) {
    try {
      const res = await fetch(
        `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=10&mkt=fr-FR`,
        { headers: { 'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY! } }
      )
      if (!res.ok) continue
      const data = await res.json()
      const webPages = data.webPages?.value ?? []

      for (const page of webPages) {
        const url = new URL(page.url)
        const domain = url.hostname.replace('www.', '')
        if (seen.has(domain)) continue
        seen.add(domain)
        results.push({
          name:        page.name?.split('|')[0]?.split('-')[0]?.trim() ?? domain,
          domain,
          description: page.snippet ?? '',
        })
      }
    } catch (err) {
      logger.warn('Discovery error:', err)
    }
    await sleep(1500 + Math.random() * 1000)
  }

  return results.slice(0, 40)
}

// ── Étape 3 : Find email ─────────────────────────────────────
export async function findEmail(firstName: string, lastName: string, domain: string): Promise<{ email: string | null; status: string; method: string }> {
  // Vérifier domaine
  const domainValid = await validateDomain(domain)
  if (!domainValid) return { email: null, status: 'invalid', method: 'dns' }

  // Pattern matching + SMTP validation
  const patterns = generateEmailPatterns(firstName, lastName, domain)
  for (const pattern of patterns) {
    const valid = await validateEmailSmtp(pattern, domain)
    if (valid) return { email: pattern, status: 'verified', method: 'smtp' }
  }

  // Hunter.io fallback
  try {
    const res = await fetch(
      `https://api.hunter.io/v2/email-finder?domain=${domain}&first_name=${firstName}&last_name=${lastName}&api_key=${process.env.HUNTER_API_KEY}`
    )
    if (res.ok) {
      const data = await res.json()
      if (data.data?.email) {
        return { email: data.data.email, status: 'verified', method: 'hunter' }
      }
    }
  } catch {}

  // Retourner le pattern le plus probable non-vérifié
  return { email: patterns[0], status: 'uncertain', method: 'pattern' }
}

// ── Étape 4 : Build context ──────────────────────────────────
export async function buildContext(companyName: string, domain: string): Promise<Record<string, unknown>> {
  const contextParts: string[] = []

  // Jina.ai — lire le site
  try {
    const res = await fetch(`https://r.jina.ai/https://${domain}/about`, {
      headers: { 'Authorization': `Bearer ${process.env.JINA_API_KEY}` }
    })
    if (res.ok) contextParts.push(await res.text())
  } catch {}

  // Google News RSS
  try {
    const res = await fetch(
      `https://news.google.com/rss/search?q=${encodeURIComponent(companyName)}&hl=fr&gl=FR&ceid=FR:fr`
    )
    if (res.ok) {
      const xml = await res.text()
      const items = xml.match(/<item>[\s\S]*?<\/item>/g)?.slice(0, 3) ?? []
      for (const item of items) {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? ''
        if (title) contextParts.push(`Actualité: ${title}`)
      }
    }
  } catch {}

  if (!contextParts.length) {
    return { company_description: companyName, recent_news: [], personalization_hooks: [] }
  }

  const raw = await callLLM(
    buildContextSummaryPrompt(contextParts.join('\n\n').slice(0, 3000), companyName),
    SYSTEM_CONTEXT_BUILDER,
    { jsonMode: true, temperature: 0.3 }
  )

  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch {
    return { company_description: companyName, recent_news: [], personalization_hooks: [] }
  }
}

// ── Étape 5 : Generate email ─────────────────────────────────
export async function generateEmail(params: {
  contactName:  string
  contactTitle: string
  companyName:  string
  context:      Record<string, unknown>
  pitch:        string
}): Promise<{ subject: string; body: string }> {
  const contextStr = [
    params.context.company_description,
    ...(params.context.recent_news as string[] ?? []).slice(0, 2),
    ...(params.context.personalization_hooks as string[] ?? []).slice(0, 2),
  ].filter(Boolean).join('. ')

  const body = await callLLM(
    buildEmailPrompt({
      contactName:  params.contactName,
      contactTitle: params.contactTitle,
      companyName:  params.companyName,
      context:      contextStr,
      senderPitch:  params.pitch,
    }),
    SYSTEM_EMAIL_WRITER,
    { temperature: 0.8, maxTokens: 300 }
  )

  const subjectsRaw = await callLLM(
    buildSubjectPrompt(body, params.contactName, params.companyName),
    'Tu génères des objets d\'email courts et percutants.',
    { temperature: 0.9, maxTokens: 100 }
  )

  const subject = subjectsRaw.split('\n').filter(Boolean)[0]?.trim() ?? `Pour ${params.companyName}`

  return { subject, body: body.trim() }
}

// ── Helpers ──────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
