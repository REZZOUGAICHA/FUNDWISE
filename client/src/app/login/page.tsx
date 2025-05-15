'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Note: changed from next/router
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
    const res = await fetch('http://localhost:3001/login', {
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

    // Example: Store token and redirect
    localStorage.setItem('token', data.token);
    router.push('/verification-portal');

  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div style={{ 
      backgroundColor: '#000', 
      minHeight: '100vh', 
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
    }}>
      <header style={{
        backgroundColor: '#212529',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #1a8754',
      }}>
        <Link href="/">
          <div style={{ 
            color: '#1a8754', 
            fontSize: '24px', 
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            FUNDWISE
          </div>
        </Link>
      </header>

      <div style={{ 
        maxWidth: '500px', 
        margin: '80px auto', 
        padding: '20px',
      }}>
        <div style={{ 
          backgroundColor: '#212529', 
          borderRadius: '8px',
          padding: '40px',
          borderLeft: '4px solid #1a8754',
        }}>
          <h2 style={{ 
            color: '#1a8754', 
            marginBottom: '20px',
            textAlign: 'center' 
          }}>
            Login to Verification Portal
          </h2>

          {error && (
            <div style={{ 
              backgroundColor: 'rgba(220, 53, 69, 0.1)', 
              color: '#dc3545', 
              padding: '10px', 
              borderRadius: '4px', 
              marginBottom: '20px' 
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                color: '#f8f9fa' 
              }}>
                Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #333', 
                  borderRadius: '4px', 
                  backgroundColor: '#333', 
                  color: '#ffffff' 
                }} 
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                color: '#f8f9fa' 
              }}>
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #333', 
                  borderRadius: '4px', 
                  backgroundColor: '#333', 
                  color: '#ffffff' 
                }} 
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                type="submit" 
                disabled={isLoading}
                style={{ 
                  backgroundColor: '#1a8754', 
                  color: '#ffffff', 
                  padding: '10px 15px', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              
              <div>
                <Link href="/forgot-password" style={{ 
                  color: '#1a8754', 
                  textDecoration: 'none', 
                  fontSize: '14px'
                }}>
                  Forgot Password?
                </Link>
              </div>
            </div>
          </form>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          color: '#6c757d', 
          fontSize: '14px' 
        }}>
          © 2025 FundWise. All rights reserved.
        </div>
      </div>
    </div>
  );
}