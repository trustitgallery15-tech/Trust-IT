import React, { useState, useEffect } from 'react';
import { 
  Cpu, ShoppingCart, Heart, Search, ChevronRight, Sliders, 
  ArrowLeftRight, Award, Briefcase, ChevronLeft, Calendar, 
  Flame, Clock, Filter, Sparkles, LogIn, UserPlus, Info, ShieldCheck, Mail, Phone, Lock 
} from 'lucide-react';

import { Product, User, Order } from './types.js';
import { FALLBACK_PRODUCTS, FALLBACK_BANNERS } from './fallbackData.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import ProductCard from './components/ProductCard.js';
import ProductDetails from './components/ProductDetails.js';
import Checkout from './components/Checkout.js';
import Dashboard from './components/Dashboard.js';
import AdminPanel from './components/AdminPanel.js';
import AdminLogin from './components/AdminLogin.js';
import PCBuilder from './components/PCBuilder.js';
import B2BRequest from './components/B2BRequest.js';
import Compare from './components/Compare.js';
import LiveChat from './components/LiveChat.js';
import DiscountPopup from './components/DiscountPopup.js';

export default function App() {
  
  // App views state with URL synchronization
  const [currentView, _setCurrentView] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/admin/login') return 'admin-login';
    if (path === '/admin/dashboard') return 'admin-dashboard';
    if (path === '/shop') return 'shop';
    if (path === '/b2b') return 'b2b';
    if (path === '/pc-builder') return 'pc-builder';
    if (path === '/compare') return 'compare';
    if (path === '/dashboard') return 'dashboard';
    return 'home';
  });

  const setCurrentView = (view: string) => {
    _setCurrentView(view);
    if (view === 'home') {
      window.history.pushState({}, '', '/');
    } else if (view === 'shop') {
      window.history.pushState({}, '', '/shop');
    } else if (view === 'b2b') {
      window.history.pushState({}, '', '/b2b');
    } else if (view === 'pc-builder') {
      window.history.pushState({}, '', '/pc-builder');
    } else if (view === 'compare') {
      window.history.pushState({}, '', '/compare');
    } else if (view === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else if (view === 'admin-login') {
      window.history.pushState({}, '', '/admin/login');
    } else if (view === 'admin-dashboard' || view === 'admin') {
      window.history.pushState({}, '', '/admin/dashboard');
    }
  };
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Loaded products database
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active banner index
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Shop filter parameters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [priceSort, setPriceSort] = useState<'Default' | 'LowToHigh' | 'HighToLow'>('Default');

  // Global transactional states
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Flash Sale Timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  // Auth form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerReferral, setRegisterReferral] = useState('');

  // Fetch initial products & marketing banner structures
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data && data.length > 0 ? data : FALLBACK_PRODUCTS);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }

        const bannerRes = await fetch('/api/banners');
        if (bannerRes.ok) {
          const data = await bannerRes.json();
          setBanners(data && data.length > 0 ? data.filter((b: any) => b.isActive) : FALLBACK_BANNERS);
        } else {
          setBanners(FALLBACK_BANNERS);
        }
      } catch (err) {
        console.error('Failed to load initial data, loading local fallbacks:', err);
        setProducts(FALLBACK_PRODUCTS);
        setBanners(FALLBACK_BANNERS);
      }
    };
    loadAppData();
  }, []);

  // Sync session user if token persists in localStorage
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin/login') {
        _setCurrentView('admin-login');
      } else if (path === '/admin/dashboard') {
        _setCurrentView('admin-dashboard');
      } else if (path === '/shop') {
        _setCurrentView('shop');
      } else if (path === '/b2b') {
        _setCurrentView('b2b');
      } else if (path === '/pc-builder') {
        _setCurrentView('pc-builder');
      } else if (path === '/compare') {
        _setCurrentView('compare');
      } else if (path === '/dashboard') {
        _setCurrentView('dashboard');
      } else {
        _setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleAdminLoginSuccess = (adminUser: User, token: string) => {
    setUser(adminUser);
    localStorage.setItem('trust_user', JSON.stringify(adminUser));
    if (token) {
      localStorage.setItem('trust_token', token);
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
    }
    setCurrentView('admin-dashboard');
  };

  useEffect(() => {
    const syncSessionUser = async () => {
      const savedUser = localStorage.getItem('trust_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('trust_user');
        }
      }
    };
    syncSessionUser();
  }, []);

  // Flash sale countdown timer ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 24, minutes: 0, seconds: 0 }; // Loop back daily
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Automatic marketing carousel rotation
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  // Global event handlers
  const handleAddToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: Math.min(product.stockCount, item.quantity + qty) }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const handleToggleWishlist = (id: string) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleCompare = (product: Product) => {
    setCompareList(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      if (prev.length >= 4) {
        alert('You can compare a maximum of 4 components side-by-side.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const handleRemoveFromCompare = (product: Product) => {
    setCompareList(prev => prev.filter(item => item.id !== product.id));
  };

  // Perform search submission
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory('All');
    setSelectedBrand('All');
    setMaxPrice(300000);
    setCurrentView('shop');
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    setCurrentView('shop');
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim().toLowerCase(), password: loginPassword })
      });

      if (res.ok) {
        const payload = await res.json();
        const userObj = payload.user || payload;
        const tokenVal = payload.token || '';
        
        setUser(userObj);
        localStorage.setItem('trust_user', JSON.stringify(userObj));
        if (tokenVal) {
          localStorage.setItem('trust_token', tokenVal);
          document.cookie = `token=${tokenVal}; path=/; max-age=${7 * 24 * 60 * 60}`;
        }
        
        setCurrentView('home');
        // Reset form
        setLoginEmail('');
        setLoginPassword('');
      } else {
        const err = await res.json();
        setAuthError(err.error || 'Authentication credentials failed.');
      }
    } catch (err) {
      setAuthError('Connection failure.');
    }
  };

  // Registration handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName.trim(),
          email: registerEmail.trim().toLowerCase(),
          password: registerPassword,
          phone: registerPhone.trim(),
          referralCode: registerReferral.trim() || undefined
        })
      });

      if (res.ok) {
        const payload = await res.json();
        const userObj = payload.user || payload;
        const tokenVal = payload.token || '';

        setUser(userObj);
        localStorage.setItem('trust_user', JSON.stringify(userObj));
        if (tokenVal) {
          localStorage.setItem('trust_token', tokenVal);
          document.cookie = `token=${tokenVal}; path=/; max-age=${7 * 24 * 60 * 60}`;
        }

        setCurrentView('home');
        // Reset form
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterPhone('');
        setRegisterReferral('');
      } else {
        const err = await res.json();
        setAuthError(err.error || 'Registration failed.');
      }
    } catch (err) {
      setAuthError('Connection failure.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('trust_user');
    localStorage.removeItem('trust_token');
    document.cookie = 'token=; path=/; max-age=0';
    setCurrentView('home');
  };

  // Filter Logic for Shop page
  const filteredProducts = products.filter(p => {
    const matchesSearch = searchQuery 
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = selectedCategory === 'All' ? true : p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' ? true : p.brand === selectedBrand;
    const actualPrice = p.discountPrice || p.price;
    const matchesPrice = actualPrice <= maxPrice;

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  // Sort Logic on top of Filter Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;
    if (priceSort === 'LowToHigh') {
      return priceA - priceB;
    }
    if (priceSort === 'HighToLow') {
      return priceB - priceA;
    }
    return 0;
  });

  // Extract all unique brand names in the matching products
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand)));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Announcement Alert ticker */}
      <div className="bg-blue-600 text-white text-[10px] md:text-xs font-bold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-1.5 select-none">
        <Sparkles className="h-3.5 w-3.5 animate-pulse shrink-0" />
        <span>⚡ TRUST IT GALLERY FLASH SALE ACTIVE: Get up to 15% instant discounts on all AMD processors & RTX GPUs! ⚡</span>
      </div>

      {/* Global Navbar */}
      <Navbar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        cart={cart}
        setCart={setCart}
        wishlist={wishlist}
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        setSelectedProductId={setSelectedProductId}
        products={products}
      />

      {/* Main route router renderer */}
      <main className="flex-1 pb-16">
        
        {/* VIEW 1: HOMEPAGE */}
        {currentView === 'home' && (
          <div className="space-y-12">
            
            {/* Banner slide carousel section */}
            {banners.length > 0 && (
              <div className="relative overflow-hidden bg-gray-900 aspect-video md:aspect-[3/1] w-full border-b border-gray-800">
                <div 
                  className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${activeBannerIdx * 100}%)` }}
                >
                  {banners.map((ban, idx) => (
                    <div key={ban.id} className="w-full h-full shrink-0 relative">
                      <img 
                        src={ban.imageUrl} 
                        alt={ban.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-85" 
                      />
                      {/* Deep text overlay */}
                      <div className="absolute inset-y-0 left-0 w-full md:w-1/2 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent flex flex-col justify-center px-6 md:px-16 text-white space-y-3">
                        <span className="rounded-lg bg-blue-600 text-[10px] font-black tracking-widest uppercase px-2 py-1 max-w-fit">
                          Featured Promo Deals
                        </span>
                        <h2 className="text-lg md:text-3xl font-black tracking-tight leading-tight max-w-md">
                          {ban.title}
                        </h2>
                        <p className="text-xs text-gray-300 max-w-sm font-semibold">
                          {ban.subtitle}
                        </p>
                        <button 
                          onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setCurrentView('shop'); }}
                          className="rounded-xl bg-white hover:bg-blue-600 hover:text-white text-gray-900 text-xs font-black px-5 py-2.5 max-w-fit shadow-md transition-all active:scale-95 mt-2"
                        >
                          Explore Deal Offers
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dot selectors */}
                {banners.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveBannerIdx(idx)}
                        className={`h-2 rounded-full transition-all ${
                          activeBannerIdx === idx ? 'w-5 bg-blue-600' : 'w-2 bg-white/40'
                        }`}
                      ></button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Mega category rail */}
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <h3 className="text-center text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Explore Professional Tech Divisions</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
                {[
                  { name: 'Processors (CPU)', bg: 'bg-indigo-50 text-indigo-700' },
                  { name: 'Graphics Cards', bg: 'bg-red-50 text-red-700' },
                  { name: 'Motherboards', bg: 'bg-blue-50 text-blue-700' },
                  { name: 'RAM', bg: 'bg-amber-50 text-amber-700' },
                  { name: 'SSD', bg: 'bg-emerald-50 text-emerald-700' },
                  { name: 'CCTV Products', bg: 'bg-slate-50 text-slate-700' }
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`rounded-2xl p-4 text-center cursor-pointer hover:-translate-y-1 hover:shadow-md transition duration-300 font-sans ${cat.bg}`}
                  >
                    <span className="text-xs font-black leading-tight block truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Promotional Flash sale Countdown Ticker */}
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <div className="rounded-3xl bg-gradient-to-r from-red-600 to-amber-500 p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                  <div className="rounded-full bg-white/10 p-3 text-white">
                    <Flame className="h-8 w-8 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight uppercase">Extreme Intel vs Ryzen Overclock Flash Sale!</h3>
                    <p className="text-xs text-red-100 font-semibold mt-0.5">High power processors with limited lifetime warranties. Get up to 15% discount!</p>
                  </div>
                </div>

                {/* Clock ticking */}
                <div className="flex gap-2 items-center font-mono text-xs font-black shrink-0">
                  <Clock className="h-4 w-4 text-white shrink-0 animate-spin" />
                  <span className="bg-black/20 rounded-lg px-2.5 py-1.5">{String(timeLeft.hours).padStart(2, '0')}h</span>
                  <span>:</span>
                  <span className="bg-black/20 rounded-lg px-2.5 py-1.5">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                  <span>:</span>
                  <span className="bg-black/20 rounded-lg px-2.5 py-1.5">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                </div>
              </div>
            </div>

            {/* Featured Hardware showcase listing */}
            <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-6">
              <div className="flex justify-between items-baseline flex-wrap gap-2 border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-base font-black text-gray-900 uppercase tracking-wider">Premium Components & Arrivals</h2>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">Direct official partner models with guaranteed retail warranties</p>
                </div>
                <button 
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setCurrentView('shop'); }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Explore All Components →
                </button>
              </div>

              {products.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {products.slice(0, 8).map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      isInWishlist={wishlist.includes(prod.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onViewDetails={(id) => { setSelectedProductId(id); setCurrentView('product'); }}
                      onToggleCompare={handleToggleCompare}
                      isComparing={!!compareList.find(c => c.id === prod.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Special marketing features: PC Builder & B2B procurement banner blocks */}
            <div className="mx-auto max-w-7xl px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              
              <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-black tracking-widest text-blue-600 uppercase">Interactive Rig Planner</span>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Interactive Custom PC Builder</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                    Select your processor socket fits, calculate PSU load wattage dynamically, align DDR4/DDR5 memory support models, and download detailed specification checklists.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('pc-builder')}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-3 shadow-md max-w-fit transition active:scale-95"
                >
                  Configure Custom PC Rig
                </button>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-black tracking-widest text-blue-600 uppercase">Wholesale corporate quote</span>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Corporate B2B Bulk Purchasing</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                    Connect directly with our pricing division for heavy volume price subtractions, automated VAT invoicing, official chalans, and express insured freight service.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('b2b')}
                  className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-black text-xs px-5 py-3 shadow-md max-w-fit transition active:scale-95"
                >
                  Request Procurement Quote (RFQ)
                </button>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: SHOP PAGE (WITH ADVANCED MULTI-TIER FILTERS) */}
        {currentView === 'shop' && (
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 font-sans">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight mb-8">Professional Components Store</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left Filters column panel */}
              <div className="lg:col-span-1 space-y-6">
                
                <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-5 shadow-sm">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                      <Filter className="h-4 w-4 text-blue-600" />
                      <span>Store Filters</span>
                    </h3>
                    <button 
                      onClick={() => {
                        setSelectedCategory('All');
                        setSelectedBrand('All');
                        setMaxPrice(300000);
                        setSearchQuery('');
                        setPriceSort('Default');
                      }}
                      className="text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      Reset All
                    </button>
                  </div>
 
                  {/* Category select Filter */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Category</label>
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none bg-white font-medium"
                    >
                      <option value="All">All Categories</option>
                      {[
                        'Computer Components', 'Graphics Cards', 'GPU', 'Processors (CPU)', 'Motherboards', 'RAM', 'SSD',
                        'Casing', 'HDD', 'CPU Coolers', 'Power Supplies', 'PC Cases', 'Monitors', 'Keyboards', 'Mice',
                        'Mouse Pads', 'Gaming Accessories', 'Headphones', 'Speakers', 'Webcams', 'Routers',
                        'Networking Devices', 'Printers', 'Printer Toners', 'Ink Cartridges', 'Laptop Accessories',
                        'Office Equipment', 'CCTV Products', 'UPS', 'USB Devices', 'Cables', 'Storage Devices',
                        'Software Licenses'
                      ].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
 
                  {/* Brand select Filter */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Manufacturer / Brand</label>
                    <select
                      value={selectedBrand}
                      onChange={e => setSelectedBrand(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none bg-white font-medium"
                    >
                      <option value="All">All Brands</option>
                      {uniqueBrands.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
 
                  {/* Pricing slider range Filter */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <span>Maximum Pricing Limit</span>
                      <span className="text-blue-600">BDT {maxPrice.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={300000}
                      step={5000}
                      value={maxPrice}
                      onChange={e => setMaxPrice(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Price sorting button selection (Separate Section) */}
                  <div className="space-y-2 pt-1 border-t border-gray-50">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort by Price</label>
                    <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl">
                      <button
                        type="button"
                        id="btn-sort-default"
                        onClick={() => setPriceSort('Default')}
                        className={`py-1.5 px-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${
                          priceSort === 'Default'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Default
                      </button>
                      <button
                        type="button"
                        id="btn-sort-low-high"
                        onClick={() => setPriceSort('LowToHigh')}
                        className={`py-1.5 px-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${
                          priceSort === 'LowToHigh'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Low → High
                      </button>
                      <button
                        type="button"
                        id="btn-sort-high-low"
                        onClick={() => setPriceSort('HighToLow')}
                        className={`py-1.5 px-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${
                          priceSort === 'HighToLow'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        High → Low
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Products Results list */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Upper results header summary */}
                <div className="flex justify-between items-baseline flex-wrap gap-2 text-xs font-semibold text-gray-500">
                  <span>Showing {filteredProducts.length} high-quality components</span>
                  {searchQuery && (
                    <span>Matches search query: <span className="text-blue-600 font-bold">"{searchQuery}"</span></span>
                  )}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gray-200 p-16 text-center text-xs text-gray-400 font-bold">
                    No components found matching current filters. Try resetting pricing filters or search parameters.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {sortedProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        isInWishlist={wishlist.includes(prod.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCart}
                        onViewDetails={(id) => { setSelectedProductId(id); setCurrentView('product'); }}
                        onToggleCompare={handleToggleCompare}
                        isComparing={!!compareList.find(c => c.id === prod.id)}
                      />
                    ))}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* VIEW 3: PRODUCT DETAILS SCREEN */}
        {currentView === 'product' && selectedProductId && (
          <ProductDetails 
            productId={selectedProductId}
            onBack={() => setCurrentView('home')}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isInWishlist={wishlist.includes(selectedProductId)}
            products={products}
            setSelectedProductId={setSelectedProductId}
            setCurrentView={setCurrentView}
            onToggleCompare={handleToggleCompare}
            isComparing={!!compareList.find(c => c.id === selectedProductId)}
          />
        )}

        {/* VIEW 4: SECURE CHECKOUT PAGE */}
        {currentView === 'checkout' && (
          <Checkout 
            cart={cart}
            setCart={setCart}
            user={user}
            setCurrentView={setCurrentView}
            setLastOrder={setLastOrder}
          />
        )}

        {/* VIEW 5: ORDER SUCCESS CONFIRMATION */}
        {currentView === 'success' && lastOrder && (
          <div className="mx-auto max-w-md px-4 py-16 text-center font-sans space-y-6">
            <div className="rounded-full bg-green-50 p-6 text-green-600 inline-block">
              <ShieldCheck className="h-12 w-12 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900">Secure Order Placed!</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Thank you! Your computer parts assembly order has been routed. Our technicians are preparing the original retail boxes and warranties.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4.5 bg-gray-50 text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400">Transaction ID:</span>
                <span className="font-mono text-blue-600 font-bold">{lastOrder.id}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400">Tracking Number:</span>
                <span className="font-mono text-gray-800 font-bold">{lastOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400">Aggregate Cost:</span>
                <span className="text-blue-600 font-bold">BDT {lastOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="rounded-xl bg-gray-900 px-5 h-11 text-xs font-bold text-white hover:bg-gray-800 transition"
              >
                Track on Dashboard
              </button>

              <button
                onClick={() => setCurrentView('home')}
                className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-5 h-11 text-xs font-bold text-gray-600 transition"
              >
                Browse More Components
              </button>
            </div>
          </div>
        )}

        {/* VIEW 6: SECURE AUTHENTICATION SCREEN (LOGIN & REGISTER) */}
        {(currentView === 'login' || currentView === 'register') && (
          <div className="mx-auto max-w-md px-4 py-12 font-sans space-y-6">
            
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
              
              {/* Tab Header Selector */}
              <div className="flex border-b border-gray-50">
                <button
                  onClick={() => { setCurrentView('login'); setAuthError(''); }}
                  className={`flex-1 py-3 text-center text-xs font-black border-b-2 transition ${
                    currentView === 'login' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Customer Sign In
                </button>
                <button
                  onClick={() => { setCurrentView('register'); setAuthError(''); }}
                  className={`flex-1 py-3 text-center text-xs font-black border-b-2 transition ${
                    currentView === 'register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authError && (
                <p className="rounded-xl bg-red-50 p-3 border border-red-100 text-[11px] font-bold text-red-600 text-center">{authError}</p>
              )}

              {/* Login form */}
              {currentView === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        placeholder="buyer@gmail.com"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-9 py-2.5 outline-none focus:border-blue-500 bg-gray-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Secure Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-9 py-2.5 outline-none focus:border-blue-500 bg-gray-50/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 py-3 text-xs font-black text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-50 transition"
                  >
                    Authenticate Account
                  </button>
                </form>
              ) : (
                // Register Form
                <form onSubmit={handleRegister} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Tanvir Rahman"
                      value={registerName}
                      onChange={e => setRegisterName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="E.g., buyer@gmail.com"
                      value={registerEmail}
                      onChange={e => setRegisterEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Telephone / Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="E.g., +880 1712-345678"
                      value={registerPhone}
                      onChange={e => setRegisterPhone(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Secure Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={e => setRegisterPassword(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Referral Invite Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="E.g., TRUST-123-4567"
                      value={registerReferral}
                      onChange={e => setRegisterReferral(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-blue-500 bg-gray-50/50 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 py-3 text-xs font-black text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-50 transition"
                  >
                    Register Account
                  </button>
                </form>
              )}

              {/* Demo accounts reminder helper */}
              <div className="rounded-2xl bg-blue-50/50 p-4 border border-blue-100 text-[10px] text-blue-800 space-y-1">
                <p className="font-bold">✨ Quick Developer / Admin Credentials:</p>
                <p>Admin Email: <span className="font-mono select-all">admin@trustitgallery.com</span> / Password: <span className="font-mono">admin</span></p>
                <p>Customer Email: <span className="font-mono select-all">buyer@gmail.com</span> / Password: <span className="font-mono">buyer123</span></p>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 7: CUSTOMER ACCOUNT DASHBOARD */}
        {currentView === 'dashboard' && (
          <Dashboard 
            user={user}
            setUser={setUser}
            products={products}
            onAddToCart={handleAddToCart}
            setSelectedProductId={setSelectedProductId}
            setCurrentView={setCurrentView}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* VIEW 8A: ADMIN LOGIN PORTAL */}
        {currentView === 'admin-login' && (
          <AdminLogin 
            onLoginSuccess={handleAdminLoginSuccess} 
            setCurrentView={setCurrentView} 
          />
        )}

        {/* VIEW 8B: ADMINISTRATIVE CONTROL PORTAL */}
        {currentView === 'admin-dashboard' && (
          <AdminPanel 
            products={products}
            setProducts={setProducts}
            setCurrentView={setCurrentView}
            user={user}
          />
        )}

        {/* VIEW 9: PC RIG CONFIGURATOR */}
        {currentView === 'pc-builder' && (
          <PCBuilder 
            products={products}
            onAddToCart={handleAddToCart}
            setCurrentView={setCurrentView}
          />
        )}

        {/* VIEW 10: B2B CORPORATE RFQ */}
        {currentView === 'b2b' && (
          <B2BRequest />
        )}

        {/* VIEW 11: SPECIFICATION COMPARISONS */}
        {currentView === 'compare' && (
          <Compare 
            compareList={compareList}
            onRemoveFromCompare={handleRemoveFromCompare}
            onAddToCart={handleAddToCart}
            setCurrentView={setCurrentView}
            setSelectedProductId={setSelectedProductId}
          />
        )}

        {/* POLICY VIEWS (Gives legal completeness) */}
        {['faq', 'warranty', 'return', 'shipping-policy', 'terms', 'privacy'].includes(currentView) && (
          <div className="mx-auto max-w-3xl px-4 py-12 font-sans space-y-6 text-xs text-gray-600 leading-relaxed">
            
            {currentView === 'faq' && (
              <div className="space-y-4">
                <h1 className="text-xl font-black text-gray-900 border-b pb-3 uppercase">FAQ & Help Center</h1>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-800">Q: Are all components listed original retail models?</h4>
                    <p>A: Yes! Every single processor, GPU, RAM, or motherboard is sourced directly from certified brand distributors and qualifies for official replacement program warranty.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Q: Does the custom PC builder check LGA socket compatibility?</h4>
                    <p>A: Yes, our Rig Configurator checks LGA/AM5 sockets dynamically and warns you instantly of physical mismatch before buying.</p>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'warranty' && (
              <div className="space-y-4">
                <h1 className="text-xl font-black text-gray-900 border-b pb-3 uppercase">Warranty Policy</h1>
                <p>We honor full manufacturer replacement warranties ranging from 3 years to lifetime on components. Ensure physical pins on processors and motherboards are not bent, and serial box stickers remain clean and unremoved.</p>
              </div>
            )}

            {currentView === 'return' && (
              <div className="space-y-4">
                <h1 className="text-xl font-black text-gray-900 border-b pb-3 uppercase">Return & Refund Policy</h1>
                <p>Enjoy a 7-day hassle-free return window for any sealed hardware components in their original, unopened retail packaging. Defective components undergo quick diagnostics for authorized manufacturer replacements.</p>
              </div>
            )}

            {currentView === 'shipping-policy' && (
              <div className="space-y-4">
                <h1 className="text-xl font-black text-gray-900 border-b pb-3 uppercase">Shipping & Delivery</h1>
                <p>We provide home delivery within 24-48 hours inside Dhaka Metropolitan. Insured nationwide courier delivery to Chittagong, Sylhet, Khulna, Rajshahi, and other districts takes 3-4 working days.</p>
              </div>
            )}

            {currentView === 'terms' && (
              <div className="space-y-4">
                <h1 className="text-xl font-black text-gray-900 border-b pb-3 uppercase">Terms & Conditions</h1>
                <p>By purchasing hardware components from Trust IT Gallery, you agree to comply with installation specifications guidelines. We are not liable for overclocking damage, liquid cooling leakages, or wrong voltage PSU assemblies.</p>
              </div>
            )}

            {currentView === 'privacy' && (
              <div className="space-y-4">
                <h1 className="text-xl font-black text-gray-900 border-b pb-3 uppercase">Privacy & Data Security</h1>
                <p>We protect user account profiles, billing addresses, and order invoices with industry-standard 256-bit secure socket layer algorithms. Your sensitive card data is handled exclusively inside sandbox payment partners.</p>
              </div>
            )}

            <button
              onClick={() => setCurrentView('home')}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Back to Homepage
            </button>
          </div>
        )}

      </main>

      {/* Persistent floating marketing elements */}
      <LiveChat />
      <DiscountPopup />

      {/* Global Footer */}
      <Footer 
        setCurrentView={setCurrentView}
        onSearch={handleSearch}
      />

    </div>
  );
}
