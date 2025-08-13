import React, { useState } from 'react';
import { Sparkles, Send, Loader } from 'lucide-react';
import { executeDottyCommand } from '../services/dotty';

export default function DottyCommand({ domain }) {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await executeDottyCommand(command, domain.name);
      setResult(response);
      setCommand('');
    } catch (err) {
      setError('Failed to execute command. Please try again.');
      console.error('Dotty error:', err);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Set up email for Gmail',
    'Point to Vercel',
    'Add subdomain for blog',
    'Enable email authentication',
    'Set up www redirect'
  ];

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h3 className="text-xl font-semibold text-white">Dotty AI Command</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Tell Dotty what you want to do... e.g., 'Set up email for Gmail'"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setCommand(suggestion)}
              className="text-xs px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-full transition"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !command.trim()}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-black font-semibold px-4 py-2 rounded-lg transition"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Execute Command</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Interpretation:</h4>
            <p className="text-white">{result.interpretation}</p>
          </div>

          {result.confirmationMessage && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400">{result.confirmationMessage}</p>
            </div>
          )}

          {result.warnings && result.warnings.length > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <h4 className="text-sm font-semibold text-amber-400 mb-2">Warnings:</h4>
              <ul className="list-disc list-inside text-amber-300 text-sm">
                {result.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {result.results && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-300">Actions Performed:</h4>
              {result.results.map((action, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    action.success
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <p className={action.success ? 'text-green-400' : 'text-red-400'}>
                    {action.action}: {action.record.type} record for {action.record.name}
                    {action.error && ` - Error: ${action.error}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}