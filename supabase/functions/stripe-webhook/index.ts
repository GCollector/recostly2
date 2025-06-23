import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const updateUserSubscription = async (
  customerId: string,
  subscriptionId: string,
  status: string,
  priceId: string
) => {
  console.log(`Updating user subscription: ${customerId}, ${subscriptionId}, ${status}, ${priceId}`);

  try {
    // Get the user with this Stripe customer ID
    const { data: profiles, error: profileError } = await supabase
      .from("profile")
      .select("*")
      .eq("stripe_customer_id", customerId);

    if (profileError) {
      throw profileError;
    }

    if (!profiles || profiles.length === 0) {
      throw new Error(`No user found with Stripe customer ID: ${customerId}`);
    }

    const profile = profiles[0];
    console.log(`Found user: ${profile.email}`);

    // Determine the tier based on the price ID
    // IMPORTANT: Update tier to 'basic' or 'premium' based on the Stripe product
    let tier = 'free';
    
    // Basic tier price IDs
    if (priceId === 'price_1OdXXXXXXXXXXXXXXXXXXXXX' || 
        priceId === 'prod_SXY4I87Xnc7zg8') {
      tier = 'basic';
    }
    // Premium tier price IDs
    else if (priceId === 'price_1OdXXXXXXXXXXXXXXXXXXXXX' || 
             priceId === 'prod_SXEpTlnMRbHpRZ' ||
             priceId === 'prod_SXY51SrzMqJqNq') {
      tier = 'premium';
    }

    // If subscription is not active, revert to free tier
    if (status !== 'active' && status !== 'trialing') {
      tier = 'free';
    }

    // Update the user's subscription information
    const { error: updateError } = await supabase
      .from("profile")
      .update({
        stripe_subscription_id: subscriptionId,
        subscription_status: status,
        tier: tier, // Update tier based on subscription
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      throw updateError;
    }

    console.log(`Updated user ${profile.email} subscription to ${tier} tier with status ${status}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating user subscription:", error);
    throw error;
  }
};

serve(async (req) => {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature provided", { status: 400 });
    }

    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook signature verification failed: ${err.message}`, {
        status: 400,
      });
    }

    console.log(`Received Stripe webhook event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        
        // Get the price ID from the subscription
        let priceId = "";
        if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
          priceId = subscription.items.data[0].price.id;
        }
        
        await updateUserSubscription(customerId, subscriptionId, status, priceId);
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        const deletedCustomerId = deletedSubscription.customer as string;
        const deletedSubscriptionId = deletedSubscription.id;
        
        // When subscription is deleted, update status to canceled and revert to free tier
        await updateUserSubscription(deletedCustomerId, deletedSubscriptionId, "canceled", "");
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});