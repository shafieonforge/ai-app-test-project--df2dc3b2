import type { Metadata } from 'next';
import './globals.css';
import MainNav from './components/MainNav';

export const metadata: Metadata = {
  title: 'Motor Billing UAE',
  description: 'Enterprise-grade motor insurance billing for UAE brokers',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <MainNav />
        <main className="pt-4 pb-10">{children}</main>
      </body>
    </html>
  );
}