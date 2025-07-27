import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function ScanResults({ results }) {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'medium':
        return <Info className="w-5 h-5 text-amber-400" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'medium':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'low':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default:
        return 'bg-green-500/10 border-green-500/20 text-green-400';
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <h4 className="text-lg font-semibold text-white">Scan Results</h4>
      
      {results.issues && results.issues.length > 0 ? (
        <div className="space-y-3">
          {results.issues.map((issue, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
            >
              <div className="flex items-start space-x-3">
                {getSeverityIcon(issue.severity)}
                <div className="flex-1">
                  <h5 className="font-semibold mb-1">{issue.title}</h5>
                  <p className="text-sm opacity-80 mb-2">{issue.description}</p>
                  {issue.fix && (
                    <button className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition">
                      One-Click Fix (Coming Soon)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400">No issues found! Your DNS configuration looks good.</p>
          </div>
        </div>
      )}

      {results.records && (
        <div className="mt-4">
          <h5 className="text-sm font-semibold text-slate-300 mb-2">Current DNS Records:</h5>
          <div className="bg-slate-800/50 rounded-lg p-3 text-xs font-mono text-slate-400">
            <pre>{JSON.stringify(results.records, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}