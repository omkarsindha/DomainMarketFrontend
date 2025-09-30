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

export const createSetupIntent = async (username) => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required.");
    const url = `${API_BASE_URL}${API_ENDPOINTS.setupIntent}?username=${encodeURIComponent(username)}`;
    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    };

    const response = await fetch(url, options);

    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(responseData.detail || "Failed to create payment setup");
    }
    return responseData;
};

export const savePaymentMethod = async (username, paymentMethodId) => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required.");

    const url = `${API_BASE_URL}${API_ENDPOINTS.savePaymentMethod}`;
    const body = {
        username: username,
        payment_method_id: paymentMethodId
    };
    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    };

    const response = await fetch(url, options);

    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(responseData.detail || "Failed to save payment method");
    }
    return responseData;
};

export const getPaymentInfo = async (username) => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required.");

    const url = `${API_BASE_URL}${API_ENDPOINTS.paymentInfo}`;
    const options = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    };

    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.detail || "Failed to fetch payment info");
    }
    return responseData;
};

export const removePaymentMethod = async (username) => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required.");

    const url = `${API_BASE_URL}${API_ENDPOINTS.removePaymentMethod}`;
    const options = {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    };

    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.detail || "Failed to remove payment method");
    }
    return responseData;
};