// app/campaigns/[id]/page.tsx
import CampaignDetails, { Campaign } from '@/components/campaigns/CampaignDetails';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  let campaign = null;
  function mapCampaignData(raw: any): Campaign {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    imageUrl: raw.image_url ?? '/campaign-placeholder.jpg',
    raised: Number(raw.current_amount),
    goal: Number(raw.target_amount),
    startDate: new Date(raw.start_date).toLocaleDateString(),
    endDate: new Date(raw.end_date).toLocaleDateString(),
    status: raw.status,
    isVerified: raw.organization?.verification_status === 'approved',
    organization: {
      id: raw.organization.id,
      name: raw.organization.name,
      email: 'contact@placeholder.com', // remplace si disponible
      phone: 'N/A', // idem
    },
  };
}

  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/api/campaigns/${params.id}`);
    campaign = res.data;
  } catch (err) {
    console.error('Error fetching campaign:', err);
  }

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
        <CampaignDetails campaign={mapCampaignData(campaign)} />

      </div>
    </div>
  );
}
