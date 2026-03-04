import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: smtpConfigs }, { data: subscription }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('smtp_configs').select('*').eq('user_id', user.id),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
  ])

  return <SettingsClient profile={profile} smtpConfigs={smtpConfigs ?? []} subscription={subscription} />
}
