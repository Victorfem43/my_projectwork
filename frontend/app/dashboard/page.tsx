'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/api';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';
import CryptoIcon from '@/components/CryptoIcon';

export default function DashboardPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cryptoPrices, setCryptoPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, transactionsRes, pricesRes] = await Promise.all([
        api.get('/wallets'),
        api.get('/transactions'),
        api.get('/crypto/prices'),
      ]);

      setWallet(walletRes.data.wallet);
      setTransactions(transactionsRes.data.transactions.slice(0, 10));
      setCryptoPrices(pricesRes.data.assets);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = wallet?.balances
    ? (wallet.balances.usd || 0) +
      (wallet.balances.btc || 0) * (cryptoPrices.find((p) => p.symbol === 'BTC')?.price || 0) +
      (wallet.balances.eth || 0) * (cryptoPrices.find((p) => p.symbol === 'ETH')?.price || 0) +
      (wallet.balances.usdt || 0)
    : 0;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Dashboard</h1>

            {/* Total Balance */}
            <div className="card mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">Total Balance</p>
                    <p className="text-2xl sm:text-3xl font-bold">${totalBalance.toFixed(2)}</p>
                  </div>
                </div>
                <Link href="/wallet" className="btn-secondary w-full sm:w-auto text-center">
                  View Wallet
                </Link>
              </div>
            </div>

            {/* Crypto Balances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">$</span>
                    </div>
                    <span className="text-gray-400 text-sm">USD</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold">${(wallet?.balances?.usd || 0).toFixed(2)}</p>
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CryptoIcon symbol="BTC" size={32} className="rounded-full" />
                    <span className="text-gray-400 text-sm">BTC</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold">{(wallet?.balances?.btc || 0).toFixed(6)}</p>
                <p className="text-gray-400 text-sm mt-1">
                  ${((wallet?.balances?.btc || 0) * (cryptoPrices.find((p) => p.symbol === 'BTC')?.price || 0)).toFixed(2)}
                </p>
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CryptoIcon symbol="ETH" size={32} className="rounded-full" />
                    <span className="text-gray-400 text-sm">ETH</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold">{(wallet?.balances?.eth || 0).toFixed(4)}</p>
                <p className="text-gray-400 text-sm mt-1">
                  ${((wallet?.balances?.eth || 0) * (cryptoPrices.find((p) => p.symbol === 'ETH')?.price || 0)).toFixed(2)}
                </p>
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CryptoIcon symbol="USDT" size={32} className="rounded-full" />
                    <span className="text-gray-400 text-sm">USDT (ERC20)</span>
                  </div>
                  <ArrowDownRight className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold">{(wallet?.balances?.usdt || 0).toFixed(2)}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Link href="/trade/crypto" className="card hover:scale-105 transition-transform text-center">
                <TrendingUp className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Trade Crypto</h3>
                <p className="text-gray-400 text-sm">Buy, sell, or trade cryptocurrencies</p>
              </Link>
              <Link href="/trade/giftcards" className="card hover:scale-105 transition-transform text-center">
                <Wallet className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Gift Cards</h3>
                <p className="text-gray-400 text-sm">Buy and sell gift cards</p>
              </Link>
              <Link href="/wallet" className="card hover:scale-105 transition-transform text-center">
                <Wallet className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Wallet</h3>
                <p className="text-gray-400 text-sm">Manage your funds</p>
              </Link>
            </div>

            {/* Recent Transactions */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Transactions</h2>
                <Link href="/transactions" className="text-blue-400 hover:text-blue-300 text-sm">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No transactions yet</p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                      <div>
                        <p className="font-semibold">{tx.description || `${tx.type} ${tx.currency.toUpperCase()}`}</p>
                        <p className="text-gray-400 text-sm">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === 'deposit' ? 'text-green-400' : tx.type === 'withdrawal' ? 'text-red-400' : 'text-white'}`}>
                          {tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : ''}
                          {tx.amount} {tx.currency.toUpperCase()}
                        </p>
                        <p className={`text-sm ${tx.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
