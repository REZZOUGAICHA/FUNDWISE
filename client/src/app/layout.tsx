import './globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/layout/Navigation';
import { AuthProvider } from '@/contexts/AuthContext';


// Using Montserrat for headings with Inter for body text


export const metadata: Metadata = {
  title: 'FundWise - Transparent Donation Platform',
  description: 'A decentralized platform for transparent and traceable donations using blockchain technology',
  keywords: 'blockchain, donations, charity, transparency, crypto donations, ethereum',
  openGraph: {
    title: 'FundWise - Transparent Donation Platform',
    description: 'A decentralized platform for transparent and traceable donations',
    url: 'https://fundwise.example.com',
    siteName: 'FundWise',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FundWise Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FundWise - Transparent Donation Platform',
    description: 'A decentralized platform for transparent and traceable donations',
    images: ['/twitter-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-gray-200 min-h-screen flex flex-col">
        {/* Green gradient glow at the top */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-500 to-green-900 z-50" />
        
        {/* Background subtle patterns */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[50vh] bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.1)_0%,_transparent_70%)]" />
          <div className="absolute bottom-0 right-0 w-full h-[70vh] bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.05)_0%,_transparent_60%)]" />
          <div className="absolute top-1/4 left-0 w-full h-[20vh] bg-[linear-gradient(90deg,_rgba(16,185,129,0.03)_0%,_transparent_100%)]" />
        </div>
          <AuthProvider>
            <div className="sticky top-0 z-40 backdrop-blur-md bg-black/80 border-b border-green-900/30">
          <Navigation />
        </div>
          </AuthProvider>
        {/* Navigation with glow effect */}
        
        
        {/* Main content with animation wrapper */}
        <main className="flex-grow relative z-10 w-full overflow-hidden">
          {children}
        </main>
        
        
      </body>
    </html>
  );
}