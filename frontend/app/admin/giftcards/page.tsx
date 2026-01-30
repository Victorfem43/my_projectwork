'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNavbar from '@/components/Layout/AdminNavbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Edit, Gift, Plus } from 'lucide-react';
import GiftCardIcon from '@/components/GiftCardIcon';

export default function AdminGiftCardsPage() {
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    buyRate: '',
    sellRate: '',
  });
  const [addForm, setAddForm] = useState({
    brand: '',
    type: 'E-Gift Card',
    faceValue: '100',
    buyRate: '97',
    sellRate: '90',
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      const res = await api.get('/admin/giftcards');
      setGiftCards(res.data.giftCards);
    } catch (error) {
      toast.error('Failed to load gift cards');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRates = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/set-rates', {
        type: 'giftcard',
        assetId: editingCard._id,
        buyRate: parseFloat(formData.buyRate),
        sellRate: parseFloat(formData.sellRate),
      });
      toast.success('Rates updated');
      setEditingCard(null);
      fetchGiftCards();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleAddGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await api.post('/admin/giftcards', {
        brand: addForm.brand.trim(),
        type: addForm.type.trim(),
        faceValue: parseFloat(addForm.faceValue),
        buyRate: parseFloat(addForm.buyRate),
        sellRate: parseFloat(addForm.sellRate),
      });
      toast.success('Gift card created');
      setShowAddModal(false);
      setAddForm({ brand: '', type: 'E-Gift Card', faceValue: '100', buyRate: '97', sellRate: '90' });
      fetchGiftCards();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Create failed');
    } finally {
      setAddLoading(false);
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
            <h1 className="text-4xl font-bold mb-8">Gift Card Management</h1>

            <div className="mb-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add gift card
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {giftCards.map((card) => (
                <div key={card._id} className="card">
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
                    <div className="flex justify-between">
                      <span className="text-gray-400">Buy Rate:</span>
                      <span className="text-green-400 font-semibold">{card.buyRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sell Rate:</span>
                      <span className="text-blue-400 font-semibold">{card.sellRate}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCard(card);
                      setFormData({ buyRate: card.buyRate.toString(), sellRate: card.sellRate.toString() });
                    }}
                    className="btn-secondary w-full flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Rates
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add gift card modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Add gift card</h2>
              <form onSubmit={handleAddGiftCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Brand</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Amazon, iTunes"
                    value={addForm.brand}
                    onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. E-Gift Card"
                    value={addForm.type}
                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Default face value (USD)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    className="input-field"
                    value={addForm.faceValue}
                    onChange={(e) => setAddForm({ ...addForm, faceValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Buy rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="input-field"
                    value={addForm.buyRate}
                    onChange={(e) => setAddForm({ ...addForm, buyRate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sell rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="input-field"
                    value={addForm.sellRate}
                    onChange={(e) => setAddForm({ ...addForm, sellRate: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1" disabled={addLoading}>
                    {addLoading ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Edit {editingCard.brand} Rates</h2>
              <form onSubmit={handleUpdateRates} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Buy Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    max="100"
                    className="input-field"
                    value={formData.buyRate}
                    onChange={(e) => setFormData({ ...formData, buyRate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sell Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    max="100"
                    className="input-field"
                    value={formData.sellRate}
                    onChange={(e) => setFormData({ ...formData, sellRate: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    Update Rates
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCard(null)}
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
