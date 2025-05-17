"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, Clock, ExternalLink, Copy, DollarSign, Calendar, Target, Users } from 'lucide-react';

interface Donation {
  id: string;
  transactionHash: string;
  amount: number;
  status: string;
  timestamp: string;
  confirmations: number;
  donor: {
    address: string;
  };
  campaign: {
    id: string;
    title: string;
    imageUrl: string;
    organization: {
      id: string;
      name: string;
    };
  };
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
  timeline: {
    status: string;
    timestamp: string;
    description: string;
  }[];
}

interface DonationTrackingPageProps {
  params: Promise<{ hash: string }>;
}

export default function DonationTrackingPage({ params }: DonationTrackingPageProps) {
  const [hash, setHash] = useState<string | null>(null);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Fetch donation data
    const fetchDonation = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/donations/${hash}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockDonation = {
          id: '123',
          transactionHash: hash ?? '', // Ensure transactionHash is always a string
          amount: 0.5,
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          confirmations: 16,
          donor: {
            address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            // In a real app, this could be the user's profile if they're logged in
          },
          campaign: {
            id: '1',
            title: 'Clean Water Initiative',
            imageUrl: '/background4.jpg',
            organization: {
              id: '1',
              name: 'Global Relief',
            }
          },
          // Blockchain transaction details
          blockNumber: 12345678,
          gasUsed: '21000',
          gasPrice: '20',
          timeline: [
            {
              status: 'initiated',
              timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
              description: 'Transaction initiated'
            },
            {
              status: 'pending',
              timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
              description: 'Transaction submitted to blockchain'
            },
            {
              status: 'confirmed',
              timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
              description: 'Transaction confirmed on blockchain'
            },
            {
              status: 'completed',
              timestamp: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
              description: 'Funds transferred to campaign'
            }
          ]
        };
        
        setDonation(mockDonation);
      } catch (error) {
        console.error('Error fetching donation:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonation();
  }, [hash]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 flex items-center justify-center">
        <div className="text-center p-8 bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-white">Donation Not Found</h1>
          <p className="text-gray-400 mb-6">We couldn't find any donation with this transaction hash.</p>
          <Link href="/donations" className="px-6 py-3 bg-emerald-600 text-black rounded-lg font-medium hover:bg-emerald-500 transition-all inline-flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            View Your Donations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Link 
          href="/donations" 
          className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-8 w-fit px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to donations
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl mb-8">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white">Donation Details</h1>
                <div className={`px-3 py-1 rounded-full flex items-center text-xs font-medium bg-emerald-500/20 text-emerald-500 border-emerald-500/30`}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Confirmed
                </div>
              </div>
              
              {/* Donation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="bg-black/40 rounded-xl p-6 border border-zinc-800 mb-4">
                    <h2 className="text-lg font-bold text-white mb-4">Transaction Details</h2>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-medium">{donation.amount} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white">{formatDate(donation.timestamp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-emerald-500">Confirmed ({donation.confirmations} confirmations)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Transaction Hash:</span>
                        <div className="flex items-center">
                          <span className="text-white text-sm truncate max-w-[150px]">{donation.transactionHash}</span>
                          <button 
                            onClick={() => copyToClipboard(donation.transactionHash)}
                            className="ml-2 text-emerald-500 hover:text-emerald-400"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Block Number:</span>
                        <span className="text-white">{donation.blockNumber}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <a 
                        href={`https://etherscan.io/tx/${donation.transactionHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        View on Etherscan
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 rounded-xl p-6 border border-zinc-800">
                    <h2 className="text-lg font-bold text-white mb-4">Gas Details</h2>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gas Used:</span>
                        <span className="text-white">{donation.gasUsed} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gas Price:</span>
                        <span className="text-white">{donation.gasPrice} Gwei</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Gas Fee:</span>
                        <span className="text-white">{(parseInt(donation.gasUsed) * parseInt(donation.gasPrice) / 1e9).toFixed(6)} ETH</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-black/40 rounded-xl overflow-hidden border border-zinc-800 mb-4">
                    <div className="relative h-48">
                      <Image 
                        src={donation.campaign.imageUrl} 
                        alt={donation.campaign.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-4">
                        <h3 className="text-lg font-bold text-white mb-1">{donation.campaign.title}</h3>
                        <p className="text-emerald-400 text-sm">by {donation.campaign.organization.name}</p>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <Link 
                        href={`/campaigns/${donation.campaign.id}`}
                        className="flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        View Campaign
                        <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 rounded-xl p-6 border border-zinc-800">
                    <h2 className="text-lg font-bold text-white mb-4">Donor Information</h2>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Wallet Address:</span>
                        <div className="flex items-center">
                          <span className="text-white text-sm truncate max-w-[150px]">{donation.donor.address}</span>
                          <button 
                            onClick={() => copyToClipboard(donation.donor.address)}
                            className="ml-2 text-emerald-500 hover:text-emerald-400"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <a 
                        href={`https://etherscan.io/address/${donation.donor.address}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        View Wallet on Etherscan
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Transaction Timeline */}
              <div className="bg-black/40 rounded-xl p-6 border border-zinc-800">
                <h2 className="text-lg font-bold text-white mb-6">Transaction Timeline</h2>
                
                <div className="relative">
                  <div className="absolute left-4 top-0 h-full w-0.5 bg-zinc-700"></div>
                  
                  <div className="space-y-8">
                    {donation.timeline.map((event, index) => (
                      <div key={index} className="relative flex items-start">
                        <div className={`absolute left-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          event.status === 'completed' || event.status === 'confirmed' 
                            ? 'bg-emerald-500 text-black' 
                            : event.status === 'pending' 
                              ? 'bg-amber-500 text-black'
                              : 'bg-zinc-700 text-white'
                        }`}>
                          {event.status === 'completed' || event.status === 'confirmed' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div className="ml-16">
                          <h3 className="text-white font-medium">{event.description}</h3>
                          <p className="text-gray-400 text-sm">{formatDate(event.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Impact Section */}
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Your Impact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 flex items-start">
                <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center mr-4">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Amount Donated</p>
                  <p className="text-2xl font-bold text-white">{donation.amount} <span className="text-emerald-500 text-lg">ETH</span></p>
                </div>
              </div>
              
              <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 flex items-start">
                <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center mr-4">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Date</p>
                  <p className="text-lg font-bold text-white">{new Date(donation.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 flex items-start">
                <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center mr-4">
                  <Target className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Campaign</p>
                  <p className="text-lg font-bold text-white">{donation.campaign.title}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-300 mb-4">Thank you for your contribution to this campaign!</p>
              <Link 
                href="/campaigns" 
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 inline-flex items-center"
              >
                Explore More Campaigns
                <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
