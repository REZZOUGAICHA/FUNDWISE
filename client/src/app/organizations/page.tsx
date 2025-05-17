import Link from 'next/link';
import OrganizationCard from '@/components/organizations/OrganizationCard';
import { Building, Search, PlusCircle } from 'lucide-react';

// Mock data for organizations
const organizations = [
  {
    id: '1',
    name: 'Global Relief',
    description: 'Providing emergency relief and sustainable solutions worldwide.',
    logo_url: '/campaign-placeholder.jpg',
    verification_status: 'approved',
    campaignCount: 2,
    totalRaised: 20
  },
  {
    id: '2',
    name: 'Education First',
    description: 'Building schools and educational programs in underserved communities.',
    logo_url: '/campaign-placeholder.jpg',
    verification_status: 'approved',
    campaignCount: 1,
    totalRaised: 15
  },
  {
    id: '3',
    name: 'Health Alliance',
    description: 'Improving healthcare access and medical supplies distribution.',
    logo_url: '/campaign-placeholder.jpg',
    verification_status: 'pending',
    campaignCount: 1,
    totalRaised: 5
  }
];

export default function OrganizationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 pb-16 mt-10">
      {/* Header Banner */}
      <div className="relative bg-black h-64 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)]"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-900/20 animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-900/10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center">
            <Building className="mr-4 h-10 w-10 text-emerald-500" />
            Organizations
          </h1>
          <p className="text-emerald-400 text-xl max-w-2xl">
            Discover verified organizations making a difference through blockchain-powered donations
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-10 relative z-20">
        {/* Search and Filter Bar */}
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 p-4 mb-10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-emerald-500" />
            </div>
            <input
              type="text"
              placeholder="Search organizations..."
              className="w-full pl-10 pr-4 py-3 bg-black/50 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <select className="bg-black/50 border border-zinc-800 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
              <option value="">All Categories</option>
              <option value="education">Education</option>
              <option value="health">Healthcare</option>
              <option value="environment">Environment</option>
              <option value="humanitarian">Humanitarian</option>
            </select>
            
            <Link href="/organizations/register" className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 flex items-center whitespace-nowrap">
              <PlusCircle className="mr-2 h-5 w-5" />
              Register Organization
            </Link>
          </div>
        </div>
        
        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {organizations.map((org, index) => (
            <div key={org.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <OrganizationCard
                id={org.id}
                name={org.name}
                description={org.description}
                logo_url={org.logo_url}
                verification_status={org.verification_status}
                campaignCount={org.campaignCount}
                totalRaised={org.totalRaised}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
