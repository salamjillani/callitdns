const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    price: 19,
    features: {
      domains: 10,
      scansPerMonth: 100,
      dottyCommands: 50
    }
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    price: 99,
    features: {
      domains: -1, // unlimited
      scansPerMonth: -1,
      dottyCommands: -1
    }
  }
};

async function createCustomer(email, userId) {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId
    }
  });
  
  return customer;
}

async function createCheckoutSession(userId, email, priceId, successUrl, cancelUrl) {
  // Get or create customer
  let customer = await getCustomerByUserId(userId);
  
  if (!customer) {
    customer = await createCustomer(email, userId);
    
    // Save customer ID to Firestore
    await admin.firestore().collection('users').doc(userId).set({
      stripeCustomerId: customer.id
    }, { merge: true });
  }
  
  const session = await stripe.checkout.sessions.create({
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
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });
  
  return session;
}

async function getCustomerByUserId(userId) {
  const customers = await stripe.customers.list({
    limit: 1,
    query: `metadata['userId']:'${userId}'`
  });
  
  return customers.data[0] || null;
}

async function getSubscription(customerId) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1
  });
  
  return subscriptions.data[0] || null;
}

async function cancelSubscription(subscriptionId) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
  
  return subscription;
}

module.exports = {
  PLANS,
  createCustomer,
  createCheckoutSession,
  createPortalSession,
  getCustomerByUserId,
  getSubscription,
  cancelSubscription
};