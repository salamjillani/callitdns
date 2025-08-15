import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, CreditCard, Shield, Sparkles, Globe } from 'lucide-react';

export default function Layout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center h-16 overflow-hidden">
              <img 
                src="/logo.png" 
                alt="CallitDNS" 
                className="h-32 w-auto object-contain"
              />
            </Link>
            
            {/* Navigation */}
            <div className="flex items-center space-x-6">
              {/* Main Navigation Links */}
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
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block">
                    <span className="text-slate-400 text-sm">
                      {currentUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-slate-300 hover:text-white transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold px-5 py-2 rounded-lg transition transform hover:scale-105"
                  >
                    Get Started
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
      
      <main className="container mx-auto px-6 py-8 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <span className="text-slate-400 text-sm">
                © 2025 CallitDNS.
              </span>
            </div>
            
          </div>
        </div>
      </footer>
    </div>
  );
}