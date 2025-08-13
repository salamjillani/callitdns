import React, { useState, useEffect } from 'react';
import { Check, X, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createCheckoutSession, getUserSubscription } from '../services/stripe';

const plans = [
  {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '1 Domain',
      '10 Scans per month',
      '5 Dotty commands per month',
      'Basic DNS management',
      'Community support'
    ],
    limitations: [
      'No priority support',
      'No API access',
      'No team features'
    ]
  },
  {
    name: 'Pro',
    price: 19,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    features: [
      '10 Domains',
      '100 Scans per month',
      '50 Dotty commands per month',
      'Advanced DNS management',
      'Priority email support',
      'API access',
      'Custom DNS templates'
    ],
    limitations: [
      'No dedicated support'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 99,
    priceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Unlimited Domains',
      'Unlimited Scans',
      'Unlimited Dotty commands',
      'Advanced DNS management',
      'Dedicated support',
      'Full API access',
      'Custom DNS templates',
      'Team collaboration',
      'SLA guarantee',
      'Custom integrations'
    ],
    limitations: []
  }
];

export default function Pricing() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadUserSubscription();
    }
  }, [currentUser]);

  const loadUserSubscription = async () => {
    try {
      const subscription = await getUserSubscription();
      setCurrentPlan(subscription.plan);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleSelectPlan = async (plan) => {
    if (!currentUser) {
      // Redirect to signup
      window.location.href = '/signup';
      return;
    }

    if (plan.priceId === null) {
      // Free plan - no checkout needed
      return;
    }

    setLoadingPlan(plan.name);
    
    try {
      const { url } = await createCheckoutSession(
        plan.priceId,
        `${window.location.origin}/dashboard?success=true`,
        `${window.location.origin}/pricing`
      );
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
        <p className="text-slate-400 text-lg">Start free, upgrade when you need more power</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-slate-900/50 backdrop-blur-lg border ${
              plan.popular ? 'border-amber-500' : 'border-slate-800'
            } rounded-xl p-8 hover:border-amber-500/50 transition`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-amber-500 text-black text-sm font-bold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-slate-400 ml-2">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
              
              {plan.limitations.map((limitation) => (
                <div key={limitation} className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-500">{limitation}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSelectPlan(plan)}
              disabled={loadingPlan === plan.name || currentPlan === plan.name.toLowerCase()}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                currentPlan === plan.name.toLowerCase()
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-amber-500 hover:bg-amber-600 text-black'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {loadingPlan === plan.name ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : currentPlan === plan.name.toLowerCase() ? (
                'Current Plan'
              ) : (
                'Select Plan'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}