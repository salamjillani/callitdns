import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
    }

    setLoading(false);
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Log In</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-black font-bold py-3 rounded-lg transition"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-400">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="text-amber-400 hover:text-amber-300">
                Sign up
              </Link>
            </p>
            <p className="mt-2">
              <Link to="/reset-password" className="text-amber-400 hover:text-amber-300">
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}