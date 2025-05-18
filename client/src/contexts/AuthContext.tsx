"use client";

// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  isConnected?: boolean;
}

interface AuthContextType {
  user: User | null;
  defaultRole: string;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  connectWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [defaultRole, setDefaultRole] = useState('public');
  const router = useRouter();
  //print user role
  console.log('User role:', user?.role);

useEffect(() => {
  // Check if user is logged in on mount
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (token) {
    // Validate token and get user data
    fetchUserData(token);
  } else if (userRole) {
    setDefaultRole(userRole);
    
    // Also create a minimal user object if we have a role but no user data
    if (!user) {
      setUser({
        id: 'unknown',
        email: 'unknown',
        role: userRole,
        name: userRole.charAt(0).toUpperCase() + userRole.slice(1),
        isConnected: false
      });
    }
  }
}, []);


  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          name: userData.fullName || userData.name,
          isConnected: !!userData.walletAddress
        });
      } else {
        // Token invalid, clear it
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('userRole', data.user.role);
    
    setUser({
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      name: data.user.fullName || data.user.name,
      isConnected: !!data.user.walletAddress
    });
  };

  const signup = async (data: any) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }
    
    const responseData = await response.json();
    localStorage.setItem('token', responseData.access_token);
    localStorage.setItem('userRole', responseData.user.role);
    
    setUser({
      id: responseData.user.id,
      email: responseData.user.email,
      role: responseData.user.role,
      name: responseData.user.fullName || responseData.user.name,
      isConnected: !!responseData.user.walletAddress
    });
  };

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userData');
  setUser(null);
  
  window.location.href = '/';
};


  const connectWallet = async () => {
    // Implement wallet connection logic
    // ...
  };

  return (
    <AuthContext.Provider value={{ user, defaultRole, login, signup, logout, connectWallet }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
