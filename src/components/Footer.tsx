import { Cpu, Facebook, Twitter, Youtube, Mail, Phone, MapPin, Send, HelpCircle, ShieldCheck, Clock } from 'lucide-react';
import React, { useState } from 'react';

interface FooterProps {
  setCurrentView: (view: string) => void;
  onSearch: (q: string) => void;
}

export default function Footer({ setCurrentView, onSearch }: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const handleLinkClick = (view: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
  };

  const handleCategorySearch = (cat: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onSearch(cat);
    setCurrentView('shop');
  };

  return (
    <footer className="bg-gray-900 text-gray-300 font-sans mt-auto border-t-4 border-blue-600">
      
      {/* Upper Marketing section */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 border-b border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Pitch */}
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-900/40 p-3 text-blue-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Genuine Products</h4>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Direct manufacturer partnerships & official brand warranties for every IT components we sell.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-900/40 p-3 text-blue-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Super Fast Delivery</h4>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Rapid 24-48 hours delivery inside Dhaka metropolitan & insured logistics service nationwide.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-900/40 p-3 text-blue-400">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Expert Technical Support</h4>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Got questions about socket compatibility or PC building? Speak directly with our IT advisors.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid Map columns */}
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Info Brand */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Cpu className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                Trust IT <span className="text-blue-500">Gallery</span>
              </h2>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Trust IT Gallery is Bangladesh’s ultimate tech hardware shopping destination. From extreme overclocking processors & GPUs to reliable office automation and custom PC building, we provide pristine tech products and outstanding customer services.
            </p>
            
            {/* Contact cards */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-gray-400">+880 1712-345678 (Hotline)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-gray-400">support@trustitgallery.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-gray-400 leading-relaxed">Level 4, Trust IT Gallery Tower, Multiplan Center, Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Column 2: Hot Categories */}
          <div>
            <h3 className="text-xs font-black tracking-wider text-white uppercase mb-5 border-l-2 border-blue-500 pl-2">Top Categories</h3>
            <ul className="space-y-3 text-xs font-semibold">
              <li>
                <button onClick={() => handleCategorySearch('Processors (CPU)')} className="hover:text-blue-500 text-gray-400 hover:translate-x-1 transition-transform">
                  Processors (CPU)
                </button>
              </li>
              <li>
                <button onClick={() => handleCategorySearch('Graphics Cards')} className="hover:text-blue-500 text-gray-400 hover:translate-x-1 transition-transform">
                  Graphics Cards
                </button>
              </li>
              <li>
                <button onClick={() => handleCategorySearch('Motherboards')} className="hover:text-blue-500 text-gray-400 hover:translate-x-1 transition-transform">
                  Motherboards
                </button>
              </li>
              <li>
                <button onClick={() => handleCategorySearch('RAM')} className="hover:text-blue-500 text-gray-400 hover:translate-x-1 transition-transform">
                  DDR5 / DDR4 RAM
                </button>
              </li>
              <li>
                <button onClick={() => handleCategorySearch('SSD')} className="hover:text-blue-500 text-gray-400 hover:translate-x-1 transition-transform">
                  NVMe M.2 SSDs
                </button>
              </li>
              <li>
                <button onClick={() => handleCategorySearch('Monitors')} className="hover:text-blue-500 text-gray-400 hover:translate-x-1 transition-transform">
                  Gaming Monitors
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal Policy */}
          <div>
            <h3 className="text-xs font-black tracking-wider text-white uppercase mb-5 border-l-2 border-blue-500 pl-2">Customer Care</h3>
            <ul className="space-y-3 text-xs font-semibold">
              <li>
                <button onClick={() => handleLinkClick('faq')} className="hover:text-blue-500 text-gray-400 hover:translate-x-1 transition-transform">
                  FAQ & Help Center
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('warranty')} className="hover:text-blue-500 text-gray-400 hover:translate-x-1 transition-transform">
                  Warranty Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('return')} className="hover:text-blue-500 text-gray-400 hover:translate-x-1 transition-transform">
                  Return & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('shipping-policy')} className="hover:text-blue-500 text-gray-400 hover:translate-x-1 transition-transform">
                  Shipping Information
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('terms')} className="hover:text-blue-500 text-gray-400 hover:translate-x-1 transition-transform">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('privacy')} className="hover:text-blue-500 text-gray-400 hover:translate-x-1 transition-transform">
                  Privacy Security
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Marketing Subscription */}
          <div>
            <h3 className="text-xs font-black tracking-wider text-white uppercase mb-5 border-l-2 border-blue-500 pl-2">Get Deal Alerts</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Join thousands of PC builders! Subscribe to get instant price drop alerts and product stock arrivals.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              
              {status === 'success' && (
                <p className="text-[10px] text-green-400 font-medium mt-1">✓ Subscribed successfully!</p>
              )}
              {status === 'error' && (
                <p className="text-[10px] text-red-400 font-medium mt-1">✗ Subscription failed.</p>
              )}
            </form>

            {/* Social Network row */}
            <div className="pt-6 space-y-2.5">
              <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Connect With Us</p>
              <div className="flex gap-3">
                <a href="https://facebook.com/trustitgallery" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-gray-800 p-2.5 hover:bg-blue-600 hover:text-white transition">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="https://twitter.com/trustitgallery" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-gray-800 p-2.5 hover:bg-blue-400 hover:text-white transition">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://youtube.com/trustitgallery" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-gray-800 p-2.5 hover:bg-red-600 hover:text-white transition">
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sub-Footer: Legal Credit & Security badging */}
      <div className="bg-gray-950 px-4 py-8 text-center text-xs text-gray-500 font-semibold border-t border-gray-800">
        <div className="mx-auto max-w-7xl lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p>© 2026 Trust IT Gallery. All rights reserved. Designed with extreme technical precision.</p>
          
          {/* Payment Gateways visualizer */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-400">
            <span className="uppercase tracking-widest text-[9px] font-bold text-gray-600">Secure Payment Gateways</span>
            <div className="rounded bg-gray-900 border border-gray-800 px-2 py-1 select-none font-mono">Stripe</div>
            <div className="rounded bg-gray-900 border border-gray-800 px-2 py-1 select-none font-mono font-bold text-blue-400">SSLCommerz</div>
            <div className="rounded bg-gray-900 border border-gray-800 px-2 py-1 select-none font-mono">bKash/Nagad</div>
            <div className="rounded bg-gray-900 border border-gray-800 px-2 py-1 select-none font-mono text-emerald-400">Cash On Delivery</div>
          </div>
        </div>
      </div>

    </footer>
  );
}
