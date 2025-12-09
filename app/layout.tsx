import type { Metadata } from 'next';
import './globals.css';
import MainNav from './components/MainNav';

export const metadata: Metadata = {
  title: 'Motor Billing UAE',
  description: 'Motor insurance billing app for UAE brokers',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <MainNav />
        <main className="pt-2">{children}</main>
      </body>
    </html>
  );
}