"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, User, Building, Wallet, Network, ChevronRight, ShieldCheck, Globe, FileText, Lock, Key } from 'lucide-react';
import axios from 'axios';

// Create a reusable axios instance for API calls
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003', // API Gateway URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Security-focused blockchain animation component
const BlockchainSecurityAnimation = () => {
    

  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div className="relative h-80 flex items-center justify-center">
      {/* Secure blockchain visualization */}
      <div className="relative w-full h-full">
        {/* Main blockchain structure */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Chain of blocks */}
          <div className="relative w-72 h-64">
            {isClient && [...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={`absolute w-32 h-32 bg-black border-2 border-emerald-500/30 rounded-lg shadow-lg transform transition-all duration-700 ease-in-out ${i % 2 === 0 ? 'left-0' : 'right-0'}`}
                style={{ 
                  top: `${i * 40}px`, 
                  zIndex: 5 - i,
                  animation: `pulse-block 3s infinite ${i * 0.5}s`,
                  opacity: 1 - (i * 0.15)
                }}
              >
                {/* Block header */}
                <div className="h-8 border-b border-emerald-500/20 flex items-center px-3 bg-emerald-900/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                  <div className="text-xs text-emerald-400 font-mono">Block #{10548 - i}</div>
                </div>
                
                {/* Block content */}
                <div className="p-2">
                  <div className="flex items-center mb-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500 mr-1" />
                    <div className="text-xs text-gray-400 font-mono">
                      {i === 0 ? "VERIFIED" : "SECURED"}
                    </div>
                  </div>
                  <div className="text-xs text-emerald-400/70 font-mono truncate">
                    {isClient ? `0x${(i + 1).toString(16).padStart(8, '0').toUpperCase()}` : "0x00000000"}
                  </div>
                  
                  {/* Lock icon in the center of each block */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Lock className="h-16 w-16 text-emerald-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Padlock in the center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-black border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Lock className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping-slow"></div>
            </div>
          </div>
        </div>
        
        {/* Security shield elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Shield outline */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80">
            <svg viewBox="0 0 24 24" className="w-full h-full text-emerald-500/10">
              <path 
                fill="currentColor" 
                d="M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1z" 
              />
            </svg>
          </div>
          
          {/* Scanning effect */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent animate-scan"></div>
          </div>
        </div>
        
        {/* Floating security elements */}
        {isClient && [...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-8 h-8 rounded-lg bg-black/80 border border-emerald-500/40 flex items-center justify-center animate-float-security"
            style={{ 
              top: `${10 + Math.random() * 80}%`, 
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          >
            {i % 3 === 0 ? (
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            ) : i % 3 === 1 ? (
              <Lock className="h-4 w-4 text-emerald-500" />
            ) : (
              <Key className="h-4 w-4 text-emerald-500" />
            )}
          </div>
        ))}
        
        {/* Connection lines with data transfer */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0)" />
              <stop offset="50%" stopColor="rgba(16, 185, 129, 0.5)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
            </linearGradient>
          </defs>
          
          {/* Security connection lines */}
          <line x1="200" y1="200" x2="100" y2="100" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="200" y1="200" x2="300" y2="100" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="2.5s" repeatCount="indefinite" />
          </line>
          <line x1="200" y1="200" x2="300" y2="300" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="3.2s" repeatCount="indefinite" />
          </line>
          <line x1="200" y1="200" x2="100" y2="300" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="2.8s" repeatCount="indefinite" />
          </line>
        </svg>
        
        {/* Data packets moving along lines */}
        {isClient && [...Array(4)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-data-packet"
            style={{ 
              top: '50%',
              left: '50%',
              animationDelay: `${i * 0.8}s`,
              transform: `rotate(${i * 90}deg)`,
              transformOrigin: 'top left'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default function Register() {
  const [accountType, setAccountType] = useState('individual'); // 'individual' or 'organization'
  const [step, setStep] = useState(1); // 1: account type, 2: basic info, 3: additional details
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    
    // Individual user fields
    fullName: '',
    avatarUrl: '',
    bio: '',
    walletAddress: '',
    
    // Organization fields
    name: '',
    description: '',
    logoUrl: '',
    website: '',
    orgWalletAddress: '',
    legalDocuments: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      // No validation needed for step 1 (account type selection)
      return true;
    }
    
    if (step === 2) {
      // Email validation
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      // Password validation
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      // Confirm password
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (step === 3) {
      if (accountType === 'individual') {
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Full name is required';
        }
      } else {
        if (!formData.name.trim()) {
          newErrors.name = 'Organization name is required';
        }
        if (!formData.description.trim()) {
          newErrors.description = 'Description is required';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

const handleSubmit = async (e: { preventDefault: () => void; }) => {
  e.preventDefault();

  if (!validateStep()) return;

  setIsLoading(true);

  try {
    // Prepare the data based on account type
    const signupData = accountType === 'individual'
      ? {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          avatarUrl: formData.avatarUrl || null,
          bio: formData.bio || null,
          walletAddress: formData.walletAddress || null,
          role: 'donor'
        }
      : {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          description: formData.description,
          logoUrl: formData.logoUrl || null,
          website: formData.website || null,
          walletAddress: formData.orgWalletAddress || null,
          legalDocuments: formData.legalDocuments || null,
          role: 'organization'
        };

    // Try to sign up first
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
    let response = await fetch(`${apiUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });

    let data = await response.json();
    let token = data.token || data.access_token || (data.data && data.data.token);
    let userRole = (data.user && data.user.role) || signupData.role;

    // If signup succeeded and token is present, store and redirect
    if (response.ok && token) {
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('userId', data.user?.id || '');


      window.location.href = '/';
      return;
    }

    // If signup failed or no token, attempt login (user might already exist)
    if (!token) {
      // Try login with the same credentials
      try {
        const loginResponse = await api.post('/api/auth/login', {
          email: formData.email,
          password: formData.password
        });

        if (loginResponse.data && loginResponse.data.token) {
          localStorage.setItem('token', loginResponse.data.token);
          localStorage.setItem('userRole', loginResponse.data.user?.role || signupData.role);
          router.push('/');
          return;
        } else {
          throw new Error('No authentication token received after login.');
        }
      } catch (loginErr) {
        if (loginErr && typeof loginErr === 'object') {
          const errObj = loginErr as any;
          throw new Error(
            errObj.response?.data?.message ||
            errObj.message ||
            'Signup and login both failed.'
          );
        } else {
          throw new Error('Signup and login both failed.');
        }
      }
    }
  } catch (err) {
    setErrors({ form: err instanceof Error ? err.message : 'An error occurred during signup. Please try again.' });
    console.error('Signup/login error:', err);
  } finally {
    setIsLoading(false);
  }
};





  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white text-center mb-6">Choose Account Type</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => setAccountType('individual')}
                className={`p-6 rounded-xl border ${accountType === 'individual' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-700 bg-black/30'} flex items-start hover:border-emerald-500/70 transition-all duration-300`}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-500/30 transform rotate-45 mr-4">
                  <User className="h-6 w-6 text-emerald-500 transform -rotate-45" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-white font-medium text-lg">Individual</h4>
                  <p className="text-gray-400 mt-1">Create a personal account to donate or support causes</p>
                </div>
                {accountType === 'individual' && (
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setAccountType('organization')}
                className={`p-6 rounded-xl border ${accountType === 'organization' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-700 bg-black/30'} flex items-start hover:border-emerald-500/70 transition-all duration-300`}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-500/30 transform rotate-45 mr-4">
                  <Building className="h-6 w-6 text-emerald-500 transform -rotate-45" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-white font-medium text-lg">Organization</h4>
                  <p className="text-gray-400 mt-1">Create an organization account to fundraise and manage campaigns</p>
                </div>
                {accountType === 'organization' && (
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
            
            <div className="pt-4">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 flex items-center justify-center"
              >
                Continue
                
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white text-center mb-6">
              {accountType === 'individual' ? 'Create Your Account' : 'Create Organization Account'}
            </h3>
            
            {errors.form && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.form}
              </div>
            )}
            
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
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-3 py-3 border ${errors.email ? 'border-red-500/50' : 'border-emerald-500/30'} bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300`}
                  placeholder="your@email.com"
                  required
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-white text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-10 py-3 border ${errors.password ? 'border-red-500/50' : 'border-emerald-500/30'} bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300`}
                  placeholder="- - - - - - - -"
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
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-10 py-3 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-emerald-500/30'} bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300`}
                  placeholder="- - - - - - - -"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center text-emerald-500 hover:text-emerald-400 focus:outline-none"
                  >
                    {showConfirmPassword ? 
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
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
            </div>
            
            <div className="flex items-start">
              <div className="relative">
                <input
                  id="terms"
                  type="checkbox"
                  className="opacity-0 absolute h-5 w-5 cursor-pointer"
                  required
                />
                <div className="bg-black/50 border border-emerald-500/30 rounded w-5 h-5 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-emerald-500">
                  <svg className="fill-current hidden w-3 h-3 text-emerald-500 pointer-events-none" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                </div>
              </div>
              <label htmlFor="terms" className="ml-1 text-sm text-gray-300 cursor-pointer select-none">
                I agree to the <Link href="/terms" className="text-emerald-400 hover:text-emerald-300 border-b border-emerald-500/30 hover:border-emerald-400">Terms of Service</Link> and <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 border-b border-emerald-500/30 hover:border-emerald-400">Privacy Policy</Link>
              </label>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 py-4 px-4 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all duration-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-2/3 py-4 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 flex items-center justify-center"
              >
                Continue
                
              </button>
            </div>
          </div>
        );
        
      case 3:
        return accountType === 'individual' ? (
          // Individual user form
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white text-center mb-6">Complete Your Profile</h3>
            
            <div>
              <label htmlFor="fullName" className="block text-white text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                    <User className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-3 py-3 border ${errors.fullName ? 'border-red-500/50' : 'border-emerald-500/30'} bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300`}
                  placeholder="John Doe"
                  required
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>}
            </div>
            
            <div>
              <label htmlFor="avatarUrl" className="block text-white text-sm font-medium mb-2">Profile Picture URL (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <input
                  id="avatarUrl"
                  name="avatarUrl"
                  type="text"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-3 py-3 border border-emerald-500/30 bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-white text-sm font-medium mb-2">Bio (Optional)</label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </div>
                </div>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-3 py-3 border border-emerald-500/30 bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 min-h-[100px]"
                  placeholder="Tell us a bit about yourself..."
                ></textarea>
              </div>
            </div>
            
            <div>
              <label htmlFor="walletAddress" className="block text-white text-sm font-medium mb-2">Wallet Address (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <input
                  id="walletAddress"
                  name="walletAddress"
                  type="text"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-3 py-3 border border-emerald-500/30 bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                  placeholder="0x..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 py-4 px-4 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-2/3 py-4 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create Account
                  </div>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Organization form
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white text-center mb-6">Organization Details</h3>
            
            <div>
              <label htmlFor="name" className="block text-white text-sm font-medium mb-2">Organization Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                    <Building className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-3 py-3 border ${errors.name ? 'border-red-500/50' : 'border-emerald-500/30'} bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300`}
                  placeholder="Organization Name"
                  required
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-white text-sm font-medium mb-2">Description</label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </div>
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-3 py-3 border ${errors.description ? 'border-red-500/50' : 'border-emerald-500/30'} bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 min-h-[100px]`}
                  placeholder="Describe your organization's mission and goals..."
                  required
                ></textarea>
              </div>
              {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
            </div>
            
            <div>
              <label htmlFor="logoUrl" className="block text-white text-sm font-medium mb-2">Logo URL (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <input
                  id="logoUrl"
                  name="logoUrl"
                  type="text"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-3 py-3 border border-emerald-500/30 bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                  placeholder="https://example.com/logo.jpg"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="website" className="block text-white text-sm font-medium mb-2">Website (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                    <Globe className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <input
                  id="website"
                  name="website"
                  type="text"
                  value={formData.website}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-3 py-3 border border-emerald-500/30 bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                  placeholder="https://example.org"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="orgWalletAddress" className="block text-white text-sm font-medium mb-2">Organization Wallet Address (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <input
                  id="orgWalletAddress"
                  name="orgWalletAddress"
                  type="text"
                  value={formData.orgWalletAddress}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-3 py-3 border border-emerald-500/30 bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                  placeholder="0x..."
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="legalDocuments" className="block text-white text-sm font-medium mb-2">Legal Documents URL (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                    <FileText className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <input
                  id="legalDocuments"
                  name="legalDocuments"
                  type="text"
                  value={formData.legalDocuments}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-3 py-3 border border-emerald-500/30 bg-black/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                  placeholder="https://example.com/documents.pdf"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 py-4 px-4 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-2/3 py-4 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Organization...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create Organization
                  </div>
                )}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 flex overflow-hidden">
      {/* Left side - Enhanced Blockchain Security Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 items-center justify-center overflow-hidden h-full">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-900/20 animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-900/10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)]"></div>
        
        {/* Enhanced blockchain security animation */}
        <div className="relative z-10 p-10 max-w-md">
          <div className="mb-10 text-center">
            <span className="text-white text-5xl font-bold tracking-tight">
              Fund<span className="text-emerald-500">Wise</span>
            </span>
            <p className="text-emerald-400 text-lg">Secure blockchain-powered donations</p>
          </div>
          
          {/* New Blockchain Security Animation */}
          <BlockchainSecurityAnimation />
          
          <div className="mt-12 text-center">
            <p className="text-gray-300 text-lg">Your data is protected by blockchain technology</p>
            <div className="mt-4 flex items-center justify-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
              <p className="text-emerald-400">Secure, encrypted, and tamper-proof</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative">
        {/* Enhanced background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)] lg:hidden"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-10 w-20 h-20 bg-emerald-500/5 rounded-xl transform rotate-45"></div>
          <div className="absolute bottom-20 left-10 w-16 h-16 bg-emerald-500/5 rounded-xl transform rotate-45"></div>
        </div>
        
        <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-emerald-900/40 hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-500">
          <div className="p-8">
            {renderStepContent()}
            
            {step === 1 && (
              <div className="mt-8 text-center text-sm">
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors border-b border-emerald-500/30 hover:border-emerald-400">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
