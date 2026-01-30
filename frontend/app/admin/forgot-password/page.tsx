'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Shield } from 'lucide-react';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success('Password reset link sent to your email');
      setSent(true);
      // In development, the API returns the reset token
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
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
              <h1 className="heading-2 text-white mb-2">Reset Admin Password</h1>
              <p className="text-gray-400">
                {sent 
                  ? 'Check your email for reset instructions'
                  : 'Enter your admin email to receive a password reset link'
                }
              </p>
            </div>
            
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      className="input-field pl-12"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-gray-300">Password reset link has been sent to your email.</p>
                {resetToken && (
                  <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-gray-400 mb-2">Development Mode - Reset Token:</p>
                    <Link 
                      href={`/reset-password?token=${resetToken}`}
                      className="text-yellow-400 hover:text-yellow-300 text-sm break-all"
                    >
                      Click here to reset password
                    </Link>
                  </div>
                )}
                <Link href="/admin/login" className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Admin Login
                </Link>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-center text-gray-400 text-sm">
                Remember your password?{' '}
                <Link href="/admin/login" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
