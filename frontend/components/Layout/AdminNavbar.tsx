'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Shield, Users, TrendingUp, DollarSign, Gift, Wallet, FileText, Home } from 'lucide-react';
import { getUser, clearAuth } from '@/lib/auth';

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <nav className="glass-strong fixed top-0 left-0 right-0 z-50 border-b border-yellow-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent flex items-center">
              <Shield className="w-6 h-6 mr-2 text-yellow-400" />
              ADMIN PANEL
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/admin" 
              className={`px-3 py-2 rounded-lg transition-colors ${
                pathname === '/admin' ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/users" 
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/users') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Users
            </Link>
            <Link 
              href="/admin/trades" 
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/trades') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Trades
            </Link>
            <Link 
              href="/admin/transactions" 
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/transactions') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Transactions
            </Link>
            <Link 
              href="/admin/giftcards" 
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/giftcards') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Gift Cards
            </Link>
            <Link 
              href="/admin/wallets" 
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/wallets') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Wallets
            </Link>
            <Link 
              href="/admin/support" 
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/support') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Support
            </Link>
            <Link 
              href="/" 
              className="px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors flex items-center"
            >
              <Home className="w-4 h-4 mr-1" />
              User App
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-strong border-t border-yellow-500/20">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link 
              href="/admin" 
              className={`block py-2 px-3 rounded-lg ${pathname === '/admin' ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'}`}
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/users" 
              className={`block py-2 px-3 rounded-lg ${isActive('/admin/users') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'}`}
              onClick={() => setIsOpen(false)}
            >
              Users
            </Link>
            <Link 
              href="/admin/trades" 
              className={`block py-2 px-3 rounded-lg ${isActive('/admin/trades') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'}`}
              onClick={() => setIsOpen(false)}
            >
              Trades
            </Link>
            <Link 
              href="/admin/transactions" 
              className={`block py-2 px-3 rounded-lg ${isActive('/admin/transactions') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'}`}
              onClick={() => setIsOpen(false)}
            >
              Transactions
            </Link>
            <Link 
              href="/admin/giftcards" 
              className={`block py-2 px-3 rounded-lg ${isActive('/admin/giftcards') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'}`}
              onClick={() => setIsOpen(false)}
            >
              Gift Cards
            </Link>
            <Link 
              href="/admin/wallets" 
              className={`block py-2 px-3 rounded-lg ${isActive('/admin/wallets') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'}`}
              onClick={() => setIsOpen(false)}
            >
              Wallets
            </Link>
            <Link 
              href="/admin/support" 
              className={`block py-2 px-3 rounded-lg ${isActive('/admin/support') ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:text-white'}`}
              onClick={() => setIsOpen(false)}
            >
              Support
            </Link>
            <Link 
              href="/" 
              className="block py-2 px-3 rounded-lg text-gray-300 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              User App
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="block w-full text-left py-2 px-3 rounded-lg text-gray-300 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
