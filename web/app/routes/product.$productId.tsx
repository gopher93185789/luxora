import { useLoaderData, useNavigate, Link, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useState } from "react";
import { motion } from "framer-motion";
import { GetProduct, type ProductInfo } from "~/pkg/api/products";
import type { ErrorResponse } from "~/pkg/models/api";
import { Sidebar } from "~/components/navigation/sidebar";
import { getTokenFromServerSideCaller } from "~/pkg/helpers/server";
import { BiddingComponent } from "~/components/BiddingComponent";

export async function loader(lfa: LoaderFunctionArgs) {
  try {
    const { productId } = lfa.params;
    
    if (!productId) {
      throw new Response("Product ID is required", { status: 400 });
    }

    const token = await getTokenFromServerSideCaller(lfa);
    
    console.log("Loader - productId:", productId);
    console.log("Loader - token exists:", !!token);

    const result = await GetProduct(productId, token || "");
    
    if ("code" in result) {
      console.error("API Error:", result.message, "Code:", result.code);
      throw new Response(result.message, { status: result.code });
    }

    return json({ product: result });
  } catch (error) {
    console.error("Loader error:", error);
    
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response("Internal server error", { status: 500 });
  }
}

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  console.log("ProductPage - Product loaded:", product?.id, product?.name);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };


  

  const selectedImage = product.product_images?.[selectedImageIndex];

  return (
    <main className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-4 md:py-5 md:pl-5 justify-center">
        <div className="w-full max-w-7xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-text-primary/60 mb-4 md:mb-6">
            <Link to="/dashboard/marketplace" className="hover:text-text-secondary transition-colors">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-text-primary">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-3 md:space-y-4">
              <div className="aspect-square bg-primary/50 rounded-lg overflow-hidden border border-border/10">
                {selectedImage && !imageError ? (
                  <img
                    src={`data:image/jpeg;base64,${selectedImage.base_64_image}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-primary/50">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-16 md:h-16">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                )}
              </div>

              {product.product_images && product.product_images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.product_images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-accent' 
                          : 'border-border/10 hover:border-border/20'
                      }`}
                    >
                      <img
                        src={`data:image/jpeg;base64,${image.base_64_image}`}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 md:space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <span className="bg-secondary/90 text-accent px-3 py-1 rounded-full text-sm font-medium w-fit">
                    {product.category}
                  </span>
                  <span className="text-text-primary/50 text-xs sm:text-sm">
                    Listed on {formatDate(product.created_at)}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 md:mb-4">
                  {product.name}
                </h1>
                <p className="text-3xl md:text-4xl font-bold text-text-secondary mb-4 md:mb-6">
                  {formatPrice(product.price, product.currency)}
                </p>
              </div>

              <div className="space-y-3 md:space-y-4">
                <h2 className="text-lg md:text-xl font-semibold text-text-primary">Description</h2>
                <p className="text-sm md:text-base text-text-primary/80 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 md:pt-6">
                <BiddingComponent
                  productId={product.id}
                  currentPrice={product.price}
                  currency={product.currency}
                  onBidSuccess={(bidId) => {
                    console.log("Bid submitted with ID:", bidId);
                  }}
                />
              </div>

              <div className="pt-4 md:pt-6 border-t border-border/10">
                <h3 className="text-base md:text-lg font-semibold text-text-primary mb-3">Product Details</h3>
                <div className="space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">Category</span>
                    <span className="text-text-primary">{product.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary/60">Listed by</span>
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary">{product.created_by}</span>
                      <img
                        src={"/default-avatar.png"}
                        alt={product.created_by}
                        className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                      />
                    </div>
                  </div>
                  {product.product_images && (
                    <div className="flex justify-between">
                      <span className="text-text-primary/60">Images</span>
                      <span className="text-text-primary">{product.product_images.length}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 md:pt-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2 text-text-primary/60 hover:text-text-secondary transition-colors text-sm md:text-base"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
                    <path d="M19 12H5"/>
                    <path d="M12 19l-7-7 7-7"/>
                  </svg>
                  <span>Back to Marketplace</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <main className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-4 md:py-5 md:pl-5">
          <div className="max-w-7xl w-full mx-auto">
            <div className="flex flex-col items-center justify-center min-h-64 md:min-h-96 text-center px-4">
              <div className="text-red-500 mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-16 md:h-16">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-2">
                {error.status === 404 ? "Product Not Found" : "Something Went Wrong"}
              </h1>
              <p className="text-sm md:text-base text-text-primary/70 mb-4 md:mb-6 max-w-md">
                {error.status === 404 
                  ? "The product you're looking for doesn't exist or has been removed."
                  : error.data || "An unexpected error occurred while loading the product."
                }
              </p>
              <div className="space-y-3 w-full max-w-xs">
                <Link
                  to="/marketplace"
                  className="inline-block w-full bg-accent hover:bg-accent/90 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-colors text-sm md:text-base"
                >
                  Back to Marketplace
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="block w-full bg-primary border border-border/20 hover:border-border/40 text-text-primary font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-colors text-sm md:text-base"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-4 md:py-5 md:pl-5">
        <div className="max-w-7xl w-full mx-auto">
          <div className="flex flex-col items-center justify-center min-h-64 md:min-h-96 text-center px-4">
            <div className="text-red-500 mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-16 md:h-16">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-2">
              Unexpected Error
            </h1>
            <p className="text-sm md:text-base text-text-primary/70 mb-4 md:mb-6 max-w-md">
              An unexpected error occurred. Please try again later.
            </p>
            <Link
              to="/marketplace"
              className="bg-accent hover:bg-accent/90 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-colors text-sm md:text-base"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
