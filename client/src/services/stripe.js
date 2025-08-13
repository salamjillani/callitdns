import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

export const createCheckoutSession = async (priceId, successUrl, cancelUrl) => {
  const checkoutFunction = httpsCallable(functions, 'createCheckoutSession');
  
  try {
    const result = await checkoutFunction({ priceId, successUrl, cancelUrl });
    return result.data;
  } catch (error) {
    console.error('Checkout session error:', error);
    throw error;
  }
};

export const createPortalSession = async (returnUrl) => {
  const portalFunction = httpsCallable(functions, 'createPortalSession');
  
  try {
    const result = await portalFunction({ returnUrl });
    return result.data;
  } catch (error) {
    console.error('Portal session error:', error);
    throw error;
  }
};

export const getUserSubscription = async () => {
  const subscriptionFunction = httpsCallable(functions, 'getUserSubscription');
  
  try {
    const result = await subscriptionFunction();
    return result.data;
  } catch (error) {
    console.error('Get subscription error:', error);
    throw error;
  }
};