const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getDNSRecords } = require('./cloudflare');
const { analyzeWithGemini } = require('./gemini');
const { processDottyCommand, executeDottyActions } = require('./dotty');
const { 
  createCheckoutSession, 
  createPortalSession, 
  getCustomerByUserId,
  getSubscription,
  PLANS 
} = require('./stripe');

admin.initializeApp();

exports.runHealthScan = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    console.error('No auth context found');
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to run a scan.'
    );
  }

  console.log('User authenticated with UID:', context.auth.uid);
  
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
      .where('userId', '==', context.auth.uid)
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

exports.executeDottyCommand = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to use Dotty.'
    );
  }

  const { command, domain } = data;

  if (!command || !domain) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Command and domain are required.'
    );
  }

  try {
    // Get existing DNS records
    const existingRecords = await getDNSRecords(domain);
    
    // Process command with Dotty AI
    const dottyResponse = await processDottyCommand(command, domain, existingRecords);
    
    // Get zone ID for the domain
    const zoneId = await getZoneId(domain);
    
    // Execute the actions
    const results = await executeDottyActions(dottyResponse.actions, domain, zoneId);
    
    // Log command in Firestore for history
    await admin.firestore().collection('dotty_commands').add({
      userId: context.auth.uid,
      domain,
      command,
      interpretation: dottyResponse.interpretation,
      actions: dottyResponse.actions,
      results,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      interpretation: dottyResponse.interpretation,
      actions: dottyResponse.actions,
      results,
      warnings: dottyResponse.warnings,
      confirmationMessage: dottyResponse.confirmationMessage
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

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated.'
    );
  }

  const { priceId, successUrl, cancelUrl } = data;
  
  try {
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data() || {};
    
    const session = await createCheckoutSession(
      context.auth.uid,
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
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated.'
    );
  }

  const { returnUrl } = data;
  
  try {
    const customer = await getCustomerByUserId(context.auth.uid);
    
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
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated.'
    );
  }

  try {
    const customer = await getCustomerByUserId(context.auth.uid);
    
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
    return { plan: 'free', features: PLANS.free.features };
  }
});

// Webhook to handle Stripe events
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Update user's subscription status
      await admin.firestore().collection('users').doc(session.metadata.userId).set({
        subscriptionStatus: 'active',
        subscriptionId: session.subscription
      }, { merge: true });
      
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      
      // Update user's subscription status
      const customers = await stripe.customers.list({
        limit: 1,
        query: `id:'${subscription.customer}'`
      });
      
      if (customers.data.length > 0) {
        const userId = customers.data[0].metadata.userId;
        await admin.firestore().collection('users').doc(userId).set({
          subscriptionStatus: 'cancelled',
          subscriptionId: null
        }, { merge: true });
      }
      
      break;
  }
  
  res.json({ received: true });
});