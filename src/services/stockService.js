import apiClient from './apiClient.js';
import { serviceBaseUrls } from './endpoints.js';

export async function getStocks() {
  const response = await apiClient.get(`${serviceBaseUrls.stocks}/api/stocks`);
  return response.data;
}

export async function getStockBySymbol(symbol) {
  const response = await apiClient.get(`${serviceBaseUrls.stocks}/api/stocks/${symbol}`);
  return response.data;
}
