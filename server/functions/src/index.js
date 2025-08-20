// server/functions/src/index.js
const {onCall, onRequest, HttpsError} = require('firebase-functions/v2/https');
const {setGlobalOptions} = require('firebase-functions/v2/options');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { createSupportTicket, getUserTickets } = require('./support');

// Set global options
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
});

// Initialize Firebase Admin
admin.initializeApp();

// Import other modules
const { getDNSRecords, getZoneId } = require('./cloudflare');
const { analyzeWithGemini } = require('./gemini');

// Enhanced auth verification function with better debugging
const verifyAuth = (request) => {
  console.log('=== AUTH VERIFICATION DEBUG ===');
  console.log('Full request received:', {
    hasAuth: !!(request && request.auth),
    hasUid: !!(request && request.auth && request.auth.uid),
    hasToken: !!(request && request.auth && request.auth.token),
    uid: request && request.auth ? request.auth.uid : 'missing',
    tokenPresent: request && request.auth && request.auth.token ? 'yes' : 'no'
  });
  
  // More detailed auth object inspection
  if (request && request.auth) {
    console.log('Auth object details:', {
      uid: request.auth.uid,
      email: request.auth.token ? request.auth.token.email : 'no email in token',
      emailVerified: request.auth.token ? request.auth.token.email_verified : 'no token',
      authTime: request.auth.token ? request.auth.token.auth_time : 'no token'
    });
  }
  
  console.log('=== END AUTH DEBUG ===');

  if (!request) {
    console.error('No request received');
    throw new HttpsError(
      'unauthenticated',
      'No authentication context received'
    );
  }

  if (!request.auth) {
    console.error('No auth in request');
    throw new HttpsError(
      'unauthenticated',
      'No authentication data received. Please ensure you are signed in.'
    );
  }

  if (!request.auth.uid) {
    console.error('No UID in auth');
    throw new HttpsError(
      'unauthenticated',
      'Invalid authentication token. Please sign out and sign in again.'
    );
  }
  
  return request.auth.uid;
};

// Health Scan Function with v2 API - Added secrets parameter
exports.runHealthScan = onCall({
  timeoutSeconds: 300,
  memory: '1GiB',
  cors: true,
  secrets: ['CLOUDFLARE_API_KEY', 'CLOUDFLARE_EMAIL', 'CLOUDFLARE_ZONE_ID', 'GEMINI_API_KEY']
}, async (request) => {
  console.log('=== HEALTH SCAN START ===');
  console.log('Function triggered');
  console.log('Request data:', request.data);

    console.log('Environment check:', {
    hasCloudflareKey: !!process.env.CLOUDFLARE_API_KEY,
    cloudflareKeyLength: process.env.CLOUDFLARE_API_KEY?.length || 0,
    cloudflareKeyPreview: process.env.CLOUDFLARE_API_KEY ? 
      `${process.env.CLOUDFLARE_API_KEY.substring(0, 5)}...${process.env.CLOUDFLARE_API_KEY.slice(-5)}` : 
      'missing',
    hasCloudflareEmail: !!process.env.CLOUDFLARE_EMAIL,
    cloudflareEmail: process.env.CLOUDFLARE_EMAIL || 'not set'
  });
  
  // Verify authentication
  let userId;
  try {
    userId = verifyAuth(request);
    console.log('Authentication successful for user:', userId);
  } catch (authError) {
    console.error('Authentication failed:', authError.message);
    throw authError;
  }
  
  const { domain } = request.data;

  if (!domain) {
    throw new HttpsError(
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

    console.log('Health scan completed successfully');
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
    throw new HttpsError(
      'internal',
      'Failed to complete DNS scan.',
      error.message
    );
  }
});

// Dotty Command Function - Added secrets parameter
exports.executeDottyCommand = onCall({
  timeoutSeconds: 300,
  memory: '1GiB',
  cors: true,
  secrets: ['CLOUDFLARE_API_KEY', 'CLOUDFLARE_EMAIL', 'CLOUDFLARE_ZONE_ID', 'GEMINI_API_KEY']
}, async (request) => {
  console.log('=== DOTTY COMMAND START ===');
  
  // Verify authentication
  const userId = verifyAuth(request);
  console.log('Authenticated user ID:', userId);

  const { command, domain } = request.data;

  if (!command || !domain) {
    throw new HttpsError(
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
    throw new HttpsError(
      'internal',
      'Failed to execute Dotty command.',
      error.message
    );
  }
});

// Stripe Functions - Added secrets parameter
exports.createCheckoutSession = onCall({
  timeoutSeconds: 60,
  memory: '256MiB',
  cors: true,
  secrets: ['STRIPE_SECRET_KEY', 'STRIPE_PRO_PRICE_ID', 'STRIPE_ENTERPRISE_PRICE_ID']
}, async (request) => {
  const userId = verifyAuth(request);
  const { priceId, successUrl, cancelUrl } = request.data;
  
  try {
    const { createCheckoutSession } = require('./stripe');
    
    const session = await createCheckoutSession(
      userId,
      request.auth.token.email,
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
    throw new HttpsError(
      'internal',
      'Failed to create checkout session.',
      error.message
    );
  }
});

exports.createPortalSession = onCall({
  timeoutSeconds: 60,
  memory: '256MiB',
  cors: true,
  secrets: ['STRIPE_SECRET_KEY']
}, async (request) => {
  const userId = verifyAuth(request);
  const { returnUrl } = request.data;
  
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
    throw new HttpsError(
      'internal',
      'Failed to create portal session.',
      error.message
    );
  }
});

exports.getUserSubscription = onCall({
  timeoutSeconds: 60,
  memory: '256MiB',
  cors: true,
  secrets: ['STRIPE_SECRET_KEY', 'STRIPE_PRO_PRICE_ID', 'STRIPE_ENTERPRISE_PRICE_ID']
}, async (request) => {
  const userId = verifyAuth(request);

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

exports.createSupportTicket = onCall({
  timeoutSeconds: 60,
  memory: '256MiB',
  cors: true
}, async (request) => {
  try {
    return await createSupportTicket(request);
  } catch (error) {
    console.error('Create support ticket error:', error);
    throw new HttpsError(
      'internal',
      'Failed to create support ticket',
      error.message
    );
  }
});

exports.getUserTickets = onCall({
  timeoutSeconds: 60,
  memory: '256MiB',
  cors: true
}, async (request) => {
  try {
    return await getUserTickets(request);
  } catch (error) {
    console.error('Get user tickets error:', error);
    throw new HttpsError(
      'internal',
      'Failed to get tickets',
      error.message
    );
  }
});


// Stripe Webhook (with CORS handling) - Added secrets parameter
exports.stripeWebhook = onRequest({
  timeoutSeconds: 60,
  memory: '256MiB',
  cors: true,
  secrets: ['STRIPE_WEBHOOK_SECRET', 'STRIPE_SECRET_KEY']
}, async (req, res) => {
  // Handle CORS
  return cors(req, res, async () => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    const { getStripeForWebhook } = require('./stripe');
    const stripe = getStripeForWebhook();
    
    const sig = req.headers['stripe-signature'];
    // Now using process.env which will be populated from secrets
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
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