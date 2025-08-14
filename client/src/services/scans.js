// client/src/services/scans.js
import { functions, auth } from '../firebase';
import { httpsCallable } from 'firebase/functions';

export const runHealthScan = async (domain) => {
  // Check if user is authenticated
  const currentUser = auth.currentUser;
  console.log('Current user for scan:', currentUser?.uid);
  
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    console.log('Getting fresh token for scan...');
    
    // Force a token refresh with longer timeout
    const idToken = await currentUser.getIdToken(true);
    console.log('Fresh token obtained for scan, length:', idToken?.length);
    
    // Wait longer to ensure Firebase Functions can process the token
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Calling runHealthScan function with domain:', domain);
    
    // Create the callable function
    const scanFunction = httpsCallable(functions, 'runHealthScan');
    
    // Call the function with proper error handling
    const result = await scanFunction({ domain });
    console.log('Scan function result:', result.data);
    return result.data;
    
  } catch (error) {
    console.error('Scan function error:', error);
    
    // More specific error handling
    if (error.code === 'functions/unauthenticated' || 
        error.message?.includes('unauthenticated') ||
        error.message?.includes('Authentication required')) {
      console.log('Auth error detected, attempting retry...');
      
      try {
        // Sign out and back in approach
        console.log('Attempting complete re-authentication...');
        
        // Get a completely fresh token
        await new Promise(resolve => setTimeout(resolve, 1000));
        const freshToken = await currentUser.getIdToken(true);
        console.log('Retry token obtained, length:', freshToken?.length);
        
        // Wait even longer before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const scanFunction = httpsCallable(functions, 'runHealthScan');
        const retryResult = await scanFunction({ domain });
        return retryResult.data;
        
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        throw new Error('Authentication failed. Please sign out and sign in again to continue.');
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