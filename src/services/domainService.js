import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { getToken } from './authService';

const handleResponse = async (response) => {
    try {
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Unauthorized: Please login again.");
            }
            throw new Error(data.detail || `Server error: ${response.status}`);
        }
        return data;
    } catch (e) {
        if (e instanceof SyntaxError) {
            console.error("Failed to parse JSON from server.");
            throw new Error(`An unexpected server error occurred. Status: ${response.status}`);
        }
        throw e;
    }
};

const getHeaders = async (includeContentType = true) => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required.");

    const headers = {
        'Authorization': `Bearer ${token}`,
    };
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

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


export const getDnsRecords = async (sld, tld) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.getDnsRecords(sld, tld)}`, {
        method: 'GET',
        headers: { 'Authorization': headers.Authorization },
    });
    return handleResponse(response);
};

export const updateDnsRecords = async (sld, tld, records) => {
    const headers = await getHeaders();

    const formattedRecords = records.map(r => ({
        hostname: r.hostname,
        record_type: r.record_type,
        address: r.address,
        ttl: Number(r.ttl) || 1800, // Ensure ttl is a number
        mx_pref: Number(r.mx_pref) || 10, // Ensure mx_pref is a number
    }));

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.updateDnsRecords(sld, tld)}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ records: formattedRecords }), // The body must be an object with a "records" key
    });

    // The handleResponse function you already have will process the success or error
    return handleResponse(response);
};