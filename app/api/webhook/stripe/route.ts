import Stripe from 'stripe'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PLAN_LIMITS: Record<string, number> = {
  free:    20,
  starter: 200,
  pro:     1000,
  agency:  5000,
}

export async function POST(req: Request) {
  // ── raw body obligatoire pour vérification signature ──
  const body = await req.text()
  const sig  = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    console.error('Webhook signature verification failed')
    return new Response('Signature invalide', { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId  = session.metadata?.userId
      const plan    = session.metadata?.plan ?? 'starter'
      if (!userId) break

      await supabase.from('subscriptions').upsert({
        user_id:                userId,
        stripe_customer_id:     session.customer as string,
        stripe_subscription_id: session.subscription as string,
        plan,
        status:         'active',
        payment_status: 'paid',
      })

      await supabase.from('profiles').update({
        plan,
        stripe_customer_id: session.customer as string,
        prospects_limit: PLAN_LIMITS[plan] ?? 20,
      }).eq('id', userId)

      break
    }

    case 'customer.subscription.updated': {
      const sub  = event.data.object as Stripe.Subscription
      const plan = sub.metadata?.plan ?? 'starter'

      await supabase.from('subscriptions')
        .update({ plan, status: sub.status })
        .eq('stripe_subscription_id', sub.id)

      const { data: profile } = await supabase.from('profiles')
        .select('id').eq('stripe_customer_id', sub.customer as string).single()
      if (profile) {
        await supabase.from('profiles').update({
          plan,
          prospects_limit: PLAN_LIMITS[plan] ?? 20,
        }).eq('id', profile.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      await supabase.from('subscriptions')
        .update({ status: 'canceled', plan: 'free' })
        .eq('stripe_customer_id', sub.customer as string)

      await supabase.from('profiles')
        .update({ plan: 'free', prospects_limit: 20 })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice

      await supabase.from('subscriptions')
        .update({ payment_status: 'past_due' })
        .eq('stripe_customer_id', invoice.customer as string)
      break
    }
  }

  return new Response('OK', { status: 200 })
}
