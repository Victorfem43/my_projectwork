'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNavbar from '@/components/Layout/AdminNavbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Wallet, Plus, CreditCard, Banknote, Coins } from 'lucide-react';

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFundModal, setShowFundModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [fundLoading, setFundLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'crypto'>('stripe');
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'usd',
  });
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
    fetchPendingDeposits();
  }, []);

  const fetchPendingDeposits = async () => {
    try {
      const res = await api.get('/payments/pending-deposits');
      setPendingDeposits(res.data?.deposits || []);
    } catch {
      setPendingDeposits([]);
    }
  };

  const handleConfirmDeposit = async (transactionId: string) => {
    setConfirmingId(transactionId);
    try {
      await api.post('/payments/confirm-deposit', { transactionId });
      toast.success('Deposit confirmed. Wallet credited.');
      fetchPendingDeposits();
      fetchWallets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to confirm deposit');
    } finally {
      setConfirmingId(null);
    }
  };

  // Show success/cancel toast when returning; capture PayPal if token present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const provider = params.get('provider');
    const token = params.get('token');
    if (payment === 'cancelled') {
      toast.error('Payment was cancelled.');
      window.history.replaceState({}, '', '/admin/wallets');
      return;
    }
    if (payment === 'success' && provider === 'paypal' && token) {
      api.post('/payments/capture-paypal', { orderId: token })
        .then(() => {
          toast.success('Payment successful. User wallet has been credited.');
          window.history.replaceState({}, '', '/admin/wallets');
          fetchWallets();
        })
        .catch((err: any) => toast.error(err.response?.data?.message || 'Failed to capture payment'));
      return;
    }
    if (payment === 'success') {
      toast.success('Payment successful. User wallet has been credited.');
      window.history.replaceState({}, '', '/admin/wallets');
      fetchWallets();
    }
  }, []);

  const fetchWallets = async () => {
    try {
      const res = await api.get('/admin/wallets');
      setWallets(res.data.wallets);
    } catch (error) {
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (!amount || amount < 1) {
      toast.error('Minimum amount is 1 USD');
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const successUrl = `${origin}/admin/wallets?payment=success&provider=${paymentMethod}`;
    const cancelUrl = `${origin}/admin/wallets?payment=cancelled`;
    setFundLoading(true);
    try {
      let endpoint = '/payments/create-admin-checkout-session';
      const body = { userId: selectedWallet.user._id, amount, successUrl, cancelUrl };
      if (paymentMethod === 'paypal') endpoint = '/payments/create-admin-paypal-order';
      else if (paymentMethod === 'crypto') endpoint = '/payments/create-admin-crypto-charge';
      const res = await api.post(endpoint, body);
      const url = res.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      toast.error('Could not start payment');
    } catch (error: any) {
      const data = error.response?.data;
      let msg = data?.message || (Array.isArray(data?.errors) && data.errors[0]?.msg) || error.message || 'Funding failed';
      if (!error.response) msg = 'Network error. Is the server running? Check the terminal for errors.';
      toast.error(msg);
      if (process.env.NODE_ENV === 'development') {
        console.error('Funding error:', error.response?.status, data || error.message);
      }
    } finally {
      setFundLoading(false);
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
            <h1 className="text-4xl font-bold mb-8">Wallet Management</h1>

            {pendingDeposits.length > 0 && (
              <div className="card mb-8">
                <h2 className="text-xl font-bold mb-4">Pending crypto deposits (no Coinbase)</h2>
                <p className="text-gray-400 text-sm mb-4">Users sent BTC/ETH/USDT to your deposit addresses. Confirm after you verify the payment.</p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-400">User</th>
                        <th className="text-left py-3 px-4 text-gray-400">Amount</th>
                        <th className="text-left py-3 px-4 text-gray-400">Currency</th>
                        <th className="text-left py-3 px-4 text-gray-400">Reference</th>
                        <th className="text-left py-3 px-4 text-gray-400">Date</th>
                        <th className="text-left py-3 px-4 text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDeposits.map((d) => (
                        <tr key={d._id} className="border-b border-white/10">
                          <td className="py-3 px-4">
                            <p className="font-medium">{d.user?.name || 'N/A'}</p>
                            <p className="text-gray-400 text-sm">{d.user?.email || 'N/A'}</p>
                          </td>
                          <td className="py-3 px-4 font-mono">{d.amount}</td>
                          <td className="py-3 px-4">{d.currency?.toUpperCase()}</td>
                          <td className="py-3 px-4 font-mono text-sm">{d.paymentId || d.metadata?.reference}</td>
                          <td className="py-3 px-4 text-gray-400 text-sm">{d.createdAt ? new Date(d.createdAt).toLocaleString() : '—'}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleConfirmDeposit(d._id)}
                              disabled={confirmingId === d._id}
                              className="btn-primary text-sm disabled:opacity-50"
                            >
                              {confirmingId === d._id ? 'Confirming…' : 'Confirm'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400">User</th>
                      <th className="text-left py-3 px-4 text-gray-400">USD</th>
                      <th className="text-left py-3 px-4 text-gray-400">BTC</th>
                      <th className="text-left py-3 px-4 text-gray-400">ETH</th>
                      <th className="text-left py-3 px-4 text-gray-400">USDT (ERC20)</th>
                      <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallets.map((wallet) => (
                      <tr key={wallet._id} className="border-b border-white/10">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{wallet.user?.name || 'N/A'}</p>
                            <p className="text-gray-400 text-sm">{wallet.user?.email || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">${(wallet.balances?.usd || 0).toFixed(2)}</td>
                        <td className="py-3 px-4">{(wallet.balances?.btc || 0).toFixed(6)}</td>
                        <td className="py-3 px-4">{(wallet.balances?.eth || 0).toFixed(4)}</td>
                        <td className="py-3 px-4">{(wallet.balances?.usdt || 0).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              setSelectedWallet(wallet);
                              setShowFundModal(true);
                            }}
                            className="btn-secondary text-sm flex items-center"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Fund
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Fund Modal */}
        {showFundModal && selectedWallet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Fund Wallet</h2>
              <p className="text-gray-400 mb-4">{selectedWallet.user?.name} ({selectedWallet.user?.email})</p>
              <form onSubmit={handleFund} className="space-y-4">
                <p className="text-gray-400 text-sm">User wallet credited in USD. Minimum 1 USD.</p>
                <div>
                  <label className="block text-sm font-medium mb-2">Payment method</label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stripe')}
                      className={`flex-1 min-w-[80px] py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                        paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" /> Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`flex-1 min-w-[80px] py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                        paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <Banknote className="w-4 h-4" /> PayPal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('crypto')}
                      className={`flex-1 min-w-[80px] py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                        paymentMethod === 'crypto' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <Coins className="w-4 h-4" /> Crypto
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="1"
                    className="input-field"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1" disabled={fundLoading}>
                    {fundLoading ? 'Redirecting…' : paymentMethod === 'stripe' ? 'Pay with card' : paymentMethod === 'paypal' ? 'Pay with PayPal' : 'Pay with crypto'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFundModal(false);
                      setFormData({ amount: '', currency: 'usd' });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
