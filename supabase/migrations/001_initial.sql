-- ═══════════════════════════════════════════════════════════
-- RESIDUAL REACH — Supabase Migration 001
-- Exécuter dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_cron;

-- ── PROFILES ──
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text,
  plan            text default 'free' check (plan in ('free','starter','pro','agency')),
  prospects_used  int default 0,
  prospects_limit int default 20,
  stripe_customer_id text unique,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "users see own profile" on public.profiles
  for all using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── SMTP CONFIGS ──
create table public.smtp_configs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade,
  provider      text check (provider in ('gmail','outlook','custom')),
  email         text not null,
  display_name  text,
  access_token  text,
  refresh_token text,
  smtp_host     text,
  smtp_port     int,
  smtp_user     text,
  smtp_pass     text,
  is_active     boolean default true,
  daily_limit   int default 50,
  sent_today    int default 0,
  warmup_day    int default 1,
  created_at    timestamptz default now()
);

alter table public.smtp_configs enable row level security;
create policy "users see own smtp" on public.smtp_configs
  for all using (auth.uid() = user_id);

-- ── CAMPAIGNS ──
create table public.campaigns (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id) on delete cascade,
  name           text not null,
  icp_raw        text not null,
  icp_parsed     jsonb,
  status         text default 'draft' check (status in ('draft','running','paused','completed')),
  sequence_config jsonb default '{"steps":[0,3,7,14]}'::jsonb,
  smtp_config_id  uuid references public.smtp_configs(id),
  prospects_count int default 0,
  emails_sent     int default 0,
  opens           int default 0,
  replies         int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.campaigns enable row level security;
create policy "users see own campaigns" on public.campaigns
  for all using (auth.uid() = user_id);

-- ── PROSPECTS ──
create table public.prospects (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid references public.campaigns(id) on delete cascade,
  user_id         uuid references public.profiles(id) on delete cascade,
  company_name    text not null,
  company_domain  text,
  company_size    text,
  company_sector  text,
  contact_name    text,
  contact_title   text,
  email           text,
  email_status    text default 'unverified' check (email_status in ('verified','unverified','invalid','uncertain')),
  email_method    text,
  context         jsonb,
  score           int default 0,
  status          text default 'found' check (status in ('found','enriched','email_ready','sent','opened','replied','bounced','unsubscribed')),
  created_at      timestamptz default now()
);

alter table public.prospects enable row level security;
create policy "users see own prospects" on public.prospects
  for all using (auth.uid() = user_id);

-- ── EMAILS ──
create table public.emails (
  id              uuid primary key default gen_random_uuid(),
  prospect_id     uuid references public.prospects(id) on delete cascade,
  campaign_id     uuid references public.campaigns(id) on delete cascade,
  user_id         uuid references public.profiles(id) on delete cascade,
  subject         text not null,
  body            text not null,
  sequence_step   int default 0,
  status          text default 'scheduled' check (status in ('scheduled','sent','opened','clicked','replied','bounced','failed')),
  scheduled_at    timestamptz,
  sent_at         timestamptz,
  opened_at       timestamptz,
  replied_at      timestamptz,
  tracking_id     text unique default gen_random_uuid()::text,
  created_at      timestamptz default now()
);

alter table public.emails enable row level security;
create policy "users see own emails" on public.emails
  for all using (auth.uid() = user_id);

-- ── SUBSCRIPTIONS ──
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid unique references public.profiles(id) on delete cascade,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  plan                    text default 'free',
  status                  text default 'active',
  payment_status          text default 'paid',
  current_period_end      timestamptz,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

alter table public.subscriptions enable row level security;
create policy "users see own subscription" on public.subscriptions
  for all using (auth.uid() = user_id);

-- ── RESET SMTP DAILY COUNTER ──
select cron.schedule(
  'reset-smtp-daily-counter',
  '0 0 * * *',
  $$update public.smtp_configs set sent_today = 0$$
);

-- ── INDEXES ──
create index idx_prospects_campaign on public.prospects(campaign_id);
create index idx_prospects_user on public.prospects(user_id);
create index idx_emails_prospect on public.emails(prospect_id);
create index idx_emails_campaign on public.emails(campaign_id);
create index idx_emails_scheduled on public.emails(scheduled_at) where status = 'scheduled';
create index idx_campaigns_user on public.campaigns(user_id);
