import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Payment Successful!</h2>
          <p className="text-slate-400 mb-6">
            Your subscription is now active. Redirecting to dashboard...
          </p>
          <div className="animate-pulse">
            <div className="h-1 bg-amber-500 rounded-full" style={{ animation: 'pulse 2s infinite' }}></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}