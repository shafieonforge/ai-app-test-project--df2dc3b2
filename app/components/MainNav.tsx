'use client';

import type { FC, MouseEvent } from 'react';
import { memo, useCallback, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
}

interface MainNavProps {
  brand?: string;
  logoText?: string;
  items?: NavItem[];
}

const DEFAULT_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Policies', href: '/policies' },
  { label: 'Invoices', href: '/invoices' },
  { label: 'Reports', href: '/reports' },
];

const MainNav: FC<MainNavProps> = memo(function MainNav({
  brand = 'Motor Billing UAE',
  logoText = 'MB',
  items = DEFAULT_ITEMS,
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const isActive = useCallback(
    (href: string): boolean => {
      if (href === '/') {
        return pathname === '/';
      }
      return pathname.startsWith(href);
    },
    [pathname],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Primary navigation"
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-semibold text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label={brand}
            onClick={closeMenu}
          >
            {logoText}
          </Link>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
              {brand}
            </span>
            <span className="text-[11px] text-slate-500">
              Motor policies · billing · collections
            </span>
          </div>
        </div>

        {/* Desktop menu */}
        <div className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-2 text-sm">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                      active
                        ? 'bg-slate-900 text-slate-50 shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-500 hover:text-blue-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:inline-flex"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
              U
            </span>
            <span>Demo User</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={toggleMenu}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 transition-all duration-200 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`md:hidden ${
          isOpen ? 'max-h-64 border-b border-slate-200' : 'max-h-0'
        } overflow-hidden bg-white shadow-sm transition-all duration-200`}
      >
        <ul className="space-y-1 px-4 pb-3 pt-2 text-sm">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-2 font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    active
                      ? 'bg-slate-900 text-slate-50'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-slate-100 px-4 py-3">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-500 hover:bg-white hover:text-blue-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <span className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                U
              </span>
              <span>Demo User</span>
            </span>
            <span className="text-[10px] text-slate-500">Broker · UAE</span>
          </button>
        </div>
      </div>
    </header>
  );
});

export default MainNav;