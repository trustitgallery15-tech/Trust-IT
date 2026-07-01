import React, { useState } from 'react';
import { Briefcase, Mail, Phone, Building, Send, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function B2BRequest() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [productNotes, setProductNotes] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !email.trim() || !productNotes.trim()) return;

    setStatus('submitting');
    try {
      const res = await fetch('/api/b2b/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          productNotes: productNotes.trim(),
          quantity
        })
      });

      if (res.ok) {
        setStatus('success');
        // Clear
        setCompanyName('');
        setContactName('');
        setEmail('');
        setPhone('');
        setProductNotes('');
        setQuantity(10);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 font-sans">
      
      {/* Intro section */}
      <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
        <div className="rounded-full bg-blue-50 p-3.5 text-blue-600 inline-block">
          <Briefcase className="h-8 w-8" />
        </div>
        <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Corporate B2B Bulk Procurement</h1>
        <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
          Need office laptops, security cameras, or server components in large quantities? Connect with our dedicated wholesale division for premium discount quotes, tax invoicing, and corporate priority shipping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
        
        {/* Left benefits columns */}
        <div className="lg:col-span-5 space-y-6 lg:pt-6">
          <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-3">Why Partner with Trust IT?</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600 shrink-0">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Customized Wholesale Discounts</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">Scale-based pricing structures designed to lower hardware overhead for companies, institutions, and cyber cafes.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600 shrink-0">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Official Tax & VAT Invoicing</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">Full corporate transparency with standardized tax receipts, VAT chalans, and transparent company account logs.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600 shrink-0">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Dedicated Priority Accounts Handler</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">A single point of contact to process configurations advice, handle express logistics setups, and coordinate claims replacements.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-200 p-4.5 text-[10px] text-gray-400 leading-relaxed font-semibold">
            <span>Our average bulk RFQ turnaround is less than 3 hours during corporate working days. Fill out the target needs form to start.</span>
          </div>
        </div>

        {/* Right Form column */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          
          {status === 'success' ? (
            <div className="text-center py-10 space-y-4">
              <div className="rounded-full bg-green-50 p-4 text-green-600 inline-block">
                <ShieldCheck className="h-10 w-10 animate-pulse" />
              </div>
              <h3 className="text-base font-black text-gray-900">RFQ Request Submitted Successfully!</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                Thank you! Your bulk procurement request has been routed to our corporate pricing analysts. We will email or call your office details shortly with a customized BDT quote.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Submit Another Quote
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Company Registered Name</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="E.g., Trust IT Gallery LTD"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-9 py-2.5 outline-none focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Authorized Contact Representative</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="E.g., Tanvir Rahman (IT Director)"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-9 py-2.5 outline-none focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Office Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="E.g., corporate@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-9 py-2.5 outline-none focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Office Telephone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="E.g., +880 1712-345678"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-9 py-2.5 outline-none focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Minimum Target Quantity</label>
                  <input
                    type="number"
                    required
                    min={5}
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-blue-500 bg-gray-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Target Components & Specification Requirements</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <textarea
                    required
                    rows={5}
                    placeholder="E.g., Looking for 25 units of Intel Core i7-14700K processors and matching LGA1700 ASUS Z790 Motherboards. Please outline best bulk prices and delivery timeline."
                    value={productNotes}
                    onChange={e => setProductNotes(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 pl-9 pr-3.5 py-3 outline-none focus:border-blue-500 bg-gray-50/50 resize-none"
                  />
                </div>
              </div>

              {status === 'error' && (
                <p className="text-[10px] font-bold text-red-600">Failed to submit RFQ. Please double check parameters.</p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-xs font-black text-white hover:bg-blue-700 active:scale-98 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Submit Request for Quotation (RFQ)</span>
              </button>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
