// src/services/authService.js
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Invalid username or password');
    }

    await AsyncStorage.setItem('access_token', data.access_token);
    return data;
};

export const registerUser = async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.register}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            email,
            password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
    }
    // Decide if you want to auto-login and store token here or redirect to login
    // For now, just returning data, signup screen redirects to login.
    // await AsyncStorage.setItem('access_token', data.access_token); 
    return data;
};

export const getToken = async () => {
    return await AsyncStorage.getItem('access_token');
};

export const removeToken = async () => {
    return await AsyncStorage.removeItem('access_token');
};

// Add a checkAuth function that could be used in AppNavigator
export const checkAuthStatus = async () => {
    const token = await getToken();
    return !!token; // Returns true if token exists, false otherwise
};