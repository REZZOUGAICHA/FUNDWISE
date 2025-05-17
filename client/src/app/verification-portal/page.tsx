"use client";

import { SetStateAction, useState } from 'react';
import { 
  Shield, CheckCircle, AlertCircle, ChevronRight, 
  User, Building, Clock, Eye, 
  FileText, Download, Check, X
} from 'lucide-react';

// Status badge component
type StatusKey = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'document review';

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<StatusKey, string> = {
    pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    reviewing: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    approved: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    rejected: "bg-red-500/20 text-red-500 border-red-500/30",
    "document review": "bg-orange-500/20 text-orange-500 border-orange-500/30"
  };
  
  const normalizedStatus = status.toLowerCase() as StatusKey;
  
  return (
    <div className={`px-3 py-1 rounded-full flex items-center text-xs font-medium ${(statusStyles[normalizedStatus] ?? statusStyles.pending)}`}>
      {normalizedStatus === 'approved' && <Check className="h-3 w-3 mr-1" />}
      {normalizedStatus === 'rejected' && <X className="h-3 w-3 mr-1" />}
      {normalizedStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
      {(normalizedStatus === 'reviewing' || normalizedStatus === 'document review') && <Eye className="h-3 w-3 mr-1" />}
      {status}
    </div>
  );
};

type NgoItem = { id: number; name: string; submissionDate: string; status: string };
type CampaignItem = { id: number; name: string; organization: string; submissionDate: string };
type FundUsageItem = { id: number; campaign: string; organization: string; amount: number };

type ReviewItem = NgoItem | CampaignItem | FundUsageItem | null;

