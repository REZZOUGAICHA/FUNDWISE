"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Wallet, Lock, CreditCard, Network, ChevronRight } from 'lucide-react';

export default function Login() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const router = useRouter();
const pathname = usePathname();

const handleSubmit = async (e: { preventDefault: () => void; }) => {
e.preventDefault();
setIsLoading(true);
setError('');


try {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, you would call your authentication API here
  if (email === 'admin@example.com' && password === 'password') {
    router.push('/dashboard');
  } else {
    setError('Invalid email or password');
  }
} catch (err) {
  setError('An error occurred. Please try again.');
  console.error(err);
} finally {
  setIsLoading(false);
}
};

return (
<main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 flex overflow-hidden">
<div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 items-center justify-center overflow-hidden h-full">

<div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-900/20 animate-pulse-slow"></div>
<div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-900/10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)]"></div>


    {/* Enhanced blockchain network animation */}
    <div className="relative z-10 p-10 max-w-md">
      <div className="mb-10 text-center">
        <span className="text-white text-5xl font-bold tracking-tight">
              Fund<span className="text-emerald-500">Wise</span>
        </span>
        <p className="text-emerald-400 text-lg">Blockchain-powered transparent donations</p>
      </div>
      
      {/* Enhanced animated blockchain network */}
      <div className="relative h-80 flex items-center justify-center">
        {/* Blockchain grid and connections */}
        <div className="absolute w-60 h-60 border-2 border-emerald-500/30 rounded-xl animate-spin-slow transform rotate-45"></div>
        <div className="absolute w-80 h-80 border border-emerald-500/20 rounded-xl animate-reverse-spin-slow transform rotate-45"></div>
        <div className="absolute w-96 h-96 border border-emerald-500/10 rounded-xl animate-spin-slow transform rotate-45" style={{ animationDelay: '2s' }}></div>
        
        {/* Center blockchain icon */}
        <div className="bg-black w-24 h-24 rounded-xl transform rotate-45 flex items-center justify-center z-10 shadow-lg shadow-emerald-500/30 border border-emerald-500/40">
          <div className="transform -rotate-45">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-emerald-500" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M4 13C4 12.4477 4.44772 12 5 12H19C19.5523 12 20 12.4477 20 13V15C20 15.5523 19.5523 16 19 16H5C4.44772 16 4 15.5523 4 15V13Z" stroke="currentColor" strokeWidth="2"/>
              <circle cx="9" cy="6" r="1" fill="currentColor"/>
              <circle cx="9" cy="14" r="1" fill="currentColor"/>
              <path d="M12 8L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        
        {/* Blockchain nodes as blocks with hash visualization */}
        <div className="absolute top-10 left-20 w-12 h-12 bg-black/80 border border-emerald-500/50 rounded-lg transform rotate-45 shadow-lg shadow-emerald-500/20 flex items-center justify-center group">
          <div className="transform -rotate-45 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">0x8F4E</div>
        </div>
        <div className="absolute bottom-10 right-20 w-12 h-12 bg-black/80 border border-emerald-500/50 rounded-lg transform rotate-45 shadow-lg shadow-emerald-500/20 flex items-center justify-center group">
          <div className="transform -rotate-45 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">0x2A7B</div>
        </div>
        <div className="absolute top-1/2 right-12 w-12 h-12 bg-black/80 border border-emerald-500/50 rounded-lg transform rotate-45 shadow-lg shadow-emerald-500/20 flex items-center justify-center group">
          <div className="transform -rotate-45 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">0xF19C</div>
        </div>
        <div className="absolute bottom-1/2 left-12 w-12 h-12 bg-black/80 border border-emerald-500/50 rounded-lg transform rotate-45 shadow-lg shadow-emerald-500/20 flex items-center justify-center group">
          <div className="transform -rotate-45 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">0xD34A</div>
        </div>
        
        {/* Animated connection lines with data transfer */}
        <div className="absolute w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <line x1="200" y1="200" x2="120" y2="100" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1.5" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="3s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 200 200" to="360 200 200" dur="30s" repeatCount="indefinite"/>
            </line>
            <line x1="200" y1="200" x2="280" y2="300" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1.5" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="2.5s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 200 200" to="360 200 200" dur="30s" repeatCount="indefinite"/>
            </line>
            <line x1="200" y1="200" x2="300" y2="200" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1.5" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="2s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 200 200" to="360 200 200" dur="30s" repeatCount="indefinite"/>
            </line>
            <line x1="200" y1="200" x2="100" y2="200" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1.5" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="3.5s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 200 200" to="360 200 200" dur="30s" repeatCount="indefinite"/>
            </line>
          </svg>
        </div>
        
        {/* Data transfer animations */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-emerald-400 rounded-full animate-ping-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-emerald-400 rounded-full animate-ping-slow" style={{ animationDelay: '0.7s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-ping-slow" style={{ animationDelay: '1.4s' }}></div>
        
        {/* Transaction verification animation */}
        <div className="absolute bottom-1/3 left-1/3">
          <div className="w-4 h-4 bg-emerald-500/80 rounded-full">
            <div className="w-full h-full animate-pulse-fast rounded-full bg-emerald-400/50"></div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-gray-300 text-lg">Secure, transparent, and traceable donations</p>
        <div className="mt-4 flex items-center justify-center">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
          <p className="text-emerald-400">Powered by blockchain technology</p>
        </div>
      </div>
    </div>
  </div>
  

  <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative">
    {/* Enhanced background effects */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)] lg:hidden"></div>
    <div className="absolute top-0 left-0 w-full h-full">
      <div className="absolute top-10 right-10 w-20 h-20 bg-emerald-500/5 rounded-xl transform rotate-45"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-emerald-500/5 rounded-xl transform rotate-45"></div>
    </div>
    
    <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-emerald-900/40 hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-500">
      <div className="p-8">
        <div className="flex justify-center mb-8">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-500/40 transform rotate-45 hover:scale-110 transition-transform duration-300">
            <Wallet className="h-10 w-10 text-emerald-500 transform -rotate-45" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-white mb-3">Welcome Back</h2>
        <p className="text-center text-emerald-400 mb-8">Sign in to continue to FundWise</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-white text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-3 py-3 border border-emerald-500/30 bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-white text-sm font-medium">Password</label>
              <Link href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                  <Lock className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-10 py-3 border border-emerald-500/30 bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                placeholder="- - - - - - - - "
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center text-emerald-500 hover:text-emerald-400 focus:outline-none"
                >
                  {showPassword ? 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg> : 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <input
                id="remember"
                type="checkbox"
                className="opacity-0 absolute h-5 w-5 cursor-pointer"
              />
              <div className="bg-black/50 border border-emerald-500/30 rounded w-5 h-5 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-emerald-500">
                <svg className="fill-current hidden w-3 h-3 text-emerald-500 pointer-events-none" viewBox="0 0 20 20">
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
              </div>
            </div>
            <label htmlFor="remember" className="ml-1 text-sm text-gray-300 cursor-pointer select-none">
              Remember me for 30 days
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Sign In
                
              </div>
            )}
          </button>
          

        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors border-b border-emerald-500/30 hover:border-emerald-400">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
</main>
);
}