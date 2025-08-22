import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  Home,
  CreditCard,
  Shield,
  Sparkles,
  Globe,
} from "lucide-react";

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
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
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
        <nav className="container mx-auto px-4 sm:px-6 py-1 sm:py-2">
          <div className="flex justify-between items-center min-h-[40px] sm:min-h-[48px]">
            {/* Logo - Responsive sizing */}
            <Link
              to="/"
              className="flex items-center flex-shrink-0 h-8 sm:h-10 overflow-hidden"
            >
              <img
                src="/logo.png"
                alt="CallitDNS"
                className="h-16 sm:h-20 md:h-24 w-auto object-contain"
              />
            </Link>

            {/* Navigation Links - Visible on larger screens between logo and user section */}
            <div className="hidden md:flex items-center space-x-6 flex-1 justify-center">
              {currentUser && (
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 transition ${
                    isActive("/dashboard")
                      ? "text-amber-400"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              )}

              <Link
                to="/pricing"
                className={`flex items-center space-x-2 transition ${
                  isActive("/pricing")
                    ? "text-amber-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Pricing</span>
              </Link>
            </div>

            {/* Mobile Pricing Link - Visible on small screens, positioned between logo and user section */}
            <div className="md:hidden flex-1 flex justify-center">
              <Link
                to="/pricing"
                className={`flex items-center space-x-1 transition text-sm ${
                  isActive("/pricing")
                    ? "text-amber-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Pricing</span>
              </Link>
            </div>

            {/* Mobile Dashboard Link - Only show if user is logged in, positioned near user section */}
            {currentUser && (
              <div className="md:hidden mr-2">
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 transition text-sm ${
                    isActive("/dashboard")
                      ? "text-amber-400"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </div>
            )}

            {/* User Section - Always visible */}
            <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
              {currentUser ? (
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="hidden sm:block max-w-[120px] md:max-w-[150px] lg:max-w-none">
                    <span className="text-slate-400 text-sm truncate block">
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
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-[#FFBF00] font-bold px-3 sm:px-5 py-2 rounded-lg transition transform hover:scale-105 text-sm sm:text-base whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-12 relative z-10 bg-slate-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
            <div className="sm:col-span-2 lg:col-span-1">
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
                <li>
                  <Link
                    to="/features"
                    className="hover:text-amber-400 transition"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="hover:text-amber-400 transition"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Company</h5>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="/blog" className="hover:text-amber-400 transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-amber-400 transition"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact?type=sales"
                    className="hover:text-amber-400 transition"
                  >
                    Sales
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:hello@callitdns.com"
                    className="hover:text-amber-400 transition"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Legal</h5>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-amber-400 transition"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-amber-400 transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cancellation"
                    className="hover:text-amber-400 transition"
                  >
                    Cancellation Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-slate-400 text-sm text-center sm:text-left">
              © 2025 CallitDNS, Inc. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="tel:703-831-7181"
                className="text-slate-400 hover:text-amber-400 text-sm transition"
              >
                703-831-7181
              </a>
              <span className="text-slate-600">•</span>
              <a
                href="mailto:hello@callitdns.com"
                className="text-slate-400 hover:text-amber-400 text-sm transition"
              >
                hello@callitdns.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
