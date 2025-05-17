"use client";

import { useEffect, useState } from 'react';
import { 
  Shield, CheckCircle, AlertCircle, ChevronRight, 
  User, Building, Clock, Eye, 
  FileText, Download, Check, X
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// API client with JWT authentication
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Status badge component
type StatusKey = 'pending' | 'reviewing' | 'approved' | 'refused' | 'active' | 'document review';

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<StatusKey, string> = {
    pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    reviewing: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    approved: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    refused: "bg-red-500/20 text-red-500 border-red-500/30",
    active: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    "document review": "bg-orange-500/20 text-orange-500 border-orange-500/30"
  };
  
  const normalizedStatus = status.toLowerCase() as StatusKey;
  
  return (
    <div className={`px-3 py-1 rounded-full flex items-center text-xs font-medium ${(statusStyles[normalizedStatus] ?? statusStyles.pending)}`}>
      {(normalizedStatus === 'approved' || normalizedStatus === 'active') && <Check className="h-3 w-3 mr-1" />}
      {normalizedStatus === 'refused' && <X className="h-3 w-3 mr-1" />}
      {normalizedStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
      {(normalizedStatus === 'reviewing' || normalizedStatus === 'document review') && <Eye className="h-3 w-3 mr-1" />}
      {status}
    </div>
  );
};

type OrganizationItem = {
  id: string;
  name: string;
  created_at?: string;
  verification_status: string;
  [key: string]: any;
};

type CampaignItem = {
  id: string;
  title: string;
  organization_id: string;
  organization_name?: string;
  created_at?: string;
  status: string;
  [key: string]: any;
};

type ProofItem = {
  id: string;
  campaign_id: string;
  campaign_name?: string;
  organization_name?: string;
  amount?: number;
  status: string;
  created_at?: string;
  [key: string]: any;
};

type ReviewItem = OrganizationItem | CampaignItem | ProofItem | null;

export default function AdminVerificationPortal() {
  const [activeTab, setActiveTab] = useState('ngo');
  const [selectedItem, setSelectedItem] = useState<ReviewItem>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  
  // State for data
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [proofs, setProofs] = useState<ProofItem[]>([]);

    const router = useRouter();
  
  // Authentication check on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);
  
  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllPendingItems();
    }
  }, [isAuthenticated]);

  
  // Fetch all pending items
  const fetchAllPendingItems = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/verification/pending');
      console.log(response);
      
      if (response.data) {
        // Process organizations
        const orgData = response.data.ngos || [];
        setOrganizations(orgData);
        
        // Process campaigns
        const campaignData = response.data.campaigns || [];
        // Add organization names to campaigns if possible
        const enhancedCampaigns = campaignData.map((campaign: CampaignItem) => {
          const org = orgData.find((o: OrganizationItem) => o.id === campaign.organization_id);
          return {
            ...campaign,
            organization_name: org ? org.name : 'Unknown Organization'
          };
        });
        setCampaigns(enhancedCampaigns);
        
        // Process proofs
        const proofData = response.data.proofs || [];
        // Add campaign and organization names to proofs if possible
        const enhancedProofs = proofData.map((proof: ProofItem) => {
          const campaign = campaignData.find((c: CampaignItem) => c.id === proof.campaign_id);
          const orgId = campaign ? campaign.organization_id : null;
          const org = orgId ? orgData.find((o: OrganizationItem) => o.id === orgId) : null;
          
          return {
            ...proof,
            campaign_name: campaign ? campaign.title : 'Unknown Campaign',
            organization_name: org ? org.name : 'Unknown Organization'
          };
        });
        setProofs(enhancedProofs);
      }
    } catch (error) {
      console.error('Error fetching pending items:', error);
      // Handle authentication errors
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = (item: OrganizationItem | CampaignItem | ProofItem) => {
    setSelectedItem(item);
    setReviewComments('');
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    
    setIsLoading(true);
    try {
      let endpoint;
      
      if ('verification_status' in selectedItem) {
        // Organization
        endpoint = `/verification/approve/organization?id=${selectedItem.id}`;
      } else if ('campaign_id' in selectedItem) {
        // Proof
        endpoint = `/verification/approve/proof?id=${selectedItem.id}`;
      } else {
        // Campaign
        endpoint = `/verification/approve/campaign?id=${selectedItem.id}`;
      }
      
      await api.patch(endpoint, { comments: reviewComments });
      
      // Refresh data
      fetchAllPendingItems();
      setSelectedItem(null);
      
    } catch (error) {
      console.error('Error approving item:', error);
      // Handle errors (could show toast notification in a real app)
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    
    setIsLoading(true);
    try {
      let endpoint;
      
      if ('verification_status' in selectedItem) {
        // Organization
        endpoint = `/verification/reject/organization?id=${selectedItem.id}`;
      } else if ('campaign_id' in selectedItem) {
        // Proof
        endpoint = `/verification/reject/proof?id=${selectedItem.id}`;
      } else {
        // Campaign
        endpoint = `/verification/reject/campaign?id=${selectedItem.id}`;
      }
      
      await api.patch(endpoint, { comments: reviewComments });
      
      // Refresh data
      fetchAllPendingItems();
      setSelectedItem(null);
      
    } catch (error) {
      console.error('Error rejecting item:', error);
      // Handle errors
    } finally {
      setIsLoading(false);
    }
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
        
        {isLoading && !selectedItem && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-400">Loading verification data...</p>
            </div>
          </div>
        )}
        
        {/* NGO Verification Tab */}
        {activeTab === 'ngo' && !selectedItem && !isLoading && (
          <div className="overflow-x-auto">
            {organizations.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No pending organizations to verify</p>
              </div>
            ) : (
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
                  {organizations.map(org => (
                    <tr key={org.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{org.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(org.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={org.verification_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleReview(org)}
                          className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-500 transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {/* Campaign Verification Tab */}
        {activeTab === 'campaigns' && !selectedItem && !isLoading && (
          <div className="overflow-x-auto">
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No pending campaigns to verify</p>
              </div>
            ) : (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{campaign.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{campaign.organization_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(campaign.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleReview(campaign)}
                          className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-500 transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {/* Fund Usage Verification Tab */}
        {activeTab === 'fund-usage' && !selectedItem && !isLoading && (
          <div className="overflow-x-auto">
            {proofs.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No pending fund usage proofs to verify</p>
              </div>
            ) : (
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
                  {proofs.map(proof => (
                    <tr key={proof.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{proof.campaign_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{proof.organization_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-500">{proof.amount || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleReview(proof)}
                          className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-500 transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
                        : 'organization_name' in selectedItem
                        ? selectedItem.organization_name
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
                      {new Date('created_at' in selectedItem && selectedItem.created_at 
                        ? selectedItem.created_at 
                        : Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {activeTab === 'fund-usage' && 'amount' in selectedItem && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Amount (ETH)</label>
                      <p className="text-emerald-500 font-medium">{selectedItem.amount || 'N/A'}</p>
                    </div>
                  )}
                  
                  {activeTab === 'campaigns' && 'title' in selectedItem && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Campaign Title</label>
                      <p className="text-white font-medium">{selectedItem.title}</p>
                    </div>
                  )}
                  
                  {activeTab === 'fund-usage' && 'campaign_name' in selectedItem && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Campaign</label>
                      <p className="text-white font-medium">{selectedItem.campaign_name}</p>
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
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  Approve
                </button>
                
                <button
                  onClick={handleReject}
                  disabled={isLoading}
                  className="px-4 py-2 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-600 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <X className="h-5 w-5 mr-2" />
                  )}
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