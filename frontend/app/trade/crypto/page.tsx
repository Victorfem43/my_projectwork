'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { TrendingUp, TrendingDown } from 'lucide-react';
import CryptoIcon from '@/components/CryptoIcon';
import type { OHLC } from '@/components/CandlestickChart';

const CandlestickChart = dynamic(() => import('@/components/CandlestickChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-lg bg-white/5 flex items-center justify-center" style={{ height: 320 }}>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>
  ),
});

// Mini 7d sparkline from CoinGecko data
function MiniSparkline({ data, up }: { data: number[] | null; up: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 28;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="flex-shrink-0" viewBox={`0 0 ${w} ${h}`}>
      <polyline
        fill="none"
        stroke={up ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

export default function CryptoTradingPage() {
  const [market, setMarket] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [formData, setFormData] = useState({
    amount: '',
    symbol: 'BTC',
  });
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [marketLoading, setMarketLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [priceFlash, setPriceFlash] = useState<Record<string, 'up' | 'down'>>({});
  const prevPricesRef = useRef<Record<string, number>>({});
  const [ohlc, setOhlc] = useState<OHLC[]>([]);
  const [ohlcLoading, setOhlcLoading] = useState(false);
  const [chartDays, setChartDays] = useState(7);
  const [usingFallbackMarket, setUsingFallbackMarket] = useState(false);

  // Placeholder OHLC when API is rate-limited or fails — chart shows range around current price (deterministic)
  function generateSyntheticOhlc(price: number, days: number): OHLC[] {
    if (!Number.isFinite(price) || price <= 0) return [];
    const now = Math.floor(Date.now() / 1000);
    const interval = Math.max(3600, (days * 24 * 3600) / 30);
    const variation = Math.max(price * 0.004, 0.01);
    const candles: OHLC[] = [];
    let open = price;
    for (let i = 30; i >= 0; i--) {
      const time = now - i * interval;
      const t = i / 30;
      const drift = Math.sin(t * Math.PI * 2) * variation * 0.8 + (t - 0.5) * variation * 0.4;
      const close = Math.max(0.0001, open + drift);
      const high = Math.max(open, close) + variation * 0.3;
      const low = Math.min(open, close) - variation * 0.3;
      candles.push({ time, open, high, low, close });
      open = close;
    }
    return candles;
  }

  useEffect(() => {
    fetchMarket();
    fetchTrades();
    const REFRESH_MS = 30 * 60 * 1000; // 30 minutes
    const interval = setInterval(fetchMarket, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!lastUpdated) return;
    const t = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  // Static fallback when API and DB both fail (e.g. CoinGecko rate limit, no DB)
  const FALLBACK_MARKET = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 97000, change24h: 1.2, marketCapRank: 1, marketCap: 1.9e12, image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3500, change24h: -0.5, marketCapRank: 2, marketCap: 420e9, image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    { id: 'tether', symbol: 'USDT', name: 'Tether', price: 1, change24h: 0, marketCapRank: 3, marketCap: 120e9, image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 700, change24h: 2.1, marketCapRank: 4, marketCap: 100e9, image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', price: 220, change24h: 5.3, marketCapRank: 5, marketCap: 95e9, image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
  ];

  const fetchMarket = async () => {
    try {
      const res = await api.get('/crypto/market');
      const list = res.data?.market || [];
      if (list.length > 0) {
        const flash: Record<string, 'up' | 'down'> = {};
        list.forEach((c: any) => {
          const prev = prevPricesRef.current[c.symbol];
          if (prev != null && c.price != null && prev !== c.price) {
            flash[c.symbol] = c.price > prev ? 'up' : 'down';
          }
          prevPricesRef.current[c.symbol] = c.price;
        });
        setPriceFlash(flash);
        setTimeout(() => setPriceFlash({}), 1500);
        setMarket(list);
        setLastUpdated(new Date());
        setUsingFallbackMarket(false);
        if (!list.find((m: any) => m.symbol === selectedAsset)) {
          setSelectedAsset(list[0].symbol);
        }
        setMarketLoading(false);
        return;
      }
    } catch (error) {
      console.warn('Market API failed, trying fallback:', (error as Error)?.message);
    }
    try {
      const fallback = await api.get('/crypto/prices');
      const list = fallback.data?.assets || fallback.data?.market || [];
      if (list.length > 0) {
        setMarket(list);
        setLastUpdated(new Date());
        setUsingFallbackMarket(false);
        if (!list.find((m: any) => m.symbol === selectedAsset)) {
          setSelectedAsset(list[0].symbol);
        }
        setMarketLoading(false);
        return;
      }
    } catch {
      console.warn('Prices fallback failed');
    }
    setMarket(FALLBACK_MARKET);
    setLastUpdated(new Date());
    setUsingFallbackMarket(true);
    if (!FALLBACK_MARKET.find((m: any) => m.symbol === selectedAsset)) {
      setSelectedAsset(FALLBACK_MARKET[0].symbol);
    }
    setMarketLoading(false);
  };

  const fetchTrades = async () => {
    try {
      const res = await api.get('/crypto/trades');
      setTrades(res.data.trades);
    } catch (error) {
      console.error('Failed to fetch trades');
    }
  };

  const fetchOhlc = async (
    coinId: string | undefined,
    symbol: string,
    days: number,
    currentPrice?: number
  ) => {
    if (!coinId && !symbol) return;
    setOhlcLoading(true);
    try {
      const params: Record<string, string | number> = { days };
      if (coinId) params.id = coinId;
      else params.symbol = symbol;
      const res = await api.get('/crypto/ohlc', { params });
      setOhlc(res.data?.ohlc || []);
    } catch {
      // Don't show 429 or other API errors — show chart with range around current price
      const price = Number(currentPrice);
      if (Number.isFinite(price) && price > 0) {
        setOhlc(generateSyntheticOhlc(price, days));
      } else {
        setOhlc([]);
      }
    } finally {
      setOhlcLoading(false);
    }
  };

  // action is 'buy' or 'sell' from the form that was submitted — only that one runs
  const handleTrade = async (e: React.FormEvent, action: 'buy' | 'sell') => {
    e.preventDefault();
    if (loading) return;
    const amountNum = parseFloat(formData.amount);
    if (!Number.isFinite(amountNum) || amountNum < 0.0001) {
      toast.error('Enter a valid amount (min 0.0001)');
      return;
    }
    setLoading(true);

    try {
      const endpoint = action === 'buy' ? '/crypto/buy' : '/crypto/sell';
      await api.post(endpoint, {
        symbol: selectedAsset || formData.symbol,
        amount: amountNum,
      });
      toast.success(`${action === 'buy' ? 'Buy' : 'Sell'} order created`);
      setFormData({ ...formData, amount: '' });
      fetchTrades();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      const errors = error.response?.data?.errors;
      const firstError = Array.isArray(errors) ? errors[0]?.msg : undefined;
      toast.error(msg || firstError || 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedPrice = market.find((p) => p.symbol === selectedAsset);

  useEffect(() => {
    if (selectedAsset && (selectedPrice?.id || selectedAsset)) {
      fetchOhlc(selectedPrice?.id, selectedAsset, chartDays, selectedPrice?.price);
    } else {
      setOhlc([]);
    }
  }, [selectedAsset, selectedPrice?.id, selectedPrice?.price, chartDays]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Crypto Trading</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Market List - running market */}
              <div className="lg:col-span-1">
                <div className="card mb-6">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h2 className="text-xl font-bold">Live Market</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Updating" />
                      <span className="text-gray-400 text-xs">Updates every 30 min</span>
                      {lastUpdated && (
                        <span className="text-gray-500 text-xs">· Updated {secondsAgo}s ago</span>
                      )}
                      {usingFallbackMarket && (
                        <span className="text-amber-400 text-xs">· Fallback data (live API unavailable)</span>
                      )}
                    </div>
                  </div>
                  {marketLoading ? (
                    <div className="flex justify-center py-8 min-h-[200px]">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto min-h-[240px]">
                      {market.map((asset) => {
                        const flash = priceFlash[asset.symbol];
                        const isUp = (asset.change24h || 0) >= 0;
                        return (
                          <button
                            key={asset.symbol + (asset.id || '')}
                            onClick={() => setSelectedAsset(asset.symbol)}
                            className={`w-full p-3 rounded-lg transition-all text-left ${
                              selectedAsset === asset.symbol
                                ? 'bg-blue-500/20 border border-blue-500'
                                : 'glass hover:bg-white/5'
                            } ${flash === 'up' ? 'bg-green-500/15 border border-green-500/50' : ''} ${flash === 'down' ? 'bg-red-500/15 border border-red-500/50' : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                {asset.image ? (
                                  <img src={asset.image} alt={asset.symbol} className="w-8 h-8 rounded-full flex-shrink-0" />
                                ) : (
                                  <CryptoIcon symbol={asset.symbol} size={32} className="rounded-full flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold">{asset.symbol === 'USDT' ? 'USDT (ERC20)' : asset.symbol}</p>
                                    {asset.marketCapRank != null && (
                                      <span className="text-gray-500 text-xs">#{asset.marketCapRank}</span>
                                    )}
                                  </div>
                                  <p className="text-gray-400 text-xs truncate">{asset.name}</p>
                                </div>
                              </div>
                              <MiniSparkline data={asset.sparkline || null} up={isUp} />
                              <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-sm">${(asset.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
                                <p className={`text-xs ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                  {isUp ? '+' : ''}{(asset.change24h || 0).toFixed(2)}% 24h
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Trading Interface */}
              <div className="lg:col-span-2">
                {selectedPrice && (
                  <>
                    {/* Candlestick chart - forex/trading style */}
                    <div className="card mb-6">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-4">
                          {selectedPrice.image ? (
                            <img src={selectedPrice.image} alt={selectedPrice.symbol} className="w-12 h-12 rounded-full" />
                          ) : (
                            <CryptoIcon symbol={selectedPrice.symbol} size={48} className="rounded-full" />
                          )}
                          <div>
                            <h2 className="text-2xl font-bold">{selectedPrice.symbol} / USD</h2>
                            <p className="text-gray-400">{selectedPrice.name}</p>
                            {selectedPrice.marketCapRank != null && (
                              <p className="text-gray-500 text-sm">Rank #{selectedPrice.marketCapRank} · MCap ${(selectedPrice.marketCap || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex gap-1">
                            {[1, 7, 14, 30].map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setChartDays(d)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition ${chartDays === d ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                              >
                                {d}D
                              </button>
                            ))}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">${(selectedPrice.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
                            <p className={`text-sm ${(selectedPrice.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {(selectedPrice.change24h || 0) >= 0 ? '▲' : '▼'} {(selectedPrice.change24h || 0) >= 0 ? '+' : ''}{(selectedPrice.change24h || 0).toFixed(2)}% 24h
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-white/10 rounded-lg p-2 bg-black/20">
                        <p className="text-gray-400 text-xs mb-2">Candlestick (OHLC) · Green = up, Red = down</p>
                        {ohlcLoading ? (
                          <div className="h-[320px] flex items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                          </div>
                        ) : (
                          <CandlestickChart data={ohlc} height={320} upColor="#22c55e" downColor="#ef4444" />
                        )}
                      </div>
                    </div>

                    {/* Buy/Sell Forms */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Buy Form */}
                      <div className="card">
                        <div className="flex items-center space-x-2 mb-4">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          <h3 className="text-xl font-bold">Buy</h3>
                        </div>
                        <form onSubmit={(e) => handleTrade(e, 'buy')}>
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Amount ({selectedPrice.symbol})</label>
                            <input
                              type="number"
                              step="0.0001"
                              min="0.0001"
                              required
                              className="input-field"
                              placeholder="0.0000"
                              value={tradeType === 'buy' ? formData.amount : ''}
                              onChange={(e) => {
                                setFormData({ ...formData, amount: e.target.value, symbol: selectedAsset });
                                setTradeType('buy');
                              }}
                            />
                            <p className="text-gray-400 text-sm mt-1">
                              ≈ ${((parseFloat(formData.amount) || 0) * (selectedPrice.price || 0)).toFixed(2)} USD
                            </p>
                          </div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50"
                          >
                            {loading ? 'Processing...' : 'Buy ' + selectedPrice.symbol}
                          </button>
                        </form>
                      </div>

                      {/* Sell Form */}
                      <div className="card">
                        <div className="flex items-center space-x-2 mb-4">
                          <TrendingDown className="w-5 h-5 text-red-400" />
                          <h3 className="text-xl font-bold">Sell</h3>
                        </div>
                        <form onSubmit={(e) => handleTrade(e, 'sell')}>
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Amount ({selectedPrice.symbol})</label>
                            <input
                              type="number"
                              step="0.0001"
                              min="0.0001"
                              required
                              className="input-field"
                              placeholder="0.0000"
                              value={tradeType === 'sell' ? formData.amount : ''}
                              onChange={(e) => {
                                setFormData({ ...formData, amount: e.target.value, symbol: selectedAsset });
                                setTradeType('sell');
                              }}
                            />
                            <p className="text-gray-400 text-sm mt-1">
                              ≈ ${((parseFloat(formData.amount) || 0) * (selectedPrice.price || 0)).toFixed(2)} USD
                            </p>
                          </div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                          >
                            {loading ? 'Processing...' : 'Sell ' + selectedPrice.symbol}
                          </button>
                        </form>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Trade History */}
            <div className="card mt-8">
              <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400">Asset</th>
                      <th className="text-left py-3 px-4 text-gray-400">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400">Price</th>
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
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
