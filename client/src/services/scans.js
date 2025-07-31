import { functions, auth } from '../firebase';
import { httpsCallable } from 'firebase/functions';

export const runHealthScan = async (domain) => {
  // Debug: Check current user
  const currentUser = auth.currentUser;
  console.log('Current user:', currentUser);
  console.log('User UID:', currentUser?.uid);
  console.log('User email:', currentUser?.email);
  
  if (!currentUser) {
    throw new Error('User not authenticated - no current user found');
  }

  // Get fresh ID token and log it (remove this in production!)
  try {
    const idToken = await currentUser.getIdToken(true);
    console.log('ID Token obtained:', idToken ? 'Yes' : 'No');
    console.log('Token length:', idToken?.length);
  } catch (tokenError) {
    console.error('Error getting ID token:', tokenError);
  }
  
  const scanFunction = httpsCallable(functions, 'runHealthScan');
  
  try {
    console.log('Calling function with domain:', domain);
    const result = await scanFunction({ domain });
    console.log('Function result:', result);
    return result.data;
  } catch (error) {
    console.error('Error calling scan function:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    throw error;
  }
};