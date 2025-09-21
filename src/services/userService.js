import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { getToken } from './authService';

export const fetchUserDetails = async () => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required. Please login.");

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.userDetails}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to fetch user details" }));
        throw new Error(errorData.detail || "Failed to fetch user details");
    }
    return await response.json();
};

export const updateUserDetails = async (userDetails) => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required. Please login.");

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.userDetails}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to update user details" }));
        throw new Error(errorData.detail || "Failed to update user details");
    }
    return await response.json();
};

export const fetchUser = async () => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required. Please login.");

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.user}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to fetch user details" }));
        throw new Error(errorData.detail || "Failed to fetch user details");
    }
    return await response.json();
};

export const fetchMyTransactions = async () => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required. Please login.");

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.myTransactions}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to fetch transactions" }));
        throw new Error(errorData.detail || "Failed to fetch transactions");
    }
    return await response.json();
};