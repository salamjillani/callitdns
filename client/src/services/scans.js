import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

export const runHealthScan = async (domain) => {
  const scanFunction = httpsCallable(functions, 'runHealthScan');
  
  try {
    const result = await scanFunction({ domain });
    return result.data;
  } catch (error) {
    console.error('Error calling scan function:', error);
    throw error;
  }
};