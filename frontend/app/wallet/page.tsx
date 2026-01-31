'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Wallet, ArrowUp, ArrowDown, CreditCard, Coins, Copy, Check } from 'lucide-react';
import CryptoIcon from '@/components/CryptoIcon';

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe');
  const [depositCurrency, setDepositCurrency] = useState<'usd' | 'btc' | 'eth' | 'usdt'>('usd');
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'usd',
  });
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
  const [depositInstructions, setDepositInstructions] = useState<{
    address: string;
    amount: number;
    currency: string;
    network?: string;
    reference: string;
    instructions: string;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(null), 2000);
    });
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  useEffect(() => {
    if (paymentMethod !== 'crypto' || !showDeposit) return;
    api.get('/crypto/market').then((res) => {
      const list = res.data?.market || [];
      const prices: Record<string, number> = {};
      list.forEach((c: any) => {
        if (c.symbol) prices[c.symbol.toLowerCase()] = c.price || 0;
      });
      setCryptoPrices(prices);
    }).catch(() => {
      api.get('/crypto/prices').then((res) => {
        const list = res.data?.assets || res.data?.market || [];
        const prices: Record<string, number> = {};
        list.forEach((c: any) => {
          if (c.symbol) prices[c.symbol.toLowerCase()] = c.price || 0;
        });
        setCryptoPrices(prices);
      }).catch(() => setCryptoPrices({}));
    });
  }, [paymentMethod, showDeposit]);

  // Show success/cancel toast when returning from payment provider
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'cancelled') {
      toast.error('Payment was cancelled.');
      window.history.replaceState({}, '', '/wallet');
      return;
    }
    if (payment === 'success') {
      toast.success('Payment successful. Your wallet has been credited.');
      window.history.replaceState({}, '', '/wallet');
      fetchWallet();
    }
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallets');
      setWallet(res.data.wallet);
    } catch (error) {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    const isCryptoDeposit = paymentMethod === 'crypto' && depositCurrency !== 'usd';
    const minAmount = isCryptoDeposit
      ? (depositCurrency === 'usdt' ? 1 : 0.0001)
      : 1;
    if (!Number.isFinite(amount) || amount < minAmount) {
      toast.error(isCryptoDeposit ? `Minimum ${depositCurrency.toUpperCase()} is ${minAmount}` : 'Minimum deposit is 1 USD');
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const successUrl = `${origin}/wallet?payment=success&provider=${paymentMethod}`;
    const cancelUrl = `${origin}/wallet?payment=cancelled`;
    setDepositLoading(true);
    try {
      let endpoint = '/payments/create-checkout-session';
      let body: Record<string, unknown> = { successUrl, cancelUrl };
      if (paymentMethod === 'crypto') {
        endpoint = '/payments/create-crypto-charge';
        if (depositCurrency === 'usd') {
          body.amount = amount;
        } else {
          body.creditCurrency = depositCurrency;
          body.creditAmount = amount;
        }
      } else {
        body.amount = amount;
      }
      const res = await api.post(endpoint, body);
      const url = res.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      if (res.data?.useAddress && res.data?.address) {
        setDepositInstructions({
          address: res.data.address,
          amount: res.data.amount,
          currency: res.data.currency,
          network: res.data.network,
          reference: res.data.reference,
          instructions: res.data.instructions || '',
        });
        setFormData({ ...formData, amount: '' });
        return;
      }
      toast.error('Could not start payment');
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;
      const msg = data?.message || (Array.isArray(data?.errors) && data.errors[0]?.msg) || error.message || 'Deposit failed';
      if (paymentMethod === 'crypto' && (status === 503 || (msg && msg.toLowerCase().includes('not configured')))) {
        if (depositCurrency !== 'usd') {
          try {
            const fallback = await api.post('/payments/request-crypto-deposit', {
              creditCurrency: depositCurrency,
              creditAmount: amount,
            });
            if (fallback.data?.useAddress && fallback.data?.address) {
              setDepositInstructions({
                address: fallback.data.address,
                amount: fallback.data.amount,
                currency: fallback.data.currency,
                network: fallback.data.network,
                reference: fallback.data.reference,
                instructions: fallback.data.instructions || '',
              });
              setFormData({ ...formData, amount: '' });
              toast.success('Deposit instructions ready. Send the amount to the address below.');
              return;
            }
          } catch {
            toast.error('Deposit addresses are not configured. Add DEPOSIT_BTC_ADDRESS, DEPOSIT_ETH_ADDRESS, or DEPOSIT_USDT_ADDRESS to your server .env');
            setDepositLoading(false);
            return;
          }
        } else {
          toast.error('To deposit USD via crypto, Coinbase Commerce is required. Choose BTC, ETH, or USDT to use deposit addresses instead.');
          setDepositLoading(false);
          return;
        }
      }
      if (!error.response) toast.error('Network error. Is the server running? Check the terminal for errors.');
      else toast.error(msg);
      if (process.env.NODE_ENV === 'development') {
        console.error('Deposit error:', status, data || error.message);
      }
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/wallets/withdraw', formData);
      toast.success('Withdrawal successful');
      setShowWithdraw(false);
      setFormData({ amount: '', currency: 'usd' });
      fetchWallet();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  const currencies = ['usd', 'btc', 'eth', 'usdt'];

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Wallet</h1>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {currencies.map((currency) => (
                <div key={currency} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {currency === 'usd' ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <span className="text-white font-bold">$</span>
                        </div>
                      ) : (
                        <CryptoIcon symbol={currency.toUpperCase()} size={40} className="rounded-full" />
                      )}
                      <div>
                        <p className="text-gray-400 text-sm">{currency === 'usdt' ? 'USDT (ERC20)' : currency.toUpperCase()}</p>
                        <p className="text-2xl font-bold">
                          {(wallet?.balances?.[currency] || 0).toFixed(currency === 'usd' || currency === 'usdt' ? 2 : 6)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Deposit</h2>
                {depositInstructions ? (
                  <div className="space-y-4">
                    {depositInstructions.network && (
                      <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/30 px-3 py-2">
                        <span className="text-blue-400 font-medium">Network:</span>
                        <span className="font-mono">{depositInstructions.network}</span>
                        {depositInstructions.currency === 'usdt' && (
                          <span className="text-gray-400 text-sm">(Send only USDT on this network)</span>
                        )}
                      </div>
                    )}
                    <p className="text-gray-400 text-sm">{depositInstructions.instructions}</p>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                      <p className="font-mono font-bold text-lg">{depositInstructions.amount} {depositInstructions.currency.toUpperCase()}{depositInstructions.network ? ` (${depositInstructions.network})` : ''}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Address{depositInstructions.network ? ` · ${depositInstructions.network}` : ''}</label>
                      <div className="flex gap-2 items-center">
                        <code className="flex-1 break-all text-sm bg-white/5 px-2 py-2 rounded">{depositInstructions.address}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(depositInstructions!.address, 'addr')}
                          className="p-2 rounded-lg border border-white/20 hover:bg-white/10"
                        >
                          {copied === 'addr' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Reference (include in memo if possible)</label>
                      <div className="flex gap-2 items-center">
                        <code className="flex-1 break-all text-sm bg-white/5 px-2 py-2 rounded">{depositInstructions.reference}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(depositInstructions!.reference, 'ref')}
                          className="p-2 rounded-lg border border-white/20 hover:bg-white/10"
                        >
                          {copied === 'ref' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-amber-400/90 text-xs">After sending, your deposit will be credited once confirmed. Contact support with your reference if needed.</p>
                    <button
                      type="button"
                      onClick={() => setDepositInstructions(null)}
                      className="btn-secondary w-full"
                    >
                      Done
                    </button>
                  </div>
                ) : !showDeposit ? (
                  <button
                    onClick={() => setShowDeposit(true)}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    <ArrowUp className="w-5 h-5 mr-2" />
                    Deposit Funds
                  </button>
                ) : (
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <p className="text-gray-400 text-sm">
                      {paymentMethod === 'crypto'
                        ? 'Deposit in USD or crypto (BTC, ETH, USDT ERC20). Minimum 1 USD equivalent.'
                        : 'Card is in USD. Minimum 1 USD.'}
                    </p>
                    <div>
                      <label className="block text-sm font-medium mb-2">Payment method</label>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => { setPaymentMethod('stripe'); setDepositCurrency('usd'); }}
                          className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                            paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" /> Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('crypto')}
                          className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                            paymentMethod === 'crypto' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <Coins className="w-4 h-4" /> Crypto
                        </button>
                      </div>
                    </div>
                    {paymentMethod === 'crypto' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Deposit in</label>
                        <div className="flex gap-2 flex-wrap">
                          {(['usd', 'btc', 'eth', 'usdt'] as const).map((cur) => (
                            <button
                              key={cur}
                              type="button"
                              onClick={() => setDepositCurrency(cur)}
                              className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition ${
                                depositCurrency === cur ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/20 hover:border-white/40'
                              }`}
                            >
                              {cur === 'usd' ? (
                                <span className="font-bold">$</span>
                              ) : (
                                <CryptoIcon symbol={cur.toUpperCase()} size={18} className="rounded-full" />
                              )}
                              <span>{cur === 'usdt' ? 'USDT (ERC20)' : cur.toUpperCase()}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Amount {paymentMethod === 'crypto' ? `(${depositCurrency.toUpperCase()})` : '(USD)'}
                      </label>
                      <input
                        type="number"
                        step={depositCurrency === 'usdt' || depositCurrency === 'usd' ? '0.01' : '0.0001'}
                        min={depositCurrency === 'usdt' || depositCurrency === 'usd' ? 1 : 0.0001}
                        required
                        className="input-field"
                        placeholder={depositCurrency === 'usdt' || depositCurrency === 'usd' ? '0.00' : '0.0000'}
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                      {paymentMethod === 'crypto' && depositCurrency !== 'usd' && cryptoPrices[depositCurrency] && formData.amount && (
                        <p className="text-gray-400 text-sm mt-1">
                          ≈ ${((parseFloat(formData.amount) || 0) * cryptoPrices[depositCurrency]).toFixed(2)} USD
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="btn-primary flex-1" disabled={depositLoading}>
                        {depositLoading
                          ? 'Redirecting…'
                          : paymentMethod === 'stripe'
                            ? 'Pay with card'
                            : depositCurrency === 'usd'
                              ? 'Pay with crypto (USD)'
                              : `Deposit ${depositCurrency.toUpperCase()}`}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeposit(false);
                          setFormData({ amount: '', currency: 'usd' });
                        }}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="card">
                <h2 className="text-xl font-bold mb-4">Withdraw</h2>
                {!showWithdraw ? (
                  <button
                    onClick={() => setShowWithdraw(true)}
                    className="btn-secondary w-full flex items-center justify-center"
                  >
                    <ArrowDown className="w-5 h-5 mr-2" />
                    Withdraw Funds
                  </button>
                ) : (
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Currency</label>
                      <select
                        className="input-field"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      >
                        {currencies.map((c) => (
                          <option key={c} value={c}>{c.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="input-field"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="btn-secondary flex-1">
                        Withdraw
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowWithdraw(false);
                          setFormData({ amount: '', currency: 'usd' });
                        }}
                        className="btn-primary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
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
