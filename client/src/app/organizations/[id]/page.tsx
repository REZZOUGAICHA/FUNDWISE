import Link from 'next/link';
import Image from 'next/image';
import CampaignCard from '@/components/campaigns/CampaignCard';
import { Building, CheckCircle, Globe, Calendar, DollarSign, ArrowLeft, Clock, Users } from 'lucide-react';

// Mock API
const getOrganizationData = (id: string) => {
  return {
    id,
    name: 'Global Relief',
    description: 'Providing emergency relief and sustainable solutions worldwide. Our mission is to deliver immediate assistance to communities affected by natural disasters, conflicts, and other emergencies, while also implementing long-term development projects that address the root causes of vulnerability.',
    logo_url: '/campaign-placeholder.jpg',
    website: 'https://globalrelief.example.org',
    verification_status: 'approved',
    created_at: '2025-04-05T13:45:00Z',
    campaigns: [
      {
        id: '1',
        title: 'Clean Water Initiative',
        description: 'Fund 10 new wells in communities facing water scarcity',
        image_url: '/campaign-placeholder.jpg',
        target_amount: 20,
        current_amount: 15,
        start_date: '2025-04-15T00:00:00Z',
        end_date: '2025-07-15T23:59:59Z',
        status: 'active',
        organization_id: id,
        organizationName: 'Global Relief'
      },
      {
        id: '2',
        title: 'Education for All',
        description: 'Help us build a new school in rural Tanzania to serve 500 children',
        image_url: '/campaign-placeholder.jpg',
        target_amount: 15,
        current_amount: 0,
        start_date: '2025-05-01T00:00:00Z',
        end_date: '2025-08-01T23:59:59Z',
        status: 'pending',
        organization_id: id,
        organizationName: 'Global Relief'
      }
    ]
  };
};

export default function OrganizationDetailPage({ params }: { params: { id: string } }) {
  const organization = getOrganizationData(params.id);

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 flex items-center justify-center">
        <div className="text-center p-8 bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-white">Organization not found</h1>
          <p className="text-gray-400 mb-6">The organization you're looking for doesn't exist or has been removed.</p>
          <Link href="/organizations" className="px-6 py-3 bg-emerald-600 text-black rounded-lg font-medium hover:bg-emerald-500 transition-all inline-flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to organizations
          </Link>
        </div>
      </div>
    );
  }

  const totalRaised = organization.campaigns.reduce((sum, campaign) => sum + campaign.current_amount, 0);
  const activeCampaigns = organization.campaigns.filter(campaign => campaign.status === 'active').length;
  const formattedDate = new Date(organization.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 pb-16">
      {/* Header Banner */}
      <div className="relative bg-black h-64 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)]"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-900/20 animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-900/10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-10 relative z-10">
          <Link href="/organizations" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-4 w-fit px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to organizations
          </Link>
          
          <h1 className="text-4xl font-bold text-white">{organization.name}</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-20 relative z-20">
        {/* Organization Card */}
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl mb-10">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo and Verification */}
              <div className="flex flex-col items-center">
                <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-black shadow-lg mb-4">
                  {organization.logo_url ? (
                    <Image 
                      src={organization.logo_url} 
                      alt={organization.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-emerald-400 font-bold text-6xl">
                      {organization.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                {organization.verification_status === 'approved' && (
                  <div className="bg-emerald-500/20 backdrop-blur-sm text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/30 flex items-center text-sm font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verified Organization
                  </div>
                )}
              </div>
              
              {/* Organization Details */}
              <div className="flex-1">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4">About</h2>
                  <p className="text-gray-300 leading-relaxed">{organization.description}</p>
                </div>
                
                {organization.website && (
                  <a 
                    href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-6 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-black/40 rounded-xl p-6 border border-zinc-800 hover:border-emerald-900/30 transition-all duration-300 group">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-emerald-900/20 flex items-center justify-center mr-4">
                    <DollarSign className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Raised</p>
                    <p className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">{totalRaised} <span className="text-emerald-500 text-lg">ETH</span></p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 rounded-xl p-6 border border-zinc-800 hover:border-emerald-900/30 transition-all duration-300 group">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-emerald-900/20 flex items-center justify-center mr-4">
                    <Clock className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Active Campaigns</p>
                    <p className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">{activeCampaigns}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 rounded-xl p-6 border border-zinc-800 hover:border-emerald-900/30 transition-all duration-300 group">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-emerald-900/20 flex items-center justify-center mr-4">
                    <Calendar className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Member Since</p>
                    <p className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{formattedDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Campaigns Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Users className="h-6 w-6 text-emerald-500 mr-3" />
              Campaigns by {organization.name}
            </h2>
            
            <div className="flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-emerald-400 text-sm">Blockchain Secured</span>
            </div>
          </div>
          
          {organization.campaigns.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800">
              <div className="w-20 h-20 mx-auto bg-black/40 rounded-full flex items-center justify-center mb-4">
                <Building className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Campaigns Yet</h3>
              <p className="text-gray-400 max-w-md mx-auto">This organization has not created any campaigns yet. Check back later for updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {organization.campaigns.map((campaign, index) => (
                <div key={campaign.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CampaignCard {...campaign} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
