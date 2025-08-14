// client/src/services/scans.js - Updated with better auth handling
import { functions, auth } from '../firebase';
import { httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

// Ensure functions are connected to the right region
// connectFunctionsEmulator(functions, "localhost", 5001); // Only for local development

export const runHealthScan = async (domain) => {
  console.log('=== SCAN REQUEST START ===');
  
  // Check if user is authenticated
  const currentUser = auth.currentUser;
  console.log('Current user for scan:', {
    uid: currentUser?.uid,
    email: currentUser?.email,
    emailVerified: currentUser?.emailVerified
  });
  
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    // Force token refresh and wait longer for propagation
    console.log('Getting fresh token for scan...');
    const idToken = await currentUser.getIdToken(true);
    console.log('Fresh token obtained:', {
      length: idToken?.length,
      starts: idToken?.substring(0, 20) + '...'
    });
    
    // Validate token format
    if (!idToken || idToken.length < 500) {
      throw new Error('Invalid token received from Firebase Auth');
    }
    
    // Wait longer for token propagation to Firebase Functions
    console.log('Waiting for token propagation...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Creating callable function...');
    const scanFunction = httpsCallable(functions, 'runHealthScan');
    
    console.log('Calling runHealthScan function with domain:', domain);
    const result = await scanFunction({ domain });
    
    console.log('Scan function result:', result.data);
    return result.data;
    
  } catch (error) {
    console.error('=== SCAN ERROR ===');
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details
    });
    
    // Handle specific authentication errors
    if (error.code === 'functions/unauthenticated' || 
        error.message?.includes('unauthenticated') ||
        error.message?.includes('Authentication required')) {
      
      console.log('Auth error detected, trying complete sign-out/sign-in cycle...');
      
      try {
        // Complete sign-out and sign-in cycle
        const user = auth.currentUser;
        if (user) {
          console.log('Attempting to refresh user session...');
          await user.reload();
          
          // Force a complete token refresh
          const newToken = await user.getIdToken(true);
          console.log('New token obtained after reload:', {
            length: newToken?.length,
            different: newToken !== idToken
          });
          
          // Wait even longer before retry
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          console.log('Retrying scan with refreshed auth...');
          const scanFunction = httpsCallable(functions, 'runHealthScan');
          const retryResult = await scanFunction({ domain });
          return retryResult.data;
        }
        
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        throw new Error('Authentication failed. Please sign out completely and sign back in.');
      }
    }
    
    // Handle other specific errors
    if (error.code === 'functions/internal') {
      throw new Error('Scan service temporarily unavailable. Please try again in a moment.');
    }
    
    if (error.code === 'functions/invalid-argument') {
      throw new Error('Invalid domain provided. Please check the domain name and try again.');
    }
    
    // Generic error
    throw new Error(`Scan failed: ${error.message || 'Unknown error occurred'}`);
  }
};
