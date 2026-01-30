'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Gift, ShoppingCart, DollarSign, Copy, Check, ExternalLink } from 'lucide-react';
import GiftCardIcon from '@/components/GiftCardIcon';

export default function GiftCardsPage() {
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [formData, setFormData] = useState({
    faceValue: '',
    giftCardCode: '',
    redeemCode: '',
  });
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{ brand: string; amount: number; redeemUrl: string | null } | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchGiftCards();
    fetchTrades();
  }, []);

  const fetchGiftCards = async () => {
    try {
      const res = await api.get('/giftcards');
      setGiftCards(res.data.giftCards);
    } catch (error) {
      toast.error('Failed to load gift cards');
    }
  };

  const fetchTrades = async () => {
    try {
      const res = await api.get('/giftcards/trades');
      setTrades(res.data.trades);
    } catch (error) {
      console.error('Failed to fetch trades');
    }
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/giftcards/buy', {
        giftCardId: selectedCard._id,
        faceValue: parseFloat(formData.faceValue),
      });
      toast.success('Purchase order created');
      setShowBuyModal(false);
      setFormData({ faceValue: '', giftCardCode: '', redeemCode: '' });
      fetchTrades();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('giftCardId', selectedCard._id);
      formDataToSend.append('faceValue', formData.faceValue);
      formDataToSend.append('giftCardCode', formData.giftCardCode);

      await api.post('/giftcards/sell', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Sell order created');
      setShowSellModal(false);
      setFormData({ faceValue: '', giftCardCode: '', redeemCode: '' });
      fetchTrades();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Sell failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', file);
      await api.post('/giftcards/upload', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRedeemLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = formData.redeemCode.trim();
    if (!code) {
      toast.error('Enter a code');
      return;
    }
    setRedeemLoading(true);
    setRedeemResult(null);
    try {
      const res = await api.get('/giftcards/redeem-info', { params: { code } });
      setRedeemResult({
        brand: res.data.brand,
        amount: res.data.amount,
        redeemUrl: res.data.redeemUrl || null,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Code not found');
    } finally {
      setRedeemLoading(false);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      toast.success('Code copied');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const myCodes = trades.filter((t) => t.tradeType === 'buy' && t.status === 'approved' && t.deliveredCode);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Gift Card Trading</h1>

            {/* Redeem a code + My gift card codes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5" /> Redeem a code
                </h2>
                <p className="text-gray-400 text-sm mb-4">Enter a gift card code you received after a purchase to get redemption instructions.</p>
                <form onSubmit={handleRedeemLookup} className="space-y-3">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Paste your code here"
                    value={formData.redeemCode}
                    onChange={(e) => setFormData({ ...formData, redeemCode: e.target.value })}
                  />
                  <button type="submit" disabled={redeemLoading} className="btn-primary w-full">
                    {redeemLoading ? 'Looking up...' : 'Get redeem link'}
                  </button>
                </form>
                {redeemResult && (
                  <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-green-400 font-medium">{redeemResult.brand} · ${redeemResult.amount}</p>
                    <p className="text-gray-400 text-sm mt-1">Redeem this card at the merchant&apos;s official site.</p>
                    {redeemResult.redeemUrl && (
                      <a
                        href={redeemResult.redeemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 text-blue-400 hover:underline"
                      >
                        Open redeem page <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="card">
                <h2 className="text-xl font-bold mb-4">My gift card codes</h2>
                <p className="text-gray-400 text-sm mb-4">Codes from your approved purchases. Copy and redeem at the merchant.</p>
                {myCodes.length === 0 ? (
                  <p className="text-gray-500 py-4">No codes yet. Buy a gift card and admin will deliver your code after approval.</p>
                ) : (
                  <div className="space-y-3">
                    {myCodes.map((t) => (
                      <div key={t._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                        <div>
                          <p className="font-semibold">{t.asset}</p>
                          <p className="text-gray-400 text-sm">${t.amount} · {new Date(t.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-black/30 px-2 py-1 rounded max-w-[140px] truncate" title={t.deliveredCode}>
                            {t.deliveredCode}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyCode(t.deliveredCode, t._id)}
                            className="p-2 rounded-lg border border-white/20 hover:bg-white/10"
                          >
                            {copiedId === t._id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Gift Cards to trade */}
            <h2 className="text-2xl font-bold mb-4">Available to trade</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {giftCards.length === 0 ? (
                <div className="col-span-full card text-center py-12">
                  <p className="text-gray-400">Loading gift cards...</p>
                </div>
              ) : (
                giftCards.map((card) => (
                <div key={card._id} className="card hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                      <GiftCardIcon brand={card.brand} size={48} className="w-full h-full" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${card.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {card.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{card.brand}</h3>
                  <p className="text-gray-400 text-sm mb-4">{card.type}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Buy Rate:</span>
                      <span className="text-green-400 font-semibold">{card.buyRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sell Rate:</span>
                      <span className="text-blue-400 font-semibold">{card.sellRate}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCard(card);
                        setShowBuyModal(true);
                      }}
                      className="flex-1 btn-primary text-sm py-2"
                    >
                      <ShoppingCart className="w-4 h-4 inline mr-1" />
                      Buy
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCard(card);
                        setShowSellModal(true);
                      }}
                      className="flex-1 btn-secondary text-sm py-2"
                    >
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Sell
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>

            {/* Trade History */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400">Brand</th>
                      <th className="text-left py-3 px-4 text-gray-400">Face Value</th>
                      <th className="text-left py-3 px-4 text-gray-400">Rate</th>
                      <th className="text-left py-3 px-4 text-gray-400">Total</th>
                      <th className="text-left py-3 px-4 text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.slice(0, 10).map((trade) => (
                      <tr key={trade._id} className="border-b border-white/10">
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            trade.tradeType === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.tradeType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{trade.asset}</td>
                        <td className="py-3 px-4">${trade.amount}</td>
                        <td className="py-3 px-4">{trade.price}%</td>
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
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {new Date(trade.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {trades.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No trades yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Buy Modal */}
        {showBuyModal && selectedCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Buy {selectedCard.brand} Gift Card</h2>
              <form onSubmit={handleBuy} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Face Value (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="1"
                    className="input-field"
                    placeholder="100.00"
                    value={formData.faceValue}
                    onChange={(e) => setFormData({ ...formData, faceValue: e.target.value })}
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    You'll pay: ${((parseFloat(formData.faceValue) || 0) * (selectedCard.buyRate / 100)).toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Processing...' : 'Buy Gift Card'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBuyModal(false);
                      setFormData({ faceValue: '', giftCardCode: '', redeemCode: '' });
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

        {/* Sell Modal */}
        {showSellModal && selectedCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Sell {selectedCard.brand} Gift Card</h2>
              <form onSubmit={handleSell} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Face Value (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="1"
                    className="input-field"
                    placeholder="100.00"
                    value={formData.faceValue}
                    onChange={(e) => setFormData({ ...formData, faceValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gift Card Code</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Enter gift card code"
                    value={formData.giftCardCode}
                    onChange={(e) => setFormData({ ...formData, giftCardCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Proof (Optional)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="input-field"
                      disabled={uploading}
                    />
                    {uploading && <span className="text-gray-400 text-sm">Uploading...</span>}
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  You'll receive: ${((parseFloat(formData.faceValue) || 0) * (selectedCard.sellRate / 100)).toFixed(2)}
                </p>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="btn-secondary flex-1">
                    {loading ? 'Processing...' : 'Sell Gift Card'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSellModal(false);
                      setFormData({ faceValue: '', giftCardCode: '', redeemCode: '' });
                    }}
                    className="btn-primary flex-1"
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
