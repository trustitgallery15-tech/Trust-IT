import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: any, token: string) => void;
  setCurrentView: (view: string) => void;
}

export default function AdminLogin({ onLoginSuccess, setCurrentView }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username.trim(), password })
      });

      let responseText = '';
      try {
        responseText = await res.text();
      } catch (readErr) {
        // Fallback if reading fails
      }

      if (res.ok) {
        let payload: any;
        try {
          payload = JSON.parse(responseText);
        } catch (jsonErr) {
          setError('Invalid JSON response from server.');
          setLoading(false);
          return;
        }

        const userObj = payload.user || payload;
        const tokenVal = payload.token || '';

        if (userObj.role !== 'admin') {
          setError('Access Denied: You do not have administrator permissions.');
          setLoading(false);
          return;
        }

        onLoginSuccess(userObj, tokenVal);
      } else {
        let errMessage = 'Invalid administrator credentials.';
        try {
          const err = JSON.parse(responseText);
          errMessage = err.error || errMessage;
        } catch (jsonErr) {
          errMessage = `Server error (${res.status}): ${responseText.slice(0, 150)}`;
        }
        setError(errMessage);
      }
    } catch (err: any) {
      setError(`Connection failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-login-page" className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-slate-100 font-sans">
      <div className="absolute top-6 left-6">
        <button 
          id="btn-back-to-home"
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition duration-200"
        >
          <ArrowLeft size={16} /> Back to Gallery Store
        </button>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400">
            <ShieldCheck size={36} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-2">Trust IT Control Portal</h2>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-mono">Administrative Session</p>
        </div>

        {error && (
          <div id="login-error-alert" className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs leading-relaxed text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Username or Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <User size={16} />
              </span>
              <input
                id="input-admin-username"
                type="text"
                required
                placeholder="Enter admin username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition duration-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Security Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock size={16} />
              </span>
              <input
                id="input-admin-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition duration-200"
              />
            </div>
          </div>

          <button
            id="btn-admin-login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition duration-200 cursor-pointer flex justify-center items-center gap-2 shadow-lg shadow-blue-500/10 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : 'Establish Control Connection'}
          </button>
        </form>

        <div className="border-t border-slate-800/60 pt-4 text-center space-y-1">
          <p className="text-[10px] text-slate-500 font-mono">Development Access: username <b className="text-slate-400">admin</b> / password <b className="text-slate-400">admin</b></p>
          <p className="text-[10px] text-slate-600">Enterprise Grade Encrypted Administrative Console</p>
        </div>
      </div>
    </div>
  );
}
