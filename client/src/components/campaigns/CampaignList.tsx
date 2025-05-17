"use client";

import CampaignCard from './CampaignCard';
import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  image_url: string;
  ipfs_hash?: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  organization_id: string;
  organizationName: string;
}

interface CampaignListProps {
  campaigns: Campaign[];
  
}

export default function CampaignList({ campaigns }: CampaignListProps) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedCampaigns, setDisplayedCampaigns] = useState<Campaign[]>([]);
  
  useEffect(() => {
    const filtered = campaigns.filter(campaign => {
      const matchesFilter = filter === 'all' || campaign.status === filter;
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
    
    setDisplayedCampaigns(filtered);
  }, [campaigns, filter, searchTerm]);
  
  return (
    <div className="animate-fade-in">
      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 p-6 mb-10 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-emerald-500" />
            </div>
            <input
              type="text"
              placeholder="Search campaigns or organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-black/50 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <div className="flex items-center text-gray-400 mr-2">
              <Filter className="h-4 w-4 mr-1" />
              <span className="text-sm">Filter:</span>
            </div>
            {['all', 'active', 'pending', 'completed'].map((status) => (
              <button 
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap
                  ${filter === status 
                    ? 'bg-emerald-600 text-black shadow-lg' 
                    : 'bg-black/30 text-gray-400 hover:bg-black/50 border border-zinc-800'
                  }`}
              >
                {status === 'all' ? 'All Campaigns' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {displayedCampaigns.length === 0 ? (
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-black/40 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No campaigns found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            We couldn't find any campaigns matching your search criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedCampaigns.map((campaign, index) => (
            <div 
              key={campaign.id} 
              className="animate-fade-in" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CampaignCard {...campaign} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
