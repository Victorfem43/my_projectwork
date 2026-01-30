import Link from 'next/link';
import { Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <img src="/Logo1.png" alt="SIEGERTECH" className="h-32 sm:h-36 w-auto object-contain object-left brightness-125 contrast-105" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              The most advanced platform for cryptocurrency and gift card trading. 
              Secure, fast, and built for professionals.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.tiktok.com/@victorfem1" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all" aria-label="TikTok">
                <svg className="w-5 h-5 text-gray-400 hover:text-[#00f2ea]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88 2.4V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href="https://instagram.com/ecomcoach6" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all" aria-label="Instagram">
                <Instagram className="w-5 h-5 text-gray-400 hover:text-pink-400" />
              </a>
              <a href="https://facebook.com/victor.oluwafemi.98892" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all" aria-label="Facebook">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-500" />
              </a>
            </div>
          </div>

          {/* Trading */}
          <div>
            <h4 className="text-white font-semibold mb-4">Trading</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/trade/crypto" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Crypto Trading
                </Link>
              </li>
              <li>
                <Link href="/trade/giftcards" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Gift Cards
                </Link>
              </li>
              <li>
                <Link href="/buy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Buy Crypto
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Sell Crypto
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Wallet
                </Link>
              </li>
              <li>
                <Link href="/transactions" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Transactions
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/support" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              &copy; {new Date().getFullYear()} SiegerTech. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-gray-400 text-sm">Licensed & Regulated</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
