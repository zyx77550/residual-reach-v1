// ═══════════════════════════════════════════
// RESIDUAL REACH — Prompts centralisés
// ═══════════════════════════════════════════

export const SYSTEM_ICP_PARSER = `
Tu es un expert en stratégie commerciale B2B.
Tu extrais des paramètres de prospection structurés depuis une description en langage naturel.
Tu réponds UNIQUEMENT en JSON valide, sans texte autour.
`

export function buildIcpParserPrompt(userInput: string): string {
  return `
Extrait les paramètres ICP depuis cette description :
"${userInput}"

Réponds avec ce JSON exact :
{
  "titles": ["titre1", "titre2"],
  "sector": "secteur principal",
  "country": "pays (France si non précisé)",
  "city": "ville ou null",
  "employee_range": { "min": 0, "max": 0 },
  "trigger": "signal déclencheur ou null",
  "exclude_sectors": [],
  "search_queries": [
    "requête de recherche 1",
    "requête de recherche 2",
    "requête de recherche 3",
    "requête de recherche 4",
    "requête de recherche 5"
  ],
  "confidence": 0.95
}

Pour search_queries, génère 5 requêtes Bing optimisées pour trouver ces prospects.
`
}

export const SYSTEM_EMAIL_WRITER = `
Tu es un expert en cold outreach B2B avec 10 ans d'expérience.
Tu écris des emails qui ressemblent à des messages humains écrits individuellement, jamais à des templates de masse.
Tu réponds UNIQUEMENT avec l'email demandé, sans intro ni explication.
`

export function buildEmailPrompt(params: {
  contactName:   string
  contactTitle:  string
  companyName:   string
  context:       string
  senderPitch:   string
}): string {
  const { contactName, contactTitle, companyName, context, senderPitch } = params
  return `
PROSPECT: ${contactName}, ${contactTitle} chez ${companyName}
CONTEXTE RÉCENT: ${context}
CE QUE JE VENDS: ${senderPitch}

RÈGLES STRICTES:
1. Ligne 1: une référence SPÉCIFIQUE et UNIQUE au contexte — JAMAIS générique
2. Lignes 2-3: valeur proposée en lien DIRECT avec leur contexte
3. Ligne 4: UNE seule question ouverte OU un CTA minimal
4. INTERDIT: "j'espère que", "je me permets", "n'hésitez pas", "suite à"
5. MAXIMUM 120 mots
6. Ton: professionnel mais humain, jamais corporate

Écris l'email maintenant. Pas d'objet. Pas d'intro. Juste l'email.
`
}

export function buildSubjectPrompt(emailBody: string, contactName: string, companyName: string): string {
  return `
Génère un objet d'email pour ce cold email.
Contact: ${contactName} chez ${companyName}
Email: ${emailBody}

Règles:
- 5 à 8 mots maximum
- Pas de majuscules excessives (pas de CAPS)
- Personnalisé avec le nom ou l'entreprise
- Donne 3 variantes, une par ligne, sans numérotation
`
}

export const SYSTEM_CONTEXT_BUILDER = `
Tu résumes et structures des informations sur une entreprise et son dirigeant.
Tu réponds UNIQUEMENT en JSON valide.
`

export function buildContextSummaryPrompt(rawData: string, companyName: string): string {
  return `
Voici des données brutes sur l'entreprise "${companyName}" et son contact :
${rawData}

Extrait et structure en JSON :
{
  "recent_news": ["actualité 1", "actualité 2"],
  "company_description": "description courte en 1 phrase",
  "tech_stack": ["tech1", "tech2"],
  "growth_signals": ["signal1"],
  "linkedin_activity": "résumé des posts récents ou null",
  "personalization_hooks": ["accroche possible 1", "accroche possible 2"]
}
`
}
