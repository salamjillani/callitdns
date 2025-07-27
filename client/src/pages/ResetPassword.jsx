import React, { useState } from 'react';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock reset password function for demo
  const resetPassword = async (email) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate random success/failure for demo
    if (Math.random() > 0.3) {
      return { success: true };
    } else {
      throw new Error('Failed to reset password');
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch (error) {
      setError('Failed to reset password. Please check your email address.');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Reset Password</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{message}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => alert('Navigate back to login')}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 bg-transparent border-none cursor-pointer"
            >
              Back to Login
            </button>
          </div>

          <div className="mt-4 text-center">
            <span className="text-slate-400">Don't have an account? </span>
            <button
              onClick={() => alert('Navigate to signup')}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 bg-transparent border-none cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}