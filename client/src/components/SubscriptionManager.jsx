// client/src/components/SubscriptionManager.jsx
import React, { useState, useEffect } from 'react';
import { CreditCard, Settings, AlertCircle } from 'lucide-react';
import { getUserSubscription, createPortalSession } from '../services/stripe';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionManager() {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const sub = await getUserSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await createPortalSession(window.location.href);
      window.location.href = url;
    } catch (error) {
      console.error('Error opening portal:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400">Loading subscription...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-6 h-6 text-amber-400" />
          <h3 className="text-xl font-semibold text-white">Subscription</h3>
        </div>
        
        {subscription?.plan !== 'free' && (
          <button
            onClick={handleManageSubscription}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition"
          >
            <Settings className="w-4 h-4" />
            <span>Manage</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Current Plan</span>
          <span className="text-white font-semibold capitalize">
            {subscription?.plan || 'Free'}
          </span>
        </div>

        {subscription?.features && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Domains</span>
              <span className="text-white">
                {subscription.features.domains === -1 
                  ? 'Unlimited' 
                  : subscription.features.domains}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Scans / Month</span>
              <span className="text-white">
                {subscription.features.scansPerMonth === -1 
                  ? 'Unlimited' 
                  : subscription.features.scansPerMonth}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Dotty Commands / Month</span>
              <span className="text-white">
                {subscription.features.dottyCommands === -1 
                  ? 'Unlimited' 
                  : subscription.features.dottyCommands}
              </span>
            </div>
          </>
        )}

        {subscription?.subscription?.cancelAtPeriodEnd && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-400 text-sm">
                  Your subscription will end on{' '}
                  {new Date(subscription.subscription.currentPeriodEnd * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {subscription?.plan === 'free' && (
          <div className="mt-4">
            <a
              href="/pricing"
              className="block text-center bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 rounded-lg transition"
            >
              Upgrade Plan
            </a>
          </div>
        )}
      </div>
    </div>
  );
}