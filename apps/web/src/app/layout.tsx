import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SiteNav } from '@/components/site-nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NFTocracy',
  description: 'NFT-weighted voting on Arbitrum Sepolia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased`}
      >
        <Providers>
          <SiteNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
  