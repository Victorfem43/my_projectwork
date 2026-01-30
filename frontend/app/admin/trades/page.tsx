'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNavbar from '@/components/Layout/AdminNavbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [deliveredCode, setDeliveredCode] = useState('');

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    setDeliveredCode(selectedTrade?.deliveredCode || '');
  }, [selectedTrade?._id]);

  const fetchTrades = async () => {
    try {
      const res = await api.get('/admin/trades');
      setTrades(res.data.trades);
    } catch (error) {
      toast.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tradeId: string, code?: string) => {
    try {
      const body: { tradeId: string; deliveredCode?: string } = { tradeId };
      if (code && code.trim()) body.deliveredCode = code.trim();
      await api.post('/admin/approve-trade', body);
      toast.success('Trade approved');
      setDeliveredCode('');
      fetchTrades();
      setSelectedTrade(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve trade');
    }
  };

  const handleReject = async (tradeId: string, notes?: string) => {
    try {
      await api.post('/admin/reject-trade', { tradeId, notes });
      toast.success('Trade rejected');
      fetchTrades();
      setSelectedTrade(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject trade');
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
            <h1 className="text-4xl font-bold mb-8">Trade Management</h1>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400">User</th>
                      <th className="text-left py-3 px-4 text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400">Asset</th>
                      <th className="text-left py-3 px-4 text-gray-400">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400">Price</th>
                      <th className="text-left py-3 px-4 text-gray-400">Total</th>
                      <th className="text-left py-3 px-4 text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade._id} className="border-b border-white/10">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{trade.user?.name || 'N/A'}</p>
                            <p className="text-gray-400 text-sm">{trade.user?.email || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            trade.tradeType === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.tradeType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{trade.asset}</td>
                        <td className="py-3 px-4">{trade.amount}</td>
                        <td className="py-3 px-4">${trade.price.toFixed(2)}</td>
                        <td className="py-3 px-4">${trade.total.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            trade.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            trade.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {trade.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => setSelectedTrade(trade)}
                                  className="p-1 text-green-400 hover:text-green-300"
                                  title="Approve (open details to add gift card code)"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleReject(trade._id)}
                                  className="p-1 text-red-400 hover:text-red-300"
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setSelectedTrade(trade)}
                              className="p-1 text-blue-400 hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Trade Details Modal */}
        {selectedTrade && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Trade Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">User</p>
                  <p className="font-semibold">{selectedTrade.user?.name} ({selectedTrade.user?.email})</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Type</p>
                  <p className="font-semibold capitalize">{selectedTrade.type} - {selectedTrade.tradeType}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Asset</p>
                  <p className="font-semibold">{selectedTrade.asset}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Amount</p>
                  <p className="font-semibold">{selectedTrade.amount}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Price</p>
                  <p className="font-semibold">${selectedTrade.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="font-semibold">${selectedTrade.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="font-semibold capitalize">{selectedTrade.status}</p>
                </div>
                {selectedTrade.type === 'giftcard' && selectedTrade.tradeType === 'sell' && selectedTrade.giftCardCode && (
                  <div>
                    <p className="text-gray-400 text-sm">Gift Card Code (from seller)</p>
                    <p className="font-semibold">{selectedTrade.giftCardCode}</p>
                  </div>
                )}
                {selectedTrade.deliveredCode && (
                  <div>
                    <p className="text-gray-400 text-sm">Delivered code (to user)</p>
                    <p className="font-mono text-sm">{selectedTrade.deliveredCode}</p>
                  </div>
                )}
                {selectedTrade.type === 'giftcard' && selectedTrade.tradeType === 'buy' && selectedTrade.status === 'pending' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Gift card code to deliver to user (optional)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Code user will redeem at merchant"
                      value={deliveredCode}
                      onChange={(e) => setDeliveredCode(e.target.value)}
                    />
                  </div>
                )}
                {selectedTrade.adminNotes && (
                  <div>
                    <p className="text-gray-400 text-sm">Admin Notes</p>
                    <p className="font-semibold">{selectedTrade.adminNotes}</p>
                  </div>
                )}
                {selectedTrade.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleApprove(selectedTrade._id, selectedTrade.type === 'giftcard' && selectedTrade.tradeType === 'buy' ? deliveredCode : undefined)}
                      className="btn-primary flex-1"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedTrade._id)}
                      className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg flex-1"
                    >
                      Reject
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setSelectedTrade(null)}
                  className="btn-secondary w-full"
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
