import apiClient from './apiClient.js';
import { serviceBaseUrls } from './endpoints.js';

export async function getOrderBook(symbol) {
  const response = await apiClient.get(`${serviceBaseUrls.matchingEngine}/api/v1/matching-engine/orderbook/${symbol}`);
  return response.data;
}
