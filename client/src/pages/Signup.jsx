import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      // Navigation will be handled by useEffect when currentUser changes
    } catch (error) {
      setError('Failed to create account. Please try again.');
      setLoading(false);
    }
  }

  // Don't render the form if user is already logged in
  if (currentUser) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8 sm:mt-16 px-4">
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Sign Up</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm sm:text-base">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm sm:text-base">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm sm:text-base">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                placeholder="Confirm your password"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-black font-bold py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-400 text-sm sm:text-base">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-amber-400 hover:text-amber-300">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}