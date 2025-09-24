export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {

    login: '/auth/login',
    register: '/auth/register',

    myDomains: '/users/my-domains',
    userDetails: '/users/user-details',
    user: '/users/',
    myTransactions: '/users/my-transactions',
    trendingDomains: '/domains/trending-domains',
    registerDomain: (domain, years) => `/domains/register?domain=${encodeURIComponent(domain)}&years=${years}`,
    checkDomain: '/domains/check',
    trendingTlds: '/domains/trending-tlds',
    auctions: '/auctions',
    createAuction: '/auctions/create',
    bidOnAuction: '/auctions/bid',
    myAuctions: '/auctions/my-auctions',
};