// client/src/components/SupportModal.jsx
import React, { useState } from 'react';
import { X, Send, Headphones } from 'lucide-react';
import { createSupportTicket } from '../services/support';
import { useAuth } from '../context/AuthContext';

export default function SupportModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createSupportTicket({
        ...formData,
        userId: currentUser.uid,
        email: currentUser.email,
        type: 'support'
      });
      
      alert('Support ticket created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Headphones className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">Get Support</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              placeholder="Brief description of your issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Message
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
              placeholder="Describe your issue in detail"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-black font-bold py-3 rounded-lg transition"
          >
            {loading ? 'Sending...' : (
              <>
                <Send className="w-4 h-4" />
                Send Ticket
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}