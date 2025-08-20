// server/functions/src/support.js
const admin = require('firebase-admin');
const { HttpsError } = require('firebase-functions/v2/https');

// Export raw functions that will be wrapped with onCall in index.js
const createSupportTicket = async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const { subject, message, priority, type, email, name, company } = request.data;

  // Validate required fields
  if (!subject || !message) {
    throw new HttpsError('invalid-argument', 'Subject and message are required');
  }

  const ticket = {
    userId,
    subject,
    message,
    priority: priority || 'normal',
    type: type || 'support',
    email: email || request.auth.token.email,
    name: name || '',
    company: company || '',
    status: 'open',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  try {
    const docRef = await admin.firestore().collection('support_tickets').add(ticket);
    
    console.log(`Support ticket created: ${docRef.id} for user: ${userId}`);
    
    return {
      success: true,
      ticketId: docRef.id,
      message: 'Support ticket created successfully'
    };
  } catch (error) {
    console.error('Error creating support ticket:', error);
    throw new HttpsError('internal', 'Failed to create support ticket');
  }
};

const getUserTickets = async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  try {
    const snapshot = await admin.firestore()
      .collection('support_tickets')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50) // Add a reasonable limit
      .get();

    const tickets = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Safely handle timestamp conversion
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });

    console.log(`Retrieved ${tickets.length} tickets for user: ${userId}`);

    return { 
      success: true,
      tickets,
      count: tickets.length
    };
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw new HttpsError('internal', 'Failed to fetch support tickets');
  }
};

// Export the functions (not using exports.functionName syntax)
module.exports = {
  createSupportTicket,
  getUserTickets
};