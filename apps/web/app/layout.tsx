import type { Metadata } from 'next';
import { DM_Sans, Geist_Mono, Playfair_Display } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'case-study-nextjs-firebase-type-contracts',
  description: 'Type contract enforcement across a Next.js + Firebase pnpm monorepo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full antialiased dark',
        playfair.variable,
        dmSans.variable,
        geistMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
