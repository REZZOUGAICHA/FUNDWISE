"use client";

import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { Calendar, Users, Clock, Target } from 'lucide-react';

interface CampaignCardProps {
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

export default function CampaignCard({
  id,
  title,
  description,
  image_url,
  target_amount,
  current_amount,
  end_date,
  status,
  organizationName
}: CampaignCardProps) {
  const progress = (current_amount / target_amount) * 100;
  const endDate = new Date(end_date);
  const timeLeft = endDate > new Date() ? formatDistanceToNow(endDate, { addSuffix: true }) : 'Ended';
  
  const getStatusColor = () => {
    switch(status) {
      case 'active': return 'bg-emerald-500 text-black';
      case 'pending': return 'bg-amber-500 text-black';
      case 'completed': return 'bg-blue-500 text-black';
      default: return 'bg-zinc-500 text-black';
    }
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-emerald-900/30 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all duration-300 group">
      {/* Card Image */}
      <div className="relative h-48 overflow-hidden">
        <Image 
          src={image_url || '/campaign-placeholder.jpg'} 
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 ${getStatusColor()} px-3 py-1 rounded-full text-xs font-medium shadow-lg`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
        
        {/* Organization Badge */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center text-xs">
          <Users className="h-3 w-3 text-emerald-500 mr-1.5" />
          <span className="text-gray-200">{organizationName}</span>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors duration-300">{title}</h3>
        <p className="text-gray-400 text-sm mb-5 line-clamp-2">{description}</p>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-emerald-500">{current_amount} ETH raised</span>
            <span className="text-gray-400">{target_amount} ETH goal</span>
          </div>
          <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Time Left */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center text-gray-400 text-sm">
            <Target className="h-4 w-4 text-emerald-500 mr-1.5" />
            <span>{Math.round(progress)}% funded</span>
          </div>
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="h-4 w-4 text-emerald-500 mr-1.5" />
            <span>{timeLeft}</span>
          </div>
        </div>
        
        {/* Action Button */}
        <Link 
          href={`/campaigns/${id}`} 
          className="block w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 text-center"
        >
          View Campaign
        </Link>
      </div>
    </div>
  );
}
