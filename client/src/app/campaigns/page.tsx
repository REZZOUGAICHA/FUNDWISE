"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CampaignList from '@/components/campaigns/CampaignList';
import { PlusCircle, Zap } from 'lucide-react';
import axios from 'axios';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrganization, setIsOrganization] = useState(false);
  
  useEffect(() => {
    // Check if user is organization from localStorage instead of using useAuth
    const userRole = localStorage.getItem('userRole');
    setIsOrganization(userRole === 'organization');
    
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        
        // Create axios instance with auth token
        const api = axios.create({
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await api.get('api/campaigns');
        setCampaigns(response.data);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaigns. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaigns();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 pb-16 mt-10">
      {/* Header Banner */}
      <div className="relative bg-black h-64 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)]"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-900/20 animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-900/10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center">
            <Zap className="mr-4 h-10 w-10 text-emerald-500" />
            Campaigns
          </h1>
          <p className="text-emerald-400 text-xl max-w-2xl">
            Support verified blockchain-powered campaigns making a real impact
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-10 relative z-20">
        {isOrganization && (
          <div className="flex justify-end mb-6">
            <Link
              href="/campaigns/create"
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 flex items-center"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Campaign
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400 text-center">
            {error}
          </div>
        ) : (
          <CampaignList campaigns={campaigns} />
        )}
      </div>
    </div>
  );
}
