// server/functions/src/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

// Import other modules
const { getDNSRecords, getZoneId } = require('./cloudflare');
const { analyzeWithGemini } = require('./gemini');

// Enhanced auth verification function
const verifyAuth = (context) => {
  console.log('Verifying auth context:', {
    hasAuth: !!context.auth,
    hasUid: !!(context.auth && context.auth.uid),
    uid: context.auth?.uid,
    token: context.auth?.token ? 'present' : 'missing'
  });

  if (!context.auth || !context.auth.uid) {
    console.error('Authentication failed:', {
      auth: context.auth,
      uid: context.auth?.uid
    });
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required. Please sign out and sign in again.'
    );
  }
  
  return context.auth.uid;
};

// Health Scan Function with enhanced auth handling
exports.runHealthScan = functions.https.onCall(async (data, context) => {
  console.log('Health scan request received');
  console.log('Raw context:', JSON.stringify(context, null, 2));
  
  // Verify authentication
  const userId = verifyAuth(context);
  console.log('Authenticated user ID:', userId);
  
  const { domain } = data;

  if (!domain) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Domain name is required.'
    );
  }

  try {
    // Fetch DNS records from Cloudflare
    console.log(`Fetching DNS records for ${domain}`);
    const dnsRecords = await getDNSRecords(domain);

    // Analyze records with Gemini AI
    console.log('Analyzing DNS records with AI...');
    const analysis = await analyzeWithGemini(dnsRecords, domain);

    // Update last scanned timestamp in Firestore
    const domainsRef = admin.firestore().collection('domains');
    const domainQuery = await domainsRef
      .where('userId', '==', userId)
      .where('name', '==', domain)
      .limit(1)
      .get();

    if (!domainQuery.empty) {
      const domainDoc = domainQuery.docs[0];
      await domainDoc.ref.update({
        lastScanned: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return {
      success: true,
      domain,
      records: dnsRecords,
      issues: analysis.issues || [],
      recommendations: analysis.recommendations || [],
      scanDate: new Date().toISOString()
    };

  } catch (error) {
    console.error('Scan error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to complete DNS scan.',
      error.message
    );
  }
});

// Dotty Command Function with enhanced auth handling
exports.executeDottyCommand = functions.https.onCall(async (data, context) => {
  console.log('Dotty command request received');
  
  // Verify authentication
  const userId = verifyAuth(context);
  console.log('Authenticated user ID:', userId);

  const { command, domain } = data;

  if (!command || !domain) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Command and domain are required.'
    );
  }

  try {
    // Check if dotty.js exists, if not use fallback
    let dottyResponse;
    let results = [];
    
    try {
      const { processDottyCommand, executeDottyActions } = require('./dotty');
      
      // Get existing DNS records
      const existingRecords = await getDNSRecords(domain);
      
      // Process command with Dotty AI
      dottyResponse = await processDottyCommand(command, domain, existingRecords);
      
      // Get zone ID for the domain
      const zoneId = await getZoneId(domain);
      
      // Execute the actions
      results = await executeDottyActions(dottyResponse.actions, domain, zoneId);
      
    } catch (moduleError) {
      console.log('Dotty module error:', moduleError);
      // Fallback response
      dottyResponse = {
        interpretation: `Processing command: ${command}`,
        actions: [],
        warnings: ['Dotty AI is being configured. Please try again later.'],
        confirmationMessage: 'Command received but not processed.'
      };
    }
    
    // Log command in Firestore for history
    await admin.firestore().collection('dotty_commands').add({
      userId: userId,
      domain,
      command,
      interpretation: dottyResponse.interpretation,
      actions: dottyResponse.actions || [],
      results: results || [],
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      interpretation: dottyResponse.interpretation,
      actions: dottyResponse.actions || [],
      results: results || [],
      warnings: dottyResponse.warnings || [],
      confirmationMessage: dottyResponse.confirmationMessage || ''
    };
  } catch (error) {
    console.error('Dotty command error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to execute Dotty command.',
      error.message
    );
  }
});

