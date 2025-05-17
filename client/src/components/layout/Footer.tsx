"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const Footer = () => {
  const [currentYear] = useState(new Date().getFullYear());
  
  return (
    <footer className="bg-black/80 text-gray-300 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="flex items-center mb-6">
              <div className="h-10 w-10 mr-3 relative">
                <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-pulse-slow"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-green-500 font-bold text-xl">F</span>
                </div>
              </div>
              <span className="text-white text-xl font-bold tracking-tight">
                Fund<span className="text-green-500">Wise</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-xs">
              A decentralized platform for transparent and traceable donations using blockchain technology.
            </p>
            <div className="flex space-x-4">
              {/* Social media icons */}
              <a href="#" className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-green-800 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-green-800 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#" className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-green-800 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-green-800 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6 text-lg font-display">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/campaigns" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Campaigns</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-green-400 transition-colors duration-300">About Us</Link></li>
              <li><Link href="/how-it-works" className="text-gray-400 hover:text-green-400 transition-colors duration-300">How It Works</Link></li>
              <li><Link href="/organizations" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Organizations</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-green-400 transition-colors duration-300">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6 text-lg font-display">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="/blog" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Blog</Link></li>
              <li><Link href="/developers" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Developers</Link></li>
              <li><Link href="/documentation" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Documentation</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6 text-lg font-display">Newsletter</h3>
            <p className="text-gray-400 mb-4">Get updates on new campaigns and platform features</p>
            <form className="space-y-3">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-green-500 text-gray-300"
                />
              </div>
              <button 
                type="submit" 
                className="w-full px-4 py-3 bg-green-700 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
            <p className="text-gray-500 text-sm mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} FundWise. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="flex items-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Verified by Blockchain</span>
            </div>
            <div className="flex items-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Secure Donations</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;