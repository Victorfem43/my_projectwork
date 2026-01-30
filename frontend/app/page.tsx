import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe, TrendingUp, Gift, Lock, CheckCircle, Star, Users, BarChart3 } from 'lucide-react';
import CryptoIcon from '@/components/CryptoIcon';
import GiftCardIcon from '@/components/GiftCardIcon';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      <Navbar />
      
      {/* Hero Section - pt clears fixed navbar + comfortable gap */}
      <section className="relative section overflow-hidden pt-40 sm:pt-44">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-blue-600/10"></div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                <Star className="w-4 h-4 fill-blue-400" />
                Trusted by 50,000+ traders worldwide
              </div>
              
              <h1 className="heading-1 text-white">
                Trade{' '}
                <span className="gradient-text">Crypto</span>
                <br />
                & Gift Cards{' '}
                <span className="gradient-text">Securely</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                The most advanced platform for cryptocurrency and gift card trading. 
                Fast, secure, and built for professionals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register" className="btn-primary inline-flex items-center justify-center group">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/trade/crypto" className="btn-outline inline-flex items-center justify-center">
                  Start Trading
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-8">
                <div>
                  <p className="text-3xl font-bold text-white">$2.5B+</p>
                  <p className="text-sm text-gray-400 mt-1">Trading Volume</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">50K+</p>
                  <p className="text-sm text-gray-400 mt-1">Active Users</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">99.9%</p>
                  <p className="text-sm text-gray-400 mt-1">Uptime</p>
                </div>
              </div>
            </div>
            
            <div className="relative animate-slide-in">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 blur-3xl rounded-full"></div>
              <div className="relative glass-strong rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center shadow-lg overflow-hidden">
                      <CryptoIcon symbol="BTC" size={56} className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Bitcoin</p>
                      <p className="text-white font-bold text-lg">$42,350.00</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-green-400 font-semibold">+2.5%</span>
                    <p className="text-gray-400 text-xs mt-1">24h</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center shadow-lg overflow-hidden">
                      <CryptoIcon symbol="ETH" size={56} className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Ethereum</p>
                      <p className="text-white font-bold text-lg">$2,580.00</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-green-400 font-semibold">+1.8%</span>
                    <p className="text-gray-400 text-xs mt-1">24h</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center shadow-lg overflow-hidden">
                      <CryptoIcon symbol="USDT" size={56} className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">USDT (ERC20)</p>
                      <p className="text-white font-bold text-lg">$1.00</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 font-semibold">0.0%</span>
                    <p className="text-gray-400 text-xs mt-1">24h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-gradient-to-b from-transparent to-white/5">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 text-white mb-4">Why Choose VICKYEXCHANGE</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built for traders who demand the best in security, speed, and reliability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-hover group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Bank-Level Security</h3>
              <p className="text-gray-400 leading-relaxed">
                Multi-layer encryption, cold storage, and 2FA protection for your assets
              </p>
            </div>

            <div className="card-hover group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400 leading-relaxed">
                Execute trades in milliseconds with our high-performance trading engine
              </p>
            </div>

            <div className="card-hover group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Best Rates</h3>
              <p className="text-gray-400 leading-relaxed">
                Competitive rates and low fees. Get the most value from every trade
              </p>
            </div>

            <div className="card-hover group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Global Access</h3>
              <p className="text-gray-400 leading-relaxed">
                Trade from anywhere in the world, 24/7. Available in 150+ countries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="card text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                  1
                </div>
                <h3 className="heading-3 text-white mb-4">Create Account</h3>
                <p className="text-gray-400 leading-relaxed">
                  Sign up in seconds with just your email. No lengthy verification process required.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
            </div>

            <div className="relative">
              <div className="card text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                  2
                </div>
                <h3 className="heading-3 text-white mb-4">Fund Your Wallet</h3>
                <p className="text-gray-400 leading-relaxed">
                  Deposit crypto or fiat instantly. Multiple payment methods supported.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-transparent"></div>
            </div>

            <div>
              <div className="card text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                  3
                </div>
                <h3 className="heading-3 text-white mb-4">Start Trading</h3>
                <p className="text-gray-400 leading-relaxed">
                  Buy, sell, or trade crypto and gift cards with competitive rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Assets */}
      <section className="section bg-gradient-to-b from-transparent to-white/5">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 text-white mb-4">Supported Assets</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Trade the most popular cryptocurrencies and gift cards
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Bitcoin', symbol: 'BTC' },
              { name: 'Ethereum', symbol: 'ETH' },
              { name: 'USDT', symbol: 'USDT' },
              { name: 'BNB', symbol: 'BNB' },
              { name: 'Solana', symbol: 'SOL' },
              { name: 'Cardano', symbol: 'ADA' }
            ].map((asset, idx) => (
              <div key={idx} className="card-hover text-center p-6">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <CryptoIcon symbol={asset.symbol} size={64} className="w-full h-full" />
                </div>
                <h3 className="font-semibold text-white">{asset.name}</h3>
                <p className="text-sm text-green-400 mt-2">Available</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Cards Section */}
      <section className="section">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                <Gift className="w-4 h-4" />
                Gift Card Trading
              </div>
              <h2 className="heading-2 text-white">
                Trade Gift Cards from{' '}
                <span className="gradient-text">Top Brands</span>
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Buy, sell, or exchange gift cards from Amazon, Apple, Google Play, Steam, 
                and 500+ more brands at competitive rates. Instant transactions, secure platform.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">500+ supported brands</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Instant verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Best rates guaranteed</span>
                </div>
              </div>
              <Link href="/trade/giftcards" className="btn-primary inline-flex items-center mt-6 group">
                Explore Gift Cards
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['Amazon', 'Apple', 'Google Play', 'Steam', 'Netflix', 'Spotify'].map((brand, idx) => (
                <div key={idx} className="card-hover p-6 text-center">
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                    <GiftCardIcon brand={brand} size={64} className="w-full h-full" />
                  </div>
                  <h4 className="font-semibold text-white">{brand}</h4>
                  <p className="text-sm text-gray-400 mt-1">Available</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="section bg-gradient-to-b from-transparent to-white/5">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-8">
              <Lock className="w-4 h-4" />
              Security First
            </div>
            <h2 className="heading-2 text-white mb-6">Your Security is Our Priority</h2>
            <p className="text-xl text-gray-400 mb-12 leading-relaxed">
              We use industry-leading security measures to protect your funds and personal information. 
              Your assets are safe with us.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">2FA Authentication</h3>
                <p className="text-gray-400">Two-factor authentication for extra security</p>
              </div>

              <div className="card text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Cold Storage</h3>
                <p className="text-gray-400">95% of funds stored in offline cold wallets</p>
              </div>

              <div className="card text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Insurance</h3>
                <p className="text-gray-400">All funds protected by comprehensive insurance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container-custom">
          <div className="card max-w-4xl mx-auto text-center p-12 sm:p-16">
            <h2 className="heading-2 text-white mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of traders already using SiegerTech. 
              Get started in less than 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary inline-flex items-center justify-center group">
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="btn-outline inline-flex items-center justify-center">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
