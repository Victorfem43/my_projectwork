'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ShoppingCart, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import CryptoIcon from '@/components/CryptoIcon';
import GiftCardIcon from '@/components/GiftCardIcon';

export default function BuyPage() {
  const [cryptoMarket, setCryptoMarket] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'crypto' | 'giftcards'>('crypto');
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [nextUpdateIn, setNextUpdateIn] = useState(10);

  useEffect(() => {
    fetchData();
    const REFRESH_MS = 30 * 60 * 1000; // 30 minutes
    const interval = setInterval(fetchCryptoMarket, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab !== 'crypto') return;
    let n = 30 * 60; // seconds until next refresh
    const t = setInterval(() => {
      n = n <= 0 ? 30 * 60 : n - 1;
      setNextUpdateIn(n);
    }, 1000);
    return () => clearInterval(t);
  }, [activeTab, cryptoMarket.length]);

  const fetchCryptoMarket = async () => {
    try {
      const res = await api.get('/crypto/market');
      setCryptoMarket(res.data?.market || []);
    } catch (error) {
      try {
        const fallback = await api.get('/crypto/prices');
        setCryptoMarket(fallback.data?.assets || []);
      } catch {
        console.error('Failed to fetch crypto market');
      }
    } finally {
      setCryptoLoading(false);
    }
  };

  const fetchData = async () => {
    setCryptoLoading(true);
    try {
      const [cryptoRes, giftCardsRes] = await Promise.all([
        api.get('/crypto/market').catch(() => api.get('/crypto/prices')),
        api.get('/giftcards'),
      ]);
      setCryptoMarket(cryptoRes.data?.market || cryptoRes.data?.assets || []);
      setGiftCards(giftCardsRes.data.giftCards || []);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setCryptoLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Buy</h1>
            <p className="text-gray-400 mb-6">Choose cryptocurrency or gift cards to buy. Crypto prices update live from the market.</p>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('crypto')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'crypto'
                    ? 'bg-blue-500 text-white'
                    : 'glass text-gray-300 hover:text-white'
                }`}
              >
                <TrendingUp className="w-5 h-5 inline mr-2" />
                Cryptocurrency
              </button>
              <button
                onClick={() => setActiveTab('giftcards')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'giftcards'
                    ? 'bg-blue-500 text-white'
                    : 'glass text-gray-300 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                Gift Cards
              </button>
            </div>

            {activeTab === 'crypto' ? (
              <>
                <h2 className="text-xl font-bold mb-2">Cryptos to buy</h2>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-gray-400 text-sm">Live market · updates every 30 min</span>
                  <span className="text-gray-500 text-sm">· Next update in {Math.floor(nextUpdateIn / 60)}m</span>
                </div>
                {cryptoLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cryptoMarket.map((asset) => {
                      const isUp = (asset.change24h || 0) >= 0;
                      const spark = asset.sparkline;
                      const min = spark?.length ? Math.min(...spark) : 0;
                      const max = spark?.length ? Math.max(...spark) : 1;
                      const range = max - min || 1;
                      const path = spark?.length ? spark.map((v: number, i: number) => `${(i / (spark.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(' ') : '';
                      return (
                        <Link
                          key={asset.symbol + (asset.id || '')}
                          href="/trade/crypto"
                          className="card hover:scale-[1.02] transition-transform"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {asset.image ? (
                                <img src={asset.image} alt={asset.symbol} className="w-10 h-10 rounded-full" />
                              ) : (
                                <CryptoIcon symbol={asset.symbol} size={40} className="rounded-full" />
                              )}
                              <div>
                                <h3 className="text-xl font-bold">{asset.symbol}</h3>
                                <p className="text-gray-400 text-sm">{asset.name}</p>
                              </div>
                            </div>
                            <span className={`text-sm font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                              {isUp ? '+' : ''}{(asset.change24h || 0).toFixed(2)}% 24h
                            </span>
                          </div>
                          {path ? (
                            <div className="h-12 w-full mb-3 rounded overflow-hidden bg-white/5">
                              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                                <polyline fill="none" stroke={isUp ? '#22c55e' : '#ef4444'} strokeWidth="0.5" points={path} />
                              </svg>
                            </div>
                          ) : null}
                          <p className="text-2xl font-bold mb-4">${(asset.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
                          <button className="btn-primary w-full">Buy {asset.symbol}</button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Gift cards to buy</h2>
                <p className="text-gray-400 text-sm mb-6">Select a gift card brand to buy. You get the face value at the listed rate.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {giftCards.length === 0 ? (
                    <p className="text-gray-400 col-span-full py-8">No gift cards available at the moment.</p>
                  ) : (
                    giftCards.map((card) => (
                      <Link
                        key={card._id}
                        href="/trade/giftcards"
                        className="card hover:scale-[1.02] transition-transform"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                              <GiftCardIcon brand={card.brand} size={48} className="w-full h-full" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">{card.brand}</h3>
                              <p className="text-gray-400 text-sm">{card.type}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                            {card.buyRate}% Rate
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">Face value options available</p>
                        <button className="btn-primary w-full">Buy {card.brand} Gift Card</button>
                      </Link>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
