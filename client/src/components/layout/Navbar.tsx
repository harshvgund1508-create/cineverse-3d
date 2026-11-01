import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Film, Ticket, LayoutDashboard, User as UserIcon, LogOut, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const { user, isAdmin, logout, openAuthModal } = useAuth();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'Cinemas', path: '/cinemas' },
    { label: 'My Bookings', path: '/my-bookings' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cine-cyan via-cine-blue to-cine-violet flex items-center justify-center shadow-glow-cyan group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-black fill-current" />
          </div>
          <div>
            <div className="font-extrabold text-lg sm:text-xl text-white tracking-wider font-display flex items-center gap-1">
              <span>CINEVERSE</span>
              <span className="text-cine-cyan text-glow">3D</span>
            </div>
            <p className="text-[9px] text-slate-400 tracking-widest uppercase font-mono -mt-1 hidden sm:block">
              Experience Your View
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cine-cyan/20 text-cine-cyan border border-cine-cyan/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                pathname.startsWith('/admin')
                  ? 'bg-cine-violet/30 text-cine-violet border border-cine-violet/40'
                  : 'text-cine-violet hover:bg-cine-violet/10'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* User Auth Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <div className="w-6 h-6 rounded-lg bg-cine-cyan/20 text-cine-cyan flex items-center justify-center font-bold font-mono">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-white font-medium line-clamp-1">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{user.role}</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cine-cyan to-cine-blue hover:opacity-95 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-cyan"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
