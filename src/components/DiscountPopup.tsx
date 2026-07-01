import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Gift, ShieldAlert } from 'lucide-react';

export default function DiscountPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user has already dismissed the popup
    const dismissed = localStorage.getItem('trustit_promo_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Trigger 3 seconds after load
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('trustit_promo_dismissed', 'true');
    setIsVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        setSubmitted(true);
        setError('');
      } else {
        setError('Subscription failed. Please try again.');
      }
    } catch (err) {
      setError('Server connection error.');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100"
          >
            {/* Top decorative accent bar */}
            <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="p-6 md:p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Gift className="h-6 w-6" />
              </div>

              {!submitted ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 md:text-2xl">
                    Get 10% Off Your First Order!
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    Subscribe to the Trust IT Gallery newsletter to receive exclusive tech deals, priority hardware alerts, and a 10% flat promo code straight to your inbox.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-1.5 text-left text-[11px] font-medium text-red-600">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all"
                    >
                      Subscribe & Reveal Code
                    </button>
                  </form>

                  <button
                    onClick={handleDismiss}
                    className="mt-4 text-xs font-medium text-gray-400 hover:text-gray-600 transition"
                  >
                    No thanks, I will pay full price
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-green-600 md:text-2xl">
                    Subscription Successful!
                  </h3>
                  <p className="text-sm text-gray-500">
                    Thank you for joining our community! Use this exclusive voucher code at checkout to claim your <span className="font-bold text-gray-800">10% discount</span>:
                  </p>
                  
                  <div className="rounded-xl border border-dashed border-green-300 bg-green-50 p-4 font-mono text-lg font-bold text-green-800 tracking-wider relative select-all cursor-copy">
                    TRUSTIT2026
                  </div>
                  <p className="text-[10px] text-gray-400">
                    *Applicable for cart values above BDT 5,000 (Max discount BDT 2,000)
                  </p>

                  <button
                    onClick={handleDismiss}
                    className="w-full rounded-xl bg-gray-900 py-3 text-xs font-bold text-white hover:bg-gray-800 transition"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
