"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, UploadCloud, CheckCircle, AlertCircle, Clock, DollarSign, FileText, Calendar } from 'lucide-react';

// Mock campaign data
const userCampaigns = [
  {
    id: '1',
    title: 'Clean Water Initiative',
    status: 'active',
    current_amount: 15,
    target_amount: 20,
  },
  {
    id: '3',
    title: 'Medical Supplies Drive',
    status: 'active',
    current_amount: 5,
    target_amount: 10,
  }
];

export default function FundReleasePage() {
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [timeline, setTimeline] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    } else {
      setFiles([]);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Reset form after successful submission
      setTimeout(() => {
        setIsSubmitted(false);
        setSelectedCampaign('');
        setAmount('');
        setPurpose('');
        setTimeline('');
        setFiles([]);
      }, 3000);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 pb-16 mt-15">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-emerald-500 hover:text-emerald-400 transition-colors mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
          >
            <ChevronLeft size={18} className="mr-1" />
            Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Fund Release Request</h1>
              <p className="text-emerald-400">Request funds from your active campaigns for approved usage</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-emerald-400 text-sm">Blockchain Secured</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-emerald-900/30 p-6 md:p-8 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-emerald-500/20 rounded-full p-4 mb-6">
                    <CheckCircle size={48} className="text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Request Submitted!</h2>
                  <p className="text-gray-400 text-center max-w-md mb-8">
                    Your fund release request has been submitted for verification. You'll be notified when it's approved.
                  </p>
                  <Link 
                    href="/fund-usage-proof" 
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg transform hover:-translate-y-1"
                  >
                    Submit Usage Proof
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <DollarSign className="h-5 w-5 text-emerald-500 mr-2" />
                    Request Details
                  </h2>
                  
                  <div className="form-group">
                    <label htmlFor="campaign-select" className="block text-gray-200 mb-2 font-medium">
                      Select Campaign
                    </label>
                    <div className="relative">
                      <select 
                        id="campaign-select"
                        className="w-full px-4 py-3 rounded-lg bg-black/50 text-gray-200 border border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-colors"
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        required
                      >
                        <option value="">Select a campaign</option>
                        {userCampaigns.map(campaign => (
                          <option key={campaign.id} value={campaign.id}>
                            {campaign.title} ({campaign.current_amount} ETH / {campaign.target_amount} ETH)
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="release-amount" className="block text-gray-200 mb-2 font-medium">
                      Amount (ETH)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-emerald-500">Ξ</span>
                      </div>
                      <input 
                        type="number"
                        id="release-amount"
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/50 text-gray-200 border border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
                        placeholder="e.g., 2.5"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="0.01"
                        min="0.01"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="release-purpose" className="block text-gray-200 mb-2 font-medium">
                      Purpose Description
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <FileText className="h-5 w-5 text-emerald-500" />
                      </div>
                      <textarea 
                        id="release-purpose"
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/50 text-gray-200 border border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
                        placeholder="Describe how these funds will be used"
                        rows={4}
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="release-timeline" className="block text-gray-200 mb-2 font-medium">
                      Timeline for Usage
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-emerald-500" />
                      </div>
                      <input 
                        type="text"
                        id="release-timeline"
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/50 text-gray-200 border border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
                        placeholder="e.g., 2 weeks for purchasing, 1 month for distribution"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-gray-200 mb-2 font-medium">
                      Supporting Documentation
                    </label>
                    <div 
                      className="border-2 border-dashed border-emerald-500/30 rounded-lg p-8 text-center cursor-pointer hover:bg-black/50 transition-colors group"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                        <UploadCloud size={32} className="text-emerald-500" />
                      </div>
                      <p className="text-gray-300 mb-2 font-medium">
                        Click to upload supporting documents
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, PNG (max 10MB) - Files will be stored via IPFS
                      </p>
                      <input 
                        type="file"
                        id="file-upload"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    {files.length > 0 && (
                      <div className="mt-4 p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                        <p className="text-sm font-medium text-emerald-400 mb-2">{files.length} file(s) selected:</p>
                        <ul className="text-sm text-gray-300 space-y-2">
                          {files.map((file, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle size={16} className="text-emerald-500 mr-2 flex-shrink-0" />
                              <span className="truncate">{file.name}</span>
                              <span className="ml-2 text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 flex items-start border border-emerald-900/30 mt-8">
                    <AlertCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-400">
                      All fund releases are recorded on the blockchain for maximum transparency. Donors can view how their contributions are being used in real-time.
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    className={`w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg transform hover:-translate-y-1 ${
                      isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-emerald-900/30 p-6 shadow-xl sticky top-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Clock className="h-5 w-5 text-emerald-500 mr-2" />
                Fund Release Process
              </h2>
              
              <div className="relative mb-6">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-emerald-500 via-emerald-700 to-zinc-800"></div>
                
                <div className="space-y-8">
                  <div className="relative flex items-start">
                    <div className="absolute left-0 mt-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                      <span className="text-black font-medium">1</span>
                    </div>
                    <div className="ml-16">
                      <h3 className="text-lg font-medium text-white">Submit Request</h3>
                      <p className="text-gray-400 mt-1 text-sm">Fill out the form with details about how funds will be used</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="absolute left-0 mt-1 w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center shadow-md shadow-emerald-700/20">
                      <span className="text-black font-medium">2</span>
                    </div>
                    <div className="ml-16">
                      <h3 className="text-lg font-medium text-white">Verification</h3>
                      <p className="text-gray-400 mt-1 text-sm">Your request is reviewed by the FundWise verification team</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="absolute left-0 mt-1 w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                      <span className="text-gray-200 font-medium">3</span>
                    </div>
                    <div className="ml-16">
                      <h3 className="text-lg font-medium text-white">Funds Released</h3>
                      <p className="text-gray-400 mt-1 text-sm">Upon approval, funds are transferred to your organization's wallet</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="absolute left-0 mt-1 w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                      <span className="text-gray-200 font-medium">4</span>
                    </div>
                    <div className="ml-16">
                      <h3 className="text-lg font-medium text-white">Submit Proof</h3>
                      <p className="text-gray-400 mt-1 text-sm">After using the funds, submit proof to maintain transparency</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/50 rounded-lg border border-emerald-900/30 p-4">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  <h3 className="text-sm font-medium text-emerald-400">Did you know?</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  All transactions are recorded on the blockchain, ensuring complete transparency for donors and recipients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
