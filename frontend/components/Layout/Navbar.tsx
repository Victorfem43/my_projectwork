'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Wallet, LogOut, TrendingUp, Gift, Settings, User } from 'lucide-react';
import { getUser, clearAuth, isAdmin } from '@/lib/auth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24 overflow-visible">
          <Link href="/" className="flex items-center shrink-0 overflow-visible">
            <Image
              src="/Logo1.png"
              alt="SIEGERTECH"
              width={300}
              height={150}
              className="h-28 sm:h-32 w-auto object-contain object-left brightness-125 contrast-105"
              priority
              unoptimized
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            <Link 
              href="/" 
              className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
            >
              Home
            </Link>
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/trade/crypto" 
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Trade
                </Link>
                <Link 
                  href="/trade/giftcards" 
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  Gift Cards
                </Link>
                <Link 
                  href="/wallet" 
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Wallet
                </Link>
                {isAdmin() && (
                  <Link 
                    href="/admin" 
                    className="px-4 py-2 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-all text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="btn-primary text-sm px-6 py-2.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-2xl border-t border-white/10">
          <div className="px-4 py-4 space-y-1">
            <Link 
              href="/" 
              className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/trade/crypto" 
                  className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <TrendingUp className="w-4 h-4" />
                  Trade Crypto
                </Link>
                <Link 
                  href="/trade/giftcards" 
                  className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Gift className="w-4 h-4" />
                  Gift Cards
                </Link>
                <Link 
                  href="/wallet" 
                  className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Wallet className="w-4 h-4" />
                  Wallet
                </Link>
                <Link 
                  href="/settings" 
                  className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                {isAdmin() && (
                  <Link 
                    href="/admin" 
                    className="block px-4 py-3 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="block px-4 py-3 rounded-lg btn-primary text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
