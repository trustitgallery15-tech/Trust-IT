import React, { useState, useEffect } from 'react';
import { 
  Heart, ShoppingBag, MapPin, User as UserIcon, Phone, Mail, 
  Trash2, ShieldCheck, Printer, ArrowRight, ClipboardList, Compass, 
  Share2, Award, Truck, MapPinOff, AlertCircle
} from 'lucide-react';
import { Product, User, Order, Address } from '../types.js';

interface DashboardProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  products: Product[];
  onAddToCart: (p: Product) => void;
  setSelectedProductId: (id: string) => void;
  setCurrentView: (view: string) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
}

export default function Dashboard({
  user,
  setUser,
  products,
  onAddToCart,
  setSelectedProductId,
  setCurrentView,
  wishlist,
  onToggleWishlist
}: DashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'referrals' | 'track'>('orders');
  
  // Track order state
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState('');

  // Selected order for invoice display
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrType, setAddrType] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPostal, setAddrPostal] = useState('');

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/orders/user/${user.email}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)));
        }
      } catch (err) {
        console.error('Error fetching user orders:', err);
      }
    };
    fetchUserOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center font-sans">
        <div className="rounded-full bg-blue-50 p-6 text-blue-600 inline-block mb-4">
          <UserIcon className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-black text-gray-800">Access Denied</h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-2">Please login or register to access your Trust IT customer dashboard.</p>
        <button
          onClick={() => setCurrentView('login')}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Get wishlist product details
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName.trim() || !addrStreet.trim() || !addrCity.trim() || !addrPostal.trim()) return;

    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      type: addrType,
      name: addrName.trim(),
      phone: addrPhone.trim(),
      streetAddress: addrStreet.trim(),
      city: addrCity.trim(),
      postalCode: addrPostal.trim(),
      country: 'Bangladesh'
    };

    const updatedAddresses = [...(user.addresses || []), newAddress];

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: `mock-jwt-token-for-${user.id}`,
          addresses: updatedAddresses
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setShowAddressForm(false);
        // Reset form
        setAddrName('');
        setAddrPhone('');
        setAddrStreet('');
        setAddrCity('');
        setAddrPostal('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    const updatedAddresses = (user.addresses || []).filter(a => a.id !== addrId);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: `mock-jwt-token-for-${user.id}`,
          addresses: updatedAddresses
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTrackedOrder(null);
    if (!trackQuery.trim()) return;

    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(trackQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setTrackedOrder(data);
      } else {
        setTrackError('Could not locate any orders with this Tracking or Order ID.');
      }
    } catch (err) {
      setTrackError('Tracking server connection error.');
    }
  };

  const triggerPrintInvoice = () => {
    const printContent = document.getElementById('printable-invoice-panel');
    if (!printContent) return;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Quick reset to restore react state
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 font-sans">
      
      {/* Profile Overview Banner card */}
      <div className="rounded-3xl bg-gradient-to-r from-gray-900 to-blue-950 p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-lg">
            {user.name.substring(0,2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black">{user.name}</h2>
            <p className="text-xs text-blue-200 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Loyalty & Referrals mini-badges */}
        <div className="flex gap-4 flex-wrap">
          <div className="bg-white/10 rounded-2xl px-4.5 py-3 border border-white/5 backdrop-blur-sm">
            <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest leading-none">Loyalty Wallet</p>
            <p className="text-lg font-black text-white mt-1">{user.loyaltyPoints || 0} pts</p>
          </div>
          
          <div className="bg-white/10 rounded-2xl px-4.5 py-3 border border-white/5 backdrop-blur-sm">
            <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest leading-none">Referral Code</p>
            <p className="text-xs font-mono font-black text-yellow-300 mt-1 select-all">{user.referralCode || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left tabs selection */}
        <div className="lg:col-span-3 space-y-1.5 shrink-0">
          <button
            onClick={() => { setActiveTab('orders'); setSelectedInvoiceOrder(null); }}
            className={`w-full rounded-xl px-4 py-3.5 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('track'); setSelectedInvoiceOrder(null); }}
            className={`w-full rounded-xl px-4 py-3.5 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'track' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Track My Order</span>
          </button>

          <button
            onClick={() => { setActiveTab('wishlist'); setSelectedInvoiceOrder(null); }}
            className={`w-full rounded-xl px-4 py-3.5 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'wishlist' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>My Wishlist ({wishlist.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('addresses'); setSelectedInvoiceOrder(null); }}
            className={`w-full rounded-xl px-4 py-3.5 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'addresses' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Address Book</span>
          </button>

          <button
            onClick={() => { setActiveTab('referrals'); setSelectedInvoiceOrder(null); }}
            className={`w-full rounded-xl px-4 py-3.5 text-left text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === 'referrals' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Referrals & Rewards</span>
          </button>
        </div>

        {/* Right Tab panels container */}
        <div className="lg:col-span-9 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[400px]">
          
          {/* Invoice Display panel overrides standard dashboard views */}
          {selectedInvoiceOrder ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  ← Back to Orders
                </button>

                <button
                  onClick={triggerPrintInvoice}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md flex items-center gap-1.5 transition"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print / Save Invoice PDF</span>
                </button>
              </div>

              {/* Print-ready invoice container */}
              <div id="printable-invoice-panel" className="border border-gray-200 rounded-2xl p-8 bg-white text-gray-800">
                <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">TRUST IT GALLERY</h2>
                    <p className="text-[10px] text-gray-400 mt-1">Multiplan Center, Level 4, Dhaka, Bangladesh</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Phone: +880 1712-345678 | support@trustitgallery.com</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-base font-black text-blue-600">OFFICIAL INVOICE</h3>
                    <p className="text-[11px] text-gray-500 font-mono mt-1">Invoice ID: {selectedInvoiceOrder.id}</p>
                    <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Date: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-gray-100 text-xs">
                  <div>
                    <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px] mb-1.5">Billed Recipient</p>
                    <p className="font-bold text-gray-800">{selectedInvoiceOrder.userName}</p>
                    <p className="text-gray-500 mt-1">{selectedInvoiceOrder.userPhone}</p>
                    <p className="text-gray-500 mt-0.5">{selectedInvoiceOrder.userEmail}</p>
                  </div>

                  <div>
                    <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px] mb-1.5">Shipping Destination</p>
                    <p className="text-gray-600">{selectedInvoiceOrder.shippingAddress.streetAddress}</p>
                    <p className="text-gray-600 mt-0.5">{selectedInvoiceOrder.shippingAddress.city} - {selectedInvoiceOrder.shippingAddress.postalCode}</p>
                    <p className="text-gray-400 mt-1">Bangladesh</p>
                  </div>
                </div>

                {/* Items invoice list */}
                <table className="w-full text-xs text-left my-6 border-b border-gray-100">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                      <th className="px-4 py-2 font-bold">Hardware Component</th>
                      <th className="px-4 py-2 text-center font-bold">Qty</th>
                      <th className="px-4 py-2 text-right font-bold">Unit Price</th>
                      <th className="px-4 py-2 text-right font-bold">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedInvoiceOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-semibold text-gray-700">{item.productName}</td>
                        <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono">BDT {item.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold">BDT {(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Calculation breakdown */}
                <div className="flex justify-end text-xs">
                  <div className="w-64 space-y-2 border-t border-dashed border-gray-100 pt-3">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal:</span>
                      <span>BDT {selectedInvoiceOrder.subtotal.toLocaleString()}</span>
                    </div>
                    {selectedInvoiceOrder.discount > 0 && (
                      <div className="flex justify-between text-red-500">
                        <span>Discounts:</span>
                        <span>-BDT {selectedInvoiceOrder.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping Fee:</span>
                      <span>{selectedInvoiceOrder.shippingCost === 0 ? 'FREE' : `BDT ${selectedInvoiceOrder.shippingCost}`}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-200 pt-2.5">
                      <span>Grand Total:</span>
                      <span className="text-blue-600">BDT {selectedInvoiceOrder.total.toLocaleString()}</span>
                    </div>

                    <div className="pt-3 border-t border-dashed border-gray-100 text-[10px] text-gray-400">
                      <span>Payment Method: {selectedInvoiceOrder.paymentMethod}</span>
                      <br />
                      <span>Payment Status: <span className="text-green-600 font-bold">{selectedInvoiceOrder.paymentStatus}</span></span>
                    </div>
                  </div>
                </div>

                {/* Secure Badge */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center text-[10px] text-gray-400 font-semibold flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>Verified Original Brand Warranty - Thank you for shopping with Trust IT Gallery.</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Tab: Orders List */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                    <ClipboardList className="h-4.5 w-4.5 text-blue-600" />
                    <span>Your Order History ({orders.length})</span>
                  </h3>

                  {orders.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-400 font-semibold">
                      <ShoppingBag className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                      <span>You haven't placed any orders yet.</span>
                      <button onClick={() => setCurrentView('shop')} className="mt-4 rounded-xl bg-blue-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition block mx-auto">
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition space-y-3">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <p className="text-xs font-black text-gray-900">Order ID: <span className="font-mono text-blue-600">{order.id}</span></p>
                              <p className="text-[10px] text-gray-400 mt-0.5">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            
                            <div className="flex gap-2">
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                                order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {order.orderStatus.toUpperCase()}
                              </span>

                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                                order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {order.paymentStatus.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                            <span className="text-xs font-black text-gray-900">Total BDT {order.total.toLocaleString()}</span>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setTrackQuery(order.id); setActiveTab('track'); }}
                                className="rounded-lg bg-gray-50 px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-gray-100 transition"
                              >
                                Track Delivery
                              </button>
                              <button
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-600 hover:bg-blue-100 flex items-center gap-1 transition"
                              >
                                <Printer className="h-3 w-3" />
                                <span>Get Invoice</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Track My Order */}
              {activeTab === 'track' && (
                <div className="space-y-6">
                  <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                    <Truck className="h-4.5 w-4.5 text-blue-600" />
                    <span>Real-Time Logistics Order Tracking</span>
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Enter your Order ID (e.g. TG-XXXXX-XXX) or Tracking Number (e.g. TRK-XXXXXXXX) to inspect the precise shipping and delivery milestones.
                  </p>

                  <form onSubmit={handleTrackOrder} className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      placeholder="Order ID or Tracking Number"
                      value={trackQuery}
                      onChange={e => setTrackQuery(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 bg-gray-50/50"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-gray-900 px-5 text-xs font-bold text-white hover:bg-gray-800 transition"
                    >
                      Track
                    </button>
                  </form>

                  {trackError && (
                    <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-100 text-amber-800 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>{trackError}</span>
                    </div>
                  )}

                  {trackedOrder && (
                    <div className="rounded-2xl border border-gray-100 p-6 space-y-6 shadow-inner bg-gray-50/20">
                      <div className="flex justify-between items-start flex-wrap gap-2 pb-4 border-b border-gray-100">
                        <div>
                          <p className="text-xs font-black text-gray-900">Logistics Tracking ID: <span className="font-mono text-blue-600">{trackedOrder.trackingNumber}</span></p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Carrier Service: Trust IT Express Courier</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">Estimated Delivery</p>
                          <p className="text-xs font-bold text-gray-800">{trackedOrder.estimatedDelivery}</p>
                        </div>
                      </div>

                      {/* Horizontal Milestone bar */}
                      <div className="relative pt-6">
                        <div className="absolute left-4 right-4 top-2.5 h-1 bg-gray-200 -z-10 rounded-full">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                            style={{ 
                              width: trackedOrder.orderStatus === 'Pending' ? '10%' :
                                     trackedOrder.orderStatus === 'Processing' ? '40%' :
                                     trackedOrder.orderStatus === 'Shipped' ? '70%' : '100%'
                            }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-center relative">
                          {[
                            { label: 'Pending', desc: 'Order Placed' },
                            { label: 'Processing', desc: 'Custom Assembly' },
                            { label: 'Shipped', desc: 'Out for Delivery' },
                            { label: 'Delivered', desc: 'Completed' }
                          ].map((step, idx) => {
                            const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
                            const currentIdx = statuses.indexOf(trackedOrder.orderStatus);
                            const stepIdx = statuses.indexOf(step.label);
                            const isCompleted = stepIdx <= currentIdx;

                            return (
                              <div key={idx} className="flex flex-col items-center">
                                <div className={`h-6.5 w-6.5 rounded-full border-4 flex items-center justify-center text-[10px] font-bold shadow-md bg-white ${
                                  isCompleted ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-300'
                                }`}>
                                  {isCompleted ? '✓' : idx + 1}
                                </div>
                                <p className={`text-[10px] font-black mt-2 ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                                <p className="text-[8px] text-gray-400 mt-0.5 max-w-[80px]">{step.desc}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* Tab: My Wishlist */}
              {activeTab === 'wishlist' && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                    <Heart className="h-4.5 w-4.5 text-blue-600" />
                    <span>Your Favorites & Wishlist ({wishlistProducts.length})</span>
                  </h3>

                  {wishlistProducts.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-400 font-semibold">
                      <Compass className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                      <span>Your wishlist is empty. Add computer components or processors to monitor pricing updates!</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlistProducts.map((p) => {
                        const price = p.discountPrice || p.price;
                        return (
                          <div key={p.id} className="rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-sm transition">
                            <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="h-16 w-16 object-cover rounded-xl bg-gray-50 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h4 onClick={() => { setSelectedProductId(p.id); setCurrentView('product'); }} className="text-xs font-bold text-gray-800 truncate hover:text-blue-600 cursor-pointer">{p.name}</h4>
                              <p className="text-xs font-black text-blue-600 mt-1">BDT {price.toLocaleString()}</p>
                              <div className="flex gap-2 mt-2.5">
                                <button
                                  onClick={() => onAddToCart(p)}
                                  disabled={p.stockStatus === 'Out of Stock'}
                                  className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-[10px] font-bold hover:bg-blue-700 transition"
                                >
                                  Add to Cart
                                </button>
                                <button
                                  onClick={() => onToggleWishlist(p.id)}
                                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Address Book */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                      <MapPin className="h-4.5 w-4.5 text-blue-600" />
                      <span>Your Shipping Address Book</span>
                    </h3>

                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="rounded-xl bg-gray-900 px-4.5 py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition"
                    >
                      {showAddressForm ? 'Cancel Address' : 'Add New Address'}
                    </button>
                  </div>

                  {/* Add address form overlay */}
                  {showAddressForm && (
                    <form onSubmit={handleAddAddress} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4 max-w-lg">
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Address Label</label>
                          <select
                            value={addrType}
                            onChange={e => setAddrType(e.target.value as any)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="Home">Home Address</option>
                            <option value="Office">Office Address</option>
                            <option value="Other">Other Location</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact Phone</label>
                          <input
                            type="tel"
                            required
                            placeholder="E.g., +880 1712-345678"
                            value={addrPhone}
                            onChange={e => setAddrPhone(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-none focus:border-blue-500 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Recipient Name</label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={addrName}
                          onChange={e => setAddrName(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-none focus:border-blue-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Street Address</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g., Road 14, House 25, Dhanmondi"
                          value={addrStreet}
                          onChange={e => setAddrStreet(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-none focus:border-blue-500 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">City / District</label>
                          <input
                            type="text"
                            required
                            placeholder="E.g., Dhaka"
                            value={addrCity}
                            onChange={e => setAddrCity(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-none focus:border-blue-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Postal Code</label>
                          <input
                            type="text"
                            required
                            placeholder="1205"
                            value={addrPostal}
                            onChange={e => setAddrPostal(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-none focus:border-blue-500 bg-white"
                          />
                        </div>
                      </div>

                      <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition">
                        Save Address
                      </button>
                    </form>
                  )}

                  {/* Saved Addresses list */}
                  {(!user.addresses || user.addresses.length === 0) ? (
                    <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-400 font-semibold flex items-center justify-center gap-1.5">
                      <MapPinOff className="h-5 w-5" />
                      <span>No addresses stored yet. Use address book to speed up checkout.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.addresses.map((addr) => (
                        <div key={addr.id} className="rounded-2xl border border-gray-100 p-4 space-y-2.5 relative group hover:border-blue-200 transition">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-blue-100 text-[9px] font-black text-blue-800 px-1.5 py-0.5 tracking-wider uppercase">{addr.type}</span>
                            <span className="text-xs font-bold text-gray-800 truncate">{addr.name}</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                            {addr.streetAddress}, {addr.city} - {addr.postalCode}
                          </p>
                          <p className="text-[10px] text-gray-400">Phone: {addr.phone}</p>
                          
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                            title="Delete address"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Referrals */}
              {activeTab === 'referrals' && (
                <div className="space-y-6">
                  <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                    <Award className="h-4.5 w-4.5 text-blue-600" />
                    <span>Invite Friends & Earn Loyalty Points</span>
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Share the Trust IT Gallery experience with your developer and gamer circles. When a friend signs up with your referral code, they receive <span className="font-bold text-blue-600">100 loyalty points</span> instantly, and you receive <span className="font-bold text-blue-600">150 loyalty points</span>!
                  </p>

                  <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 flex flex-col md:flex-row justify-between items-center gap-6 max-w-2xl shadow-sm">
                    <div className="space-y-1 text-center md:text-left">
                      <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Your Exclusive Invitation Code</p>
                      <h4 className="text-2xl font-black text-blue-900 font-mono tracking-wider">{user.referralCode || 'N/A'}</h4>
                    </div>

                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(user.referralCode || '');
                        alert('Referral Code copied to clipboard!');
                      }}
                      className="rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white hover:bg-blue-700 active:scale-95 flex items-center gap-1.5 transition"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Copy Referral Code</span>
                    </button>
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
