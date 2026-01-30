'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data.user);
      setFormData({ name: res.data.user.name });
    } catch (error) {
      toast.error('Failed to load user data');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/users/update', formData);
      toast.success('Profile updated successfully');
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
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
            <h1 className="text-4xl font-bold mb-8">Settings</h1>

            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold">Profile</h2>
                </div>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      disabled
                      className="input-field opacity-50 cursor-not-allowed"
                      value={user?.email || ''}
                    />
                    <p className="text-gray-400 text-sm mt-1">Email cannot be changed</p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>

              {/* Security Settings */}
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-green-400" />
                  <h2 className="text-2xl font-bold">Security</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div>
                      <p className="font-semibold">Two-Factor Authentication</p>
                      <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                    </div>
                    <button className="btn-secondary">Enable</button>
                  </div>
                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div>
                      <p className="font-semibold">KYC Status</p>
                      <p className="text-gray-400 text-sm">
                        Status: <span className={`${
                          user?.kycStatus === 'approved' ? 'text-green-400' :
                          user?.kycStatus === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {user?.kycStatus || 'pending'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <Bell className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold">Notifications</h2>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 p-4 glass rounded-lg cursor-pointer">
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                    <span>Email notifications</span>
                  </label>
                  <label className="flex items-center space-x-3 p-4 glass rounded-lg cursor-pointer">
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                    <span>Trade alerts</span>
                  </label>
                  <label className="flex items-center space-x-3 p-4 glass rounded-lg cursor-pointer">
                    <input type="checkbox" className="w-5 h-5" />
                    <span>Marketing emails</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
