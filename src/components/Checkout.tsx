import React, { useState, useEffect } from 'react';
import { CreditCard, ShoppingBag, ShieldCheck, Ticket, Sparkles, MapPin, Phone, Mail, User as UserIcon } from 'lucide-react';
import { Product, User, Order } from '../types.js';

interface CheckoutProps {
  cart: { product: Product; quantity: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ product: Product; quantity: number }[]>>;
  user: User | null;
  setCurrentView: (view: string) => void;
  setLastOrder: (order: Order) => void;
}

export default function Checkout({
  cart,
  setCart,
  user,
  setCurrentView,
  setLastOrder
}: CheckoutProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postal, setPostal] = useState('');
  
  // Coupons & Promo Codes
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Loyalty points
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [pointsDiscount, setPointsDiscount] = useState(0);

  // Payment gateways
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'SSLCommerz' | 'Cash on Delivery'>('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);
  const shippingCost = cartSubtotal >= 50000 ? 0 : 150;

  // Auto-fill user profile info if logged in
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      if (user.addresses && user.addresses.length > 0) {
        const addr = user.addresses[0];
        setStreet(addr.streetAddress);
        setCity(addr.city);
        setPostal(addr.postalCode);
      }
    }
  }, [user]);

  // Points redemption logic: 1 loyalty point = BDT 1 discount, cap at 1000 or user's total points
  useEffect(() => {
    if (redeemPoints && user && user.loyaltyPoints) {
      const pointsToUse = Math.min(user.loyaltyPoints, 1000, cartSubtotal - couponDiscount);
      setPointsDiscount(pointsToUse);
    } else {
      setPointsDiscount(0);
    }
  }, [redeemPoints, user, couponDiscount, cartSubtotal]);

  const handleValidateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), cartAmount: cartSubtotal })
      });

      if (res.ok) {
        const data = await res.json();
        let discount = 0;
        if (data.discountType === 'Percentage') {
          discount = Math.round((cartSubtotal * data.discountValue) / 100);
          if (data.maxDiscount) {
            discount = Math.min(discount, data.maxDiscount);
          }
        } else {
          discount = data.discountValue;
        }

        setCouponDiscount(discount);
        setAppliedCoupon(data.code);
        setCouponSuccess(`Voucher Applied: BDT ${discount.toLocaleString()} Saved!`);
      } else {
        const err = await res.json();
        setCouponError(err.error || 'Invalid coupon voucher code.');
      }
    } catch (err) {
      setCouponError('Coupon validator offline.');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg('');

    const finalTotal = Math.max(0, cartSubtotal - couponDiscount - pointsDiscount + shippingCost);

    const orderPayload = {
      order: {
        userId: user?.id,
        userEmail: email.trim().toLowerCase(),
        userName: name.trim(),
        userPhone: phone.trim(),
        shippingAddress: {
          streetAddress: street.trim(),
          city: city.trim(),
          postalCode: postal.trim(),
          country: 'Bangladesh'
        },
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images[0],
          price: item.product.discountPrice || item.product.price,
          quantity: item.quantity
        })),
        subtotal: cartSubtotal,
        discount: couponDiscount + pointsDiscount,
        shippingCost,
        total: finalTotal,
        couponCode: appliedCoupon || undefined,
        paymentMethod
      }
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const savedOrder: Order = await res.json();
        setLastOrder(savedOrder);
        setCart([]); // Clear cart state
        setCurrentView('success');
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to place order.');
      }
    } catch (err) {
      setErrorMsg('Network error. Could not place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center font-sans">
        <div className="rounded-full bg-blue-50 p-6 text-blue-600 inline-block mb-4">
          <ShoppingBag className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="text-xl font-black text-gray-800">Your Cart is Empty</h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-2 leading-relaxed">
          You need to add products before checking out. Explore our high-speed NVMe SSDs, motherboards, and PC components.
        </p>
        <button
          onClick={() => setCurrentView('shop')}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
        >
          Explore Store
        </button>
      </div>
    );
  }

  const finalTotal = Math.max(0, cartSubtotal - couponDiscount - pointsDiscount + shippingCost);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 font-sans">
      <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight mb-8">Secure Checkout Gateway</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Form: Delivery info & payment methods */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Customer Contact details */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
              <UserIcon className="h-4.5 w-4.5 text-blue-600" />
              <span>1. Shipping Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Recipient Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="E.g., Tanvir Rahman"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-9 py-2.5 text-xs outline-none focus:border-blue-500 bg-gray-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    placeholder="E.g., +880 1712-345678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-9 py-2.5 text-xs outline-none focus:border-blue-500 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="E.g., buyer@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-9 py-2.5 text-xs outline-none focus:border-blue-500 bg-gray-50/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Shipping address */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
              <MapPin className="h-4.5 w-4.5 text-blue-600" />
              <span>2. Delivery Address</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Apartment 4B, Level 3, Multiplan Tower, Elephant Road"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 bg-gray-50/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">City / District</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Dhaka"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., 1205"
                    value={postal}
                    onChange={e => setPostal(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 bg-gray-50/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Secure Payment methods */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
              <CreditCard className="h-4.5 w-4.5 text-blue-600" />
              <span>3. Modular Payment Gateway Selection</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition ${
                paymentMethod === 'Cash on Delivery' 
                  ? 'border-blue-600 bg-blue-50/30' 
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="sr-only"
                />
                <span className="text-xs font-bold text-gray-900">Cash on Delivery</span>
                <span className="text-[10px] text-gray-400 mt-1 leading-relaxed">Pay with cash when the courier delivers to your door.</span>
              </label>

              <label className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition ${
                paymentMethod === 'Stripe' 
                  ? 'border-blue-600 bg-blue-50/30' 
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Stripe'}
                  onChange={() => setPaymentMethod('Stripe')}
                  className="sr-only"
                />
                <span className="text-xs font-bold text-gray-900">Stripe Card Pay</span>
                <span className="text-[10px] text-gray-400 mt-1 leading-relaxed">Secure instant checkout with Visa, Mastercard, or Amex.</span>
              </label>

              <label className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition ${
                paymentMethod === 'SSLCommerz' 
                  ? 'border-blue-600 bg-blue-50/30' 
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'SSLCommerz'}
                  onChange={() => setPaymentMethod('SSLCommerz')}
                  className="sr-only"
                />
                <span className="text-xs font-bold text-gray-900">SSLCommerz Pay</span>
                <span className="text-[10px] text-gray-400 mt-1 leading-relaxed">bKash, Nagad, Rocket or Local Bangladesh bank cards.</span>
              </label>
            </div>

            {/* Sandbox details showing based on payment method */}
            {paymentMethod !== 'Cash on Delivery' && (
              <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-4 text-[11px] text-blue-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="h-4 w-4 animate-spin text-blue-600" />
                  <span>Sandbox Simulator Mode Active</span>
                </p>
                <p>Payment will be simulated successfully in checkout sandbox. No real charges are processed.</p>
              </div>
            )}
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-red-600">{errorMsg}</p>
          )}

          {/* Place Order Trigger */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-black text-white hover:bg-blue-700 active:scale-98 shadow-xl shadow-blue-100 disabled:bg-blue-400 transition-all"
          >
            {isSubmitting ? 'Processing Transaction...' : 'Place Secure Order Now'}
          </button>

        </form>

        {/* Right Summary: Cart list, coupons, loyalty point redemption */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Checkout items summary */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-50 pb-3">Order Summary</h3>
            
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
              {cart.map((item, idx) => {
                const actualPrice = item.product.discountPrice || item.product.price;
                return (
                  <div key={idx} className="flex items-center gap-3 py-3">
                    <img src={item.product.images[0]} alt={item.product.name} referrerPolicy="no-referrer" className="h-11 w-11 rounded-lg object-cover border bg-gray-50" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 truncate">{item.product.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.quantity} x BDT {actualPrice.toLocaleString()}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-900 shrink-0">BDT {(actualPrice * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            {/* Calculations block */}
            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500 font-semibold">
                <span>Subtotal:</span>
                <span>BDT {cartSubtotal.toLocaleString()}</span>
              </div>
              
              {couponDiscount > 0 && (
                <div className="flex justify-between text-red-500 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-BDT {couponDiscount.toLocaleString()}</span>
                </div>
              )}

              {pointsDiscount > 0 && (
                <div className="flex justify-between text-indigo-600 font-bold">
                  <span>Loyalty Points Redeemed:</span>
                  <span>-BDT {pointsDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-500 font-semibold">
                <span>Shipping:</span>
                <span>{shippingCost === 0 ? 'FREE' : `BDT ${shippingCost.toLocaleString()}`}</span>
              </div>

              <div className="flex justify-between text-base font-black text-gray-900 border-t border-dashed border-gray-200 pt-3">
                <span>Total Amount:</span>
                <span className="text-blue-600">BDT {finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Promo Coupon Card input */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-3.5 shadow-sm">
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Ticket className="h-4 w-4 text-blue-600" />
              <span>Promo Coupon Code</span>
            </h4>

            <form onSubmit={handleValidateCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="E.g., TRUSTIT2026"
                value={couponCode}
                onChange={e => {
                  setCouponCode(e.target.value);
                  setCouponError('');
                  setCouponSuccess('');
                }}
                className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-none focus:border-blue-500 bg-gray-50/50"
              />
              <button
                type="submit"
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-gray-800 active:scale-95 transition"
              >
                Apply
              </button>
            </form>

            {couponError && (
              <p className="text-[10px] font-bold text-red-600">{couponError}</p>
            )}
            {couponSuccess && (
              <p className="text-[10px] font-bold text-green-600">{couponSuccess}</p>
            )}
          </div>

          {/* Loyalty Points Redemption Card */}
          {user && user.loyaltyPoints && user.loyaltyPoints > 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-3 shadow-sm">
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-blue-600" />
                <span>Loyalty Points Wallet</span>
              </h4>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Available Points: <span className="font-bold text-blue-600">{user.loyaltyPoints}</span></p>
                  <p className="text-[10px] text-gray-400 mt-0.5"> Redeem points for BDT {Math.min(user.loyaltyPoints, 1000)} instant discount.</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={redeemPoints}
                    onChange={e => setRedeemPoints(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          ) : null}

          {/* Checkout secure locks */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold py-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span>256-Bit SSL Encrypted Secure Checkout</span>
          </div>

        </div>

      </div>

    </div>
  );
}
