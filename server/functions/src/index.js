const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getDNSRecords } = require('./cloudflare');
const { analyzeWithGemini } = require('./gemini');

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