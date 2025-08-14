// server/functions/src/stripe.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Stripe lazily to avoid initialization errors
let stripe;
const getStripe = () => {
  if (!stripe) {
    const Stripe = require('stripe');
    // Use Firebase Functions config in production, fallback to process.env for local development
    const secretKey = functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('Stripe secret key not configured. Please set stripe.secret_key in Firebase Functions config.');
    }
    
    stripe = Stripe(secretKey);
  }
  return stripe;
};

const PLANS = {
  free: {
    name: 'Free',
    priceId: null,
    features: {
      domains: 1,
      scansPerMonth: 10,
      dottyCommands: 5
    }
  },
  pro: {
    name: 'Pro',
    priceId: functions.config().stripe?.pro_price_id || process.env.STRIPE_PRO_PRICE_ID || 'price_1RvOH2R1JkzRn27a7Ru5ZHv0',
    price: 19,
    features: {
      domains: 10,
      scansPerMonth: 100,
      dottyCommands: 50
    }
  },
  enterprise: {
    name: 'Enterprise',
    priceId: functions.config().stripe?.enterprise_price_id || process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_1RvOKWR1JkzRn27aoCcblTD2',
    price: 99,
    features: {
      domains: -1, // unlimited
      scansPerMonth: -1,
      dottyCommands: -1
    }
  }
};

async function createCustomer(email, userId) {
  const stripeInstance = getStripe();
  const customer = await stripeInstance.customers.create({
    email,
    metadata: {
      userId
    }
  });
  
  return customer;
}

async function createCheckoutSession(userId, email, priceId, successUrl, cancelUrl) {
  const stripeInstance = getStripe();
  
  // Get or create customer
  let customer = await getCustomerByUserId(userId);
  
  if (!customer) {
    customer = await createCustomer(email, userId);
    
    // Save customer ID to Firestore
    await admin.firestore().collection('users').doc(userId).set({
      stripeCustomerId: customer.id
    }, { merge: true });
  }
  
  const session = await stripeInstance.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId
    }
  });
  
  return session;
}

async function createPortalSession(customerId, returnUrl) {
  const stripeInstance = getStripe();
  const session = await stripeInstance.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });
  
  return session;
}

async function getCustomerByUserId(userId) {
  const stripeInstance = getStripe();
  
  // Search for customer with userId in metadata
  // Note: This requires iterating through customers as Stripe doesn't support direct metadata search
  const customers = await stripeInstance.customers.list({
    limit: 100
  });
  
  const customer = customers.data.find(c => c.metadata.userId === userId);
  return customer || null;
}

async function getSubscription(customerId) {
  const stripeInstance = getStripe();
  const subscriptions = await stripeInstance.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1
  });
  
  return subscriptions.data[0] || null;
}

async function cancelSubscription(subscriptionId) {
  const stripeInstance = getStripe();
  const subscription = await stripeInstance.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
  
  return subscription;
}

// Export function to get Stripe instance for webhook handling
function getStripeForWebhook() {
  return getStripe();
}

module.exports = {
  PLANS,
  createCustomer,
  createCheckoutSession,
  createPortalSession,
  getCustomerByUserId,
  getSubscription,
  cancelSubscription,
  getStripeForWebhook
};