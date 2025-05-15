import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FundWise - Transparent Charity Fundraising',
  description: 'FundWise - Transparent blockchain-based charity verification platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
