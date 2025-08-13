import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

export const executeDottyCommand = async (command, domain) => {
  const dottyFunction = httpsCallable(functions, 'executeDottyCommand');
  
  try {
    const result = await dottyFunction({ command, domain });
    return result.data;
  } catch (error) {
    console.error('Dotty command error:', error);
    throw error;
  }
};

export const getDottyHistory = async (domain) => {
  const historyFunction = httpsCallable(functions, 'getDottyHistory');
  
  try {
    const result = await historyFunction({ domain });
    return result.data;
  } catch (error) {
    console.error('Get history error:', error);
    throw error;
  }
};