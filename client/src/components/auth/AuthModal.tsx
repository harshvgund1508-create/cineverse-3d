import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name || !email || !password) {
          throw new Error('Please fill all required fields');
        }
        await register(name, email, password, phone);
      } else {
        if (!email || !password) {
          throw new Error('Email and password are required');
        }
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsRegister(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 flex flex-col border border-white/10 shadow-2xl relative">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cine-cyan to-cine-violet shadow-glow-cyan mb-3">
            <Sparkles className="w-6 h-6 text-black fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            {isRegister ? 'Join CineVerse 3D' : 'Welcome to CineVerse 3D'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Experience trailers in full 3D and book your seat view
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-5 border border-white/5">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              !isRegister
                ? 'bg-cine-cyan text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              isRegister
                ? 'bg-cine-cyan text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Autofill Buttons */}
        <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            One-Click Test Accounts
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('user@cineverse.com', 'password123')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-cine-cyan/15 hover:bg-cine-cyan/25 text-cine-cyan text-[11px] font-bold border border-cine-cyan/30 transition-colors"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@cineverse.com', 'admin123')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-cine-violet/15 hover:bg-cine-violet/25 text-cine-violet text-[11px] font-bold border border-cine-violet/30 transition-colors"
            >
              Director / Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Harshvardhan Gund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cine-cyan"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="user@cineverse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cine-cyan"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cine-cyan"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-6 rounded-xl bg-gradient-to-r from-cine-cyan via-cine-blue to-cine-violet text-black font-bold text-xs hover:opacity-95 shadow-glow-cyan flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In to CineVerse'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
