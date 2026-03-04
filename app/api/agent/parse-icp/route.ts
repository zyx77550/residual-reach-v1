import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseIcp } from '@/lib/agent/orchestrator'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 })

  const parsed = await parseIcp(text)
  return NextResponse.json(parsed)
}
