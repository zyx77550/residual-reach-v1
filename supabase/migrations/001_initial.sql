--- Début du script SQL (idempotent) ---

-- RESIDUAL REACH — Supabase Migration 001 (idempotent) -- Exécuter dans Supabase SQL Editor ou inclure dans vos migrations

-- Enable required extensions (no-op si déjà présentes) CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ── PROFILES ── CREATE TABLE IF NOT EXISTS public.profiles ( id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, email text NOT NULL, full_name text, plan text DEFAULT 'free' CHECK (plan IN ('free','starter','pro','agency')), prospects_used int DEFAULT 0, prospects_limit int DEFAULT 20, stripe_customer_id text UNIQUE, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now() );

-- Ensure columns exist (safe for migrations) ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text; ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text; ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free'; ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prospects_used int DEFAULT 0; ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prospects_limit int DEFAULT 20; ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text; ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(); ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Enable RLS and create policy safely DO BEGIN IF EXISTS ( SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'profiles' AND n.nspname = 'public' ) THEN -- Enable RLS (no-op if already enabled) EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY'; -- Create policy only if it doesn't exist IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'users_see_own_profile' ) THEN EXECUTE $sql$ CREATE POLICY "users_see_own_profile" ON public.profiles FOR ALL USING ((SELECT auth.uid()) = id); $sql$; END IF; END IF; END;

-- Auto-create profile on signup: create or replace function (idempotent) CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN INSERT INTO public.profiles (id, email, full_name) VALUES ( NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', '') ) ON CONFLICT (id) DO NOTHING; RETURN NEW; END;

-- Create trigger if not exists DO 
B
E
G
I
N
I
F
N
O
T
E
X
I
S
T
S
(
S
E
L
E
C
T
1
F
R
O
M
p
g
t
r
i
g
g
e
r
W
H
E
R
E
t
g
n
a
m
e
=
′
o
n
a
u
t
h
u
s
e
r
c
r
e
a
t
e
d
′
)
T
H
E
N
E
X
E
C
U
T
E
′
C
R
E
A
T
E
T
R
I
G
G
E
R
o
n
a
u
t
h
u
s
e
r
c
r
e
a
t
e
d
A
F
T
E
R
I
N
S
E
R
T
O
N
a
u
t
h
.
u
s
e
r
s
F
O
R
E
A
C
H
R
O
W
E
X
E
C
U
T
E
P
R
O
C
E
D
U
R
E
p
u
b
l
i
c
.
h
a
n
d
l
e
n
e
w
u
s
e
r
(
)
′
;
E
N
D
I
F
;
E
N
D
BEGINIFNOTEXISTS(SELECT1FROMpg 
t
​
 riggerWHEREtgname= 
′
 on 
a
​
 uth 
u
​
 ser 
c
​
 reated 
′
 )THENEXECUTE 
′
 CREATETRIGGERon 
a
​
 uth 
u
​
 ser 
c
​
 reatedAFTERINSERTONauth.usersFOREACHROWEXECUTEPROCEDUREpublic.handle 
n
​
 ew 
u
​
 ser() 
′
 ;ENDIF;END;

-- ── SMTP CONFIGS ── CREATE TABLE IF NOT EXISTS public.smtp_configs ( id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, provider text CHECK (provider IN ('gmail','outlook','custom')), email text NOT NULL, display_name text, access_token text, refresh_token text, smtp_host text, smtp_port int, smtp_user text, smtp_pass text, is_active boolean DEFAULT true, daily_limit int DEFAULT 50, sent_today int DEFAULT 0, warmup_day int DEFAULT 1, created_at timestamptz DEFAULT now() );

ALTER TABLE public.smtp_configs ADD COLUMN IF NOT EXISTS user_id uuid; ALTER TABLE public.smtp_configs ADD COLUMN IF NOT EXISTS provider text; ALTER TABLE public.smtp_configs ADD COLUMN IF NOT EXISTS email text; ALTER TABLE public.smtp_configs ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true; ALTER TABLE public.smtp_configs ADD COLUMN IF NOT EXISTS daily_limit int DEFAULT 50; ALTER TABLE public.smtp_configs ADD COLUMN IF NOT EXISTS sent_today int DEFAULT 0;

DO BEGIN IF EXISTS ( SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'smtp_configs' AND n.nspname = 'public' ) THEN EXECUTE 'ALTER TABLE public.smtp_configs ENABLE ROW LEVEL SECURITY'; IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'smtp_configs' AND policyname = 'users_see_own_smtp' ) THEN EXECUTE $sql$ CREATE POLICY "users_see_own_smtp" ON public.smtp_configs FOR ALL USING ((SELECT auth.uid()) = user_id); $sql$; END IF; END IF; END;

-- ── CAMPAIGNS ── CREATE TABLE IF NOT EXISTS public.campaigns ( id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, name text NOT NULL, icp_raw text NOT NULL, icp_parsed jsonb, status text DEFAULT 'draft' CHECK (status IN ('draft','running','paused','completed')), sequence_config jsonb DEFAULT '{"steps":[0,3,7,14]}'::jsonb, smtp_config_id uuid REFERENCES public.smtp_configs(id), prospects_count int DEFAULT 0, emails_sent int DEFAULT 0, opens int DEFAULT 0, replies int DEFAULT 0, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now() );

ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS user_id uuid; ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS name text; ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS icp_raw text; ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';

