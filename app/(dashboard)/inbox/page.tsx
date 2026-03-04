import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InboxClient from './InboxClient'

export default async function InboxPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: emails } = await supabase
    .from('emails')
    .select('*, prospects(contact_name, company_name, contact_title, email)')
    .eq('user_id', user.id)
    .in('status', ['replied', 'opened'])
    .order('created_at', { ascending: false })
    .limit(50)

  return <InboxClient emails={emails ?? []} />
}
