import apiClient from './apiClient.js';
import { serviceBaseUrls } from './endpoints.js';

export async function getOrders() {
  const response = await apiClient.get(`${serviceBaseUrls.orders}/api/orders`);
  return response.data;
}

export async function placeOrder(payload) {
  const response = await apiClient.post(`${serviceBaseUrls.orders}/api/orders`, payload);
  return response.data;
}

export async function cancelOrder(orderId) {
  const response = await apiClient.put(`${serviceBaseUrls.orders}/api/orders/${orderId}/cancel`);
  return response.data;
}
