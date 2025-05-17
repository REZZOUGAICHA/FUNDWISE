import CampaignForm from '@/components/campaigns/CampaignForm';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function CreateCampaignPage() {
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
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FileText className="mr-3 h-8 w-8 text-emerald-500" />
            Create a New Campaign
          </h1>
          <p className="text-emerald-400 mt-1">Start fundraising with blockchain-powered transparency</p>
        </div>

        <CampaignForm />
      </div>
    </div>
  );
}
