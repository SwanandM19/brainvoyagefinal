'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { Menu, X } from 'lucide-react';

export default function LandingNav() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : 'border-b border-[#E5E7EB]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[100px] flex items-center justify-between">
        <Logo size="md" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'For Students', href: '#students'  },
            { label: 'For Teachers', href: '#teachers'  },
            { label: 'Leaderboard',  href: '#leaderboard' },
            { label: 'About',        href: '#about'     },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors duration-150"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-[#6B7280] hover:text-[#111827] px-3 py-2 rounded transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/login"
            className="btn-primary text-sm px-5 py-2.5 rounded-lg"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-[#6B7280] hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-4 space-y-1 animate-[slideUp_0.2s_ease-out]">
          {[
            { label: 'For Students', href: '#students'  },
            { label: 'For Teachers', href: '#teachers'  },
            { label: 'Leaderboard',  href: '#leaderboard' },
            { label: 'About',        href: '#about'     },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-semibold text-[#6B7280] hover:text-[#111827] hover:bg-gray-50 rounded-lg transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-3 border-t border-[#E5E7EB] flex flex-col gap-2">
            <Link
              href="/auth/login"
              className="block text-center py-2.5 text-sm font-semibold text-[#6B7280] hover:text-[#111827] rounded-lg border border-[#E5E7EB] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/login"
              className="btn-primary block text-center text-sm py-2.5 rounded-lg"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