export default function AdminVerificationPortal() {
  const [activeTab, setActiveTab] = useState('ngo');
  const [selectedItem, setSelectedItem] = useState<ReviewItem>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for NGOs
  const ngos: NgoItem[] = [
    { id: 1, name: 'Global Relief Initiative', submissionDate: '2025-05-01', status: 'Document Review' },
    { id: 2, name: 'Community Health Alliance', submissionDate: '2025-05-03', status: 'Pending' }
  ];
  
  // Mock data for campaigns
  const campaigns: CampaignItem[] = [
    { id: 1, name: 'Education for All', organization: 'Global Relief Initiative', submissionDate: '2025-05-10' },
    { id: 2, name: 'Medical Outreach Program', organization: 'Community Health Alliance', submissionDate: '2025-05-12' }
  ];
  
  // Mock data for fund usage
  const fundUsage: FundUsageItem[] = [
    { id: 1, campaign: 'Clean Water Initiative', organization: 'Global Relief Initiative', amount: 2.5 },
    { id: 2, campaign: 'Medical Supplies Drive', organization: 'Global Relief Initiative', amount: 1.2 }
  ];

  const handleReview = (item: NgoItem | CampaignItem | FundUsageItem) => {
    setSelectedItem(item);
    setReviewComments('');
  };

  const handleApprove = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSelectedItem(null);
    setIsLoading(false);
  };

  const handleReject = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSelectedItem(null);
    setIsLoading(false);
  };

  const handleRequestMoreInfo = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSelectedItem(null);
    setIsLoading(false);
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-zinc-800 mt-20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Shield className="h-6 w-6 text-emerald-500 mr-2" />
            Verification Portal
          </h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-xs">Admin Access</span>
          </div>
        </div>
        
        <div className="flex border-b border-zinc-800 mb-6">
          <button
            onClick={() => setActiveTab('ngo')}
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'ngo' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white transition-colors'}`}
          >
            <div className="flex items-center justify-center">
              <Building className="h-5 w-5 mr-2" />
              NGO Verification
            </div>
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'campaigns' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white transition-colors'}`}
          >
            <div className="flex items-center justify-center">
              <FileText className="h-5 w-5 mr-2" />
              Campaign Verification
            </div>
          </button>
          <button
            onClick={() => setActiveTab('fund-usage')}
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'fund-usage' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white transition-colors'}`}
          >
            <div className="flex items-center justify-center">
              <Eye className="h-5 w-5 mr-2" />
              Fund Usage Verification
            </div>
          </button>
        </div>
        
        {/* NGO Verification Tab */}
        {activeTab === 'ngo' && !selectedItem && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/30">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Submission Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {ngos.map(ngo => (
                  <tr key={ngo.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{ngo.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{ngo.submissionDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={ngo.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleReview(ngo)}
                        className="px-3 py-1 bg-emerald-600 text-black text-sm rounded hover:bg-emerald-500 transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Campaign Verification Tab */}
        {activeTab === 'campaigns' && !selectedItem && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/30">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Submission Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {campaigns.map(campaign => (
                  <tr key={campaign.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{campaign.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{campaign.organization}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{campaign.submissionDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleReview(campaign)}
                        className="px-3 py-1 bg-emerald-600 text-black text-sm rounded hover:bg-emerald-500 transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Fund Usage Verification Tab */}
        {activeTab === 'fund-usage' && !selectedItem && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/30">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount (ETH)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {fundUsage.map(fund => (
                  <tr key={fund.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{fund.campaign}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{fund.organization}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-500">{fund.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleReview(fund)}
                        className="px-3 py-1 bg-emerald-600 text-black text-sm rounded hover:bg-emerald-500 transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Document Review Interface */}
        {selectedItem && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Document Review</h3>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Organization</label>
                    <p className="text-white font-medium">
                      {'name' in selectedItem
                        ? selectedItem.name
                        : 'campaign' in selectedItem
                        ? selectedItem.campaign
                        : ''}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Document Type</label>
                    <p className="text-white font-medium">
                      {activeTab === 'ngo' ? 'Registration Documents' : 
                       activeTab === 'campaigns' ? 'Campaign Details' : 'Fund Usage Proof'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Submission Date</label>
                    <p className="text-white font-medium">
                      {'submissionDate' in selectedItem && selectedItem.submissionDate
                        ? selectedItem.submissionDate
                        : '2025-05-15'}
                    </p>
                  </div>
                  
                  {activeTab === 'fund-usage' && 'amount' in selectedItem && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Amount (ETH)</label>
                      <p className="text-emerald-500 font-medium">{selectedItem.amount}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <Download className="h-4 w-4 text-emerald-500 mr-2" />
                    <label className="text-gray-400 text-sm">Attached Documents</label>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-black/30 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-white text-sm">main_document.pdf</span>
                      </div>
                      <button className="text-emerald-500 hover:text-emerald-400 text-sm">View</button>
                    </div>
                    
                    <div className="bg-black/30 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-white text-sm">supporting_evidence.pdf</span>
                      </div>
                      <button className="text-emerald-500 hover:text-emerald-400 text-sm">View</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-black/30 border border-zinc-800 rounded-lg h-64 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <FileText className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">Document Preview</p>
                    <button className="mt-2 text-emerald-500 hover:text-emerald-400 text-sm">
                      Open Full Preview
                    </button>
                  </div>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-yellow-500 font-medium text-sm">Verification Guidelines</h4>
                      <ul className="text-gray-400 text-sm mt-2 space-y-1 list-disc list-inside">
                        <li>Ensure all required documents are present</li>
                        <li>Verify authenticity of registration numbers</li>
                        <li>Check for any inconsistencies in the information</li>
                        <li>Confirm compliance with platform policies</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="reviewer-comments" className="block text-white text-sm font-medium mb-2">
                  Review Comments
                </label>
                <textarea 
                  id="reviewer-comments" 
                  rows={3}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Add your comments here..."
                ></textarea>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-600 text-black rounded-lg font-medium hover:bg-emerald-500 transition-all duration-300 flex items-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Approve
                </button>
                
                
                
                <button
                  onClick={handleReject}
                  disabled={isLoading}
                  className="px-4 py-2 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-600 transition-all duration-300 flex items-center"
                >
                  <X className="h-5 w-5 mr-2" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
