import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Perth Split - Split Bills with Friends',
  description: 'Scan receipts, assign items to friends, and settle up with Australian payment methods. Perfect for dinners, drinks, and shared expenses in Perth.',
  keywords: ['bill split', 'receipt scanner', 'Perth', 'Australia', 'PayID', 'share expenses'],
  authors: [{ name: 'Perth Split' }],
  openGraph: {
    title: 'Perth Split - Split Bills with Friends',
    description: 'Scan receipts, assign items, and settle up instantly with Australian payment methods.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
          {children}
        </main>
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </body>
    </html>
  );
}
