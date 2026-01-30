'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNavbar from '@/components/Layout/AdminNavbar';
import api from '@/lib/api';
import Link from 'next/link';
import { Users, DollarSign, TrendingUp, FileText, Gift, Wallet } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrades: 0,
    totalTransactions: 0,
    pendingTrades: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

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
            <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Grid */}
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

            {/* Quick Actions */}
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
    </ProtectedRoute>
  );
}
