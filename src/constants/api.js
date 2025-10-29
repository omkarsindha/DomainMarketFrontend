export const API_BASE_URL = 'http://10.0.2.2:8000';

export const API_ENDPOINTS = {

    login: '/auth/login',
    register: '/auth/register',

    myDomains: '/users/my-domains',
    userDetails: '/users/user-details',
    user: '/users/',
    myTransactions: '/users/my-transactions',
    trendingDomains: '/domains/trending-domains',
    registerDomain: (domain, years) => `/domains/register?domain=${encodeURIComponent(domain)}&years=${years}`,
    purchaseDomain: `/domains/purchase-domain`,
    checkDomain: '/domains/check',
    trendingTlds: '/domains/trending-tlds',

    setupIntent: '/users/setup-intent',
    savePaymentMethod: '/users/save-payment-method',

    createAuction: '/auctions/',
    getActiveAuctions: '/auctions/',
    getAuctionDetails: (auctionId) => `/auctions/${auctionId}`,
    placeBid: (auctionId) => `/auctions/${auctionId}/bids`,
    paymentInfo: '/users/payment-info',
    removePaymentMethod: '/users/payment-method',
    getMySellingAuctions: '/auctions/my-selling-auctions',
    cancelAuction: (auctionId) => `/auctions/${auctionId}`,
    createListing: '/listings/',
    getActiveListings: '/listings/',
    getMyListings: '/listings/my-listings',
    getMyPurchases: '/listings/my-purchases',
    getListingDetails: (listingId) => `/listings/${listingId}`,
    purchaseListing: (listingId) => `/listings/${listingId}/purchase`,
    cancelListing: (listingId) => `/listings/${listingId}`,

    getDnsRecords: (sld, tld) => `/domains/manage/${sld}/${tld}/dns`,
    updateDnsRecords: (sld, tld) => `/domains/manage/${sld}/${tld}/dns/update`,
};