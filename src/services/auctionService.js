// src/services/auctionService.js
// Mock Auction Service (replace with real API later)

let mockAuctions = [
    {
      id: 1,
      domain: "cooldomain.com",
      seller_masked: "user_12",
      start_price: 10,
      current_bid: 25,
      min_increment: 5,
      buy_now_price: 100,
      start_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // started 1hr ago
      end_time: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // ends in 24hrs
      status: "active",
      bids: [
        { id: 101, user_id_masked: "bidder_44", amount: 20, timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
        { id: 102, user_id_masked: "bidder_55", amount: 25, timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
      ]
    },
    {
      id: 2,
      domain: "brandnew.io",
      seller_masked: "user_34",
      start_price: 5,
      current_bid: 5,
      min_increment: 2,
      buy_now_price: 50,
      start_time: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      end_time: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
      status: "active",
      bids: []
    }
  ];
  
  let mockDomains = [
    { id: 201, domain_name: "myportfolio.net", expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(), price: 12 },
    { id: 202, domain_name: "myblog.org", expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 100).toISOString(), price: 9 }
  ];
  
  export async function fetchActiveAuctions() {
    return new Promise((resolve) => setTimeout(() => resolve(mockAuctions), 500));
  }
  
  export async function fetchAuctionDetails(id) {
    const auction = mockAuctions.find(a => a.id === id);
    return new Promise((resolve) => setTimeout(() => resolve(auction), 300));
  }
  
  export async function fetchMyDomains() {
    return new Promise((resolve) => setTimeout(() => resolve(mockDomains), 300));
  }
  
  export async function listDomainForAuction(domain) {
    const newAuction = {
      id: Date.now(),
      domain: domain.domain_name,
      seller_masked: "me",
      start_price: 10,
      current_bid: 10,
      min_increment: 1,
      buy_now_price: 100,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      status: "active",
      bids: []
    };
    mockAuctions.push(newAuction);
    // Remove domain from owned list
    mockDomains = mockDomains.filter(d => d.id !== domain.id);
    return new Promise((resolve) => setTimeout(() => resolve(newAuction), 500));
  }
  
  export async function placeBid(auctionId, amount) {
    const auction = mockAuctions.find(a => a.id === auctionId);
    if (!auction) throw new Error("Auction not found");
    if (amount < auction.current_bid + auction.min_increment) {
      throw new Error(`Bid too low. Min required: ${auction.current_bid + auction.min_increment}`);
    }
    auction.current_bid = amount;
    auction.bids.push({
      id: Date.now(),
      user_id_masked: "me",
      amount,
      timestamp: new Date().toISOString()
    });
    return new Promise((resolve) => setTimeout(() => resolve(auction), 400));
  }
  