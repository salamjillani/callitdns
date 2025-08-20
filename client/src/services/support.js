// client/src/services/support.js
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

export const createSupportTicket = async (ticketData) => {
  const createTicket = httpsCallable(functions, 'createSupportTicket');
  const result = await createTicket(ticketData);
  return result.data;
};

export const getSupportTickets = async () => {
  const getTickets = httpsCallable(functions, 'getUserTickets');
  const result = await getTickets();
  return result.data;
};