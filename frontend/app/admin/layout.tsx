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
    // Allow /admin (exact) and /admin/forgot-password – no redirect (login or form at /admin)
    if (pathname === '/admin' || pathname === '/admin/forgot-password') {
      return;
    }

    // Other /admin/* require auth and admin
    if (!isAuthenticated()) {
      router.push('/admin');
      return;
    }
    if (!isAdmin()) {
      router.push('/admin?reason=admin_required');
      return;
    }
  }, [router, pathname]);

  // Show loading only for protected /admin/* (not for /admin or /admin/forgot-password)
  const isPublicPath = pathname === '/admin' || pathname === '/admin/forgot-password';
  if (!isPublicPath && (!isAuthenticated() || !isAdmin())) {
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
