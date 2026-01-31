'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { setAuth, clearAuth, isAuthenticated, isAdmin } from '@/lib/auth';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Shield, Users, DollarSign, TrendingUp, FileText, Gift, Wallet } from 'lucide-react';
import AdminNavbar from '@/components/Layout/AdminNavbar';

function AdminLoginForm({ reason }: { reason: string | null }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reason === 'admin_required') {
      if (isAdmin()) return;
      clearAuth();
      toast('Please sign in with an admin account.', { icon: '🔐' });
      router.replace('/admin', { scroll: false });
    }
  }, [reason, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      if (res.data.user.role !== 'admin') {
        toast.error('Access denied. Admin credentials required.');
        setLoading(false);
        return;
      }
      setAuth(res.data.token, res.data.user);
      toast.success('Admin login successful!');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="heading-2 text-white mb-2">Admin Access</h1>
              <p className="text-gray-400">Sign in to access the admin dashboard</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="input-field pl-12"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    className="input-field pl-12"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded bg-white/5 border-white/10 text-yellow-500 focus:ring-yellow-500" />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <Link href="/admin/forgot-password" className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                {loading ? 'Signing in...' : 'Sign In as Admin'}
                {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-center text-gray-400 text-sm">
                Regular user?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  User Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrades: 0,
    totalTransactions: 0,
    pendingTrades: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, tradesRes, transactionsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/trades'),
          api.get('/admin/transactions'),
        ]);
        const pendingTrades = tradesRes.data.trades.filter((t: any) => t.status === 'pending').length;
        setStats({
          totalUsers: usersRes.data.users.length,
          totalTrades: tradesRes.data.trades.length,
          totalTransactions: transactionsRes.data.transactions.length,
          pendingTrades,
        });
      } catch (error) {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminNavbar />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-blue-400" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Trades</p>
                  <p className="text-3xl font-bold">{stats.totalTrades}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-400" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Transactions</p>
                  <p className="text-3xl font-bold">{stats.totalTransactions}</p>
                </div>
                <DollarSign className="w-12 h-12 text-yellow-400" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Pending Trades</p>
                  <p className="text-3xl font-bold">{stats.pendingTrades}</p>
                </div>
                <FileText className="w-12 h-12 text-orange-400" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/users" className="card hover:scale-105 transition-transform">
              <Users className="w-10 h-10 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">User Management</h3>
              <p className="text-gray-400 text-sm">Manage users, KYC, and accounts</p>
            </Link>
            <Link href="/admin/trades" className="card hover:scale-105 transition-transform">
              <TrendingUp className="w-10 h-10 text-green-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">Trade Management</h3>
              <p className="text-gray-400 text-sm">Approve or reject trades</p>
            </Link>
            <Link href="/admin/transactions" className="card hover:scale-105 transition-transform">
              <DollarSign className="w-10 h-10 text-yellow-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">Transactions</h3>
              <p className="text-gray-400 text-sm">View all transactions</p>
            </Link>
            <Link href="/admin/giftcards" className="card hover:scale-105 transition-transform">
              <Gift className="w-10 h-10 text-purple-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">Gift Cards</h3>
              <p className="text-gray-400 text-sm">Manage gift card rates</p>
            </Link>
            <Link href="/admin/wallets" className="card hover:scale-105 transition-transform">
              <Wallet className="w-10 h-10 text-cyan-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">Wallets</h3>
              <p className="text-gray-400 text-sm">View and manage wallets</p>
            </Link>
            <Link href="/admin/support" className="card hover:scale-105 transition-transform">
              <FileText className="w-10 h-10 text-orange-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">Support Tickets</h3>
              <p className="text-gray-400 text-sm">Handle support requests</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPageContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  if (isAuthenticated() && isAdmin()) {
    return <AdminDashboard />;
  }
  return <AdminLoginForm reason={reason} />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
