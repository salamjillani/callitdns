import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DomainCard from '../components/DomainCard';
import { useAuth } from '../context/AuthContext';
import { addDomain, getUserDomains, deleteDomain } from '../services/domains';
import { Plus, Globe } from 'lucide-react';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadDomains();
  }, [currentUser]);

  const loadDomains = async () => {
    try {
      const userDomains = await getUserDomains(currentUser.uid);
      setDomains(userDomains);
    } catch (err) {
      console.error('Error loading domains:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const domain = await addDomain(currentUser.uid, newDomain);
      setDomains([...domains, domain]);
      setNewDomain('');
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to add domain. Please try again.');
    }
  };

  const handleDeleteDomain = async (domainId) => {
    try {
      await deleteDomain(domainId);
      setDomains(domains.filter(d => d.id !== domainId));
    } catch (err) {
      console.error('Error deleting domain:', err);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Manage your domains and run AI-powered health scans</p>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Domain</span>
          </button>
        </div>

        {showAddForm && (
          <div className="mb-8 bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Add New Domain</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
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
                  setError('');
                  setNewDomain('');
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
            <p className="text-slate-400">Loading domains...</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl">
            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No domains added yet</p>
            <p className="text-slate-500 mt-2">Add your first domain to get started</p>
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
    </Layout>
  );
}