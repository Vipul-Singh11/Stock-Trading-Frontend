import apiClient from './apiClient.js';
import { serviceBaseUrls } from './endpoints.js';
import { getCurrentUser } from './userService.js';

export async function loginUser(payload) {
  const response = await apiClient.post(`${serviceBaseUrls.user}/api/auth/login`, payload);
  return response.data;
}

export async function registerUser(payload) {
  const response = await apiClient.post(`${serviceBaseUrls.user}/api/auth/register`, payload);
  return response.data;
}

export { getCurrentUser };
