# Residual Reach
**AI-powered B2B Cold Outreach Agent — by Residual Labs**

> Indétectable. Gratuit. Puissant. Dans cet ordre.

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in all values in .env.local

# 3. Run Supabase migration
# Go to Supabase Dashboard → SQL Editor
# Paste and run: supabase/migrations/001_initial.sql

# 4. Run development server
npm run dev
```

## Stack
- **Next.js 14** App Router + TypeScript
- **Supabase** (Auth + PostgreSQL + Edge Functions)
- **Stripe** (Payments + Webhooks)
- **Framer Motion** (Animations)
- **Tailwind CSS** + shadcn/ui
- **LLM Router**: Groq → Mistral → Google AI

## Structure
```
app/
  page.tsx                  # Landing page publique
  (auth)/login              # Login
  (auth)/signup             # Signup
  (dashboard)/dashboard     # Dashboard principal
  (dashboard)/campaigns/    # Campagnes
  (dashboard)/inbox/        # Inbox réponses
  (dashboard)/settings/     # SMTP + Billing + Profil
  api/webhook/stripe/       # Webhook Stripe sécurisé
  api/checkout/             # Créer session Stripe
  api/agent/parse-icp/      # Parser ICP avec LLM

lib/
  supabase/   # client, server, admin
  stripe/     # client Stripe
  llm/        # router multi-providers + prompts
  email/      # validator DNS+SMTP
  agent/      # orchestrateur pipeline complet
```

## Sécurité Stripe
- Clés dans Vercel env vars uniquement
- `.env*` dans .gitignore
- Webhook vérifie signature `constructEvent()`
- Auth Supabase vérifiée avant tout appel Stripe
- `metadata.userId` inclus dans chaque session

## Residual Labs — Engineering the Impossible
