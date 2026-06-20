import apiClient from './apiClient.js';
import { serviceBaseUrls } from './endpoints.js';

export async function getCurrentUser() {
  const response = await apiClient.get(`${serviceBaseUrls.user}/api/users/me`);
  return response.data;
}

export async function creditWallet(userId, amount) {
  const response = await apiClient.post(`${serviceBaseUrls.user}/api/users/credit`, null, {
    params: { userId, amount },
  });

  return response.data;
}

export async function debitWallet(userId, amount) {
  const response = await apiClient.post(`${serviceBaseUrls.user}/api/users/debit`, null, {
    params: { userId, amount },
  });

  return response.data;
}