// Stripe Functions (enhanced auth handling)
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  const userId = verifyAuth(context);
  const { priceId, successUrl, cancelUrl } = data;
  
  try {
    const { createCheckoutSession } = require('./stripe');
    
    const session = await createCheckoutSession(
      userId,
      context.auth.token.email,
      priceId,
      successUrl,
      cancelUrl
    );
    
    return {
      sessionId: session.id,
      url: session.url
    };
  } catch (error) {
    console.error('Checkout session error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create checkout session.',
      error.message
    );
  }
});

exports.createPortalSession = functions.https.onCall(async (data, context) => {
  const userId = verifyAuth(context);
  const { returnUrl } = data;
  
  try {
    const { createPortalSession, getCustomerByUserId } = require('./stripe');
    
    const customer = await getCustomerByUserId(userId);
    
    if (!customer) {
      throw new Error('No customer found');
    }
    
    const session = await createPortalSession(customer.id, returnUrl);
    
    return {
      url: session.url
    };
  } catch (error) {
    console.error('Portal session error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create portal session.',
      error.message
    );
  }
});

exports.getUserSubscription = functions.https.onCall(async (data, context) => {
  const userId = verifyAuth(context);

  try {
    const { getCustomerByUserId, getSubscription, PLANS } = require('./stripe');
    
    const customer = await getCustomerByUserId(userId);
    
    if (!customer) {
      return { plan: 'free', features: PLANS.free.features };
    }
    
    const subscription = await getSubscription(customer.id);
    
    if (!subscription) {
      return { plan: 'free', features: PLANS.free.features };
    }
    
    // Determine plan based on price ID
    let plan = 'free';
    for (const [key, value] of Object.entries(PLANS)) {
      if (value.priceId === subscription.items.data[0].price.id) {
        plan = key;
        break;
      }
    }
    
    return {
      plan,
      features: PLANS[plan].features,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    };
  } catch (error) {
    console.error('Get subscription error:', error);
    const { PLANS } = require('./stripe');
    return { plan: 'free', features: PLANS.free.features };
  }
});

// Stripe Webhook (with CORS handling)
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  return cors(req, res, async () => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    const { getStripeForWebhook } = require('./stripe');
    const stripe = getStripeForWebhook();
    
    const sig = req.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
      console.error('Webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }
    
    let event;
    
    try {
      // Use req.rawBody for signature verification
      const payload = req.rawBody || req.body;
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          
          // Update user's subscription status
          if (session.metadata && session.metadata.userId) {
            await admin.firestore().collection('users').doc(session.metadata.userId).set({
              subscriptionStatus: 'active',
              subscriptionId: session.subscription,
              stripeCustomerId: session.customer
            }, { merge: true });
            
            console.log(`Subscription activated for user ${session.metadata.userId}`);
          }
          break;
          
        case 'customer.subscription.deleted':
          const subscription = event.data.object;
          
          // Find user by customer ID and update subscription status
          const usersRef = admin.firestore().collection('users');
          const userSnapshot = await usersRef.where('stripeCustomerId', '==', subscription.customer).limit(1).get();
          
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            await userDoc.ref.set({
              subscriptionStatus: 'cancelled',
              subscriptionId: null
            }, { merge: true });
            
            console.log(`Subscription cancelled for user ${userDoc.id}`);
          }
          break;
          
        case 'customer.subscription.updated':
          const updatedSubscription = event.data.object;
          
          // Find user and update subscription status
          const usersRef2 = admin.firestore().collection('users');
          const userSnapshot2 = await usersRef2.where('stripeCustomerId', '==', updatedSubscription.customer).limit(1).get();
          
          if (!userSnapshot2.empty) {
            const userDoc = userSnapshot2.docs[0];
            await userDoc.ref.set({
              subscriptionStatus: updatedSubscription.status,
              subscriptionId: updatedSubscription.id
            }, { merge: true });
            
            console.log(`Subscription updated for user ${userDoc.id}`);
          }
          break;
          
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });
});