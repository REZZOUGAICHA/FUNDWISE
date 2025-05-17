import Link from 'next/link';
import CampaignDetails, { Campaign } from '@/components/campaigns/CampaignDetails';
import { ArrowLeft } from 'lucide-react';

// This would normally come from an API call based on the ID
const getCampaignData = (id: string): Campaign | null => {
  const campaigns: Campaign[] = [
    {
      id: '1',
      title: 'Clean Water Initiative',
      description: 'Fund 10 new wells in communities facing water scarcity. Access to clean water is a fundamental human right, yet millions around the world still lack this basic necessity. This campaign aims to address this critical issue by funding the construction of 10 new wells in communities facing severe water scarcity. Your contribution will help provide clean, safe drinking water to thousands of people, improving health outcomes and quality of life.',
      imageUrl: '/background4.jpg',
      raised: 15,
      goal: 20,
      status: 'active',
      isVerified: true,
      organization: {
        id: '1',
        name: 'Global Relief',
        email: 'info@globalrelief.org',
        phone: '+1 555-123-4567',
      },
      startDate: '2025-04-15',
      endDate: '2025-07-15',
      updates: [
        {
          date: '2025-05-01',
          title: 'First well location selected',
          content: 'We have selected the first community for well construction. Work will begin next week.'
        },
        {
          date: '2025-05-10',
          title: 'Construction begins',
          content: 'Construction equipment has arrived and ground has been broken on our first well.'
        }
      ]
    },
    {
      id: '2',
      title: 'Education for All',
      description: 'Help us build a new school in rural Tanzania to serve 500 children',
      imageUrl: '/campaign-placeholder.jpg',
      raised: 0,
      goal: 15,
      status: 'pending',
      isVerified: false,
      organization: {
        id: '2',
        name: 'Education First',
        email: 'contact@educationfirst.org',
        phone: '+1 555-987-6543',
      },
      startDate: '2025-05-01',
      endDate: '2025-08-01',
      updates: []
    }
  ];
  
  return campaigns.find(campaign => campaign.id === id) || null;
};

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const campaign = getCampaignData(id);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 flex items-center justify-center">
        <div className="text-center p-8 bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-white">Campaign not found</h1>
          <p className="text-gray-400 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
          <Link href="/campaigns" className="px-6 py-3 bg-emerald-600 text-black rounded-lg font-medium hover:bg-emerald-500 transition-all inline-flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to campaigns
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 pb-16">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/campaigns" 
          className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-8 w-fit px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to campaigns
        </Link>
        
        <CampaignDetails campaign={campaign} />
      </div>
    </div>
  );
}


