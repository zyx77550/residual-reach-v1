import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: campaigns }, { data: prospects }, { data: profile }] = await Promise.all([
    supabase.from('campaigns').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('prospects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  const stats = {
    emailsSent:       campaigns?.reduce((s, c) => s + (c.emails_sent ?? 0), 0) ?? 0,
    openRate:         campaigns?.length ? Math.round(campaigns.reduce((s, c) => s + (c.opens / Math.max(c.emails_sent, 1) * 100), 0) / campaigns.length) : 0,
    replyRate:        campaigns?.length ? Math.round(campaigns.reduce((s, c) => s + (c.replies / Math.max(c.emails_sent, 1) * 100), 0) / campaigns.length) : 0,
    activeCampaigns:  campaigns?.filter(c => c.status === 'running').length ?? 0,
  }

  return <DashboardClient campaigns={campaigns ?? []} prospects={prospects ?? []} stats={stats} profile={profile} />
}
