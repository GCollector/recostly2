import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')
  const body = await request.text()
  
  let receivedEvent
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    return new Response(err.message, { status: 400 })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  switch (receivedEvent.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = receivedEvent.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Get user by Stripe customer ID
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile) {
        // Determine tier based on subscription
        let tier = 'basic'
        if (subscription.items.data.some(item => 
          item.price.lookup_key === 'premium_monthly' || 
          item.price.lookup_key === 'premium_yearly'
        )) {
          tier = 'premium'
        }

        await supabaseClient
          .from('profiles')
          .update({
            tier,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
          })
          .eq('id', profile.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = receivedEvent.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile) {
        await supabaseClient
          .from('profiles')
          .update({
            tier: 'basic',
            stripe_subscription_id: null,
            subscription_status: 'canceled',
          })
          .eq('id', profile.id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = receivedEvent.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile) {
        await supabaseClient
          .from('profiles')
          .update({
            subscription_status: 'past_due',
          })
          .eq('id', profile.id)
      }
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})