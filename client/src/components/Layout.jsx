import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, CreditCard, Shield, Sparkles, Globe } from 'lucide-react';

export default function Layout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // This automatically scrolls to top whenever the route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-500/5 via-slate-950 to-orange-500/5 pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%22100%22%20height%3D%22100%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%20100%200%20L%200%200%200%20100%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%220.5%22%20opacity%3D%220.05%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%20/%3E%3C/svg%3E')] pointer-events-none" />
      
      <header className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-lg border-b border-slate-800">
        <nav className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center h-12 sm:h-16 overflow-hidden">
              <img 
                src="/logo.png" 
                alt="CallitDNS" 
                className="h-24 sm:h-32 w-auto object-contain"
              />
            </Link>
            
            {/* Navigation */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              {/* Main Navigation Links - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-6">
                {currentUser && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`flex items-center space-x-2 transition ${
                        isActive('/dashboard')
                          ? 'text-amber-400'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  </>
                )}
                
                <Link
                  to="/pricing"
                  className={`flex items-center space-x-2 transition ${
                    isActive('/pricing')
                      ? 'text-amber-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pricing</span>
                </Link>
              </div>

              {/* User Section */}
              {currentUser ? (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="hidden sm:block">
                    <span className="text-slate-400 text-sm truncate max-w-32 sm:max-w-none">
                      {currentUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Link
                    to="/login"
                    className="text-slate-300 hover:text-white transition px-2 sm:px-0"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-[#FFBF00] font-bold px-3 sm:px-5 py-2 rounded-lg transition transform hover:scale-105 text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden mt-4 pt-4 border-t border-slate-800 flex justify-around">
            {currentUser && (
              <Link
                to="/dashboard"
                className={`flex flex-col items-center space-y-1 ${
                  isActive('/dashboard')
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="text-xs">Dashboard</span>
              </Link>
            )}
            <Link
              to="/pricing"
              className={`flex flex-col items-center space-y-1 ${
                isActive('/pricing')
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs">Pricing</span>
            </Link>
          </div>
        </nav>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 relative z-10">
        {children}
      </main>

      {/* Footer */}
   <footer className="border-t border-slate-800 mt-20 py-12 relative z-10 bg-slate-900/50 backdrop-blur-lg">
  <div className="container mx-auto px-4 sm:px-6">
    <div className="grid md:grid-cols-4 gap-8 mb-8">
      <div>
        <Link to="/" className="flex items-center space-x-2 mb-4">
          <Globe className="w-6 h-6 text-amber-400" />
          <span className="text-xl font-bold text-white">CallitDNS</span>
        </Link>
        <p className="text-slate-400 text-sm">
          AI-powered DNS management for modern developers.
        </p>
      </div>
      
      <div>
        <h5 className="font-semibold text-white mb-4">Product</h5>
        <ul className="space-y-2 text-slate-400">
          <li><Link to="/features" className="hover:text-amber-400">Features</Link></li>
          <li><Link to="/pricing" className="hover:text-amber-400">Pricing</Link></li>
        </ul>
      </div>
      
      <div>
        <h5 className="font-semibold text-white mb-4">Company</h5>
        <ul className="space-y-2 text-slate-400">
          <li><Link to="/blog" className="hover:text-amber-400">Blog</Link></li>
          <li><Link to="/contact" className="hover:text-amber-400">Contact</Link></li>
          <li><Link to="/contact?type=sales" className="hover:text-amber-400">Sales</Link></li>
          <li><a href="mailto:hello@callitdns.com" className="hover:text-amber-400">Support</a></li>
        </ul>
      </div>
      
      <div>
        <h5 className="font-semibold text-white mb-4">Legal</h5>
        <ul className="space-y-2 text-slate-400">
          <li><Link to="/privacy" className="hover:text-amber-400">Privacy Policy</Link></li>
          <li><Link to="/terms" className="hover:text-amber-400">Terms of Service</Link></li>
          <li><Link to="/cancellation" className="hover:text-amber-400">Cancellation Policy</Link></li>
        </ul>
      </div>
    </div>
    
    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
      <p className="text-slate-400 text-sm">
        © 2025 CallitDNS, Inc. All rights reserved.
      </p>
      <div className="flex items-center space-x-4 mt-4 md:mt-0">
        <a href="tel:703-831-7181" className="text-slate-400 hover:text-amber-400 text-sm">
          703-831-7181
        </a>
        <span className="text-slate-600">•</span>
        <a href="mailto:hello@callitdns.com" className="text-slate-400 hover:text-amber-400 text-sm">
          hello@callitdns.com
        </a>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}