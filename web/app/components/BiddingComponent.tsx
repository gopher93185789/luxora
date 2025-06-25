import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "@remix-run/react";
import { CreateBid, GetBidsForProduct } from "~/pkg/api/bidding";
import { GetTokenFromLocalStorage } from "~/pkg/helpers/tokenHandling";
import type { BidDetails, Bid, ErrorResponse } from "~/pkg/models/api";

interface BiddingComponentProps {
  productId: string;
  currentPrice: number;
  currency: string;
  onBidSuccess?: (bidId: string) => void;
}

export function BiddingComponent({ 
  productId, 
  currentPrice, 
  currency, 
  onBidSuccess 
}: BiddingComponentProps) {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bidMessage, setBidMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [existingBids, setExistingBids] = useState<BidDetails[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [showBids, setShowBids] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = GetTokenFromLocalStorage();
    setIsAuthenticated(!!token);
  }, []);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid bid amount");
      return;
    }

    if (amount <= currentPrice) {
      setError("Bid amount must be higher than the current price");
      return;
    }

    setIsSubmitting(true);

    try {
      const bid: Bid = {
        amount,
        message: bidMessage, 
        product_id: productId,
      };

      console.log('Submitting bid:', bid);
      const result = await CreateBid(bid);
      console.log('Bid result:', result);

      if ("code" in result) {
        console.error('Bid failed with error:', result);
        setError(result.message);
      } else {
        console.log('Bid submitted successfully:', result);
        setSuccess("Bid submitted successfully!");
        setBidAmount("");
        setBidMessage("");
        onBidSuccess?.(result.bid_id);
        
        if (showBids) {
          await loadExistingBids();
        }
      }
    } catch (err) {
      console.error('Bid submission error:', err);
      setError("Failed to submit bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadExistingBids = async () => {
    setLoadingBids(true);
    try {
      const result = await GetBidsForProduct(productId, { limit: 10, page: 1 });
      
      if ("code" in result) {
        console.error("Failed to load bids:", result.message);
      } else {
        setExistingBids(result);
      }
    } catch (err) {
      console.error("Failed to load bids:", err);
    } finally {
      setLoadingBids(false);
    }
  };

  const toggleShowBids = async () => {
    if (!showBids && existingBids.length === 0) {
      await loadExistingBids();
    }
    setShowBids(!showBids);
  };

  return (
    <div className="space-y-6">
      {/* Bidding Form */}
      <div className="bg-primary/30 border border-border/20 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          Place Your Bid
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-text-primary/60 mb-2">
            Current Price: <span className="font-semibold text-text-primary">
              {formatPrice(currentPrice, currency)}
            </span>
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-text-primary/60">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-4">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"/>
              </svg>
              <p className="text-lg font-medium text-text-primary mb-2">
                Sign in to place a bid
              </p>
              <p className="text-sm text-text-primary/60 mb-6">
                You need to be logged in to participate in bidding
              </p>
            </div>
            <div className="space-y-3">
              <Link
                to="/auth"
                className="block w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
              >
                Sign In to Bid
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitBid} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Your Bid Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-primary/60">
                  {currency === 'USD' ? '$' : currency}
                </span>
                <input
                  type="number"
                  min={currentPrice + 1}
                  step="0.01"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-secondary/50 border border-border/20 rounded-lg focus:border-accent focus:outline-none text-text-primary"
                  placeholder={`Enter amount above ${formatPrice(currentPrice, currency)}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Message (Optional)
              </label>
              <textarea
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/50 border border-border/20 rounded-lg focus:border-accent focus:outline-none text-text-primary resize-none"
                rows={3}
                placeholder="Add a message to the seller..."
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? "Submitting Bid..." : "Place Bid"}
            </motion.button>
          </form>
        )}
      </div>

      {/* View Existing Bids */}
      <div className="space-y-4">
        <button
          onClick={toggleShowBids}
          className="flex items-center justify-between w-full text-left p-4 bg-primary/20 border border-border/10 rounded-lg hover:bg-primary/30 transition-colors"
        >
          <span className="font-medium text-text-primary">
            View Other Bids {existingBids.length > 0 && `(${existingBids.length})`}
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transform transition-transform ${showBids ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {showBids && (
          <div className="space-y-3">
            {loadingBids ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : existingBids.length > 0 ? (
              existingBids.map((bid) => (
                <div
                  key={bid.bid_id}
                  className="bg-secondary/30 border border-border/10 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-text-primary">
                        {formatPrice(bid.amount, currency)}
                      </span>
                      {bid.bid_status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bid.bid_status === 'winning' 
                            ? 'bg-green-500/20 text-green-400'
                            : bid.bid_status === 'outbid'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {bid.bid_status}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-text-primary/60">
                      {formatDate(bid.created_at)}
                    </span>
                  </div>
                  {bid.message && (
                    <p className="text-sm text-text-primary/80 mt-2">
                      "{bid.message}"
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-primary/60">
                No bids yet. Be the first to bid!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
