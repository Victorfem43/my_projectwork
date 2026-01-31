'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, isAdmin } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow /admin/login and /admin/forgot-password without redirect
    if (pathname === '/admin/login' || pathname === '/admin/forgot-password') {
      return;
    }

    // Not logged in → admin login (stay in admin flow)
    if (!isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    // Logged in but not admin → admin login with message (do not send to user dashboard)
    if (!isAdmin()) {
      router.push('/admin/login?reason=admin_required');
      return;
    }
  }, [router, pathname]);

  // Show loading while checking auth
  if (pathname !== '/admin/login' && pathname !== '/admin/forgot-password' && (!isAuthenticated() || !isAdmin())) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
