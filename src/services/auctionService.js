import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { getToken } from './authService';

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized: Please login again.");
        }
        throw new Error(data.detail || `Server error: ${response.status}`);
    }
    return data;
};

const getHeaders = async () => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required.");
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

export const createAuction = async (auctionData) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.createAuction}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(auctionData),
    });
    return handleResponse(response);
};

export const getActiveAuctions = async () => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.getActiveAuctions}`, {
        method: 'GET',
        headers,
    });
    return handleResponse(response);
};

export const getAuctionDetails = async (auctionId) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.getAuctionDetails(auctionId)}`, {
        method: 'GET',
        headers,
    });
    return handleResponse(response);
};

export const placeBid = async (auctionId, amount) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.placeBid(auctionId)}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount }),
    });
    return handleResponse(response);
};