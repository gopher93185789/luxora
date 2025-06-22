import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GetUserDetails, Refresh } from "~/pkg/api/auth";
import { GetUserBids } from "~/pkg/api/bidding";
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
  const [userBids, setUserBids] = useState<BidDetails[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
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
    try {
      const bids = await GetUserBids({
        limit: 50,
        page: 1,
        status: filter === 'all' ? undefined : filter
      });
      
      if (!("code" in bids)) {
        setUserBids(bids);
      }
    } catch (error) {
      console.error("Failed to fetch user bids:", error);
    } finally {
      setLoadingBids(false);
    }
  };

  useEffect(() => {
    if (data) {
      fetchUserBids();
    }
  }, [data, filter]);

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

  const filteredBids = userBids.filter(bid => {
    if (filter === 'all') return true;
    return bid.bid_status === filter;
  });

  const getFilterCounts = () => {
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
              Track all your bids and their current status
            </p>
          </div>
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

      <div className="bg-primary rounded-lg p-6 w-full">
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
      </div>

      <div className="bg-primary rounded-lg p-8 w-full">
        {loadingBids ? (
          <div className="flex items-center justify-center py-12">
            <ShinyText text="Loading your bids ..." speed={1} />
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
            <Link to="/marketplace">
              <button className="bg-black/90 hover:bg-accent/50 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                Explore Marketplace
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBids.map((bid, index) => (
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
                          {bid.amount === bid.current_highest_bid ? 'Leading' : 
                           (bid.current_highest_bid && bid.amount < bid.current_highest_bid) ? 'Outbid' : 'Active'}
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
                        <button className="text-text-primary/70 hover:text-text-primary text-sm font-medium transition-colors duration-200 ml-4">
                          Place Higher Bid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
