import type { Metadata } from 'next';
import './globals.css';

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
        {children}
      </body>
    </html>
  );
}