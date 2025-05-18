"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Clock, AlertCircle, Search, Filter, ArrowRight, DollarSign, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useSearchParams } from 'next/navigation';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Donation = {
  id: string;
  transactionHash: string;
  amount: number;
  status: string;
  timestamp: string;
  campaign: {
    id: string;
    title: string;
    imageUrl: string;
    organization: {
      id: string;
      name: string;
    };
  };
};

export default function UserDonationsPage() {
  const searchParams = useSearchParams();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedDonations, setDisplayedDonations] = useState<Donation[]>([]);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for payment status in URL
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      setPaymentSuccess('Payment successful! Thank you for your donation.');
    } else if (canceled === 'true') {
      setPaymentError('Payment was canceled.');
    }
  }, [searchParams]);

  useEffect(() => {
    // Fetch user donations
    const fetchDonations = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/user/donations');
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockDonations = [
          {
            id: '1',
            transactionHash: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            amount: 0.5,
            status: 'confirmed',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            campaign: {
              id: '1',
              title: 'Clean Water Initiative',
              imageUrl: '/background4.jpg',
              organization: {
                id: '1',
                name: 'Global Relief',
              }
            }
          },
          {
            id: '2',
            transactionHash: '0x88C7656EC7ab88b098defB751B7401B5f6d8976F',
            amount: 0.2,
            status: 'confirmed',
            timestamp: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
            campaign: {
              id: '3',
              title: 'Medical Supplies Drive',
              imageUrl: '/campaign-placeholder.jpg',
              organization: {
                id: '3',
                name: 'Health Alliance',
              }
            }
          },
          {
            id: '3',
            transactionHash: '0x99C7656EC7ab88b098defB751B7401B5f6d8976F',
            amount: 0.1,
            status: 'pending',
            timestamp: new Date().toISOString(), // Now
            campaign: {
              id: '2',
              title: 'Education for All',
              imageUrl: '/background7.jpg',
              organization: {
                id: '2',
                name: 'Education First',
              }
            }
          }
        ];
        
        setDonations(mockDonations);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonations();
  }, []);
  
  useEffect(() => {
    // Filter and search donations
    const filtered = donations.filter(donation => {
      const matchesFilter = filter === 'all' || donation.status === filter;
      const matchesSearch = donation.campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           donation.campaign.organization.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
    
    setDisplayedDonations(filtered);
  }, [donations, filter, searchTerm]);

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed':
        return (
          <div className="px-3 py-1 rounded-full flex items-center text-xs font-medium bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Confirmed
          </div>
        );
      case 'pending':
        return (
          <div className="px-3 py-1 rounded-full flex items-center text-xs font-medium bg-amber-500/20 text-amber-500 border-amber-500/30">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Pending
          </div>
        );
      case 'failed':
        return (
          <div className="px-3 py-1 rounded-full flex items-center text-xs font-medium bg-red-500/20 text-red-500 border-red-500/30">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
            Failed
          </div>
        );
      default:
        return null;
    }
  };

  const handlePayment = async (amount: number, campaignId: string) => {
    try {
      setProcessingPayment(true);
      setPaymentError(null);

      // Create a payment intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          campaignId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      // Load Stripe
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Your Donations</h1>
          <p className="text-emerald-400 mb-8">Track all your contributions and their impact</p>
          
          {/* Payment Status Notifications */}
          {paymentSuccess && (
            <div className="mb-6 bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                <p className="text-emerald-500">{paymentSuccess}</p>
              </div>
              <button
                onClick={() => setPaymentSuccess(null)}
                className="text-emerald-500 hover:text-emerald-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {paymentError && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-500">{paymentError}</p>
              </div>
              <button
                onClick={() => setPaymentError(null)}
                className="text-red-500 hover:text-red-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* Filters and Search */}
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Search Bar */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-emerald-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search by campaign or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
                />
              </div>
              
              {/* Filter Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <div className="flex items-center text-gray-400 mr-2">
                  <Filter className="h-4 w-4 mr-1" />
                  <span className="text-sm">Filter:</span>
                </div>
                {['all', 'confirmed', 'pending'].map((status) => (
                  <button 
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap
                      ${filter === status 
                        ? 'bg-emerald-600 text-black shadow-lg' 
                        : 'bg-black/30 text-gray-400 hover:bg-black/50 border border-zinc-800'
                      }`}
                  >
                    {status === 'all' ? 'All Donations' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Donations List */}
          {displayedDonations.length === 0 ? (
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-black/40 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No donations found</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                {searchTerm || filter !== 'all' 
                  ? "We couldn't find any donations matching your criteria. Try adjusting your filters or search terms."
                  : "You haven't made any donations yet. Explore campaigns and make a difference today!"}
              </p>
              <Link 
                href="/campaigns" 
                className="px-6 py-3 bg-emerald-600 text-black rounded-lg font-medium hover:bg-emerald-500 transition-all inline-flex items-center"
              >
                Explore Campaigns
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedDonations.map((donation) => (
                <div 
                  key={donation.id}
                  className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-md hover:shadow-lg hover:border-emerald-900/30 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Campaign Image */}
                    <div className="md:w-1/4 relative h-48 md:h-auto">
                      <Image 
                        src={donation.campaign.imageUrl} 
                        alt={donation.campaign.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    
                    {/* Donation Details */}
                    <div className="p-6 md:w-3/4 flex flex-col">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-bold text-white mb-1">{donation.campaign.title}</h2>
                          <p className="text-emerald-400 text-sm">by {donation.campaign.organization.name}</p>
                        </div>
                        {getStatusBadge(donation.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">Amount</p>
                          <p className="text-xl font-bold text-white">{donation.amount} ETH</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Date</p>
                          <p className="text-white">{formatDate(donation.timestamp)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Transaction</p>
                          <p className="text-white text-sm truncate">{donation.transactionHash.substring(0, 18)}...</p>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex flex-col sm:flex-row gap-3 pt-4">
                        <Link 
                          href={`/campaigns/${donation.campaign.id}`}
                          className="px-4 py-2 bg-black/30 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-900/20 transition-all duration-300 text-center text-sm"
                        >
                          View Campaign
                        </Link>
                        <button
                          onClick={() => handlePayment(donation.amount, donation.campaign.id)}
                          disabled={processingPayment}
                          className="px-4 py-2 bg-emerald-600 text-black rounded-lg hover:bg-emerald-500 transition-all duration-300 text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingPayment ? 'Processing...' : 'Donate Again'}
                        </button>
                        <Link 
                          href={`/donations/track/${donation.transactionHash}`}
                          className="px-4 py-2 bg-emerald-600 text-black rounded-lg hover:bg-emerald-500 transition-all duration-300 text-center text-sm"
                        >
                          Track Donation
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Summary Section */}
          {displayedDonations.length > 0 && (
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 p-6 mt-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">Donation Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                  <h3 className="text-white font-medium mb-2">Total Donated</h3>
                  <p className="text-2xl font-bold text-emerald-500">
                    {displayedDonations.reduce((sum, donation) => sum + donation.amount, 0).toFixed(2)} ETH
                  </p>
                </div>
                
                <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                  <h3 className="text-white font-medium mb-2">Campaigns Supported</h3>
                  <p className="text-2xl font-bold text-emerald-500">
                    {new Set(displayedDonations.map(d => d.campaign.id)).size}
                  </p>
                </div>
                
                <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                  <h3 className="text-white font-medium mb-2">Organizations Supported</h3>
                  <p className="text-2xl font-bold text-emerald-500">
                    {new Set(displayedDonations.map(d => d.campaign.organization.id)).size}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
