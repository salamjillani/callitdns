// Update client/src/components/DomainCard.jsx
import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Loader, Sparkles } from 'lucide-react';
import { runHealthScan } from '../services/scans';
import ScanResults from './ScanResults';
import DottyCommand from './DottyCommand';

export default function DomainCard({ domain, onDelete }) {
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [error, setError] = useState('');
  const [showDotty, setShowDotty] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    setError('');
    setScanResults(null);

    try {
      const results = await runHealthScan(domain.name);
      setScanResults(results);
    } catch (err) {
      setError('Failed to scan domain. Please try again.');
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-6 hover:border-amber-500/20 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">{domain.name}</h3>
          <p className="text-slate-400 text-sm">
            Added on {new Date(domain.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => onDelete(domain.id)}
          className="text-slate-400 hover:text-red-400 transition"
        >
          Remove
        </button>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-black font-semibold px-4 py-2 rounded-lg transition"
        >
          {scanning ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Scan Now</span>
            </>
          )}
        </button>
        
       <button
  onClick={() => setShowDotty(!showDotty)}
  className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-semibold px-4 py-2 rounded-lg transition"
>
  <Sparkles className="w-4 h-4 text-amber-400" />
  <span className="text-amber-400 font-bold">Dotty AI</span>
</button>
      </div>

      {showDotty && (
        <div className="mt-6">
          <DottyCommand domain={domain} />
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {scanResults && <ScanResults results={scanResults} />}
    </div>
  );
}