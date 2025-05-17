import Link from 'next/link';
import CampaignList from '@/components/campaigns/CampaignList';
import { PlusCircle, Zap } from 'lucide-react';

// This would normally come from an API call
const mockCampaigns = [
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
    id: '2',
    title: 'Education for All',
    description: 'Help us build a new school in rural Tanzania to serve 500 children',
    image_url: '/background7.jpg',
    target_amount: 15,
    current_amount: 0,
    start_date: '2025-05-01T00:00:00Z',
    end_date: '2025-08-01T23:59:59Z',
    status: 'pending',
    organization_id: '2',
    organizationName: 'Education First'
  },
  {
    id: '3',
    title: 'Medical Supplies Drive',
    description: 'Provide essential medical supplies to underserved communities',
    image_url: '/campaign-placeholder.jpg',
    target_amount: 10,
    current_amount: 5,
    start_date: '2025-03-01T00:00:00Z',
    end_date: '2025-06-01T23:59:59Z',
    status: 'active',
    organization_id: '3',
    organizationName: 'Health Alliance'
  }
];

export default function CampaignsPage() {
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
        <div className="flex justify-end mb-6">
          <Link
            href="/campaigns/create"
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 flex items-center"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Campaign
          </Link>
        </div>

        <CampaignList campaigns={mockCampaigns} />
      </div>
    </div>
  );
}
