import apiClient from './apiClient.js';
import { serviceBaseUrls } from './endpoints.js';

export async function getPortfolio(userId) {
  const response = await apiClient.get(`${serviceBaseUrls.portfolio}/api/portfolio/${userId}`);
  return response.data;
}

export async function getPortfolioSummary(userId) {
  const response = await apiClient.get(`${serviceBaseUrls.portfolio}/api/portfolio/summary/${userId}`);
  return response.data;
}

export async function getTradeHistory(userId) {
  const response = await apiClient.get(`${serviceBaseUrls.portfolio}/api/portfolio/trades/${userId}`);
  return response.data;
}
