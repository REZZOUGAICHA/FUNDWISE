'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await res.json();
      console.log('Login success:', data);

      localStorage.setItem('token', data.token);
      router.push('/verification-portal');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <header className="bg-[#212529] px-5 py-4 flex justify-between items-center border-b-2 border-[#1a8754]">
        <Link href="/" className="text-[#1a8754] text-2xl font-bold cursor-pointer">
          FUNDWISE
        </Link>
      </header>

      <div className="max-w-lg mx-auto mt-20 p-5">
        <div className="bg-[#212529] rounded-lg p-10 border-l-4 border-[#1a8754]">
          <h2 className="text-[#1a8754] text-center mb-5 text-xl font-semibold">
            Login to Verification Portal
          </h2>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 text-gray-100">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-[#1a8754]"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-gray-100">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-[#1a8754]"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-[#1a8754] text-white px-4 py-2 rounded font-bold transition-opacity ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
                }`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              <Link href="/forgot-password" className="text-sm text-[#1a8754] hover:underline">
                Forgot Password?
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          © 2025 FundWise. All rights reserved.
        </div>
      </div>
    </div>
  );
}
