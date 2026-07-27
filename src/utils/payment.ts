import type { AsaasPaymentStatus } from '../types';

export const isPaidStatus = (status?: AsaasPaymentStatus) => status === 'RECEIVED' || status === 'CONFIRMED';
