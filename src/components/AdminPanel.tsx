import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Database, Plus, Edit3, Trash2, Tag, 
  Settings as SettingsIcon, Users, Receipt, Terminal, Image as ImageIcon, Sliders, Briefcase, ChevronRight, RefreshCw, Eye,
  Layers, Award, Check, X, Printer, Download, Search, Star, Mail, FileText, Lock, Unlock, TrendingUp, Percent, Activity, Grid, ShieldCheck
} from 'lucide-react';
import { 
  Product, Order, User, Coupon, B2BRequest, HeroBanner, 
  ActivityLog, WebsiteSettings, Category, Brand 
} from '../types.js';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCurrentView: (view: string) => void;
  user: User | null;
}

export default function AdminPanel({
  products,
  setProducts,
  setCurrentView,
  user
}: AdminPanelProps) {
  // Tabs:
  // 'dashboard' (formerly analytics), 'products', 'categories', 'brands', 'orders',
  // 'customers', 'inventory', 'coupons', 'reviews', 'newsletter', 'reports', 'settings', 'logs'
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'categories' | 'brands' | 'orders' | 
    'customers' | 'inventory' | 'coupons' | 'reviews' | 'newsletter' | 'reports' | 'settings' | 'logs'
  >('dashboard');
  
  // Custom fetch wrapper to automatically inject JWT Bearer Token
  const fetchWithAuth = (input: RequestInfo | URL, init?: RequestInit) => {
    const token = localStorage.getItem('trust_token');
    const headers = {
      ...(init?.headers || {}),
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    return window.fetch(input, { ...init, headers });
  };
  
  // Loaded collections
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newsletterEmails, setNewsletterEmails] = useState<string[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  
  // Extra tabs data (reused from existing setup)
  const [b2bRequests, setB2bRequests] = useState<B2BRequest[]>([]);
  const [banners, setBanners] = useState<HeroBanner[]>([]);

  // Loading indicator states
  const [isLoading, setIsLoading] = useState(false);

  // Forms / Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', price: 0, discountPrice: 0, category: '', brand: '', model: '', sku: '',
    description: '', features: [], specifications: {}, images: [], stockCount: 10, stockStatus: 'In Stock',
    rating: 5, reviewsCount: 0, warranty: '3 Years Warranty',
    isFeatured: false, isFlashDeal: false, isTrending: false, isBestSeller: false
  });

  // Multiple Images Management State (within product modal)
  const [tempImageUrls, setTempImageUrls] = useState<string[]>(['']);
  const [useCustomCategoryText, setUseCustomCategoryText] = useState(false);

  // Category Form State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({ name: '', imageUrl: '' });

  // Brand Form State
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState<Partial<Brand>>({ name: '', logoUrl: '' });

  // Coupon Form State
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '', discountType: 'Percentage', discountValue: 10, minPurchase: 1000, expiryDate: '', isActive: true
  });

  // Invoice / View Order Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Quick edit state for Inventory Tab
  const [inventoryPrices, setInventoryPrices] = useState<Record<string, number>>({});
  const [inventoryDiscounts, setInventoryDiscounts] = useState<Record<string, number>>({});
  const [inventoryStocks, setInventoryStocks] = useState<Record<string, number>>({});
  const [inventoryStatuses, setInventoryStatuses] = useState<Record<string, string>>({});

  // Search filter strings
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Fetch administrator data on mount / tab change
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setCurrentView('home');
      return;
    }

    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        const [
          ordersRes, usersRes, categoriesRes, brandsRes, couponsRes, 
          reviewsRes, newsletterRes, logsRes, settingsRes, b2bRes, bannersRes
        ] = await Promise.all([
          fetchWithAuth('/api/orders'),
          fetchWithAuth('/api/admin/users'),
          fetchWithAuth('/api/categories'),
          fetchWithAuth('/api/brands'),
          fetchWithAuth('/api/admin/coupons'),
          fetchWithAuth('/api/admin/reviews'),
          fetchWithAuth('/api/admin/newsletter'),
          fetchWithAuth('/api/admin/logs'),
          fetchWithAuth('/api/settings'),
          fetchWithAuth('/api/admin/b2b-requests'),
          fetchWithAuth('/api/banners')
        ]);

        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
        if (brandsRes.ok) setBrands(await brandsRes.json());
        if (couponsRes.ok) setCoupons(await couponsRes.json());
        if (reviewsRes.ok) setReviews(await reviewsRes.json());
        if (newsletterRes.ok) setNewsletterEmails(await newsletterRes.json());
        if (logsRes.ok) setLogs(await logsRes.json());
        if (settingsRes.ok) setSettings(await settingsRes.json());
        if (b2bRes.ok) setB2bRequests(await b2bRes.json());
        if (bannersRes.ok) setBanners(await bannersRes.json());

      } catch (err) {
        console.error('Error fetching admin details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [activeTab, user]);

  // Handle inventory forms mapping when entering the inventory tab
  useEffect(() => {
    if (activeTab === 'inventory') {
      const prices: Record<string, number> = {};
      const discounts: Record<string, number> = {};
      const stocks: Record<string, number> = {};
      const statuses: Record<string, string> = {};

      products.forEach(p => {
        prices[p.id] = p.price;
        discounts[p.id] = p.discountPrice || 0;
        stocks[p.id] = p.stockCount;
        statuses[p.id] = p.stockStatus;
      });

      setInventoryPrices(prices);
      setInventoryDiscounts(discounts);
      setInventoryStocks(stocks);
      setInventoryStatuses(statuses);
    }
  }, [activeTab, products]);

  // --- Product CRUD Actions ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingProduct;
    const url = isEdit ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    // Combine multiple images
    const imagesToSave = tempImageUrls.map(u => u.trim()).filter(Boolean);
    if (imagesToSave.length === 0) {
      imagesToSave.push('https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&q=80');
    }

    // Specifications Map Parser
    let specPayload = {};
    if (typeof productForm.specifications === 'string') {
      try {
        specPayload = JSON.parse(productForm.specifications);
      } catch {
        specPayload = { "Specs": productForm.specifications };
      }
    } else {
      specPayload = productForm.specifications || {};
    }

    // Features List Parser
    const featuresArray = typeof productForm.features === 'string'
      ? (productForm.features as string).split(',').map(f => f.trim()).filter(Boolean)
      : productForm.features || [];

    const finalProduct = {
      ...productForm,
      images: imagesToSave,
      features: featuresArray,
      specifications: specPayload,
      stockStatus: (productForm.stockCount || 0) > 0 ? (productForm.stockStatus || 'In Stock') : 'Out of Stock'
    };

    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: finalProduct })
      });

      if (res.ok) {
        const savedProduct = await res.json();
        if (isEdit) {
          setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
          setProducts(prev => [savedProduct, ...prev]);
        }
        setShowProductModal(false);
        setEditingProduct(null);
      } else {
        alert('Failed to save product listing. Check model definitions.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('Are you absolutely sure you want to permanently delete this product?')) return;
    try {
      const res = await fetchWithAuth(`/api/products/${prodId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== prodId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      ...prod,
      features: prod.features.join(', '),
      specifications: JSON.stringify(prod.specifications, null, 2)
    });
    setTempImageUrls(prod.images.length > 0 ? prod.images : ['']);
    setUseCustomCategoryText(false);
    setShowProductModal(true);
  };

  const handleCreateProductClick = () => {
    setEditingProduct(null);
    setProductForm({
      name: '', 
      price: 15000, 
      discountPrice: 0, 
      category: categories[0]?.name || 'Processors (CPU)', 
      brand: brands[0]?.name || 'Intel', 
      model: '', 
      sku: `TG-${Math.floor(1000 + Math.random() * 9000)}`,
      description: '', 
      features: 'Direct Brand Warranty, high reliability, optimal heat dispatch', 
      specifications: JSON.stringify({ "Warranty": "3 Years", "Status": "New" }, null, 2),
      stockCount: 15, 
      stockStatus: 'In Stock',
      isFeatured: false,
      isFlashDeal: false,
      isTrending: false,
      isBestSeller: false
    });
    setTempImageUrls(['']);
    setUseCustomCategoryText(false);
    setShowProductModal(true);
  };

  // --- Toggle Product Flags Quickly ---
  const handleToggleProductFlag = async (prod: Product, flag: 'isFeatured' | 'isFlashDeal' | 'isTrending' | 'isBestSeller') => {
    const updated = {
      ...prod,
      [flag]: !prod[flag]
    };
    try {
      const res = await fetchWithAuth(`/api/products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: updated })
      });
      if (res.ok) {
        const saved = await res.json();
        setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
      }
    } catch (err) {
      console.error('Failed to toggle flag:', err);
    }
  };

  // --- Category CRUD Actions ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingCategory;
    const url = isEdit ? `/api/categories/${editingCategory.id}` : '/api/categories';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...categoryForm,
          id: categoryForm.id || `cat-${Date.now()}`
        })
      });

      if (res.ok) {
        const savedCat = await res.json();
        if (isEdit) {
          setCategories(prev => prev.map(c => c.id === savedCat.id ? savedCat : c));
        } else {
          setCategories(prev => [...prev, savedCat]);
        }
        setShowCategoryModal(false);
        setEditingCategory(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products mapped here might become uncategorized.')) return;
    try {
      const res = await fetchWithAuth(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Brand CRUD Actions ---
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingBrand;
    const url = isEdit ? `/api/brands/${editingBrand.id}` : '/api/brands';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...brandForm,
          id: brandForm.id || `brand-${Date.now()}`
        })
      });

      if (res.ok) {
        const savedBrand = await res.json();
        if (isEdit) {
          setBrands(prev => prev.map(b => b.id === savedBrand.id ? savedBrand : b));
        } else {
          setBrands(prev => [...prev, savedBrand]);
        }
        setShowBrandModal(false);
        setEditingBrand(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand logo?')) return;
    try {
      const res = await fetchWithAuth(`/api/brands/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBrands(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Order Status Management ---
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetchWithAuth(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Customer Disable/Enable Actions ---
  const handleToggleCustomerStatus = async (customer: User) => {
    try {
      const res = await fetchWithAuth(`/api/admin/users/${customer.id}/toggle`, {
        method: 'PUT'
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      }
    } catch (err) {
      console.error('Failed to change user state:', err);
    }
  };

  // --- Inventory Quick Update ---
  const handleQuickSaveInventory = async (productId: string) => {
    const original = products.find(p => p.id === productId);
    if (!original) return;

    const updatedProduct = {
      ...original,
      price: Number(inventoryPrices[productId] || original.price),
      discountPrice: Number(inventoryDiscounts[productId] !== undefined ? inventoryDiscounts[productId] : original.discountPrice || 0),
      stockCount: Number(inventoryStocks[productId] !== undefined ? inventoryStocks[productId] : original.stockCount),
      stockStatus: inventoryStatuses[productId] || original.stockStatus
    };

    // Auto update status if stock goes zero
    if (updatedProduct.stockCount <= 0) {
      updatedProduct.stockStatus = 'Out of Stock';
    }

    try {
      const res = await fetchWithAuth(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: updatedProduct })
      });
      if (res.ok) {
        const saved = await res.json();
        setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
        alert('Product details successfully synchronized!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Coupon Creation ---
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;

    try {
      const res = await fetchWithAuth('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon: newCoupon })
      });

      if (res.ok) {
        const saved = await res.json();
        setCoupons(prev => [saved, ...prev]);
        setNewCoupon({
          code: '', discountType: 'Percentage', discountValue: 10, minPurchase: 1000, expiryDate: '', isActive: true
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm('Are you sure you want to retire this coupon code?')) return;
    try {
      const res = await fetchWithAuth(`/api/admin/coupons/${code}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.code !== code));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Review Moderation ---
  const handleApproveReview = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/api/admin/reviews/${id}/approve`, { method: 'PUT' });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete/reject this review?')) return;
    try {
      const res = await fetchWithAuth(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Global Website Settings Form ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetchWithAuth('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Website system configurations successfully written to server.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Print Invoice Utility ---
  const triggerInvoicePrint = () => {
    const printContent = document.getElementById('printable-invoice-content');
    const originalContent = document.body.innerHTML;
    if (printContent) {
      window.print();
    }
  };

  // --- Calculations for Analytics ---
  const totalEarnings = orders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.total, 0);
  const pendingSales = orders.filter(o => o.paymentStatus === 'Pending').reduce((sum, o) => sum + o.total, 0);
  const cancelledSales = orders.filter(o => o.orderStatus === 'Cancelled').reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = orders.length > 0 ? Math.round(totalEarnings / orders.length) : 0;

  // Render Charts Data (Recharts-friendly format)
  const getOrdersChartData = () => {
    const datesMap: Record<string, { date: string; Sales: number; Orders: number }> = {};
    orders.forEach(o => {
      const dt = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!datesMap[dt]) {
        datesMap[dt] = { date: dt, Sales: 0, Orders: 0 };
      }
      datesMap[dt].Orders += 1;
      if (o.paymentStatus === 'Paid') {
        datesMap[dt].Sales += o.total;
      }
    });
    return Object.values(datesMap).reverse().slice(-10); // last 10 dates
  };

  const getCategoriesStockData = () => {
    const categoryCount: Record<string, number> = {};
    products.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + p.stockCount;
    });
    return Object.entries(categoryCount).map(([name, stock]) => ({ name, stock }));
  };

  // Filters logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.userName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.userEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.trackingNumber.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.phone && u.phone.includes(userSearch))
  );

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* Upper Navigation Bar */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl text-white">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">Trust IT System Central</h1>
            <p className="text-[10px] text-slate-400 font-mono mt-1">OPERATOR SESSION: {user?.email || 'Administrator'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            id="btn-nav-to-gallery"
            onClick={() => {
              setCurrentView('home');
              window.history.pushState({}, '', '/');
            }}
            className="px-4 py-2 text-xs font-bold bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 text-slate-200 transition duration-200 cursor-pointer"
          >
            Switch to Public Gallery
          </button>
        </div>
      </header>

      {/* Primary Dashboard layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR NAVIGATION RAIL */}
        <aside className="lg:col-span-3 space-y-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm shrink-0">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-3 mb-2">Primary Control Panel</p>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={16} />
            <span>Dashboard Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Database size={16} />
            <span>Products Database ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'categories' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Layers size={16} />
            <span>Categories Panel ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('brands')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'brands' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Award size={16} />
            <span>Brands Catalog ({brands.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Receipt size={16} />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'customers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={16} />
            <span>User Accounts ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Sliders size={16} />
            <span>Stocks & Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'coupons' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Tag size={16} />
            <span>Promo Coupons ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'reviews' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Star size={16} />
            <span>Reviews Moderation ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('newsletter')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'newsletter' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Mail size={16} />
            <span>Subscribers Email</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'reports' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp size={16} />
            <span>Analytical Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SettingsIcon size={16} />
            <span>Website Config</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-black transition flex items-center gap-2.5 ${
              activeTab === 'logs' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Terminal size={16} />
            <span>Security Activity Logs</span>
          </button>
        </aside>

        {/* WORKSPACE AREA */}
        <main className="lg:col-span-9 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm min-h-[600px] flex flex-col justify-start">
          
          {isLoading ? (
            <div className="flex flex-col flex-grow items-center justify-center py-24">
              <RefreshCw className="h-10 w-10 text-blue-600 animate-spin" />
              <p className="text-xs text-gray-400 font-mono mt-4 font-bold">Synchronizing database instances with Mongo Atlas...</p>
            </div>
          ) : (
            <>
              {/* 1. TAB: DASHBOARD HUB */}
              {activeTab === 'dashboard' && (
                <div id="tab-content-dashboard" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight">Enterprise Analytics Dashboard</h2>
                      <p className="text-xs text-gray-400">Key metrics pulled in real-time from your system database.</p>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-1">
                      <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider font-mono">Gross Sales Turnover</p>
                      <h3 className="text-lg font-black text-slate-900">৳ {totalEarnings.toLocaleString()}</h3>
                      <p className="text-[10px] text-gray-400">Total verified order volume</p>
                    </div>
                    <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 space-y-1">
                      <p className="text-[10px] text-yellow-700 uppercase font-bold tracking-wider font-mono">Pending Transactions</p>
                      <h3 className="text-lg font-black text-slate-900">৳ {pendingSales.toLocaleString()}</h3>
                      <p className="text-[10px] text-gray-400">Outstanding payments state</p>
                    </div>
                    <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 space-y-1">
                      <p className="text-[10px] text-green-700 uppercase font-bold tracking-wider font-mono">Completed Deliveries</p>
                      <h3 className="text-lg font-black text-slate-900">{orders.filter(o => o.orderStatus === 'Delivered').length} Orders</h3>
                      <p className="text-[10px] text-gray-400">Successfully shipped items</p>
                    </div>
                    <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 space-y-1">
                      <p className="text-[10px] text-purple-700 uppercase font-bold tracking-wider font-mono">Average Order Size</p>
                      <h3 className="text-lg font-black text-slate-900">৳ {averageOrderValue.toLocaleString()}</h3>
                      <p className="text-[10px] text-gray-400">Average billing check amount</p>
                    </div>
                  </div>

                  {/* Chart and Activity Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                    <div className="border border-gray-100 rounded-xl p-4 bg-white space-y-3">
                      <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">Historical Order & Earnings Intake</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getOrdersChartData()}>
                            <defs>
                              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" fontSize={10} stroke="#94a3b8" />
                            <YAxis fontSize={10} stroke="#94a3b8" />
                            <Tooltip />
                            <Area type="monotone" dataKey="Sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSales)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl p-4 bg-slate-900 text-slate-300 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Controls Log Stream</h4>
                        <button onClick={() => setActiveTab('logs')} className="text-[10px] text-blue-400 hover:underline">Full Log System</button>
                      </div>
                      <div className="space-y-3 font-mono text-[10px] max-h-64 overflow-y-auto">
                        {logs.slice(0, 6).map(log => (
                          <div key={log.id} className="border-b border-slate-800/60 pb-2">
                            <div className="flex justify-between text-[9px] text-slate-500">
                              <span>{log.adminEmail}</span>
                              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-blue-400 font-bold mt-0.5">{log.action}</p>
                            <p className="text-slate-400">{log.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. TAB: PRODUCTS DATABASE */}
              {activeTab === 'products' && (
                <div id="tab-content-products" className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight">Master Products Database</h2>
                      <p className="text-xs text-gray-400">Perform complete CRUD, adjust pricing schemas, change details, and toggle promotions.</p>
                    </div>
                    <button
                      id="btn-admin-add-product"
                      onClick={handleCreateProductClick}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
                    >
                      <Plus size={14} /> Add Product Listing
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Search size={16} />
                    </span>
                    <input
                      id="input-product-search"
                      type="text"
                      placeholder="Search listings by Name, SKU, Brand, Category..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition duration-200"
                    />
                  </div>

                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                          <th className="px-4 py-3">Listing Details</th>
                          <th className="px-4 py-3">Categories & Brands</th>
                          <th className="px-4 py-3">Pricing State</th>
                          <th className="px-4 py-3 text-center">Promotions Status Flags</th>
                          <th className="px-4 py-3 text-right">Inventory</th>
                          <th className="px-4 py-3 text-right">Database Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-4 py-3.5 flex items-center gap-3">
                              <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-200" referrerPolicy="no-referrer" />
                              <div>
                                <p className="font-black text-gray-900 leading-tight">{p.name}</p>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">SKU: {p.sku} | MODEL: {p.model}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md block w-fit mb-1">{p.category}</span>
                              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md block w-fit">{p.brand}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-gray-900">৳ {p.price.toLocaleString()}</p>
                              {p.discountPrice ? (
                                <p className="text-[10px] text-red-600 font-semibold line-through">৳ {p.discountPrice.toLocaleString()}</p>
                              ) : <p className="text-[10px] text-gray-400">Regular List Price</p>}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex justify-center items-center gap-1.5 flex-wrap max-w-[200px] mx-auto">
                                <button
                                  onClick={() => handleToggleProductFlag(p, 'isFeatured')}
                                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border transition ${
                                    p.isFeatured ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-gray-50 text-gray-400 border-gray-200'
                                  }`}
                                >
                                  Featured
                                </button>
                                <button
                                  onClick={() => handleToggleProductFlag(p, 'isFlashDeal')}
                                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border transition ${
                                    p.isFlashDeal ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-50 text-gray-400 border-gray-200'
                                  }`}
                                >
                                  Flash
                                </button>
                                <button
                                  onClick={() => handleToggleProductFlag(p, 'isTrending')}
                                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border transition ${
                                    p.isTrending ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-50 text-gray-400 border-gray-200'
                                  }`}
                                >
                                  Trending
                                </button>
                                <button
                                  onClick={() => handleToggleProductFlag(p, 'isBestSeller')}
                                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border transition ${
                                    p.isBestSeller ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-50 text-gray-400 border-gray-200'
                                  }`}
                                >
                                  Best
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono">
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                p.stockCount > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {p.stockCount} in stock
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => handleEditProductClick(p)}
                                  className="p-1.5 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md transition"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. TAB: CATEGORIES PANEL */}
              {activeTab === 'categories' && (
                <div id="tab-content-categories" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight">Product Categories Panel</h2>
                      <p className="text-xs text-gray-400">Add, edit, and retire structural product category classifications.</p>
                    </div>
                    <button
                      id="btn-add-category"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({ name: '', imageUrl: '' });
                        setShowCategoryModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus size={14} /> Create Category
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map(c => (
                      <div key={c.id} className="border border-gray-100 rounded-xl p-4 bg-white hover:shadow-md transition flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 overflow-hidden font-mono font-bold">
                            {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{c.name}</h4>
                            <p className="text-[10px] text-gray-400">Total matched products: {products.filter(p => p.category === c.name).length}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingCategory(c);
                              setCategoryForm(c);
                              setShowCategoryModal(true);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. TAB: BRANDS CATALOG */}
              {activeTab === 'brands' && (
                <div id="tab-content-brands" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight">Brands Catalogue</h2>
                      <p className="text-xs text-gray-400">Create brand listings, logos, and check product catalogs in real-time.</p>
                    </div>
                    <button
                      id="btn-add-brand"
                      onClick={() => {
                        setEditingBrand(null);
                        setBrandForm({ name: '', logoUrl: '' });
                        setShowBrandModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus size={14} /> Register New Brand
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {brands.map(b => (
                      <div key={b.id} className="border border-gray-100 rounded-xl p-4 bg-white hover:shadow-md transition flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 border rounded-lg flex items-center justify-center text-slate-500 overflow-hidden text-xs font-mono font-bold">
                            {b.logoUrl ? <img src={b.logoUrl} alt={b.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" /> : b.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{b.name}</h4>
                            <p className="text-[10px] text-gray-400">Mapped components: {products.filter(p => p.brand === b.name).length}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingBrand(b);
                              setBrandForm(b);
                              setShowBrandModal(true);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(b.id)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. TAB: CUSTOMER ORDERS */}
              {activeTab === 'orders' && (
                <div id="tab-content-orders" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Customer Sales Orders</h2>
                    <p className="text-xs text-gray-400">View customer purchases, update tracking numbers or fulfillment status, and print professional invoices.</p>
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Search size={16} />
                    </span>
                    <input
                      id="input-order-search"
                      type="text"
                      placeholder="Search orders by Order ID, Buyer Name, Email, Tracking code..."
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                          <th className="px-4 py-3">Order Code</th>
                          <th className="px-4 py-3">Buyer</th>
                          <th className="px-4 py-3">Financial Total</th>
                          <th className="px-4 py-3">Payment State</th>
                          <th className="px-4 py-3">Fulfillment Status</th>
                          <th className="px-4 py-3 text-right font-bold">Actions / Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-4 py-3.5 font-mono font-bold text-gray-900">{o.id}</td>
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-gray-900">{o.userName}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{o.userEmail} | {o.userPhone}</p>
                            </td>
                            <td className="px-4 py-3.5 font-black text-slate-900">৳ {o.total.toLocaleString()}</td>
                            <td className="px-4 py-3.5 font-mono">
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                                o.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                              }`}>
                                {o.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <select
                                value={o.orderStatus}
                                onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-md p-1 text-[10px] focus:outline-none"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setShowInvoiceModal(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 rounded-md transition cursor-pointer"
                              >
                                <Printer size={12} /> View Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 6. TAB: USER ACCOUNTS (CUSTOMERS) */}
              {activeTab === 'customers' && (
                <div id="tab-content-customers" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">User Accounts (Customers)</h2>
                    <p className="text-xs text-gray-400">Oversee customer accounts, monitor points profiles, and easily toggle account accessibility.</p>
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Search size={16} />
                    </span>
                    <input
                      id="input-user-search"
                      type="text"
                      placeholder="Search buyers by Name, Registered Email, Telephone..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                          <th className="px-4 py-3">Account User</th>
                          <th className="px-4 py-3">Telephone</th>
                          <th className="px-4 py-3">Loyalty Level</th>
                          <th className="px-4 py-3 font-mono text-center">Referral Scheme</th>
                          <th className="px-4 py-3 text-center">Security Access Status</th>
                          <th className="px-4 py-3 text-right">Registered Since</th>
                          <th className="px-4 py-3 text-right">Toggle Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-gray-900">{u.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{u.email} <span className="bg-slate-100 text-slate-600 font-bold text-[8px] px-1 py-0.5 rounded uppercase">{u.role}</span></p>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-gray-500">{u.phone || 'N/A'}</td>
                            <td className="px-4 py-3.5">
                              <span className="bg-blue-50 text-blue-700 font-mono font-bold px-2 py-0.5 rounded-md text-[10px]">
                                {u.loyaltyPoints || 0} pts
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center font-mono text-gray-400">
                              {u.referralCode ? `${u.referralCode}` : 'None'}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                                u.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {u.disabled ? 'Disabled' : 'Active Account'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono text-gray-400">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {u.role === 'admin' ? (
                                <span className="text-[9px] text-gray-400 font-bold">System Operator</span>
                              ) : (
                                <button
                                  onClick={() => handleToggleCustomerStatus(u)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl transition duration-200 cursor-pointer ${
                                    u.disabled 
                                      ? 'bg-green-600 hover:bg-green-500 text-white' 
                                      : 'bg-red-600 hover:bg-red-500 text-white'
                                  }`}
                                >
                                  {u.disabled ? <Unlock size={12} /> : <Lock size={12} />}
                                  {u.disabled ? 'Enable' : 'Disable'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 7. TAB: INVENTORY */}
              {activeTab === 'inventory' && (
                <div id="tab-content-inventory" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Stock & Pricing Inventory Control</h2>
                    <p className="text-xs text-gray-400">A high-density spreadsheet utility designed for quick adjustments of lists prices, discounts, and item stock quantities.</p>
                  </div>

                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                          <th className="px-4 py-3">Product Name & SKU</th>
                          <th className="px-4 py-3">List Price (৳)</th>
                          <th className="px-4 py-3">Discount Value (৳)</th>
                          <th className="px-4 py-3">Stock count</th>
                          <th className="px-4 py-3">Stock Status Option</th>
                          <th className="px-4 py-3 text-right">Commit Changes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono">
                        {products.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-4 py-2 font-sans font-bold text-gray-900">
                              <p className="truncate max-w-xs">{p.name}</p>
                              <span className="text-[9px] text-gray-400 font-mono">SKU: {p.sku}</span>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={inventoryPrices[p.id] !== undefined ? inventoryPrices[p.id] : p.price}
                                onChange={e => setInventoryPrices(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                                className="w-24 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 focus:bg-white"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={inventoryDiscounts[p.id] !== undefined ? inventoryDiscounts[p.id] : p.discountPrice || 0}
                                onChange={e => setInventoryDiscounts(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                                className="w-24 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 focus:bg-white"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={inventoryStocks[p.id] !== undefined ? inventoryStocks[p.id] : p.stockCount}
                                onChange={e => setInventoryStocks(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                                className="w-20 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 focus:bg-white"
                              />
                            </td>
                            <td className="px-4 py-2 font-sans">
                              <select
                                value={inventoryStatuses[p.id] || p.stockStatus}
                                onChange={e => setInventoryStatuses(prev => ({ ...prev, [p.id]: e.target.value }))}
                                className="bg-gray-50 border border-gray-200 rounded px-1 py-0.5"
                              >
                                <option value="In Stock">In Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                                <option value="Pre-Order">Pre-Order</option>
                              </select>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => handleQuickSaveInventory(p.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold rounded-md transition duration-200 cursor-pointer"
                              >
                                Quick Sync
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 8. TAB: PROMO COUPONS */}
              {activeTab === 'coupons' && (
                <div id="tab-content-coupons" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Coupon Form */}
                    <div className="border border-gray-100 rounded-xl p-5 bg-white space-y-4">
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Generate New Coupon</h3>
                      <form onSubmit={handleCreateCoupon} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-500">Promo Code</label>
                          <input
                            type="text"
                            required
                            placeholder="TRUST50"
                            value={newCoupon.code}
                            onChange={e => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase().trim() }))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-500">Discount Classification</label>
                          <select
                            value={newCoupon.discountType}
                            onChange={e => setNewCoupon(prev => ({ ...prev, discountType: e.target.value as any }))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                          >
                            <option value="Percentage">Percentage Discount (%)</option>
                            <option value="Fixed">Fixed Deduction (৳)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-500">Discount Amount</label>
                          <input
                            type="number"
                            required
                            value={newCoupon.discountValue}
                            onChange={e => setNewCoupon(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-500">Minimum Order Purchase Required</label>
                          <input
                            type="number"
                            required
                            value={newCoupon.minPurchase}
                            onChange={e => setNewCoupon(prev => ({ ...prev, minPurchase: Number(e.target.value) }))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-500">Expiry Threshold</label>
                          <input
                            type="date"
                            required
                            value={newCoupon.expiryDate}
                            onChange={e => setNewCoupon(prev => ({ ...prev, expiryDate: e.target.value }))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-lg transition duration-200 cursor-pointer"
                        >
                          Forge Active Coupon
                        </button>
                      </form>
                    </div>

                    {/* Coupons List */}
                    <div className="lg:col-span-2 overflow-x-auto border border-gray-100 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                            <th className="px-4 py-3">Coupon Code</th>
                            <th className="px-4 py-3">Deduction Method</th>
                            <th className="px-4 py-3">Min Cart Limit</th>
                            <th className="px-4 py-3">Expiry Day</th>
                            <th className="px-4 py-3 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-mono">
                          {coupons.map(c => (
                            <tr key={c.code} className="hover:bg-gray-50/50 transition">
                              <td className="px-4 py-3 font-bold text-gray-900">{c.code}</td>
                              <td className="px-4 py-3">
                                {c.discountType === 'Percentage' ? `${c.discountValue}% Off` : `৳ ${c.discountValue} Off`}
                              </td>
                              <td className="px-4 py-3">৳ {c.minPurchase.toLocaleString()}</td>
                              <td className="px-4 py-3 text-gray-400">{c.expiryDate}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteCoupon(c.code)}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. TAB: REVIEWS MODERATION */}
              {activeTab === 'reviews' && (
                <div id="tab-content-reviews" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">User Reviews Moderation</h2>
                    <p className="text-xs text-gray-400">Review content generated by clients, approve valid ones, or permanently reject inappropriate feedback.</p>
                  </div>

                  <div className="space-y-4">
                    {reviews.map(r => {
                      const matchedProduct = products.find(p => p.id === r.productId);
                      return (
                        <div key={r.id} className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="flex text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} />
                                ))}
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono">ID: {r.id} | USER: {r.userName} ({r.userEmail})</span>
                            </div>
                            <h4 className="font-bold text-gray-900">
                              Product: {matchedProduct ? matchedProduct.name : 'Unknown Product'}
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed italic">"{r.comment}"</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {r.approved ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                                <Check size={12} /> Approved & Public
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApproveReview(r.id)}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition cursor-pointer"
                              >
                                Approve Listing
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReview(r.id)}
                              className="p-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-500 rounded-lg border border-gray-100 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 10. TAB: SUBSCRIBERS EMAIL */}
              {activeTab === 'newsletter' && (
                <div id="tab-content-newsletter" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight">Newsletter Subscribers</h2>
                      <p className="text-xs text-gray-400">View customer emails registered for the marketing newsletters.</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(newsletterEmails.join(', '));
                        alert('All newsletter emails copied to clipboard!');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <Download size={14} /> Copy All Subscriber Emails
                    </button>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-black text-gray-400 tracking-wider font-mono">
                      Subscribers Record ({newsletterEmails.length})
                    </div>
                    <div className="divide-y divide-gray-100">
                      {newsletterEmails.map((email, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition font-mono text-xs text-gray-800">
                          <span>{email}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(email);
                              alert(`Copied ${email} to clipboard!`);
                            }}
                            className="text-[10px] text-blue-600 font-sans hover:underline"
                          >
                            Copy Email
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 11. TAB: ANALYTICAL REPORTS */}
              {activeTab === 'reports' && (
                <div id="tab-content-reports" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Analytical Performance Reports</h2>
                    <p className="text-xs text-gray-400">Detailed data reports generated using Recharts for stock, categories and order flow statistics.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Performance */}
                    <div className="border border-gray-100 rounded-xl p-5 bg-white space-y-3">
                      <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Order Count Frequency</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getOrdersChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" fontSize={10} stroke="#94a3b8" />
                            <YAxis fontSize={10} stroke="#94a3b8" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Orders" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Stock Distribution */}
                    <div className="border border-gray-100 rounded-xl p-5 bg-white space-y-3">
                      <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Stock Count Volume by Categories</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getCategoriesStockData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" fontSize={8} stroke="#94a3b8" />
                            <YAxis fontSize={10} stroke="#94a3b8" />
                            <Tooltip />
                            <Bar dataKey="stock" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 12. TAB: WEBSITE CONFIG */}
              {activeTab === 'settings' && settings && (
                <div id="tab-content-settings" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Website Configuration</h2>
                    <p className="text-xs text-gray-400">Manage global operational thresholds, flat shipping policies, physical store addresses, and social contacts.</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl bg-white border border-gray-100 rounded-xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Free Shipping Limit (৳)</label>
                        <input
                          type="number"
                          required
                          value={settings.freeShippingThreshold}
                          onChange={e => setSettings(prev => prev ? ({ ...prev, freeShippingThreshold: Number(e.target.value) }) : null)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Flat Shipping Rate (৳)</label>
                        <input
                          type="number"
                          required
                          value={settings.flatShippingRate}
                          onChange={e => setSettings(prev => prev ? ({ ...prev, flatShippingRate: Number(e.target.value) }) : null)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Store Contact Email Address</label>
                        <input
                          type="email"
                          required
                          value={settings.contactEmail}
                          onChange={e => setSettings(prev => prev ? ({ ...prev, contactEmail: e.target.value }) : null)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Store Telephone Contact</label>
                        <input
                          type="text"
                          required
                          value={settings.contactPhone}
                          onChange={e => setSettings(prev => prev ? ({ ...prev, contactPhone: e.target.value }) : null)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Physical Center HQ Address</label>
                      <textarea
                        required
                        value={settings.address}
                        onChange={e => setSettings(prev => prev ? ({ ...prev, address: e.target.value }) : null)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none h-16 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">WhatsApp Hotline Number</label>
                        <input
                          type="text"
                          value={settings.whatsappNumber}
                          onChange={e => setSettings(prev => prev ? ({ ...prev, whatsappNumber: e.target.value }) : null)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Facebook Page Link</label>
                        <input
                          type="text"
                          value={settings.facebookLink}
                          onChange={e => setSettings(prev => prev ? ({ ...prev, facebookLink: e.target.value }) : null)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="check-popup"
                        checked={settings.enableNewsletterPopup}
                        onChange={e => setSettings(prev => prev ? ({ ...prev, enableNewsletterPopup: e.target.checked }) : null)}
                        className="rounded text-blue-600 focus:ring-blue-500/20"
                      />
                      <label htmlFor="check-popup" className="text-xs font-bold text-gray-700">Display Automated Newsletter Discount Offer Modal Popup on Store Entry</label>
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black py-2.5 px-6 rounded-xl transition duration-200 cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </form>
                </div>
              )}

              {/* 13. TAB: SECURITY ACTIVITY LOGS */}
              {activeTab === 'logs' && (
                <div id="tab-content-logs" className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Security System Activity Logs</h2>
                    <p className="text-xs text-gray-400">Strictly tracks all operational changes, listing deletions, configuration adjustments and authentications.</p>
                  </div>

                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                            <th className="px-4 py-3 font-mono">Timestamp</th>
                            <th className="px-4 py-3">Administrator Email</th>
                            <th className="px-4 py-3">Action Type</th>
                            <th className="px-4 py-3">Details Parameters Logged</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-mono bg-slate-950 text-slate-300">
                          {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-900/40 transition">
                              <td className="px-4 py-3 text-slate-500 text-[11px]">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-slate-400">{log.adminEmail}</td>
                              <td className="px-4 py-3 text-blue-400 font-black">{log.action}</td>
                              <td className="px-4 py-3 text-slate-400 text-[11px] leading-normal">{log.details}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODAL 1: PRODUCT ADD / EDIT MULTI-IMAGE & FORM MODAL */}
      {showProductModal && (
        <div id="product-crud-modal" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-gray-900 tracking-tight">
                {editingProduct ? `Edit Listing Details: ${editingProduct.sku}` : 'Register New Gallery component'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Model ID</label>
                  <input
                    type="text"
                    required
                    value={productForm.model}
                    onChange={e => setProductForm(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">List Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Discount List Price (৳ - optional)</label>
                  <input
                    type="number"
                    value={productForm.discountPrice || ''}
                    onChange={e => setProductForm(prev => ({ ...prev, discountPrice: Number(e.target.value) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={productForm.stockCount}
                    onChange={e => setProductForm(prev => ({ ...prev, stockCount: Number(e.target.value) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Stock Availability State</label>
                  <select
                    value={productForm.stockStatus}
                    onChange={e => setProductForm(prev => ({ ...prev, stockStatus: e.target.value as any }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Pre-Order">Pre-Order</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Product Category</label>
                    <button
                      type="button"
                      onClick={() => setUseCustomCategoryText(!useCustomCategoryText)}
                      className="text-[9px] font-semibold text-blue-600 hover:underline"
                    >
                      {useCustomCategoryText ? 'Select from list' : 'Type custom category'}
                    </button>
                  </div>
                  {useCustomCategoryText ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. RAM, Graphics Cards, Casing..."
                      value={productForm.category}
                      onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  ) : (
                    <select
                      value={productForm.category}
                      onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                      <option value="RAM">RAM</option>
                      <option value="Graphics Cards">Graphics Cards</option>
                      <option value="Casing">Casing</option>
                      <option value="Processors (CPU)">Processors (CPU)</option>
                      <option value="Motherboards">Motherboards</option>
                      <option value="SSD">SSD</option>
                      <option value="PC Cases">PC Cases</option>
                      <option value="CPU Coolers">CPU Coolers</option>
                      <option value="Power Supplies">Power Supplies</option>
                      <option value="Monitors">Monitors</option>
                      <option value="Mice">Mice</option>
                      <option value="Keyboards">Keyboards</option>
                      <option value="Routers">Routers</option>
                      <option value="Printers">Printers</option>
                      <option value="CCTV Products">CCTV Products</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Brand Name</label>
                  <select
                    value={productForm.brand}
                    onChange={e => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                    <option value="Intel">Intel</option>
                    <option value="AMD">AMD</option>
                    <option value="ASUS">ASUS</option>
                    <option value="MSI">MSI</option>
                  </select>
                </div>
              </div>

              {/* MULTIPLE IMAGES MANAGEMENT SECTION */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Upload Multiple Product Image URLs</label>
                  <button
                    type="button"
                    onClick={() => setTempImageUrls(prev => [...prev, ''])}
                    className="text-[10px] text-blue-600 font-bold flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Additional Image URL Input
                  </button>
                </div>
                <div className="space-y-2">
                  {tempImageUrls.map((url, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={url}
                        onChange={e => {
                          const updated = [...tempImageUrls];
                          updated[idx] = e.target.value;
                          setTempImageUrls(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                      />
                      {tempImageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setTempImageUrls(prev => prev.filter((_, i) => i !== idx))}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500">Short Promotional Features (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Direct Brand Warranty, high reliability, overclocking ready"
                  value={productForm.features}
                  onChange={e => setProductForm(prev => ({ ...prev, features: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Specifications (JSON format)</label>
                  <textarea
                    rows={4}
                    value={productForm.specifications}
                    onChange={e => setProductForm(prev => ({ ...prev, specifications: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Detailed Product Overview</label>
                  <textarea
                    rows={4}
                    value={productForm.description}
                    onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition cursor-pointer"
                >
                  Synchronize to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CATEGORY MODAL */}
      {showCategoryModal && (
        <div id="category-modal" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-black text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create Category Classification'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500">Illustration Icon URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={categoryForm.imageUrl}
                  onChange={e => setCategoryForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3.5 py-1.5 border rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition cursor-pointer"
                >
                  Commit Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BRAND MODAL */}
      {showBrandModal && (
        <div id="brand-modal" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-black text-gray-900">
                {editingBrand ? 'Edit Brand Info' : 'Add Brand Manufacturer'}
              </h3>
              <button onClick={() => setShowBrandModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500">Brand Name</label>
                <input
                  type="text"
                  required
                  value={brandForm.name}
                  onChange={e => setBrandForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500">Logo Image Link URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={brandForm.logoUrl}
                  onChange={e => setBrandForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="px-3.5 py-1.5 border rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition cursor-pointer"
                >
                  Commit Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: INVOICE PRINT AND VIEW DETAILS */}
      {showInvoiceModal && selectedOrder && (
        <div id="invoice-modal-overlay" className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="bg-blue-600 text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md">Official Billing Statement</span>
              <div className="flex gap-2">
                <button
                  onClick={triggerInvoicePrint}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer size={14} /> Print Invoice
                </button>
                <button onClick={() => setShowInvoiceModal(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Area content ID */}
            <div id="printable-invoice-content" className="space-y-6 text-xs text-gray-800 font-sans p-4 border border-gray-100 rounded-xl">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-gray-900 leading-none uppercase">Trust IT Gallery Ltd.</h3>
                  <p className="text-gray-400 text-[10px]">Premium PC Components Hub & Systems Integration</p>
                  <p className="text-gray-500 font-mono">Baitul Mukarram Market, Dhaka, Bangladesh</p>
                </div>
                <div className="text-right space-y-1 font-mono">
                  <p className="font-bold text-gray-900">INVOICE: #{selectedOrder.id}</p>
                  <p className="text-gray-400">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-500">Method: {selectedOrder.paymentMethod}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-b border-gray-100 pb-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider font-mono">Bill To Customer</p>
                  <h4 className="font-bold text-gray-900 text-sm">{selectedOrder.userName}</h4>
                  <p className="text-gray-600 font-mono">Phone: {selectedOrder.userPhone}</p>
                  <p className="text-gray-600 font-mono">Email: {selectedOrder.userEmail}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider font-mono">Fulfillment Dispatch</p>
                  <p className="text-gray-600">{selectedOrder.shippingAddress.streetAddress}</p>
                  <p className="text-gray-600">{selectedOrder.shippingAddress.city} - {selectedOrder.shippingAddress.postalCode}</p>
                  <p className="text-gray-600">{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Items billing table */}
              <div className="space-y-2">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider font-mono">Order Line Items</p>
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-[9px]">
                        <th className="px-4 py-2">Matched Component</th>
                        <th className="px-4 py-2 text-center">Quantity</th>
                        <th className="px-4 py-2 text-right">Unit Price</th>
                        <th className="px-4 py-2 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono text-[10px]">
                      {selectedOrder.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2.5 font-sans font-bold text-gray-900">{it.productName}</td>
                          <td className="px-4 py-2.5 text-center font-bold text-gray-800">{it.quantity}</td>
                          <td className="px-4 py-2.5 text-right">৳ {it.price.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right font-black text-gray-900">৳ {(it.price * it.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice Calculations list */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-right font-mono">
                  <div className="flex justify-between text-gray-500 border-b border-gray-50/60 pb-1">
                    <span>Subtotal Price:</span>
                    <span>৳ {selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-red-600 border-b border-red-50/60 pb-1">
                      <span>Promo Discount:</span>
                      <span>-৳ {selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500 border-b border-gray-50/60 pb-1">
                    <span>Shipping Charges:</span>
                    <span>৳ {selectedOrder.shippingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-950 pt-1 text-sm border-t border-slate-900">
                    <span>Grand Total Due:</span>
                    <span>৳ {selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 text-center space-y-1">
                <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">Thank You For Sourcing With Trust IT Gallery!</p>
                <p className="text-[9px] text-gray-300 font-mono">Authorized computerized statement generated on secure Atlas channels. No hand written signature required.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
