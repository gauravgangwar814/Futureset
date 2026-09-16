import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, 
  Sparkles, 
  Layers,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  TrendingUp,
  Link2,
  ShieldCheck,
  ArrowDownToLine,
  BookOpen,
  Zap,
  Trophy
} from 'lucide-react';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.512 5.335L2 22l4.816-1.503a9.98 9.98 0 0 0 5.196 1.488h.005c5.507 0 9.991-4.478 9.991-9.985A9.99 9.99 0 0 0 12.012 2zm5.836 14.159c-.244.686-1.42 1.314-1.956 1.396-.497.076-1.144.108-3.702-.953-3.266-1.355-5.37-4.664-5.534-4.88-.164-.216-1.314-1.748-1.314-3.334s.827-2.368 1.12-2.691c.293-.323.64-.404.854-.404.214 0 .428.002.614.012.2.01.468-.076.732.558.268.647.915 2.234.996 2.396.08.163.134.354.027.57-.107.215-.16.35-.32.538-.16.188-.337.42-.48.564-.16.16-.328.334-.141.654.187.32.83 1.368 1.782 2.215 1.222 1.089 2.25 1.426 2.57 1.587.32.16.507.134.694-.08.187-.215.8-1.022 1.014-1.371.214-.35.428-.295.721-.188.293.107 1.868.88 2.189 1.04.32.16.534.241.614.376.08.134.08.779-.164 1.465z" />
  </svg>
);

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    activeView, 
    setActiveView, 
    logout 
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const openWhatsAppContact = () => {
    const message = encodeURIComponent("Hi Gaurav sir, I want to know more about Futureset Packages.");
    window.open(`https://wa.me/918279641186?text=${message}`, '_blank');
  };

  const scrollToPackages = () => {
    if (activeView !== 'home') {
      setActiveView('home');
    }
    setTimeout(() => {
      const el = document.getElementById('packages-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleNavClick = (view: any) => {
    setActiveView(view);
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    logout();
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full">
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-1">
        
        {/* Brand Logo */}
        <button
          id="btn-brand-logo"
          onClick={() => currentUser ? setActiveView('profile_initial') : setActiveView('home')}
          className="flex items-center gap-2 sm:gap-3 group text-left transition-transform active:scale-95 shrink-0"
        >
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 shrink-0">
            <div className="w-full h-full bg-white rounded-[7px] sm:rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 font-sans">
                Future<span className="text-blue-600">Set</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                Official
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 font-medium">Learn • Earn • Scale</p>
          </div>
        </button>

        {/* Top Header Navigation Items */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {!currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* 1. Our Packages (Desktop & Tablet only to keep mobile header clean) */}
              <button
                id="top-nav-our-packages"
                onClick={scrollToPackages}
                className="hidden md:flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all shadow-sm shrink-0 whitespace-nowrap"
              >
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Our Packages</span>
              </button>

              {/* 2. WhatsApp Button - Clearly visible on all mobile screens */}
              <button
                id="top-nav-whatsapp"
                onClick={openWhatsAppContact}
                className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all active:scale-95 shrink-0 whitespace-nowrap"
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <WhatsAppIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <span>WhatsApp</span>
              </button>

              {/* 3. Login Button - Clearly visible on all mobile screens */}
              <button
                id="top-nav-login"
                onClick={() => setActiveView('login')}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-600/20 transition-all active:scale-95 shrink-0 whitespace-nowrap"
              >
                <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                <span>Login</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 relative" ref={menuRef}>
              {/* Authenticated Dashboard button */}
              <button
                id="btn-user-badge"
                onClick={() => setActiveView('profile_initial')}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm transition-colors"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-blue-600"
                />
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase block">
                    {currentUser.packageName}
                  </span>
                </div>
              </button>

              {/* Three-line Menu Button (Hamburger) */}
              <button
                id="top-nav-menu-button"
                onClick={() => setIsMenuOpen(prev => !prev)}
                className={`flex items-center justify-center p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition-all ${
                  isMenuOpen
                    ? 'text-blue-600 bg-blue-50 border-blue-400 shadow-sm'
                    : 'text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300'
                }`}
                title="Navigation Menu"
                aria-label="Navigation Menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
                <span className="hidden sm:inline-block ml-1.5">Menu</span>
              </button>

              {/* Dropdown Menu containing all Quick Navigation options */}
              {isMenuOpen && (
                <div 
                  id="top-nav-dropdown-menu"
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-blue-900/10 backdrop-blur-xl p-3 z-50 animate-fadeIn"
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Quick Navigation</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.name} ({currentUser.email})</p>
                  </div>

                  <div className="space-y-1">
                    {/* My Profile */}
                    <button
                      id="menu-opt-my-profile"
                      onClick={() => handleNavClick('profile_edit')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold">My Profile</span>
                        <span className="text-[10px] text-slate-500 block">Edit DP & Name</span>
                      </div>
                    </button>

                    {/* My Courses */}
                    <button
                      id="menu-opt-my-courses"
                      onClick={() => handleNavClick('courses')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold">My Courses</span>
                        <span className="text-[10px] text-slate-500 block">Watch video lessons</span>
                      </div>
                    </button>

                    {/* Upgrade Package */}
                    <button
                      id="menu-opt-upgrade-package"
                      onClick={() => handleNavClick('upgrade_package')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="block font-bold text-blue-700">Upgrade Package</span>
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[9px] font-black text-blue-700">HOT</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">Higher tier & more commission</span>
                      </div>
                    </button>

                    {/* Affiliate Dashboard */}
                    <button
                      id="menu-opt-affiliate-dashboard"
                      onClick={() => handleNavClick('affiliate_dashboard')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold">Affiliate Dashboard</span>
                        <span className="text-[10px] text-slate-500 block">Today, 7d & 30d earnings</span>
                      </div>
                    </button>

                    {/* Affiliate Link */}
                    <button
                      id="menu-opt-affiliate-link"
                      onClick={() => handleNavClick('affiliate_link')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold">Affiliate Link</span>
                        <span className="text-[10px] text-slate-500 block">Copy referral link</span>
                      </div>
                    </button>

                    {/* Complete KYC */}
                    <button
                      id="menu-opt-complete-kyc"
                      onClick={() => handleNavClick('kyc')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold">Complete KYC</span>
                        <span className="text-[10px] text-slate-500 block">Bank details & UPI ID</span>
                      </div>
                    </button>

                    {/* Withdrawal Request */}
                    <button
                      id="menu-opt-withdrawal-request"
                      onClick={() => handleNavClick('withdrawal')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ArrowDownToLine className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold">Withdrawal Request</span>
                        <span className="text-[10px] text-slate-500 block">Payout commissions</span>
                      </div>
                    </button>

                    {/* Leaderboard (Top 10 Earners - Today, 7 Days, 30 Days) */}
                    <button
                      id="menu-opt-leaderboard"
                      onClick={() => handleNavClick('leaderboard')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="block font-bold">Leaderboard</span>
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[9px] font-black text-blue-700">TOP 10</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">Today, 7d & 30d top earners</span>
                      </div>
                    </button>

                    <div className="pt-2 border-t border-slate-100">
                      {/* Log Out */}
                      <button
                        id="menu-opt-logout"
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-bold">Log Out</span>
                          <span className="text-[10px] text-rose-500 block">Securely exit session</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


