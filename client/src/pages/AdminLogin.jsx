import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Loader, AlertTriangle } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (!adminDoc.exists()) {
        throw new Error('Access denied. Admin privileges required.');
      }

      const adminData = adminDoc.data();
      
      if (!adminData.isAdmin || adminData.status !== 'active') {
        throw new Error('Admin account is not active.');
      }

      await updateDoc(doc(db, 'admins', user.uid), {
        lastLogin: serverTimestamp()
      });

      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminData', JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: adminData.name
      }));

      // Navigate to admin dashboard
      navigate('/callitdns-mgmt-portal-x9k2m/console');
      
    } catch (error) {
      console.error('Admin login error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('No admin account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid login credentials.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/user-disabled') {
        setError('This admin account has been disabled.');
      } else if (error.message.includes('Access denied')) {
        setError(error.message);
        await auth.signOut();
      } else {
        setError(error.message || 'Failed to sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="fixed inset-0 bg-gradient-to-br from-red-500/10 via-slate-950 to-amber-500/10" />
      
      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-lg border border-red-500/20 rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-3 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">System Management</h1>
            <p className="text-sm sm:text-base text-slate-400">Authorized personnel only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3/4 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3/4 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-700 disabled:to-red-800 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Authenticating...</span>
                </span>
              ) : (
                'Access System Console'
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <a href="/" className="text-slate-400 hover:text-white text-sm transition">
              ← Back to main site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}