import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home } from 'lucide-react';

export default function Layout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-lg border-b border-slate-800">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tighter" style={{
              background: 'linear-gradient(to right, #fbbf24, #ef4444)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent'
            }}>
              CallitDNS
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <span className="text-slate-300">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-5 py-2 rounded-lg transition"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}