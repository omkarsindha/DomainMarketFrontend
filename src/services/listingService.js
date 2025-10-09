import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { getToken } from './authService';

export const createListing = async (domainName, price) => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.createListing}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ domain_name: domainName, price }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to create listing');
  return data;
};

export const getActiveListings = async () => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.getActiveListings}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to fetch listings');
  return data;
};

export const getMyListings = async () => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.getMyListings}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to fetch your listings');
  return data;
};

export const purchaseListing = async (listingId) => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.purchaseListing(listingId)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to purchase listing');
  return data;
};

export const cancelListing = async (listingId) => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.cancelListing(listingId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to cancel listing');
  return data;
};
