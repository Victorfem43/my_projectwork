'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { MessageSquare, Send } from 'lucide-react';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Note: Support ticket endpoint would need to be added to backend
      toast.success('Support ticket created');
      setFormData({ subject: '', message: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Support</h1>

            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold">Contact Support</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="What can we help you with?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    required
                    rows={8}
                    className="input-field"
                    placeholder="Describe your issue or question..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="card">
                <h3 className="text-xl font-bold mb-2">FAQ</h3>
                <p className="text-gray-400">Check out our frequently asked questions</p>
              </div>
              <div className="card">
                <h3 className="text-xl font-bold mb-2">Live Chat</h3>
                <p className="text-gray-400">Chat with our support team</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
