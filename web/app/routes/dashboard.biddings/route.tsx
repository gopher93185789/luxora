import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GetUserDetails, Refresh } from "~/pkg/api/auth";
import { GetUserBids, GetBidsOnUserListings, AcceptBid, type BidsOnUserListing } from "~/pkg/api/bidding";
import { getTokenFromServerSideCaller } from "~/pkg/helpers/server";
import { GetTokenFromLocalStorage } from "~/pkg/helpers/tokenHandling";
import { UserDetails, BidDetails } from "~/pkg/models/api";
import ShinyText from "~/components/ShinyText";

export async function loader(lfa: LoaderFunctionArgs) {
  const token = await getTokenFromServerSideCaller(lfa);
  if (!token) {
    return { requireRefresh: true };
  }
  const resp = await GetUserDetails(token);

  if ("code" in resp) {
    return { requireRefresh: true };
  }

  return { requireRefresh: false, user: resp };
}

export default function BiddingsDashboard() {
  const { requireRefresh, user } = useLoaderData<typeof loader>();
  const [data, setData] = useState<UserDetails | undefined>(
    !requireRefresh ? user : undefined
  );
  const [activeTab, setActiveTab] = useState<'my-bids' | 'incoming-bids'>('my-bids');
  const [userBids, setUserBids] = useState<BidDetails[]>([]);
  const [incomingBids, setIncomingBids] = useState<BidsOnUserListing[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [loadingIncoming, setLoadingIncoming] = useState(false);
  const [acceptingBid, setAcceptingBid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'won' | 'lost'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const handle = async () => {
      if (!requireRefresh) return;

      console.log("defaulting to csr");
      try {
        const rt = await Refresh();
        if (rt !== 200) throw new Error("Failed to refresh");

        const tk = GetTokenFromLocalStorage();
        await fetch("/auth/cookie", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tk }),
        });

        const token = GetTokenFromLocalStorage();
        const userData = await GetUserDetails(token);
        if ("code" in userData) throw new Error("Failed to fetch user");

        setData(userData);
      } catch {
        // navigate("/auth");
      }
    };

    handle();
  }, [requireRefresh, navigate]);

  const fetchUserBids = async () => {
    setLoadingBids(true);
    setError(null);
    try {
      const bids = await GetUserBids({
        limit: 50,
        page: 1,
        status: filter === 'all' ? undefined : filter
      });
      
      if ("code" in bids) {
        setError(bids.message);
        setUserBids([]);
      } else {
        setUserBids(bids);
        setError(null);
      }
    } catch (error) {
      console.error("Failed to fetch user bids:", error);
      setError("Failed to load your bids. Please try again.");
      setUserBids([]);
    } finally {
      setLoadingBids(false);
    }
  };

  const fetchIncomingBids = async () => {
    setLoadingIncoming(true);
    setError(null);
    try {
      const bids = await GetBidsOnUserListings();
      
      if ("code" in bids) {
        setError(bids.message);
        setIncomingBids([]);
      } else {
        setIncomingBids(bids);
        setError(null);
      }
    } catch (error) {
      console.error("Failed to fetch incoming bids:", error);
      setError("Failed to load incoming bids. Please try again.");
      setIncomingBids([]);
    } finally {
      setLoadingIncoming(false);
    }
  };

  const handleAcceptBid = async (bidId: string, productId: string) => {
    setAcceptingBid(bidId);
    try {
      const result = await AcceptBid(bidId, productId);
      
      if ("code" in result) {
        setError(result.message);
      } else {
        // Refresh incoming bids to reflect the change
        await fetchIncomingBids();
        setError(null);
      }
    } catch (error) {
      console.error("Failed to accept bid:", error);
      setError("Failed to accept bid. Please try again.");
    } finally {
      setAcceptingBid(null);
    }
  };

  useEffect(() => {
    if (data) {
      if (activeTab === 'my-bids') {
        fetchUserBids();
      } else {
        fetchIncomingBids();
      }
    }
  }, [data, filter, activeTab]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'winning':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'won':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'outbid':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'lost':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'active':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'winning':
        return 'Winning';
      case 'won':
        return 'Won';
      case 'outbid':
        return 'Outbid';
      case 'lost':
        return 'Lost';
      case 'active':
        return 'Active';
      default:
        return 'Unknown';
    }
  };

  const refreshCurrentTab = () => {
    if (activeTab === 'my-bids') {
      fetchUserBids();
    } else {
      fetchIncomingBids();
    }
  };

  const filteredBids = userBids.filter(bid => {
    if (filter === 'all') return true;
    return bid.bid_status === filter;
  });

  const getFilterCounts = () => {
    if (error || userBids.length === 0) {
      return { all: 0, active: 0, won: 0, lost: 0 };
    }
    
    return {
      all: userBids.length,
      active: userBids.filter(b => b.bid_status === 'active' || b.bid_status === 'winning').length,
      won: userBids.filter(b => b.bid_status === 'won').length,
      lost: userBids.filter(b => b.bid_status === 'lost' || b.bid_status === 'outbid').length,
    };
  };

  const counts = getFilterCounts();

  return (
    <div className="flex flex-col gap-8 items-start w-full">
      <div className="bg-primary rounded-lg p-8 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Your Biddings
            </h1>
            <p className="text-text-primary/70">
              {activeTab === 'my-bids' 
                ? "Track all your bids and their current status" 
                : "Manage bids received on your listings"
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshCurrentTab}
              disabled={loadingBids || loadingIncoming}
              className="bg-secondary/50 hover:bg-secondary text-text-primary px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className={loadingBids || loadingIncoming ? "animate-spin" : ""}
              >
                <path d="M23 4v6h-6"/>
                <path d="M20.49 15a9 9 0 11-2.12-8.36L23 10"/>
              </svg>
              Refresh
            </button>
            <Link
              to="/dashboard/marketplace"
              className="bg-accent/10 hover:bg-accent/20 text-text-primary px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3H1m6 10a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2"/>
              </svg>
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="bg-primary rounded-lg p-6 w-full">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('my-bids')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'my-bids'
                ? 'bg-accent text-black'
                : 'bg-secondary/50 text-text-primary/70 hover:bg-secondary hover:text-text-primary'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            My Bids
          </button>
          <button
            onClick={() => setActiveTab('incoming-bids')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'incoming-bids'
                ? 'bg-accent text-black'
                : 'bg-secondary/50 text-text-primary/70 hover:bg-secondary hover:text-text-primary'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <path d="M20 8v6M23 11l-3 3-3-3"/>
            </svg>
            Incoming Bids
          </button>
        </div>

        {/* Filter tabs for My Bids only */}
        {activeTab === 'my-bids' && (
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Bids', count: counts.all },
              { key: 'active', label: 'Active', count: counts.active },
              { key: 'won', label: 'Won', count: counts.won },
              { key: 'lost', label: 'Lost/Outbid', count: counts.lost },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === tab.key
                    ? 'bg-accent text-black'
                    : 'bg-secondary/50 text-text-primary/70 hover:bg-secondary hover:text-text-primary'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-primary rounded-lg p-8 w-full">
        {activeTab === 'my-bids' ? (
          // My Bids View
          <>
            {loadingBids ? (
              <div className="flex items-center justify-center py-12">
                <ShinyText text="Loading your bids ..." speed={1} />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Failed to Load Bids
                </h3>
                <p className="text-text-primary/70 mb-4">
                  {error}
                </p>
                <button 
                  onClick={fetchUserBids}
                  className="bg-secondary hover:bg-secondary/80 text-accent px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : filteredBids.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-text-primary/50 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {filter === 'all' ? 'No bids yet' : `No ${filter} bids`}
                </h3>
                <p className="text-text-primary/70 mb-4">
                  {filter === 'all' 
                    ? "You haven't placed any bids yet. Start exploring luxury items in the marketplace!"
                    : `You don't have any ${filter} bids at the moment.`
                  }
                </p>
                <Link to="/dashboard/marketplace">
                  <button className="bg-secondary hover:bg-secondary/80 text-accent px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                    Explore Marketplace
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBids.map((bid: BidDetails, index: number) => (
                  <motion.div
                    key={bid.bid_id}
                    className="bg-secondary/50 rounded-lg p-6 border border-border/10 hover:bg-secondary/70 transition-all duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-secondary rounded-lg flex-shrink-0 overflow-hidden">
                        {bid.product_image ? (
                          <img 
                            src={`data:image/jpeg;base64,${bid.product_image}`}
                            alt={bid.product_name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center">
                            <span className="text-xs text-text-primary/60">No Image</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-text-primary mb-1">
                              {bid.product_name || 'Unnamed Product'}
                            </h3>
                            <p className="text-text-primary/70 text-sm">
                              Bid placed on {formatDate(bid.created_at)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bid.bid_status || 'active')}`}>
                            {getStatusText(bid.bid_status || 'active')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-text-primary/60 text-sm">Your Bid</p>
                            <p className="text-text-primary font-semibold">
                              {formatPrice(bid.amount)}
                            </p>
                          </div>
                          {bid.current_highest_bid && (
                            <div>
                              <p className="text-text-primary/60 text-sm">Current Highest</p>
                              <p className="text-text-primary font-semibold">
                                {formatPrice(bid.current_highest_bid)}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-text-primary/60 text-sm">Status</p>
                            <p className={`font-semibold ${
                              bid.bid_status === 'winning' || bid.bid_status === 'won' ? 'text-green-400' :
                              bid.bid_status === 'outbid' || bid.bid_status === 'lost' ? 'text-red-400' :
                              'text-blue-400'
                            }`}>
                              {getStatusText(bid.bid_status || 'active')}
                            </p>
                          </div>
                        </div>

                        {bid.message && (
                          <div className="mb-3">
                            <p className="text-text-primary/60 text-sm mb-1">Your Message</p>
                            <p className="text-text-primary/80 text-sm italic">
                              "{bid.message}"
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Link to={`/product/${bid.product_id}`}>
                            <button className="text-accent hover:text-accent/80 text-sm font-medium transition-colors duration-200">
                              View Product
                            </button>
                          </Link>
                          {(bid.bid_status === 'active' || bid.bid_status === 'outbid') && (
                            <Link to={`/product/${bid.product_id}#bid`}>
                              <button className="text-text-primary/70 hover:text-text-primary text-sm font-medium transition-colors duration-200 ml-4">
                                Place Higher Bid
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Incoming Bids View
          <>
            {loadingIncoming ? (
              <div className="flex items-center justify-center py-12">
                <ShinyText text="Loading incoming bids ..." speed={1} />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Failed to Load Incoming Bids
                </h3>
                <p className="text-text-primary/70 mb-4">
                  {error}
                </p>
                <button 
                  onClick={fetchIncomingBids}
                  className="bg-secondary hover:bg-secondary/80 text-accent px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : incomingBids.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-text-primary/50 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 3a4 4 0 100 8 4 4 0 000-8zM20 8v6M23 11l-3 3-3-3" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No incoming bids yet
                </h3>
                <p className="text-text-primary/70 mb-4">
                  You haven't received any bids on your listings yet. Make sure your items are listed and attractively priced!
                </p>
                <Link to="/dashboard/listings">
                  <button className="bg-secondary hover:bg-secondary/80 text-accent px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                    View My Listings
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {incomingBids.map((product, productIndex) => (
                  <motion.div
                    key={product.product_id}
                    className="bg-secondary/30 rounded-lg p-6 border border-border/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: productIndex * 0.1 }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-secondary rounded-lg flex-shrink-0 overflow-hidden">
                        {product.product_image ? (
                          <img 
                            src={`data:image/jpeg;base64,${product.product_image}`}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center">
                            <span className="text-xs text-text-primary/60">No Image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-text-primary mb-1">
                          {product.product_name}
                        </h3>
                        <p className="text-text-primary/70 text-sm">
                          {product.bids.length} bid{product.bids.length !== 1 ? 's' : ''} received
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {product.bids
                        .sort((a, b) => b.amount - a.amount) // Sort by highest bid first
                        .map((bid, bidIndex) => (
                        <div
                          key={bid.bid_id}
                          className="bg-secondary/50 rounded-lg p-4 border border-border/10"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <div>
                                  <p className="font-semibold text-text-primary">
                                    {formatPrice(bid.amount)}
                                  </p>
                                  <p className="text-text-primary/60 text-sm">
                                    {formatDate(bid.created_at)}
                                  </p>
                                </div>
                                {bidIndex === 0 && (
                                  <span className="px-2 py-1 bg-green-400/10 text-green-400 text-xs font-medium rounded-full border border-green-400/20">
                                    Highest Bid
                                  </span>
                                )}
                              </div>
                              {bid.message && (
                                <div className="mb-3">
                                  <p className="text-text-primary/60 text-sm mb-1">Message:</p>
                                  <p className="text-text-primary/80 text-sm italic">
                                    "{bid.message}"
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptBid(bid.bid_id, product.product_id)}
                                disabled={acceptingBid === bid.bid_id}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                              >
                                {acceptingBid === bid.bid_id ? (
                                  <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                                    </svg>
                                    Accepting...
                                  </>
                                ) : (
                                  <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M20 6L9 17l-5-5"/>
                                    </svg>
                                    Accept Bid
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
