'use client';

import type { FC, MouseEvent } from 'react';
import { memo, useCallback, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface NavItem {
  /** Visible label for the menu item */
  label: string;
  /** Destination href */
  href: string;
}

interface MainNavProps {
  /** App / brand name */
  brand?: string;
  /** Optional logo text (short) */
  logoText?: string;
  /** Menu items to render */
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
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setIsOpen((prev) => !prev);
    },
    []
  );

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Primary navigation"
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
            aria-label={brand}
            onClick={closeMenu}
          >
            {logoText}
          </Link>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 sm:text-base">
              {brand}
            </span>
            <span className="text-xs text-gray-500">
              Motor policies · billing · collections
            </span>
          </div>
        </div>

        {/* Desktop menu */}
        <div className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-4 text-sm">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Placeholder for a right-side action (e.g., profile, sign out) */}
          <button
            type="button"
            className="hidden rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-blue-500 hover:text-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white sm:inline-flex"
          >
            Demo User
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={toggleMenu}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
          >
            {isOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden ${
          isOpen ? 'max-h-64 border-b border-gray-200' : 'max-h-0'
        } overflow-hidden bg-white shadow-sm transition-all duration-200`}
      >
        <ul className="space-y-1 px-4 pb-3 pt-2 text-sm">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-lg px-3 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-blue-500 hover:text-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
          >
            <span>Demo User</span>
            <span className="text-[10px] text-gray-500">Broker · UAE</span>
          </button>
        </div>
      </div>
    </header>
  );
});

export default MainNav;