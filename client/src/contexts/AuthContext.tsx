// src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'public' | 'donor' | 'organization' | 'audit' ;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isConnected: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  defaultRole: UserRole; // Add this
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
const defaultRole: UserRole = 'public'; // Default role 
  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, you'd check for an existing session with your backend
        const storedUser = localStorage.getItem('fundwise_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);


const login = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Use defaultRole as the starting point
    let role: UserRole = defaultRole;
    
    // Override based on email if needed
    if (email.includes('org')) role = 'organization';
    if (email.includes('audit')) role = 'audit';

    
    const user = {
      id: '123',
      name: email.split('@')[0],
      email,
      role, // This will now respect the defaultRole if not overridden
      isConnected: false
    };
    
    setUser(user);
    localStorage.setItem('fundwise_user', JSON.stringify(user));
  } finally {
    setIsLoading(false);
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fundwise_user');
  };

  const connectWallet = () => {
    if (user) {
      const updatedUser = { ...user, isConnected: true };
      setUser(updatedUser);
      localStorage.setItem('fundwise_user', JSON.stringify(updatedUser));
    }
  };

  const disconnectWallet = () => {
    if (user) {
      const updatedUser = { ...user, isConnected: false };
      setUser(updatedUser);
      localStorage.setItem('fundwise_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, defaultRole, login, logout, connectWallet, disconnectWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
