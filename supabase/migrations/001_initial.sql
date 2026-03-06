-- ═══════════════════════════════════════════════════════════════
-- RESIDUAL REACH — Migration 001 (idempotent)
-- Coller entièrement dans Supabase > SQL Editor > Run
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ── PROFILES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                 uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              text        NOT NULL,
  full_name          text,
  plan               text        DEFAULT 'free' CHECK (plan IN ('free','starter','pro','agency')),
  prospects_used     int         DEFAULT 0,
  prospects_limit    int         DEFAULT 20,
  stripe_customer_id text        UNIQUE,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email              text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name          text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan               text        DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prospects_used     int         DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prospects_limit    int         DEFAULT 20;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at         timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at         timestamptz DEFAULT now();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'users_see_own_profile'
  ) THEN
    CREATE POLICY "users_see_own_profile" ON public.profiles
      FOR ALL USING ((SELECT auth.uid()) = id);
  END IF;
END $$;

-- Trigger : auto-création du profil après signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- ── SMTP CONFIGS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.smtp_configs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider      text        CHECK (provider IN ('gmail','outlook','custom')),
  email         text        NOT NULL,
  display_name  text,
  access_token  text,
  refresh_token text,
  smtp_host     text,
  smtp_port     int,
  smtp_user     text,
  smtp_pass     text,
  is_active     boolean     DEFAULT true,
  daily_limit   int         DEFAULT 50,
  sent_today    int         DEFAULT 0,
  warmup_day    int         DEFAULT 1,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.smtp_configs ADD COLUMN IF NOT EXISTS user_id     uuid;
ALTER TABLE public.smtp_configs ADD COLUMN IF NOT EXISTS provider    text;
ALTER TABLE public.smtp_configs ADD COLUMN IF NOT EXISTS email       text;
ALTER TABLE public.smtp_configs ADD COLUMN IF NOT EXISTS is_active   boolean DEFAULT true;
ALTER TABLE public.smtp_configs ADD COLUMN IF NOT EXISTS daily_limit int     DEFAULT 50;
ALTER TABLE public.smtp_configs ADD COLUMN IF NOT EXISTS sent_today  int     DEFAULT 0;

ALTER TABLE public.smtp_configs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'smtp_configs' AND policyname = 'users_see_own_smtp'
  ) THEN
    CREATE POLICY "users_see_own_smtp" ON public.smtp_configs
      FOR ALL USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- ── CAMPAIGNS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campaigns (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  icp_raw         text        NOT NULL,
  icp_parsed      jsonb,
  status          text        DEFAULT 'draft' CHECK (status IN ('draft','running','paused','completed')),
  sequence_config jsonb       DEFAULT '{"steps":[0,3,7,14]}'::jsonb,
  smtp_config_id  uuid        REFERENCES public.smtp_configs(id),
  prospects_count int         DEFAULT 0,
  emails_sent     int         DEFAULT 0,
  opens           int         DEFAULT 0,
  replies         int         DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS user_id  uuid;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS name     text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS icp_raw  text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS status   text DEFAULT 'draft';

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'users_see_own_campaigns'
  ) THEN
    CREATE POLICY "users_see_own_campaigns" ON public.campaigns
      FOR ALL USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- ── PROSPECTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prospects (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     uuid        REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id         uuid        REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name    text        NOT NULL,
  company_domain  text,
  company_size    text,
  company_sector  text,
  contact_name    text,
  contact_title   text,
  email           text,
  email_status    text        DEFAULT 'unverified' CHECK (email_status IN ('verified','unverified','invalid','uncertain')),
  email_method    text,
  context         jsonb,
  score           int         DEFAULT 0,
  status          text        DEFAULT 'found' CHECK (status IN ('found','enriched','email_ready','sent','opened','replied','bounced','unsubscribed')),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS campaign_id  uuid;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS user_id      uuid;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS company_name text;

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'prospects' AND policyname = 'users_see_own_prospects'
  ) THEN
    CREATE POLICY "users_see_own_prospects" ON public.prospects
      FOR ALL USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- ── EMAILS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.emails (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id    uuid        REFERENCES public.prospects(id) ON DELETE CASCADE,
  campaign_id    uuid        REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id        uuid        REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject        text        NOT NULL,
  body           text        NOT NULL,
  sequence_step  int         DEFAULT 0,
  status         text        DEFAULT 'scheduled' CHECK (status IN ('scheduled','sent','opened','clicked','replied','bounced','failed')),
  scheduled_at   timestamptz,
  sent_at        timestamptz,
  opened_at      timestamptz,
  replied_at     timestamptz,
  tracking_id    text        UNIQUE DEFAULT gen_random_uuid()::text,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS prospect_id uuid;
ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS campaign_id uuid;
ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS user_id     uuid;
ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS subject     text;
ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS body        text;

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'emails' AND policyname = 'users_see_own_emails'
  ) THEN
    CREATE POLICY "users_see_own_emails" ON public.emails
      FOR ALL USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- ── SUBSCRIPTIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid        UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id     text        UNIQUE,
  stripe_subscription_id text        UNIQUE,
  plan                   text        DEFAULT 'free',
  status                 text        DEFAULT 'active',
  payment_status         text        DEFAULT 'paid',
  current_period_end     timestamptz,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan    text DEFAULT 'free';

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'users_see_own_subscription'
  ) THEN
    CREATE POLICY "users_see_own_subscription" ON public.subscriptions
      FOR ALL USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- ── CRON : reset compteur SMTP à minuit ──────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'reset-smtp-daily-counter'
  ) THEN
    PERFORM cron.schedule(
      'reset-smtp-daily-counter',
      '0 0 * * *',
      $cron$ UPDATE public.smtp_configs SET sent_today = 0 $cron$
    );
  END IF;
END $$;

-- ── INDEX ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_prospects_campaign  ON public.prospects(campaign_id);
CREATE INDEX IF NOT EXISTS idx_prospects_user      ON public.prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_prospect     ON public.emails(prospect_id);
CREATE INDEX IF NOT EXISTS idx_emails_campaign     ON public.emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_emails_scheduled    ON public.emails(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_campaigns_user      ON public.campaigns(user_id);

-- ═══════════════════════════════════════════════════════════════
-- FIN — Migration appliquée avec succès ✓
-- ═══════════════════════════════════════════════════════════════
