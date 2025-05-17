"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Wallet, DollarSign, CreditCard, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Info, Copy, ExternalLink } from 'lucide-react';

interface DonatePageProps {
  params: Promise<{ id: string }>;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  raised: number;
  goal: number;
  organization: {
    name: string;
    id: string;
    walletAddress: string;
  };
}

export default function DonatePage({ params }: DonatePageProps) {
  const router = useRouter();
  const { id } = use(params); // Properly unwrap the params promise using React.use()
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMethod, setDonationMethod] = useState('crypto');
  const [currentStep, setCurrentStep] = useState(1);
  const [transactionStatus, setTransactionStatus] = useState<null | 'pending' | 'success' | 'failed'>(null); // 'pending', 'success', 'failed'
  const [transactionHash, setTransactionHash] = useState('');
  
  // Predefined donation amounts
  const suggestedAmounts = [0.01, 0.05, 0.1, 0.5, 1];

  useEffect(() => {
    // Fetch campaign data
    const fetchCampaign = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/campaigns/${id}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockCampaign = {
          id,
          title: 'Clean Water Initiative',
          description: 'Fund 10 new wells in communities facing water scarcity',
          imageUrl: '/background4.jpg',
          raised: 15,
          goal: 20,
          organization: {
            name: 'Global Relief',
            id: '1',
            walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
          }
        };
        
        setCampaign(mockCampaign);
      } catch (error) {
        console.error('Error fetching campaign:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaign();
  }, [id]);

  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount.toString());
  };

  const handleAmountChange = (e: { target: { value: any; }; }) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDonationAmount(value);
    }
  };

  const handleContinue = () => {
    if (parseFloat(donationAmount) > 0) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleDonate = async () => {
    // Simulate transaction process
    setTransactionStatus('pending');
    
    try {
      // In a real app, this would interact with a blockchain wallet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful transaction
      setTransactionStatus('success');
      setTransactionHash('0x' + Math.random().toString(16).substring(2, 34));
      
      // In a real app, you would call your API to record the donation
      // await fetch('/api/donations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     campaignId: id,
      //     amount: parseFloat(donationAmount),
      //     transactionHash,
      //     method: donationMethod
      //   })
      // });
      
    } catch (error) {
      console.error('Donation error:', error);
      setTransactionStatus('failed');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 flex items-center justify-center mt-10">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 flex items-center justify-center">
        <div className="text-center p-8 bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
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
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Link 
          href={`/campaigns/${id}`} 
          className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-8 w-fit px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to campaign
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl mb-8">
            {/* Campaign Header */}
            <div className="relative h-48 md:h-64">
              <Image 
                src={campaign.imageUrl} 
                alt={campaign.title}
                fill
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{campaign.title}</h1>
                <p className="text-emerald-400">by {campaign.organization.name}</p>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-emerald-500">{campaign.raised} ETH raised</span>
                  <span className="text-gray-400">{campaign.goal} ETH goal</span>
                </div>
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                    style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Donation Steps */}
              {transactionStatus !== 'success' ? (
                <>
                  {/* Step Indicator */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center w-full">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${currentStep >= 1 ? 'bg-emerald-500 text-black' : 'bg-zinc-700 text-gray-300'}`}>
                        1
                      </div>
                      <div className={`h-1 flex-1 mx-2 ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${currentStep >= 2 ? 'bg-emerald-500 text-black' : 'bg-zinc-700 text-gray-300'}`}>
                        2
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 1: Choose Amount */}
                  {currentStep === 1 && (
                    <div className="animate-fade-in">
                      <h2 className="text-xl font-bold text-white mb-6">Choose Donation Amount</h2>
                      
                      {/* Suggested Amounts */}
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                        {suggestedAmounts.map(amount => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => handleAmountSelect(amount)}
                            className={`py-3 rounded-lg font-medium transition-all ${
                              donationAmount === amount.toString()
                                ? 'bg-emerald-600 text-black'
                                : 'bg-black/30 text-gray-300 border border-zinc-700 hover:border-emerald-500/30'
                            }`}
                          >
                            {amount} ETH
                          </button>
                        ))}
                      </div>
                      
                      {/* Custom Amount */}
                      <div className="mb-8">
                        <label htmlFor="custom-amount" className="block text-gray-300 mb-2 font-medium">
                          Or enter custom amount
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-emerald-500" />
                          </div>
                          <input
                            id="custom-amount"
                            type="text"
                            value={donationAmount}
                            onChange={handleAmountChange}
                            className="w-full pl-10 px-4 py-3 bg-black/50 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
                            placeholder="Enter amount in ETH"
                          />
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!donationAmount || parseFloat(donationAmount) <= 0}
                        className={`w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg flex items-center justify-center ${
                          !donationAmount || parseFloat(donationAmount) <= 0 ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        Continue
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </button>
                    </div>
                  )}
                  
                  {/* Step 2: Choose Payment Method */}
                  {currentStep === 2 && (
                    <div className="animate-fade-in">
                      <h2 className="text-xl font-bold text-white mb-6">Choose Payment Method</h2>
                      
                      <div className="space-y-4 mb-8">
                        {/* Crypto Wallet Option */}
                        <div 
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            donationMethod === 'crypto' 
                              ? 'border-emerald-500 bg-emerald-500/10' 
                              : 'border-zinc-700 hover:border-emerald-500/30'
                          }`}
                          onClick={() => setDonationMethod('crypto')}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-emerald-900/30 rounded-full flex items-center justify-center mr-4">
                              <Wallet className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-medium">Crypto Wallet</h3>
                              <p className="text-gray-400 text-sm">Connect your wallet and donate directly</p>
                            </div>
                            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center ml-2">
                              {donationMethod === 'crypto' && (
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Credit Card Option */}
                        <div 
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            donationMethod === 'card' 
                              ? 'border-emerald-500 bg-emerald-500/10' 
                              : 'border-zinc-700 hover:border-emerald-500/30'
                          }`}
                          onClick={() => setDonationMethod('card')}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-emerald-900/30 rounded-full flex items-center justify-center mr-4">
                              <CreditCard className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-medium">Credit Card</h3>
                              <p className="text-gray-400 text-sm">Donate using your credit or debit card</p>
                            </div>
                            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center ml-2">
                              {donationMethod === 'card' && (
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Donation Summary */}
                      <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 mb-8">
                        <h3 className="text-white font-medium mb-3">Donation Summary</h3>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Amount:</span>
                          <span className="text-white">{donationAmount} ETH</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Campaign:</span>
                          <span className="text-white">{campaign.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Organization:</span>
                          <span className="text-white">{campaign.organization.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all duration-300"
                        >
                          Back
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleDonate}
                          className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg flex items-center justify-center"
                        >
                          {donationMethod === 'crypto' ? 'Connect Wallet & Donate' : 'Proceed to Payment'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                  <p className="text-gray-300 mb-6">Your donation of {donationAmount} ETH has been successfully processed.</p>
                  
                  <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 mb-6 max-w-md mx-auto text-left">
                    <h3 className="text-white font-medium mb-3">Transaction Details</h3>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white">{donationAmount} ETH</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-emerald-500">Confirmed</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Transaction Hash:</span>
                      <div className="flex items-center">
                        <span className="text-white text-sm truncate max-w-[150px]">{transactionHash}</span>
                        <button 
                          onClick={() => copyToClipboard(transactionHash)}
                          className="ml-2 text-emerald-500 hover:text-emerald-400"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link 
                      href={`/donations/track/${transactionHash}`} 
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg flex items-center justify-center"
                    >
                      Track Your Donation
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    
                    <Link 
                      href="/campaigns" 
                      className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all duration-300 flex items-center justify-center"
                    >
                      Explore More Campaigns
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Transaction Processing UI */}
              {transactionStatus === 'pending' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-zinc-900 rounded-xl border border-emerald-900/30 p-8 max-w-md w-full text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold text-white mb-2">Processing Your Donation</h3>
                    <p className="text-gray-400 mb-4">Please wait while we process your transaction...</p>
                    <p className="text-emerald-500 text-sm">Do not close this window</p>
                  </div>
                </div>
              )}
              
              {/* Transaction Failed UI */}
              {transactionStatus === 'failed' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-zinc-900 rounded-xl border border-red-900/30 p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Transaction Failed</h3>
                    <p className="text-gray-400 mb-6">There was an error processing your donation. Please try again.</p>
                    <button
                      onClick={() => setTransactionStatus(null)}
                      className="px-6 py-3 bg-emerald-600 text-black rounded-lg font-medium hover:bg-emerald-500 transition-all duration-300"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Info Section */}
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Info className="h-5 w-5 text-emerald-500 mr-2" />
              About Blockchain Donations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                <h3 className="text-white font-medium mb-2">Transparent</h3>
                <p className="text-gray-400 text-sm">All donations are recorded on the blockchain, making them fully transparent and traceable.</p>
              </div>
              
              <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                <h3 className="text-white font-medium mb-2">Secure</h3>
                <p className="text-gray-400 text-sm">Blockchain technology ensures your donation is securely processed and cannot be altered.</p>
              </div>
              
              <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                <h3 className="text-white font-medium mb-2">Direct Impact</h3>
                <p className="text-gray-400 text-sm">Your donation goes directly to the campaign with minimal fees, maximizing your impact.</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <a 
                href="https://etherscan.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Learn more about blockchain donations
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}