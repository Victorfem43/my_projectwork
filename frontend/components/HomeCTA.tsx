'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';

export default function HomeCTA() {
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAuthenticated(isAuthenticated());
  }, []);

  if (!mounted || authenticated) return null;

  return (
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
  );
}
