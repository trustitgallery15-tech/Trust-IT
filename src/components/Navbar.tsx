import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ShoppingCart, Heart, User as UserIcon, LayoutDashboard, 
  LogOut, Menu, X, Trash2, Cpu, ShieldAlert, BadgePercent, MapPin, 
  Phone, Bell, Check, ChevronDown, Monitor, Keyboard, Printer, Shield, ChevronRight
} from 'lucide-react';
import { Product, User } from '../types.js';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  cart: { product: Product; quantity: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ product: Product; quantity: number }[]>>;
  wishlist: string[];
  user: User | null;
  onLogout: () => void;
  onSearch: (query: string) => void;
  setSelectedProductId: (id: string) => void;
  products: Product[];
}

export default function Navbar({
  currentView,
  setCurrentView,
  cart,
  setCart,
  wishlist,
  user,
  onLogout,
  onSearch,
  setSelectedProductId,
  products
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart statistics
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);

  // Fetch search autocomplete suggestions from our actual Express backend
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle clicks outside of autocomplete suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
      setCurrentView('shop');
    }
  };

  const handleSuggestionClick = (val: string) => {
    setSearchQuery(val);
    onSearch(val);
    setShowSuggestions(false);
    setCurrentView('shop');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCategoryClick = (category: string) => {
    onSearch(category);
    setIsMegaMenuOpen(false);
    setIsMobileMenuOpen(false);
    setCurrentView('shop');
  };

  // 18 main Mega Menu category buckets
  const categories = [
    { name: 'Processors (CPU)', icon: Cpu },
    { name: 'Graphics Cards', icon: Cpu },
    { name: 'Motherboards', icon: Cpu },
    { name: 'RAM', icon: Cpu },
    { name: 'SSD', icon: Cpu },
    { name: 'CPU Coolers', icon: Cpu },
    { name: 'Power Supplies', icon: Cpu },
    { name: 'Monitors', icon: Monitor },
    { name: 'Keyboards', icon: Keyboard },
    { name: 'Mice', icon: Keyboard },
    { name: 'Printers', icon: Printer },
    { name: 'Routers', icon: Printer },
    { name: 'CCTV Products', icon: Shield },
    { name: 'UPS', icon: Shield },
    { name: 'Cables', icon: Shield },
    { name: 'Office Equipment', icon: Monitor },
    { name: 'Software Licenses', icon: Shield },
    { name: 'Gaming Accessories', icon: Keyboard }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-gray-100 font-sans">
      {/* Top Banner Alert (Free Shipping & Support contacts) */}
      <div className="bg-blue-600 px-4 py-1.5 text-xs font-medium text-white flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <BadgePercent className="h-4 w-4 text-yellow-300 animate-bounce" />
          <span>⚡ FLASH DEAL: Use promo code <span className="font-bold underline text-yellow-300 select-all">TRUSTIT2026</span> for 10% Off!</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-blue-100 divide-x divide-blue-500">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Multiplan Center, Dhaka</span>
          <span className="flex items-center gap-1 pl-4"><Phone className="h-3 w-3" /> Hotline: +880 1712-345678</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => { setCurrentView('home'); setSearchQuery(''); onSearch(''); }}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-gray-900 leading-tight">
                TRUST <span className="text-blue-600">IT</span>
              </h1>
              <p className="text-[9px] font-bold text-gray-400 tracking-widest -mt-0.5 uppercase">Gallery</p>
            </div>
          </div>

          {/* Categories Mega Trigger */}
          <div className="hidden lg:block relative">
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
            >
              <span>Categories</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Dropdown */}
            <AnimatePresence>
              {isMegaMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  ref={suggestionsRef}
                  className="absolute left-0 mt-2 w-72 rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl ring-1 ring-black/5"
                >
                  <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto pr-1">
                    {categories.map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => handleCategoryClick(cat.name)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        <span className="font-medium">{cat.name}</span>
                        <ChevronRight className="h-3 w-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search System (Sticky) */}
          <div className="flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products, brands, model, SKU..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-5 pr-11 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* Search autocomplete & typo suggestions overlay */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  ref={suggestionsRef}
                  className="absolute left-0 right-0 mt-1.5 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl z-50 max-h-72 overflow-y-auto scrollbar-thin"
                >
                  <p className="text-[10px] font-bold text-gray-400 uppercase px-3 py-1 tracking-wider border-b border-gray-50">Suggestions</p>
                  <div className="mt-1 space-y-0.5">
                    {suggestions.map((val, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(val)}
                        className="w-full text-left rounded-xl px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2 transition"
                      >
                        <Search className="h-3 w-3 text-gray-400" />
                        <span className="truncate">{val}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Action Icons (Cart, Wishlist, User Profiles) */}
          <div className="flex items-center gap-2 md:gap-3.5">
            {/* Quick Support Links */}
            <button
              onClick={() => setCurrentView('about')}
              className="hidden md:inline text-xs font-semibold text-gray-500 hover:text-blue-600 transition"
            >
              About
            </button>
            <button
              onClick={() => setCurrentView('contact')}
              className="hidden md:inline text-xs font-semibold text-gray-500 hover:text-blue-600 transition"
            >
              Contact
            </button>

            {/* Wishlist Link */}
            <button
              onClick={() => setCurrentView('dashboard')}
              className="relative rounded-full p-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full p-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Auth Menu / User Portal */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-1 rounded-full p-1 border border-gray-100 hover:border-blue-500 transition cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-2xl ring-1 ring-black/5 z-50"
                      >
                        <div className="px-3 py-2 border-b border-gray-50 mb-1.5">
                          <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                        </div>

                        {user.role === 'admin' && (
                          <button
                            onClick={() => { setCurrentView('admin'); setIsUserDropdownOpen(false); }}
                            className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Admin Panel</span>
                          </button>
                        )}

                        <button
                          onClick={() => { setCurrentView('dashboard'); setIsUserDropdownOpen(false); }}
                          className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                        >
                          <UserIcon className="h-4 w-4" />
                          <span>My Account</span>
                        </button>

                        <button
                          onClick={() => { onLogout(); setIsUserDropdownOpen(false); }}
                          className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentView('login')}
                  className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-gray-800 active:scale-95 transition"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Login</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden rounded-full p-1.5 text-gray-600 hover:bg-gray-50 transition"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-50 p-4 space-y-3 shadow-inner max-h-[80vh] overflow-y-auto"
          >
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Hardware Categories</p>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.slice(0, 10).map((cat, i) => (
                <button
                  key={i}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="rounded-xl bg-gray-50 px-3 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setCurrentView('shop'); setIsMobileMenuOpen(false); }}
              className="w-full text-center rounded-xl border border-gray-100 bg-gray-50 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
            >
              Explore Full Catalog →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sliding Side Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 font-sans backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            >
              {/* Cart Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-black text-gray-900">Your Shopping Cart ({cartItemCount})</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-6">
                    <div className="rounded-full bg-blue-50 p-5 text-blue-600 mb-4">
                      <ShoppingCart className="h-8 w-8" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">Your Cart is Empty</h4>
                    <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                      Add premium components, gaming accessories, or IT equipment to your cart and kickstart your build!
                    </p>
                    <button
                      onClick={() => { setIsCartOpen(false); setCurrentView('shop'); }}
                      className="mt-5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  cart.map((item, idx) => {
                    const actualPrice = item.product.discountPrice || item.product.price;
                    return (
                      <div key={idx} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 hover:shadow-sm transition">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="h-16 w-16 rounded-lg object-cover bg-gray-50"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 
                            onClick={() => { setSelectedProductId(item.product.id); setCurrentView('product'); setIsCartOpen(false); }}
                            className="text-xs font-bold text-gray-900 truncate hover:text-blue-600 cursor-pointer"
                          >
                            {item.product.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">SKU: {item.product.sku}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-blue-600">BDT {actualPrice.toLocaleString()}</span>
                            {/* Quantity buttons */}
                            <div className="flex items-center border border-gray-200 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.product.id, -1)}
                                className="px-2.5 py-0.5 text-xs font-semibold hover:bg-gray-100 text-gray-500 rounded-l-lg"
                              >
                                -
                              </button>
                              <span className="px-2 py-0.5 text-xs font-bold text-gray-700">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, 1)}
                                className="px-2.5 py-0.5 text-xs font-semibold hover:bg-gray-100 text-gray-500 rounded-r-lg"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Cart Drawer Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Shipping Cost:</span>
                    <span className="font-semibold text-gray-800">
                      {cartSubtotal >= 50000 ? 'FREE' : 'BDT 150'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">Subtotal Amount:</span>
                    <span className="text-lg font-black text-blue-600">BDT {cartSubtotal.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                    >
                      Keep Shopping
                    </button>
                    <button
                      onClick={() => { setIsCartOpen(false); setCurrentView('checkout'); }}
                      className="rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition"
                    >
                      Checkout Now
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
