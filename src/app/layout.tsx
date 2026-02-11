import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebDev Blog',
  description: 'A modern blog platform for developers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
