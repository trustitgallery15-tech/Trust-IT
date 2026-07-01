import { Heart, ShoppingCart, Eye, ArrowLeftRight, Check } from 'lucide-react';
import { Product } from '../types.js';

interface ProductCardProps {
  key?: string;
  product: Product;
  isInWishlist: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onViewDetails: (id: string) => void;
  onToggleCompare: (p: Product) => void;
  isComparing: boolean;
}

export default function ProductCard({
  product,
  isInWishlist,
  onToggleWishlist,
  onAddToCart,
  onViewDetails,
  onToggleCompare,
  isComparing
}: ProductCardProps) {
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const actualPrice = product.discountPrice || product.price;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-100 font-sans">
      
      {/* Top badges: Discount & Stock */}
      <div className="absolute left-3.5 top-3.5 z-10 flex flex-col gap-1.5">
        {discountPercent > 0 && (
          <span className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-black text-white tracking-wide shadow-sm animate-pulse">
            -{discountPercent}% OFF
          </span>
        )}
        {product.stockStatus === 'Pre-Order' && (
          <span className="rounded-lg bg-indigo-600 px-2 py-1 text-[10px] font-black text-white tracking-wide shadow-sm">
            PRE-ORDER
          </span>
        )}
        {product.stockStatus === 'Out of Stock' && (
          <span className="rounded-lg bg-gray-500 px-2 py-1 text-[10px] font-black text-white tracking-wide shadow-sm">
            OUT OF STOCK
          </span>
        )}
      </div>

      {/* Wishlist and Compare Toggles */}
      <div className="absolute right-3.5 top-3.5 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all ${
            isInWishlist 
              ? 'bg-red-50 text-red-500 hover:bg-red-100' 
              : 'bg-white/80 text-gray-500 hover:bg-white hover:text-red-500'
          }`}
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onToggleCompare(product); }}
          className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all ${
            isComparing
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'bg-white/80 text-gray-500 hover:bg-white hover:text-blue-600'
          }`}
          title={isComparing ? 'Remove from Comparison' : 'Compare Product'}
        >
          {isComparing ? <Check className="h-4 w-4" /> : <ArrowLeftRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Hover action overlay */}
      <div 
        onClick={() => onViewDetails(product.id)}
        className="relative aspect-square cursor-pointer overflow-hidden bg-gray-50/50 flex items-center justify-center"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Quick view lens effect */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
          <button className="flex items-center gap-1.5 rounded-xl bg-white/95 px-4 py-2 text-[11px] font-bold text-gray-800 shadow-md backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Eye className="h-3.5 w-3.5" />
            <span>Specifications</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand & Category row */}
        <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-gray-400">
          <span className="uppercase text-blue-600 tracking-wider font-extrabold">{product.brand}</span>
          <span className="truncate max-w-[120px]">{product.category}</span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onViewDetails(product.id)}
          className="mt-2 text-xs font-bold text-gray-800 line-clamp-2 hover:text-blue-600 cursor-pointer transition leading-relaxed min-h-[36px]"
        >
          {product.name}
        </h3>

        {/* Star Rating details */}
        <div className="mt-2.5 flex items-center gap-1">
          <div className="flex text-yellow-400">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span key={idx} className="text-xs">
                {idx < Math.round(product.rating) ? '★' : '☆'}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-semibold mt-0.5">({product.reviewsCount})</span>
        </div>

        {/* Price & Buy Button Grid */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-xs text-gray-400 line-through font-semibold leading-none">
                  BDT {product.price.toLocaleString()}
                </span>
                <span className="text-sm font-black text-red-600 mt-0.5">
                  BDT {product.discountPrice.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-sm font-black text-gray-900">
                BDT {product.price.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            disabled={product.stockStatus === 'Out of Stock'}
            className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-md active:scale-90 transition-all ${
              product.stockStatus === 'Out of Stock'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
            }`}
            title={product.stockStatus === 'Out of Stock' ? 'Sold Out' : 'Add to Cart'}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
