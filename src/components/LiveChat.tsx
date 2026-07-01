import React, { useState } from 'react';
import { MessageSquare, X, Send, PhoneCall, Calendar, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string; time: string }[]>([
    { sender: 'bot', text: 'Hello! Welcome to Trust IT Gallery. How can I assist you with your IT purchase today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setInputText('');

    // Pre-programmed smart e-commerce answers
    setTimeout(() => {
      let botResponse = "Thank you for asking! An expert from our Trust IT team will join this chat shortly. You can also contact us instantly via WhatsApp at +8801712345678.";
      
      const query = userMsg.toLowerCase();
      if (query.includes('warranty')) {
        botResponse = "🛡️ **Warranty Policy**: All our processors and motherboards carry a 3-year warranty. SSDs have a 5-year warranty, while laptops and accessories have 1-2 years. Physical damage is not covered under warranty.";
      } else if (query.includes('shipping') || query.includes('delivery')) {
        botResponse = "🚚 **Delivery Rates & Times**: We offer FREE shipping inside Bangladesh for orders above BDT 50,000. For standard orders, shipping is BDT 150. Delivery takes 1-2 days in Dhaka, and 2-4 days nationwide.";
      } else if (query.includes('payment') || query.includes('bkash') || query.includes('stripe')) {
        botResponse = "💳 **Payment Methods**: We accept Cash on Delivery (COD), Stripe (Visa/Mastercard), and SSLCommerz (Mobile Banking like bKash, Nagad, Rocket).";
      } else if (query.includes('location') || query.includes('address') || query.includes('shop')) {
        botResponse = "📍 **Showroom Location**: Come visit us at Level 4, Trust IT Gallery Tower, Multiplan Center, Dhaka, Bangladesh. Open daily from 10:00 AM to 8:00 PM (Closed on Tuesdays).";
      } else if (query.includes('stock') || query.includes('available')) {
        botResponse = "💻 **Stock Availability**: All items marked 'In Stock' are ready for immediate pickup or delivery. For pre-orders, it generally takes 7-10 working days.";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* Floating Messenger / WhatsApp Shortcuts */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col gap-2"
          >
            {/* WhatsApp Quick Link */}
            <a
              href="https://wa.me/8801712345678"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-green-600 hover:scale-105"
            >
              <PhoneCall className="h-4 w-4" />
              <span>WhatsApp Chat</span>
            </a>
            {/* Messenger Quick Link */}
            <a
              href="https://m.me/trustitgallery"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:scale-105"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Messenger Chat</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Live Chat Toggle Button */}
      <button
        id="live-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition hover:bg-blue-700 hover:scale-105 focus:outline-none"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Live Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="flex h-[420px] w-80 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse absolute -bottom-0.5 -right-0.5"></div>
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Trust IT Live Support</h4>
                  <p className="text-[10px] text-blue-100">Usually replies instantly</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Support info banner inside chat */}
            <div className="bg-blue-50 px-3 py-1.5 text-[10px] text-blue-800 border-b border-blue-100 flex items-center justify-between">
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-blue-600" /> Original Brand Warranty</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-blue-600" /> Sat-Mon: 10AM-8PM</span>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}
                  >
                    {msg.text.startsWith('🛡️') || msg.text.startsWith('🚚') || msg.text.startsWith('📍') ? (
                      <div className="space-y-1">
                        {msg.text.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="flex border-t border-gray-100 bg-white p-2">
              <input
                type="text"
                placeholder="Ask about stock, warranty, location..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-700 placeholder-gray-400 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
