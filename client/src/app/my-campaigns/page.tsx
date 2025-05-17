"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CampaignList from '@/components/campaigns/CampaignList';
import { PlusCircle, BarChart2 } from 'lucide-react';


const mockOrganizationCampaigns = [
  {
    id: '1',
    title: 'Clean Water Initiative',
    description: 'Fund 10 new wells in communities facing water scarcity',
    image_url: '/background1.jpg',
    target_amount: 20,
    current_amount: 15,
    start_date: '2025-04-15T00:00:00Z',
    end_date: '2025-07-15T23:59:59Z',
    status: 'active',
    organization_id: '1',
    organizationName: 'Global Relief'
  },
  {
    id: '4',
    title: 'Renewable Energy Project',
    description: 'Install solar panels in 5 villages to provide sustainable electricity',
    image_url: '/background5.jpg',
    target_amount: 25,
    current_amount: 10,
    start_date: '2025-05-10T00:00:00Z',
    end_date: '2025-08-10T23:59:59Z',
    status: 'active',
    organization_id: '1',
    organizationName: 'Global Relief'
  },
  {
    id: '7',
    title: 'Emergency Relief Fund',
    description: 'Support our rapid response team for disaster relief operations',
    image_url: '/background3.jpg',
    target_amount: 30,
    current_amount: 0,
    start_date: '2025-06-01T00:00:00Z',
    end_date: '2025-09-01T23:59:59Z',
    status: 'pending',
    organization_id: '1',
    organizationName: 'Global Relief'
  }
];

export default function MyCampaignsPage() {
  const [campaigns] = useState(mockOrganizationCampaigns);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simple loading simulation for UI testing
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
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
            <BarChart2 className="mr-4 h-10 w-10 text-emerald-500" />
            My Campaigns
          </h1>
          <p className="text-emerald-400 text-xl max-w-2xl">
            Manage your organization's fundraising campaigns
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-zinc-800/50 border border-emerald-900/30 rounded-lg px-4 py-2">
            <p className="text-emerald-400">
              <span className="font-bold">{campaigns.length}</span> campaigns
            </p>
          </div>
          
          <Link
            href="/campaigns/create"
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 flex items-center"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Campaign
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {/* Just render the campaigns directly */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden hover:shadow-lg hover:shadow-emerald-900/20 transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={campaign.image_url || '/campaign-placeholder.jpg'} 
                      alt={campaign.title}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    
                    <div className={`absolute top-3 right-3 ${
                      campaign.status === 'active' ? 'bg-emerald-500 text-black' : 
                      campaign.status === 'pending' ? 'bg-amber-500 text-black' : 
                      'bg-blue-500 text-black'
                    } px-3 py-1 rounded-full text-xs font-medium shadow-lg`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </div>
                    
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center text-xs">
                      <span className="text-gray-200">{campaign.organizationName}</span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors duration-300">{campaign.title}</h3>
                    <p className="text-gray-400 text-sm mb-5 line-clamp-2">{campaign.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-emerald-500">{campaign.current_amount} ETH raised</span>
                        <span className="text-gray-400">{campaign.target_amount} ETH goal</span>
                      </div>
                      <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.min((campaign.current_amount / campaign.target_amount) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-3">
                      
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="px-3 py-2 bg-emerald-900/20 text-emerald-400 rounded-lg hover:bg-emerald-900/30 transition-all duration-300 flex items-center text-sm flex-1 justify-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
