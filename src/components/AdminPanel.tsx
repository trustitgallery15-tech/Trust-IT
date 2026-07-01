import React, { useState, useEffect } from 'react';
import { 
  BarChart3, ShieldCheck, Database, Plus, Edit3, Trash2, Tag, 
  Settings as SettingsIcon, Users, Receipt, Terminal, Image, Sliders, Briefcase, ChevronRight, RefreshCw, Eye
} from 'lucide-react';
import { Product, Order, User, Coupon, B2BRequest, Banner, SystemSettings, LogEntry } from '../types.js';

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
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'coupons' | 'b2b' | 'banners' | 'logs' | 'settings'>('analytics');
  
  // Loaded collections
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [b2bRequests, setB2bRequests] = useState<B2BRequest[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // Loading indicator states
  const [isLoading, setIsLoading] = useState(false);

  // Forms / Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', price: 0, discountPrice: 0, category: 'Processors (CPU)', brand: '', model: '', sku: '',
    description: '', features: [], specifications: {}, images: [], stockCount: 10, stockStatus: 'In Stock',
    rating: 5, reviewsCount: 0, warranty: '3 Years Warranty'
  });

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscountType, setNewCouponDiscountType] = useState<'Percentage' | 'Flat'>('Percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMinCart, setNewCouponMinCart] = useState(1000);

  // Fetch administrator data on mount / tab change
  useEffect(() => {
    // Safety check - force exit if not admin
    if (!user || user.role !== 'admin') {
      setCurrentView('home');
      return;
    }

    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        // Parallel queries to fetch state
        const [ordersRes, usersRes, couponsRes, b2bRes, bannersRes, logsRes, settingsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/admin/users'),
          fetch('/api/admin/coupons'),
          fetch('/api/admin/b2b-requests'),
          fetch('/api/banners'),
          fetch('/api/admin/logs'),
          fetch('/api/settings')
        ]);

        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
        if (couponsRes.ok) setCoupons(await couponsRes.json());
        if (b2bRes.ok) setB2bRequests(await b2bRes.json());
        if (bannersRes.ok) setBanners(await bannersRes.json());
        if (logsRes.ok) setLogs(await logsRes.json());
        if (settingsRes.ok) setSettings(await settingsRes.json());

      } catch (err) {
        console.error('Error fetching admin details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [activeTab, user]);

  // Product CRUD Operations
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingProduct;
    const url = isEdit ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    // Parse features & specs if stringified comma-separated list
    const featuresArray = typeof productForm.features === 'string' 
      ? (productForm.features as string).split(',').map(f => f.trim()) 
      : productForm.features || [];

    const specPayload = typeof productForm.specifications === 'string'
      ? JSON.parse(productForm.specifications)
      : productForm.specifications || {};

    const imageArray = typeof productForm.images === 'string'
      ? (productForm.images as string).split(',').map(i => i.trim())
      : productForm.images || ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&q=80'];

    const payload = {
      product: {
        ...productForm,
        features: featuresArray,
        specifications: specPayload,
        images: imageArray
      }
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('Are you absolutely sure you want to delete this product listing?')) return;
    try {
      const res = await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
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
      specifications: JSON.stringify(prod.specifications, null, 2),
      images: prod.images.join(', ')
    } as any);
    setShowProductModal(true);
  };

  const handleCreateProductClick = () => {
    setEditingProduct(null);
    setProductForm({
      name: '', price: 25000, discountPrice: 0, category: 'Processors (CPU)', brand: '', model: '', sku: `TG-${Math.floor(1000 + Math.random() * 9000)}`,
      description: '', features: 'Direct Brand Warranty, extreme speed', specifications: JSON.stringify({ "Socket": "AM5", "Speed": "4.2GHz", "Cores": "8 Cores" }, null, 2),
      images: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&q=80', stockCount: 15, stockStatus: 'In Stock',
      rating: 5, reviewsCount: 0, warranty: '3 Years Warranty'
    } as any);
    setShowProductModal(true);
  };

  // Order status transitions
  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Coupons creation
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupon: {
            code: newCouponCode.trim().toUpperCase(),
            discountType: newCouponDiscountType,
            discountValue: newCouponValue,
            minCartAmount: newCouponMinCart,
            isActive: true
          }
        })
      });
      if (res.ok) {
        const saved = await res.json();
        setCoupons(prev => [saved, ...prev]);
        setNewCouponCode('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.code !== code));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Settings Updates
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Global Settings Updated successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // B2B Requests transition
  const handleUpdateB2bStatus = async (reqId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/b2b-requests/${reqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setB2bRequests(prev => prev.map(r => r.id === reqId ? updated : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Banners slider modifications
  const handleToggleBanner = async (bannerId: string) => {
    const banner = banners.find(b => b.id === bannerId);
    if (!banner) return;
    try {
      const res = await fetch(`/api/banners/${bannerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive })
      });
      if (res.ok) {
        const updated = await res.json();
        setBanners(prev => prev.map(b => b.id === bannerId ? updated : b));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate high-level financial analytical aggregates
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
  const processedOrders = orders.filter(o => o.orderStatus === 'Processing').length;
  const completedOrders = orders.filter(o => o.orderStatus === 'Delivered').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 font-sans">
      
      {/* Master Admin Header */}
      <div className="rounded-3xl bg-gray-900 text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 shadow-xl border-l-4 border-blue-600">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-600 text-[10px] font-black tracking-widest uppercase px-2 py-0.5">Admin Security Portal</span>
            <span className="text-gray-400 font-bold text-xs">● Active Connection Secured</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black mt-2">Trust IT Gallery Administration</h1>
          <p className="text-xs text-gray-400 mt-1">Configure inventories, process customer invoices, moderate B2B quotes, and manage systems settings.</p>
        </div>

        <button
          onClick={() => setCurrentView('home')}
          className="rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 px-4 py-2.5 text-xs font-bold text-gray-200 transition"
        >
          Exit Administrative View
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left administrative navigation rail */}
        <div className="lg:col-span-3 space-y-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Store Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Manage Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'coupons' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>Promo Coupons ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('b2b')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'b2b' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>B2B Bulk Quotes ({b2bRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'banners' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Image className="h-4 w-4" />
            <span>Marketing Banners ({banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <SettingsIcon className="h-4 w-4" />
            <span>Store Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full rounded-xl px-4 py-3 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'logs' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Server Security Logs</span>
          </button>
        </div>

        {/* Right Dashboard panel screens */}
        <div className="lg:col-span-9 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[500px]">
          
          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                <p className="mt-3 text-xs text-gray-400 font-semibold">Synchronizing secure data panels...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Tab: Analytics Dashboard */}
              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Real-Time Analytical Pulse</h3>
                  
                  {/* Stats Grid cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-gray-100 p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Gross Sales Turnover</p>
                      <h4 className="text-lg font-black text-blue-900 mt-1">BDT {totalRevenue.toLocaleString()}</h4>
                      <p className="text-[10px] text-green-600 font-bold mt-1">✓ Operating Green</p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Transactions</p>
                      <h4 className="text-lg font-black text-gray-800 mt-1">{orders.length} Orders</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">Pending: {pendingOrders}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Customers</p>
                      <h4 className="text-lg font-black text-gray-800 mt-1">{users.length} Users</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">Staff: {users.filter(u=>u.role==='Admin').length}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Inventory</p>
                      <h4 className="text-lg font-black text-gray-800 mt-1">{products.length} SKU</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">Out of Stock: {products.filter(p=>p.stockStatus==='Out of Stock').length}</p>
                    </div>
                  </div>

                  {/* Visual analytical chart mock */}
                  <div className="border border-gray-100 rounded-3xl p-6 space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Monthly Sales Progression (BDT)</h4>
                    <div className="flex items-end gap-3 h-48 pt-6">
                      {[120000, 195000, 310000, 240000, 420000, 680000, totalRevenue].map((val, idx) => {
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
                        const maxVal = 700000;
                        const pct = Math.min(100, Math.max(10, (val / maxVal) * 100));

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                            <span className="text-[9px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition duration-200">
                              {(val/1000).toFixed(0)}k
                            </span>
                            <div 
                              className="w-full bg-blue-500 rounded-lg group-hover:bg-blue-600 transition duration-300" 
                              style={{ height: `${pct}%` }}
                            ></div>
                            <span className="text-[9px] text-gray-400 font-black">{months[idx]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Products Manager Grid */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-50 pb-4">
                    <h3 className="text-base font-black text-gray-900 tracking-tight">Active Hardware Inventory</h3>
                    <button
                      onClick={handleCreateProductClick}
                      className="rounded-xl bg-blue-600 px-4.5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center gap-1.5 transition"
                    >
                      <Plus className="h-4.5 w-4.5" />
                      <span>Add New Component</span>
                    </button>
                  </div>

                  {/* Standard search inputs inside product managers */}
                  <div className="border border-gray-100 rounded-3xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                          <th className="px-4 py-3 font-bold">Component Name</th>
                          <th className="px-4 py-3 font-bold">Category</th>
                          <th className="px-4 py-3 font-bold">SKU</th>
                          <th className="px-4 py-3 text-right font-bold">Price</th>
                          <th className="px-4 py-3 text-center font-bold">Stock</th>
                          <th className="px-4 py-3 text-center font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-4 py-3.5 font-semibold text-gray-800 truncate max-w-xs">{p.name}</td>
                            <td className="px-4 py-3.5 text-gray-500">{p.category}</td>
                            <td className="px-4 py-3.5 font-mono text-gray-500">{p.sku}</td>
                            <td className="px-4 py-3.5 text-right font-bold font-mono">BDT {p.price.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-center font-bold">
                              <span className={`rounded-md px-2 py-0.5 text-[9px] ${
                                p.stockCount < 5 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                              }`}>
                                {p.stockCount} ({p.stockStatus})
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex justify-center gap-1.5">
                                <button
                                  onClick={() => handleEditProductClick(p)}
                                  className="rounded p-1 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
                                  title="Edit specs"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                                  title="Delete product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Edit/Create Product Modal overlay */}
                  {showProductModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
                        <h4 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">
                          {editingProduct ? 'Edit Computer Component' : 'Add New IT Component'}
                        </h4>

                        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-gray-400 font-bold mb-1">Product Title / Name</label>
                              <input
                                type="text"
                                required
                                value={productForm.name || ''}
                                onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-gray-50/50"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-400 font-bold mb-1">Category</label>
                              <select
                                value={productForm.category || 'Processors (CPU)'}
                                onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-white"
                              >
                                {[
                                  'Computer Components', 'Graphics Cards', 'Processors (CPU)', 'Motherboards', 'RAM', 'SSD',
                                  'HDD', 'CPU Coolers', 'Power Supplies', 'PC Cases', 'Monitors', 'Keyboards', 'Mice',
                                  'Mouse Pads', 'Gaming Accessories', 'Headphones', 'Speakers', 'Webcams', 'Routers',
                                  'Networking Devices', 'Printers', 'Printer Toners', 'Ink Cartridges', 'Laptop Accessories',
                                  'Office Equipment', 'CCTV Products', 'UPS', 'USB Devices', 'Cables', 'Storage Devices',
                                  'Software Licenses'
                                ].map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-gray-400 font-bold mb-1">Brand Name</label>
                              <input
                                type="text"
                                required
                                value={productForm.brand || ''}
                                onChange={e => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-gray-50/50"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-400 font-bold mb-1">Model ID</label>
                              <input
                                type="text"
                                required
                                value={productForm.model || ''}
                                onChange={e => setProductForm(prev => ({ ...prev, model: e.target.value }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-gray-50/50"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-400 font-bold mb-1">SKU Barcode</label>
                              <input
                                type="text"
                                required
                                value={productForm.sku || ''}
                                onChange={e => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-gray-50/50"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-400 font-bold mb-1">Price (BDT)</label>
                              <input
                                type="number"
                                required
                                value={productForm.price || 0}
                                onChange={e => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-gray-50/50"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-400 font-bold mb-1">Discount Price (BDT) (Set 0 if none)</label>
                              <input
                                type="number"
                                value={productForm.discountPrice || 0}
                                onChange={e => setProductForm(prev => ({ ...prev, discountPrice: parseFloat(e.target.value) }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-gray-50/50"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-400 font-bold mb-1">Stock Count</label>
                              <input
                                type="number"
                                required
                                value={productForm.stockCount || 0}
                                onChange={e => setProductForm(prev => ({ ...prev, stockCount: parseInt(e.target.value) }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-gray-50/50"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-400 font-bold mb-1">Stock Status</label>
                              <select
                                value={productForm.stockStatus || 'In Stock'}
                                onChange={e => setProductForm(prev => ({ ...prev, stockStatus: e.target.value as any }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-white"
                              >
                                <option value="In Stock">In Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                                <option value="Pre-Order">Pre-Order</option>
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-gray-400 font-bold mb-1">Image Links (Comma-separated URLs)</label>
                              <input
                                type="text"
                                value={productForm.images || ''}
                                onChange={e => setProductForm(prev => ({ ...prev, images: e.target.value as any }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-gray-50/50"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-gray-400 font-bold mb-1">Key Features (Comma-separated bullets)</label>
                              <input
                                type="text"
                                value={productForm.features || ''}
                                onChange={e => setProductForm(prev => ({ ...prev, features: e.target.value as any }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-gray-50/50"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-gray-400 font-bold mb-1">Technical Specifications (JSON format)</label>
                              <textarea
                                value={productForm.specifications || ''}
                                rows={3}
                                onChange={e => setProductForm(prev => ({ ...prev, specifications: e.target.value as any }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-gray-50/50 font-mono text-[11px]"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-gray-400 font-bold mb-1">Long Description</label>
                              <textarea
                                value={productForm.description || ''}
                                rows={4}
                                onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full rounded-xl border border-gray-200 p-2.5 focus:border-blue-500 outline-none bg-gray-50/50 resize-none"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-3.5 border-t border-gray-100 pt-4">
                            <button
                              type="button"
                              onClick={() => { setShowProductModal(false); setEditingProduct(null); }}
                              className="rounded-xl border border-gray-200 bg-white px-4.5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                            >
                              Save Changes
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Tab: Customer Orders management */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Moderate Customer Orders</h3>

                  <div className="border border-gray-100 rounded-3xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                          <th className="px-4 py-3 font-bold">Order ID</th>
                          <th className="px-4 py-3 font-bold">Customer</th>
                          <th className="px-4 py-3 text-right font-bold">Total sum</th>
                          <th className="px-4 py-3 text-center font-bold">Logistics Status</th>
                          <th className="px-4 py-3 text-center font-bold">Payment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-4 py-3.5 font-mono text-blue-600 font-bold">{o.id}</td>
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-gray-800">{o.userName}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{o.userPhone}</p>
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold font-mono">BDT {o.total.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-center">
                              <select
                                value={o.orderStatus}
                                onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                                className="rounded-xl border border-gray-200 px-2 py-1 text-[10px] font-bold outline-none"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <select
                                value={o.paymentStatus}
                                onChange={e => handleUpdatePaymentStatus(o.id, e.target.value)}
                                className={`rounded-xl border px-2 py-1 text-[10px] font-black outline-none ${
                                  o.paymentStatus === 'Paid' ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: Promo Coupons creator */}
              {activeTab === 'coupons' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Left coupon creation */}
                  <form onSubmit={handleCreateCoupon} className="md:col-span-5 bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3.5">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2">Generate Voucher Coupon</h4>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Coupon Code</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g., SAVE2026"
                        value={newCouponCode}
                        onChange={e => setNewCouponCode(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none bg-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                      <select
                        value={newCouponDiscountType}
                        onChange={e => setNewCouponDiscountType(e.target.value as any)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none bg-white"
                      >
                        <option value="Percentage">Percentage (%)</option>
                        <option value="Flat">Flat Cash subtraction (BDT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Value</label>
                      <input
                        type="number"
                        required
                        value={newCouponValue}
                        onChange={e => setNewCouponValue(parseFloat(e.target.value))}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none bg-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Minimum Cart Subtotal Required (BDT)</label>
                      <input
                        type="number"
                        required
                        value={newCouponMinCart}
                        onChange={e => setNewCouponMinCart(parseFloat(e.target.value))}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none bg-white focus:border-blue-500"
                      />
                    </div>

                    <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition">
                      Create Coupon Code
                    </button>
                  </form>

                  {/* Right Coupon lists */}
                  <div className="md:col-span-7 space-y-4">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-50 pb-2">Active Promotional Vouchers</h4>
                    
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
                      {coupons.map((c) => (
                        <div key={c.code} className="rounded-xl border border-gray-100 p-3.5 flex justify-between items-center bg-gray-50/20 hover:bg-white hover:shadow-sm transition">
                          <div>
                            <p className="font-mono text-sm font-black text-blue-600">{c.code}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Discount: {c.discountType === 'Percentage' ? `${c.discountValue}%` : `BDT ${c.discountValue}`} | Min Cart: BDT {c.minCartAmount}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteCoupon(c.code)}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Tab: B2B Requests moderation */}
              {activeTab === 'b2b' && (
                <div className="space-y-6">
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Corporate B2B Bulk Requests</h3>

                  <div className="border border-gray-100 rounded-3xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                          <th className="px-4 py-3 font-bold">Company Info</th>
                          <th className="px-4 py-3 font-bold">Requested Quote</th>
                          <th className="px-4 py-3 font-bold">Quantity</th>
                          <th className="px-4 py-3 text-center font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {b2bRequests.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-gray-800">{b.companyName}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">Contact: {b.contactName} ({b.phone})</p>
                            </td>
                            <td className="px-4 py-3.5 max-w-xs truncate">{b.productNotes}</td>
                            <td className="px-4 py-3.5 font-bold">{b.quantity} units</td>
                            <td className="px-4 py-3.5 text-center">
                              <select
                                value={b.status}
                                onChange={e => handleUpdateB2bStatus(b.id, e.target.value)}
                                className={`rounded-xl border px-2 py-1 text-[10px] font-black outline-none ${
                                  b.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Reviewed">Reviewed</option>
                                <option value="Approved">Approved</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: Marketing Banners control */}
              {activeTab === 'banners' && (
                <div className="space-y-6">
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Active Homepage Slides Banners</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map((b) => (
                      <div key={b.id} className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col hover:border-blue-200 transition">
                        <img src={b.imageUrl} alt="banner" referrerPolicy="no-referrer" className="aspect-video w-full object-cover bg-gray-50" />
                        
                        <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-gray-800 truncate">{b.title}</h4>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{b.subtitle}</p>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                            <span className="text-[10px] text-gray-400">Position: {b.position}</span>
                            
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={b.isActive}
                                onChange={() => handleToggleBanner(b.id)}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Global settings adjustments */}
              {activeTab === 'settings' && settings && (
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-lg">
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Global Storefront Parameters</h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-gray-400 font-bold mb-1.5">Government VAT Tax (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.vatPercent}
                        onChange={e => setSettings(prev => prev ? { ...prev, vatPercent: parseFloat(e.target.value) } : null)}
                        className="w-full rounded-xl border border-gray-200 p-2.5 outline-none bg-gray-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold mb-1.5">Standard Delivery Charge (BDT)</label>
                      <input
                        type="number"
                        value={settings.deliveryCharge}
                        onChange={e => setSettings(prev => prev ? { ...prev, deliveryCharge: parseFloat(e.target.value) } : null)}
                        className="w-full rounded-xl border border-gray-200 p-2.5 outline-none bg-gray-50/50"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-gray-400 font-bold mb-1.5">Global Announcement Banner Headline</label>
                      <input
                        type="text"
                        value={settings.emergencyStatusAlert}
                        onChange={e => setSettings(prev => prev ? { ...prev, emergencyStatusAlert: e.target.value } : null)}
                        className="w-full rounded-xl border border-gray-200 p-2.5 outline-none bg-gray-50/50"
                      />
                    </div>
                  </div>

                  <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md transition">
                    Apply Storefront Changes
                  </button>
                </form>
              )}

              {/* Tab: Server Security logs */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-gray-900 tracking-tight">Administrative Activity Logs</h3>
                    <button
                      onClick={async () => {
                        const logsRes = await fetch('/api/admin/logs');
                        if (logsRes.ok) setLogs(await logsRes.json());
                      }}
                      className="rounded-lg bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200 transition"
                      title="Refresh logs"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded-2xl border border-gray-900 bg-gray-950 p-4.5 font-mono text-[11px] text-blue-400 max-h-[380px] overflow-y-auto space-y-1 shadow-inner">
                    {logs.length === 0 ? (
                      <p className="text-gray-500">Security container logs empty.</p>
                    ) : (
                      logs.map((log) => (
                        <p key={log.id} className="leading-relaxed">
                          <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                          <span className="text-yellow-400">[{log.user}]</span>{' '}
                          <span className="text-green-400">[{log.action}]</span>{' '}
                          <span className="text-white">{log.details}</span>
                        </p>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
}
