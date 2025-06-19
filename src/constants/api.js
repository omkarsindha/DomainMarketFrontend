export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {

    login: '/auth/login',
    register: '/auth/register',

    userDetails: '/users/user_details',

    trendingDomains: '/domains/trending_domains',
    registerDomain: (domain, years) => `/domains/register?domain=${encodeURIComponent(domain)}&years=${years}`,
    checkDomain: '/domains/check',
    trendingTlds: '/domains/trending_tlds',
};