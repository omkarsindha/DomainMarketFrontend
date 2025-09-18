export const API_BASE_URL = 'http://10.0.2.2:8000';

export const API_ENDPOINTS = {

    login: '/auth/login',
    register: '/auth/register',

    userDetails: '/users/user-details',

    trendingDomains: '/domains/trending-domains',
    registerDomain: (domain, years) => `/domains/register?domain=${encodeURIComponent(domain)}&years=${years}`,
    checkDomain: '/domains/check',
    trendingTlds: '/domains/trending-tlds',
};