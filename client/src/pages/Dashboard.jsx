import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import DomainCard from "../components/DomainCard";
import SubscriptionManager from "../components/SubscriptionManager";
import SupportModal from "../components/SupportModal";
import { useAuth } from "../context/AuthContext";
import { addDomain, getUserDomains, deleteDomain } from "../services/domains";
import { getUserSubscription } from "../services/stripe";
import { Plus, Globe, Loader, Headphones, Users } from "lucide-react";
import AuthDebug from "../components/AuthDebug";

export default function Dashboard() {
  const { currentUser, authChecked } = useAuth();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    // Only load data after auth is fully checked and user exists
    if (authChecked && currentUser) {
      console.log("Auth checked and user exists, loading dashboard...");
      loadDashboardData();
    } else if (authChecked && !currentUser) {
      console.log("Auth checked but no user, stopping loading...");
      setLoading(false);
    }
  }, [currentUser, authChecked]);

  const loadDashboardData = async () => {
    try {
      console.log("Loading dashboard data for user:", currentUser.uid);

      // Wait a bit more to ensure Firebase auth is fully ready
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Ensure user token is fresh before making calls
      try {
        await currentUser.getIdToken(true);
        console.log("Token refreshed for dashboard loading");
      } catch (tokenError) {
        console.error("Token refresh error in dashboard:", tokenError);
        setError("Authentication error. Please sign out and sign in again.");
        setLoading(false);
        return;
      }

      const [domainsData, subscriptionData] = await Promise.allSettled([
        getUserDomains(currentUser.uid),
        loadSubscription(),
      ]);

      if (domainsData.status === "fulfilled") {
        setDomains(domainsData.value);
      } else {
        console.error("Failed to load domains:", domainsData.reason);
      }

      if (subscriptionData.status === "fulfilled") {
        setSubscription(subscriptionData.value);
      } else {
        console.error("Failed to load subscription:", subscriptionData.reason);
        // Set default free plan
        setSubscription({
          plan: "free",
          features: { domains: 1, scansPerMonth: 10, dottyCommands: 5 },
        });
      }

      // Check for success parameter from Stripe
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("success") === "true") {
        alert("Payment successful! Your subscription is now active.");
        window.history.replaceState({}, document.title, "/dashboard");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const sub = await getUserSubscription();
      console.log("Loaded subscription:", sub);
      return sub;
    } catch (error) {
      console.error("Error loading subscription:", error);
      // Return default free plan
      return {
        plan: "free",
        features: { domains: 1, scansPerMonth: 10, dottyCommands: 5 },
      };
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    setError("");

    if (!newDomain.trim()) {
      setError("Please enter a domain name");
      return;
    }

    // Check domain limit
    if (subscription && subscription.features.domains !== -1) {
      if (domains.length >= subscription.features.domains) {
        // For free plan users with 1 domain limit, provide helpful message
        if (
          subscription.plan === "free" &&
          subscription.features.domains === 1
        ) {
          setError(
            `You've reached your limit of 1 domain on the free plan. Upgrade to Pro to add and manage multiple domains.`
          );
        } else {
          setError(
            `You've reached your limit of ${subscription.features.domains} domain(s). Please upgrade your plan.`
          );
        }
        return;
      }
    }

    try {
      // Ensure fresh token before adding domain
      await currentUser.getIdToken(true);

      const domain = await addDomain(currentUser.uid, newDomain);
      setDomains([...domains, domain]);
      setNewDomain("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding domain:", err);
      setError("Failed to add domain. Please try again.");
    }
  };

  const handleDeleteDomain = async (domainId) => {
    // Only allow deletion for enterprise plan users
    if (subscription?.plan === "free") {
      setError(
        "Domain deletion is not available on the free plan. Upgrade to Enterprise to remove and manage domains."
      );
      return;
    }

    if (subscription?.plan === "pro") {
      setError(
        "Domain deletion is not available on the Pro plan. Upgrade to Enterprise to remove and manage domains."
      );
      return;
    }

    // Only enterprise users can delete domains
    if (subscription?.plan !== "enterprise") {
      setError("Only Enterprise plan users can remove domains.");
      return;
    }

    try {
      await deleteDomain(domainId);
      setDomains(domains.filter((d) => d.id !== domainId));
    } catch (err) {
      console.error("Error deleting domain:", err);
      setError("Failed to delete domain. Please try again.");
    }
  };

  if (!authChecked) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-slate-400">Checking authentication...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentUser) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-white mb-4">
            Please sign in to access your dashboard
          </h1>
          <a
            href="/login"
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-lg transition"
          >
            Sign In
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">
            Manage your domains and run AI-powered health scans
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                <span>Add Domain</span>
              </button>

              {/* Show helpful text for free and pro plan users */}
              {subscription?.plan === "free" && domains.length > 0 && (
                <p className="text-sm text-slate-400">
                  Free plan: 1 domain limit reached
                </p>
              )}
              {subscription?.plan === "pro" && domains.length > 0 && (
                <p className="text-sm text-slate-400">
                  Pro plan: {domains.length}/10 domains
                </p>
              )}
            </div>

            {showAddForm && (
              <div className="mb-8 bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Add New Domain
                </h3>

                {/* Show info message for free and pro plan users */}
                {subscription?.plan === "free" && domains.length > 0 && (
                  <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-amber-400 text-sm">
                      You've reached your free plan limit of 1 domain. Upgrade
                      to Pro for more domains or Enterprise to manage domains.
                    </p>
                  </div>
                )}
                {subscription?.plan === "pro" && domains.length >= 10 && (
                  <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-amber-400 text-sm">
                      You've reached your Pro plan limit of 10 domains. Upgrade
                      to Enterprise for unlimited domains and domain management.
                    </p>
                  </div>
                )}

                <form onSubmit={handleAddDomain} className="flex space-x-4">
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="example.com"
                    required
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2 rounded-lg transition"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setError("");
                      setNewDomain("");
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
                <p className="text-slate-400">Loading domains...</p>
              </div>
            ) : domains.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl">
                <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No domains added yet</p>
                <p className="text-slate-500 mt-2">
                  Add your first domain to get started
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {domains.map((domain) => (
                  <DomainCard
                    key={domain.id}
                    domain={domain}
                    onDelete={handleDeleteDomain}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowSupportModal(true)}
                  className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg transition"
                >
                  <Headphones className="w-5 h-5" />
                  Get Support
                </button>
                <Link
                  to="/contact?type=sales"
                  className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg transition"
                >
                  <Users className="w-5 h-5" />
                  Contact Sales
                </Link>
              </div>
            </div>
            <SubscriptionManager />
          </div>
        </div>
      </div>
      <AuthDebug />
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </Layout>
  );
}
