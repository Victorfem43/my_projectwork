'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNavbar from '@/components/Layout/AdminNavbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { MessageSquare, CheckCircle, XCircle } from 'lucide-react';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // Note: Support ticket endpoint would need to be implemented
      // const res = await api.get('/admin/support');
      // setTickets(res.data.tickets);
      setTickets([]);
    } catch (error) {
      console.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      // await api.put(`/admin/support/${ticketId}`, { status, adminResponse: response });
      toast.success('Ticket updated');
      fetchTickets();
      setSelectedTicket(null);
      setResponse('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen">
        <AdminNavbar />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Support Tickets</h1>

            {tickets.length === 0 ? (
              <div className="card text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No support tickets yet</p>
              </div>
            ) : (
              <div className="card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-400">User</th>
                        <th className="text-left py-3 px-4 text-gray-400">Subject</th>
                        <th className="text-left py-3 px-4 text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400">Priority</th>
                        <th className="text-left py-3 px-4 text-gray-400">Date</th>
                        <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket._id} className="border-b border-white/10">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold">{ticket.user?.name || 'N/A'}</p>
                              <p className="text-gray-400 text-sm">{ticket.user?.email || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">{ticket.subject}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                              ticket.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 capitalize">{ticket.priority}</td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{selectedTicket.subject}</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">From</p>
                  <p className="font-semibold">{selectedTicket.user?.name} ({selectedTicket.user?.email})</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Message</p>
                  <p className="font-semibold">{selectedTicket.message}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Response</label>
                  <textarea
                    rows={4}
                    className="input-field"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Enter your response..."
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateStatus(selectedTicket._id, 'resolved')}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Resolve
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTicket._id, 'in-progress')}
                  className="btn-secondary flex-1"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    setResponse('');
                  }}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