DO BEGIN IF EXISTS ( SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'campaigns' AND n.nspname = 'public' ) THEN EXECUTE 'ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY'; IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'users_see_own_campaigns' ) THEN EXECUTE $sql$ CREATE POLICY "users_see_own_campaigns" ON public.campaigns FOR ALL USING ((SELECT auth.uid()) = user_id); $sql$; END IF; END IF; END;

-- ── PROSPECTS ── CREATE TABLE IF NOT EXISTS public.prospects ( id uuid PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE, user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, company_name text NOT NULL, company_domain text, company_size text, company_sector text, contact_name text, contact_title text, email text, email_status text DEFAULT 'unverified' CHECK (email_status IN ('verified','unverified','invalid','uncertain')), email_method text, context jsonb, score int DEFAULT 0, status text DEFAULT 'found' CHECK (status IN ('found','enriched','email_ready','sent','opened','replied','bounced','unsubscribed')), created_at timestamptz DEFAULT now() );

ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS campaign_id uuid; ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS user_id uuid; ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS company_name text;

DO BEGIN IF EXISTS ( SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'prospects' AND n.nspname = 'public' ) THEN EXECUTE 'ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY'; IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'prospects' AND policyname = 'users_see_own_prospects' ) THEN EXECUTE $sql$ CREATE POLICY "users_see_own_prospects" ON public.prospects FOR ALL USING ((SELECT auth.uid()) = user_id); $sql$; END IF; END IF; END;

-- ── EMAILS ── CREATE TABLE IF NOT EXISTS public.emails ( id uuid PRIMARY KEY DEFAULT gen_random_uuid(), prospect_id uuid REFERENCES public.prospects(id) ON DELETE CASCADE, campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE, user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, subject text NOT NULL, body text NOT NULL, sequence_step int DEFAULT 0, status text DEFAULT 'scheduled' CHECK (status IN ('scheduled','sent','opened','clicked','replied','bounced','failed')), scheduled_at timestamptz, sent_at timestamptz, opened_at timestamptz, replied_at timestamptz, tracking_id text UNIQUE DEFAULT gen_random_uuid()::text, created_at timestamptz DEFAULT now() );

ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS prospect_id uuid; ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS campaign_id uuid; ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS user_id uuid; ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS subject text; ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS body text;

DO BEGIN IF EXISTS ( SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'emails' AND n.nspname = 'public' ) THEN EXECUTE 'ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY'; IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'emails' AND policyname = 'users_see_own_emails' ) THEN EXECUTE $sql$ CREATE POLICY "users_see_own_emails" ON public.emails FOR ALL USING ((SELECT auth.uid()) = user_id); $sql$; END IF; END IF; END;

-- ── SUBSCRIPTIONS ── CREATE TABLE IF NOT EXISTS public.subscriptions ( id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE, stripe_customer_id text UNIQUE, stripe_subscription_id text UNIQUE, plan text DEFAULT 'free', status text DEFAULT 'active', payment_status text DEFAULT 'paid', current_period_end timestamptz, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now() );

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS user_id uuid; ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';

DO BEGIN IF EXISTS ( SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'subscriptions' AND n.nspname = 'public' ) THEN EXECUTE 'ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY'; IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'users_see_own_subscription' ) THEN EXECUTE $sql$ CREATE POLICY "users_see_own_subscription" ON public.subscriptions FOR ALL USING ((SELECT auth.uid()) = user_id); $sql$; END IF; END IF; END;

-- ── RESET SMTP DAILY COUNTER (cron job) ── -- Use pg_cron.schedule if not already scheduled DO 
B
E
G
I
N
I
F
N
O
T
E
X
I
S
T
S
(
S
E
L
E
C
T
1
F
R
O
M
c
r
o
n
.
j
o
b
W
H
E
R
E
j
o
b
n
a
m
e
=
′
r
e
s
e
t
−
s
m
t
p
−
d
a
i
l
y
−
c
o
u
n
t
e
r
′
)
T
H
E
N
P
E
R
F
O
R
M
c
r
o
n
.
s
c
h
e
d
u
l
e
(
′
r
e
s
e
t
−
s
m
t
p
−
d
a
i
l
y
−
c
o
u
n
t
e
r
′
,
′
00
∗
∗
∗
′
,
BEGINIFNOTEXISTS(SELECT1FROMcron.jobWHEREjobname= 
′
 reset−smtp−daily−counter 
′
 )THENPERFORMcron.schedule( 
′
 reset−smtp−daily−counter 
′
 , 
′
 00∗∗∗ 
′
 ,UPDATE public.smtp_configs SET sent_today = 0
)
;
E
N
D
I
F
;
E
N
D
);ENDIF;END;*

-- ── INDEXES ── CREATE INDEX IF NOT EXISTS idx_prospects_campaign ON public.prospects(campaign_id); CREATE INDEX IF NOT EXISTS idx_prospects_user ON public.prospects(user_id); CREATE INDEX IF NOT EXISTS idx_emails_prospect ON public.emails(prospect_id); CREATE INDEX IF NOT EXISTS idx_emails_campaign ON public.emails(campaign_id); CREATE INDEX IF NOT EXISTS idx_emails_scheduled ON public.emails(scheduled_at) WHERE status = 'scheduled'; CREATE INDEX IF NOT EXISTS idx_campaigns_user ON public.campaigns(user_id);

-- Ensure gen_random_uuid function availability (extension pgcrypto / or uuid-ossp alternative) -- If gen_random_uuid is not available, uuid_generate_v4() from uuid-ossp is used by default above. CREATE EXTENSION IF NOT EXISTS pgcrypto;

--- Fin du script SQL ---

