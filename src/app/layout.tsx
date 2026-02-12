import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'WebDev Blog',
    template: '%s | WebDev Blog',
  },
  description:
    'A production-ready full-stack blogging platform built with Next.js 15, PostgreSQL, and TypeScript.',
  keywords: ['blog', 'web development', 'nextjs', 'typescript', 'postgresql'],
  authors: [{ name: 'davidfdzmorilla' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://blog.davidfdzmorilla.dev',
    siteName: 'WebDev Blog',
    title: 'WebDev Blog',
    description:
      'A production-ready full-stack blogging platform built with Next.js 15, PostgreSQL, and TypeScript.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebDev Blog',
    description:
      'A production-ready full-stack blogging platform built with Next.js 15, PostgreSQL, and TypeScript.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="WebDev Blog RSS Feed"
          href="/api/rss.xml"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
