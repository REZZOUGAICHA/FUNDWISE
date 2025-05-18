import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Users,
  Clock,
  Target,
  Globe,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  raised: number;
  goal: number;
  status: 'active' | 'pending' | 'completed';
  isVerified: boolean;
  organization: Organization;
  startDate: string;
  endDate: string;
}

interface Update {
  date: string;
  title: string;
  content: string;
}

interface CampaignDetailsProps {
  campaign: Campaign | null;
}

export default function CampaignDetails({ campaign }: CampaignDetailsProps) {
  if (!campaign) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl p-8 text-center text-gray-400">
        Campaign not found.
      </div>
    );
  }
  console.log('Campaign Details:', campaign);

  const progress = (campaign.raised / campaign.goal) * 100;

  const getStatusColor = () => {
    switch (campaign.status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-500 border-zinc-500/30';
    }
  };

  const getStatusIcon = () => {
    switch (campaign.status) {
      case 'active':
        return <Clock className="h-4 w-4 mr-2" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 mr-2" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 mr-2" />;
      default:
        return <Clock className="h-4 w-4 mr-2" />;
    }
  };

  // 🔥 Updates hardcodés
  const updates: Update[] = [
    {
      date: '2025-01-10',
      title: 'Campaign Launched',
      content: 'We’re excited to kick off our campaign and begin making an impact!'
    },
    {
      date: '2025-01-20',
      title: '50% Goal Reached',
      content: 'Thanks to your generous support, we’ve reached 50% of our fundraising goal!'
    },
    {
      date: '2025-02-01',
      title: 'New Partnership Announced',
      content: 'We’re thrilled to announce a partnership that will amplify our efforts.'
    }
  ];

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
      {/* Hero Image */}
      <div className="relative h-80 md:h-96">
        <Image
          src={campaign.imageUrl || '/campaign-placeholder.jpg'}
          alt={campaign.title}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

        {/* Campaign Status */}
        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full border flex items-center text-sm font-medium shadow-lg backdrop-blur-sm ${getStatusColor()}`}>
          {getStatusIcon()}
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </div>

        {/* Verification Badge */}
        {campaign.isVerified && (
          <div className="absolute top-4 left-4 bg-emerald-500/20 backdrop-blur-sm text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-2" />
            Verified Campaign
          </div>
        )}
      </div>

      <div className="p-8">
        {/* Campaign Title & Organization */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{campaign.title}</h1>
          <Link href={`/organizations/${campaign.organization.id}`} className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors">
            <Users className="h-5 w-5 mr-2" />
            {campaign.organization.name}
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="bg-black/40 rounded-xl p-6 border border-zinc-800 mb-8">
          <div className="mb-4">
            <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Raised</p>
              <p className="text-2xl font-bold text-white">{campaign.raised} <span className="text-emerald-500 text-lg">ETH</span></p>
              <p className="text-gray-500 text-sm">of {campaign.goal} ETH goal</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Progress</p>
              <p className="text-2xl font-bold text-white">{Math.round(progress)}%</p>
              <p className="text-gray-500 text-sm">funded</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Timeline</p>
              <p className="text-emerald-400 text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {campaign.startDate}
              </p>
              <p className="text-emerald-400 text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {campaign.endDate}
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Description */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <MessageSquare className="h-6 w-6 text-emerald-500 mr-3" />
            About this Campaign
          </h2>
          <div className="prose prose-invert prose-emerald max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{campaign.description}</p>
          </div>
        </div>

        {/* Organization & Updates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Organization Details */}
          <div className="bg-black/40 rounded-xl p-6 border border-zinc-800 hover:border-emerald-900/30 transition-all duration-300">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Users className="h-5 w-5 text-emerald-500 mr-2" />
              Organization Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-white font-medium">{campaign.organization.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Contact</p>
                <p className="text-white">{campaign.organization.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white">{campaign.organization.phone}</p>
              </div>
              <Link
                href={`/organizations/${campaign.organization.id}`}
                className="inline-flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <Globe className="h-4 w-4 mr-2" />
                View Organization Profile
              </Link>
            </div>
          </div>

          {/* Campaign Updates */}
          <div className="bg-black/40 rounded-xl p-6 border border-zinc-800 hover:border-emerald-900/30 transition-all duration-300">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 text-emerald-500 mr-2" />
              Campaign Updates
            </h2>

            {updates.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No updates have been posted yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {updates.map((update, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-emerald-500/30">
                    <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-emerald-500"></div>
                    <p className="text-sm text-emerald-400 mb-1">{update.date}</p>
                    <h3 className="font-medium text-white mb-1">{update.title}</h3>
                    <p className="text-gray-400 text-sm">{update.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Donate Button */}
        {campaign.status === 'active' && (
          <Link href={`/campaigns/${campaign.id}/donate`}>
            <div className="flex justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 text-lg">
                Donate to this Campaign
              </button>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
