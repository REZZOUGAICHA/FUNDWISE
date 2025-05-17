"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Building, CheckCircle, Globe, ArrowRight } from 'lucide-react';

interface OrganizationCardProps {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  website?: string | null;
  verification_status: string;
  campaignCount: number;
  totalRaised: number;
}

export default function OrganizationCard({
  id,
  name,
  description,
  logo_url,
  website,
  verification_status,
  campaignCount,
  totalRaised
}: OrganizationCardProps) {
  const isVerified = verification_status === 'approved';

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-emerald-900/30 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all duration-300 group">
      <div className="relative">
        {/* Card Header with Logo */}
        <div className="h-32 bg-gradient-to-r from-emerald-900/40 to-black/60 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)]"></div>
          
          {/* Organization Logo */}
          <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-black shadow-lg z-10 group-hover:scale-105 transition-transform duration-300">
            {logo_url ? (
              <Image 
                src={logo_url} 
                alt={name}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-emerald-400 font-bold text-3xl">
                {name.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Verification Badge */}
          {isVerified && (
            <div className="absolute bottom-3 right-3 bg-emerald-500/20 backdrop-blur-sm text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center text-xs font-medium">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              Verified
            </div>
          )}
        </div>
        
        {/* Card Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors duration-300">{name}</h3>
          
          <p className="text-gray-400 mb-5 line-clamp-2 text-sm">{description}</p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-black/40 rounded-lg p-3 border border-zinc-800">
              <p className="text-xs text-gray-500 mb-1">Campaigns</p>
              <p className="text-lg font-bold text-emerald-400">{campaignCount}</p>
            </div>
            <div className="bg-black/40 rounded-lg p-3 border border-zinc-800">
              <p className="text-xs text-gray-500 mb-1">Total Raised</p>
              <p className="text-lg font-bold text-emerald-400">{totalRaised} ETH</p>
            </div>
          </div>
          
          {/* Website Link */}
          {website && (
            <a 
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-400 hover:text-emerald-400 text-sm mb-5 transition-colors"
            >
              <Globe className="h-4 w-4 mr-2" />
              {website}
            </a>
          )}
          
          {/* View Organization Button */}
          <Link 
            href={`/organizations/${id}`} 
            className="block w-full text-center py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 flex items-center justify-center"
          >
            View Organization
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
