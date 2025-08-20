// client/src/pages/Contact.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Mail, Phone, MapPin, Send, MessageSquare, Headphones, Users, Clock } from 'lucide-react';
import { createSupportTicket } from '../services/support';
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'general';
  
  const [formType, setFormType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: currentUser?.email || '',
    company: '',
    subject: '',
    message: '',
    priority: 'normal'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createSupportTicket({
        ...formData,
        type: formType,
        userId: currentUser?.uid
      });
      
      alert('Thank you for contacting us! We will respond within 24 hours.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        {/* Contact info cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-6 text-center">
            <Mail className="w-6 h-6 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Email Us</h3>
            <a href="mailto:hello@callitdns.com" className="text-amber-400">hello@callitdns.com</a>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-6 text-center">
            <Phone className="w-6 h-6 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Call Us</h3>
            <a href="tel:703-831-7181" className="text-amber-400">703-831-7181</a>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-6 text-center">
            <MapPin className="w-6 h-6 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Office</h3>
            <p className="text-slate-300">Tysons, Virginia</p>
          </div>
        </div>

        {/* Form implementation... */}
      </div>
    </Layout>
  );
}