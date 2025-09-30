import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { getToken } from './authService';

export const registerDomain = async (domainName, price, years) => {
    const token = await getToken();
    if (!token) {
        throw new Error("Authentication required. Please login.");
    }

    const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.purchaseDomain}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                domain: domainName,
                price: parseFloat(price),
                years: parseInt(years, 10),
            }),
        }
    );

    const result = await response.json();
    if (!response.ok) {
        const errorMessage = result.detail || result.error || `Server error: ${response.status}`;
        throw new Error(errorMessage);
    }
    return result;
};

export const fetchTrendingDomains = async () => {
    const token = await getToken();
    if (!token) {
        throw new Error("Authentication required. Please login.");
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.trendingDomains}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Error fetching trending domains');
    }
    return data;
};

export const checkDomainAvailability = async (domainName) => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required. Please login.");

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.checkDomain}?domain=${encodeURIComponent(domainName)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Session may have expired. Please login again.");
        throw new Error(data.detail || 'Failed to check domain availability.');
    }
    return data;
};

export const fetchTrendingTldsService = async () => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required. Please login.");

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.trendingTlds}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Session may have expired. Please login again.");
        throw new Error(data.detail || 'Failed to fetch trending TLDs.');
    }
    return data;
};

export const fetchMyDomains = async () => {
    const token = await getToken();
    if (!token) {
        throw new Error("Authentication required. Please login.");
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.myDomains}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Error fetching your domains');
    }
    return data;
};
