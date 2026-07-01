import React, { useState, useEffect } from 'react';
import { 
  Heart, ShoppingCart, ShieldCheck, Truck, Sparkles, Check, 
  ArrowLeftRight, Info, AlertTriangle, MessageSquare, ChevronRight, Calculator, Plus
} from 'lucide-react';
import { Product, Review } from '../types.js';

interface ProductDetailsProps {
  productId: string;
  onBack: () => void;
  onAddToCart: (p: Product, qty?: number) => void;
  onToggleWishlist: (id: string) => void;
  isInWishlist: boolean;
  products: Product[];
  setSelectedProductId: (id: string) => void;
  setCurrentView: (view: string) => void;
  onToggleCompare: (p: Product) => void;
  isComparing: boolean;
}

export default function ProductDetails({
  productId,
  onBack,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  products,
  setSelectedProductId,
  setCurrentView,
  onToggleCompare,
  isComparing
}: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'warranty'>('specs');
  
  // Shipping calculator state
  const [shippingCity, setShippingCity] = useState('');
  const [shippingResult, setShippingResult] = useState<string | null>(null);

  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  // AI assistant helper
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch product & reviews details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data: Product = await res.json();
          setProduct(data);
          setActiveImage(data.images[0]);
          setQuantity(1);
          setAiResponse(''); // Reset AI context
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      }
    };

    const fetchProductReviews = async () => {
      try {
        const res = await fetch(`/api/reviews/${productId}`);
        if (res.ok) {
          const rData = await res.json();
          setReviews(rData);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    fetchProductDetails();
    fetchProductReviews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  if (!product) {
    return (
      <div className="flex h-96 items-center justify-center font-sans">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-xs text-gray-500 font-semibold">Loading technical details...</p>
        </div>
      </div>
    );
  }

  // Related products (same category)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Smart Frequently Bought Together Recommendation:
  // Propose a logical accessory depending on category
  let recommendedAccessory: Product | null = null;
  if (product.category === 'Processors (CPU)') {
    recommendedAccessory = products.find(p => p.category === 'Motherboards' || p.category === 'RAM') || null;
  } else if (product.category === 'Motherboards') {
    recommendedAccessory = products.find(p => p.category === 'RAM' || p.category === 'SSD') || null;
  } else if (product.category === 'Graphics Cards') {
    recommendedAccessory = products.find(p => p.category === 'Power Supplies' || p.category === 'CPU Coolers') || null;
  } else if (product.category === 'Mice') {
    recommendedAccessory = products.find(p => p.category === 'Keyboards' || p.category === 'Monitors') || null;
  } else if (product.category === 'Printers') {
    recommendedAccessory = products.find(p => p.category === 'Cables') || null;
  } else if (product.category === 'CCTV Products') {
    recommendedAccessory = products.find(p => p.category === 'Cables' || p.category === 'Storage Devices') || null;
  } else {
    // Fallback standard SSD recommendation
    recommendedAccessory = products.find(p => p.category === 'SSD' && p.id !== product.id) || null;
  }

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingCity.trim()) return;

    const actualPrice = product.discountPrice || product.price;
    const finalPrice = actualPrice * quantity;

    if (finalPrice >= 50000) {
      setShippingResult(`🎉 FREE shipping qualified! (Order total exceeds BDT 50,000)`);
    } else {
      const cityLower = shippingCity.trim().toLowerCase();
      if (cityLower === 'dhaka') {
        setShippingResult(`🚚 Dhaka Metropolitan: BDT 150 (Est. Delivery: 1-2 Working Days)`);
      } else {
        setShippingResult(`🚚 Outside Dhaka (${shippingCity}): BDT 150 (Est. Delivery: 3-4 Working Days via courier)`);
      }
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    setReviewSubmitStatus('submitting');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review: {
            productId: product.id,
            userName: newReviewName.trim(),
            rating: newReviewRating,
            comment: newReviewComment.trim()
          }
        })
      });
      if (res.ok) {
        const addedReview = await res.json();
        setReviews(prev => [addedReview, ...prev]);
        setReviewSubmitStatus('success');
        setNewReviewName('');
        setNewReviewComment('');
        // Re-sync rating on local state
        setProduct(prev => {
          if (!prev) return null;
          const totalRating = (prev.rating * prev.reviewsCount) + newReviewRating;
          const newCount = prev.reviewsCount + 1;
          return {
            ...prev,
            rating: parseFloat((totalRating / newCount).toFixed(1)),
            reviewsCount: newCount
          };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskAI = async () => {
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.text);
      }
    } catch (err) {
      setAiResponse('AI service connection error.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleBuyNow = () => {
    onAddToCart(product, quantity);
    setCurrentView('checkout');
  };

  const handleBundleBuy = () => {
    onAddToCart(product, 1);
    if (recommendedAccessory) {
      onAddToCart(recommendedAccessory, 1);
    }
  };

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 font-sans">
      
      {/* Breadcrumb row */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-8">
        <span className="cursor-pointer hover:text-blue-600" onClick={() => setCurrentView('home')}>Home</span>
        <ChevronRight className="h-3 w-3" />
        <span className="cursor-pointer hover:text-blue-600" onClick={() => setCurrentView('shop')}>Shop</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-600 truncate">{product.name}</span>
      </div>

      {/* Main product presentation grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left: Images Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center aspect-square group">
            <img
              src={activeImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-150 cursor-zoom-in"
              id="zoom-product-image"
            />
            {/* Soft Zoom instruction overlay */}
            <span className="absolute bottom-3 right-3 text-[10px] bg-black/60 text-white rounded-lg px-2 py-1 font-bold">
              🔍 Hover to Zoom Specs
            </span>
          </div>

          {/* Thumbnail row */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`h-16 w-16 rounded-xl overflow-hidden border-2 bg-gray-50 flex items-center justify-center transition-all ${
                    activeImage === img ? 'border-blue-600 scale-105 shadow-sm' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="thumbnail" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Technical specifications purchasing card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="rounded-lg bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700 uppercase tracking-widest">
                {product.category}
              </span>
              <span className={`text-xs font-bold ${product.stockStatus === 'In Stock' ? 'text-green-600' : 'text-amber-600'}`}>
                ● {product.stockStatus}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Quick reference metadata */}
            <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-gray-400 font-semibold pt-1 border-b border-gray-100 pb-3">
              <span>Brand: <span className="text-gray-700">{product.brand}</span></span>
              <span>Model: <span className="text-gray-700">{product.model}</span></span>
              <span>SKU: <span className="text-gray-700 font-mono">{product.sku}</span></span>
              <span className="flex items-center gap-1 text-yellow-500">
                ★ {product.rating} <span className="text-gray-400">({product.reviewsCount} reviews)</span>
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="bg-gray-50/50 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-4 border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Showroom Pricing</p>
              <div className="flex items-baseline gap-2.5 mt-1">
                {product.discountPrice ? (
                  <>
                    <span className="text-xl font-black text-red-600">
                      BDT {product.discountPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 line-through font-semibold">
                      BDT {product.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
                      SAVE BDT {(product.price - product.discountPrice).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-black text-gray-900">
                    BDT {product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-200 bg-white rounded-xl h-11 px-1 shadow-sm">
              <button
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="h-8 w-8 text-sm font-black hover:bg-gray-50 text-gray-500 rounded-lg"
              >
                -
              </button>
              <span className="px-3.5 text-xs font-black text-gray-800">{quantity}</span>
              <button
                onClick={() => setQuantity(prev => Math.min(product.stockCount, prev + 1))}
                className="h-8 w-8 text-sm font-black hover:bg-gray-50 text-gray-500 rounded-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Key Features Bullet List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Key Highlights</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-600">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Grid Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => onAddToCart(product, quantity)}
              disabled={product.stockStatus === 'Out of Stock'}
              className={`md:col-span-1 rounded-xl h-12 flex items-center justify-center gap-2 text-xs font-black transition active:scale-95 ${
                product.stockStatus === 'Out of Stock'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stockStatus === 'Out of Stock'}
              className={`md:col-span-1 rounded-xl h-12 flex items-center justify-center text-xs font-black text-white shadow-lg transition active:scale-95 ${
                product.stockStatus === 'Out of Stock'
                  ? 'bg-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'
              }`}
            >
              Buy Now
            </button>

            <div className="flex gap-2.5">
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`flex-1 rounded-xl border h-12 flex items-center justify-center gap-1.5 text-xs font-bold transition active:scale-95 ${
                  isInWishlist
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                <span>{isInWishlist ? 'Wishlisted' : 'Wishlist'}</span>
              </button>

              <button
                onClick={() => onToggleCompare(product)}
                className={`rounded-xl border h-12 w-12 flex items-center justify-center transition active:scale-95 ${
                  isComparing
                    ? 'border-blue-200 bg-blue-50 text-blue-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Add to product comparison list"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* AI Smart Advisory Button connected to actual Gemini Backend */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/70 p-4.5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
                <h4 className="text-xs font-black text-blue-900 tracking-tight">AI Smart Specifications Consultant</h4>
              </div>
              <button
                onClick={handleAskAI}
                disabled={aiLoading}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400 transition"
              >
                {aiLoading ? 'Analyzing...' : 'Generate Advisory Report'}
              </button>
            </div>
            
            {aiResponse ? (
              <div className="rounded-xl bg-white p-3.5 border border-blue-50 text-xs text-gray-700 leading-relaxed shadow-inner max-h-52 overflow-y-auto font-medium prose prose-sm">
                <p className="whitespace-pre-wrap">{aiResponse}</p>
              </div>
            ) : (
              <p className="text-[11px] text-blue-800 leading-relaxed font-semibold">
                Want to know if this CPU fits your motherboard, or if your power supply has enough connectors? Tap the advisor button to run a real-time Gemini analysis on compatibility and specs!
              </p>
            )}
          </div>

          {/* Shipping Calculator */}
          <div className="border border-gray-100 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center gap-1.5">
              <Calculator className="h-4.5 w-4.5 text-gray-400" />
              <h4 className="text-xs font-black text-gray-700">Shipping Delivery Calculator</h4>
            </div>

            <form onSubmit={handleCalculateShipping} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter your Delivery District (e.g., Dhaka, Chittagong)"
                value={shippingCity}
                onChange={e => setShippingCity(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 bg-gray-50/50"
              />
              <button
                type="submit"
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-gray-800 active:scale-95 transition"
              >
                Check
              </button>
            </form>

            {shippingResult && (
              <div className="rounded-xl bg-gray-50 px-3 py-2 text-[11px] font-semibold text-gray-600 flex items-center gap-1.5 border border-gray-100">
                <span>{shippingResult}</span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Frequently Bought Together (Smart Marketing Upsell Bundle) */}
      {recommendedAccessory && (
        <div className="mt-14 rounded-3xl border border-blue-100/70 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 p-6 md:p-8">
          <h3 className="text-base font-black text-gray-900 tracking-tight">Frequently Bought Together</h3>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Bundle up and save! Customers who bought this also highly rated the accessory below:</p>

          <div className="mt-6 flex flex-col md:flex-row items-center gap-6">
            
            {/* Primary Product info */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <img src={product.images[0]} alt="bundle-1" referrerPolicy="no-referrer" className="h-14 w-14 rounded-lg object-cover border bg-white" />
              <div className="min-w-0 max-w-[200px]">
                <h5 className="text-xs font-bold text-gray-800 truncate">{product.name}</h5>
                <p className="text-xs font-black text-blue-600 mt-0.5">BDT {(product.discountPrice || product.price).toLocaleString()}</p>
              </div>
            </div>

            <Plus className="h-5 w-5 text-gray-400 shrink-0" />

            {/* Accessory Product Info */}
            <div 
              onClick={() => setSelectedProductId(recommendedAccessory!.id)}
              className="flex items-center gap-3 w-full md:w-auto cursor-pointer group"
            >
              <img src={recommendedAccessory.images[0]} alt="bundle-2" referrerPolicy="no-referrer" className="h-14 w-14 rounded-lg object-cover border bg-white group-hover:border-blue-500 transition" />
              <div className="min-w-0 max-w-[200px]">
                <h5 className="text-xs font-bold text-gray-800 truncate group-hover:text-blue-600 transition">{recommendedAccessory.name}</h5>
                <p className="text-xs font-black text-blue-600 mt-0.5">BDT {(recommendedAccessory.discountPrice || recommendedAccessory.price).toLocaleString()}</p>
              </div>
            </div>

            {/* Total pricing actions */}
            <div className="w-full md:w-auto md:ml-auto flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Bundle Total Price</p>
                <p className="text-base font-black text-gray-900">
                  BDT {((product.discountPrice || product.price) + (recommendedAccessory.discountPrice || recommendedAccessory.price)).toLocaleString()}
                </p>
              </div>

              <button
                onClick={handleBundleBuy}
                className="rounded-xl bg-blue-600 px-5 h-11 text-xs font-black text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-100 flex items-center gap-1.5 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Buy Both as Bundle</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Tabs Layout: Detailed Description, Specs Table, Warranty Policies */}
      <div className="mt-14 border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
        
        {/* Tab Headers */}
        <div className="flex bg-gray-50 border-b border-gray-100 px-6 py-1">
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-4 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'specs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Detailed Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Customer Reviews ({reviews.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('warranty')}
            className={`py-4 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'warranty' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Official Warranty Info
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 md:p-8 bg-white">
          
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div className="prose prose-sm max-w-none text-xs text-gray-600 leading-relaxed">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Product Description</h4>
                <p>{product.description}</p>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden mt-6">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                      <th className="px-6 py-3 font-black">Specification Feature</th>
                      <th className="px-6 py-3 font-black">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(product.specifications).map(([key, val], idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-3.5 font-bold text-gray-700 bg-gray-50/20">{key}</td>
                        <td className="px-6 py-3.5 text-gray-600 font-semibold">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Review Form */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="text-sm font-bold text-gray-900">Write a Review</h4>
                
                {reviewSubmitStatus === 'success' ? (
                  <div className="rounded-2xl bg-green-50 p-4 border border-green-100 text-xs text-green-800">
                    <p className="font-bold">✓ Review Submitted Successfully!</p>
                    <p className="mt-1">Thank you for rating. Your feedback helps builders make informed tech choices!</p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Rating (1 to 5 Stars)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReviewRating(star)}
                            className="text-xl hover:scale-110 transition"
                          >
                            <span className={star <= newReviewRating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={newReviewName}
                        onChange={e => setNewReviewName(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 bg-gray-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Your Feedback</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Share your experience building or gaming with this hardware..."
                        value={newReviewComment}
                        onChange={e => setNewReviewComment(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 bg-gray-50/50 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gray-900 py-3 text-xs font-bold text-white hover:bg-gray-800 active:scale-95 transition"
                    >
                      {reviewSubmitStatus === 'submitting' ? 'Posting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-sm font-bold text-gray-900">Verified Builder Reviews ({reviews.length})</h4>
                
                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400 font-semibold">
                    No verified reviews yet. Be the first to review this component!
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="rounded-2xl border border-gray-100 p-4 space-y-2 hover:shadow-inner transition">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-gray-800">{rev.userName}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{new Date(rev.date).toLocaleDateString()}</span>
                        </div>
                        {/* Rating stars */}
                        <div className="text-yellow-400 text-[11px]">
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed font-semibold">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'warranty' && (
            <div className="space-y-4.5 text-xs text-gray-600 leading-relaxed">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <span>Trust IT Brand Partner Warranty Program</span>
              </h4>
              <p>
                Every product listed on our platform is sourced directly from certified brand distributors and covers full local manufacturer replacement warranty.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="font-bold text-gray-800">Processor Warranty:</span> {product.warranty} (Requires original serial box. Internal pins damage is void).</li>
                <li><span className="font-bold text-gray-800">Motherboards & GPU:</span> 3 Years official replacement program.</li>
                <li><span className="font-bold text-gray-800">SSDs & RAM:</span> 5 Years to Lifetime warranty.</li>
              </ul>
              <div className="rounded-xl bg-amber-50 p-3 border border-amber-100 text-amber-800 flex items-start gap-2 max-w-xl">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px]">
                  <span className="font-bold">Avoid Voiding:</span> Please do not remove any regulatory distributor barcodes, serial stickers, or holograms from your components (motherboard sockets, memory heatsinks, power cables), as distributors require these to authorize quick replacements.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-gray-900 tracking-tight">Related Tech Products</h3>
            <button
              onClick={() => setCurrentView('shop')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              See All →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => {
              const actualPrice = p.discountPrice || p.price;
              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className="rounded-2xl border border-gray-100 p-3 hover:shadow-md hover:border-blue-100 cursor-pointer transition flex flex-col h-full"
                >
                  <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="aspect-square object-cover rounded-xl bg-gray-50" />
                  <span className="text-[9px] font-black text-blue-600 tracking-wider uppercase mt-3">{p.brand}</span>
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-2 mt-1 leading-relaxed min-h-[36px]">{p.name}</h4>
                  <p className="text-xs font-black text-gray-900 mt-auto pt-2">BDT {actualPrice.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
