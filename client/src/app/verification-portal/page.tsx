'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Note: changed from next/router

// TypeScript interfaces
interface NGO {
  id: string;
  name: string;
  submissionDate: string;
  status: 'Document Review' | 'Pending' | 'Background Check' | 'Approved';
}

interface Campaign {
  id: string;
  name: string;
  organization: string;
  submissionDate: string;
}

interface FundUsage {
  id: string;
  campaign: string;
  organization: string;
  amount: number;
}

interface DocumentReview {
  organization: string;
  documentType: string;
  submissionDate: string;
}

export default function VerificationPortal() {
  const router = useRouter();
  
  // State variables for tabs
  const [activeTab, setActiveTab] = useState('pending-ngo');
  const [selectedDocument, setSelectedDocument] = useState<DocumentReview | null>(null);
  
  // Mock data
  const pendingNGOs: NGO[] = [
    { id: '1', name: 'Global Relief Initiative', submissionDate: '2025-05-01', status: 'Document Review' },
    { id: '2', name: 'Community Health Alliance', submissionDate: '2025-05-03', status: 'Pending' },
    { id: '3', name: 'Education First Foundation', submissionDate: '2025-05-10', status: 'Background Check' }
  ];
  
  const pendingCampaigns: Campaign[] = [
    { id: '1', name: 'Education for All', organization: 'Global Relief Initiative', submissionDate: '2025-05-10' },
    { id: '2', name: 'Medical Outreach Program', organization: 'Community Health Alliance', submissionDate: '2025-05-12' },
    { id: '3', name: 'Clean Water Project', organization: 'Education First Foundation', submissionDate: '2025-05-14' }
  ];
  
  const pendingFundUsage: FundUsage[] = [
    { id: '1', campaign: 'Clean Water Initiative', organization: 'Global Relief Initiative', amount: 2.5 },
    { id: '2', campaign: 'Medical Supplies Drive', organization: 'Global Relief Initiative', amount: 1.2 },
    { id: '3', campaign: 'School Building Program', organization: 'Education First Foundation', amount: 5.0 }
  ];

  // Handle logout
  const handleLogout = () => {
    // In a real app, clear authentication state here
    router.push('/login');
  };

  // Handle document review
  const handleReview = (type: string, id: string) => {
    let document: DocumentReview | null = null;
    
    if (type === 'ngo') {
      const ngo = pendingNGOs.find(n => n.id === id);
      if (ngo) {
        document = {
          organization: ngo.name,
          documentType: 'Financial Statements',
          submissionDate: ngo.submissionDate
        };
      }
    } else if (type === 'campaign') {
      const campaign = pendingCampaigns.find(c => c.id === id);
      if (campaign) {
        document = {
          organization: campaign.organization,
          documentType: 'Campaign Documentation',
          submissionDate: campaign.submissionDate
        };
      }
    } else if (type === 'fund') {
      const fund = pendingFundUsage.find(f => f.id === id);
      if (fund) {
        document = {
          organization: fund.organization,
          documentType: 'Fund Usage Proof',
          submissionDate: new Date().toISOString().split('T')[0]
        };
      }
    }
    
    setSelectedDocument(document);
  };

  // Handle document approval response
  const handleDocumentResponse = (action: 'approve' | 'request' | 'reject') => {
    // In a real app, send this response to the backend
    alert(`Document ${action === 'approve' ? 'approved' : action === 'request' ? 'needs more information' : 'rejected'}`);
    setSelectedDocument(null);
  };

  return (
    <div style={{ 
      backgroundColor: '#000', 
      minHeight: '100vh', 
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{
        backgroundColor: '#212529',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #1a8754'
      }}>
        <Link href="/">
          <div style={{ 
            color: '#1a8754', 
            fontSize: '24px', 
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            FUNDWISE
          </div>
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '20px', color: '#f8f9fa' }}>
            Welcome, Admin
          </div>
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #1a8754',
              color: '#1a8754',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px' 
      }}>
        <h2 style={{ 
          color: '#1a8754', 
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '1px solid #1a8754'
        }}>
          Verification Portal
        </h2>
        
        <div style={{
          backgroundColor: '#212529',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          borderLeft: '4px solid #1a8754'
        }}>
          <div style={{ 
            display: 'flex', 
            marginBottom: '20px',
            borderBottom: '1px solid #333',
            paddingBottom: '0'
          }}>
            <div 
              onClick={() => setActiveTab('pending-ngo')}
              style={{
                padding: '10px 15px',
                cursor: 'pointer',
                marginRight: '5px',
                borderRadius: '4px 4px 0 0',
                backgroundColor: activeTab === 'pending-ngo' ? '#1a8754' : 'transparent',
                color: activeTab === 'pending-ngo' ? '#ffffff' : 'inherit'
              }}
            >
              NGOs
            </div>
            <div 
              onClick={() => setActiveTab('pending-campaigns')}
              style={{
                padding: '10px 15px',
                cursor: 'pointer',
                marginRight: '5px',
                borderRadius: '4px 4px 0 0',
                backgroundColor: activeTab === 'pending-campaigns' ? '#1a8754' : 'transparent',
                color: activeTab === 'pending-campaigns' ? '#ffffff' : 'inherit'
              }}
            >
              Campaigns
            </div>
            <div 
              onClick={() => setActiveTab('pending-fund-usage')}
              style={{
                padding: '10px 15px',
                cursor: 'pointer',
                marginRight: '5px',
                borderRadius: '4px 4px 0 0',
                backgroundColor: activeTab === 'pending-fund-usage' ? '#1a8754' : 'transparent',
                color: activeTab === 'pending-fund-usage' ? '#ffffff' : 'inherit'
              }}
            >
              Fund Usage
            </div>
          </div>
          
          {/* NGO Verification Tab */}
          {activeTab === 'pending-ngo' && (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left', backgroundColor: '#212529', color: '#1a8754' }}>Organization</th>
                    <th style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left', backgroundColor: '#212529', color: '#1a8754' }}>Submission Date</th>
                    <th style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left', backgroundColor: '#212529', color: '#1a8754' }}>Status</th>
                    <th style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left', backgroundColor: '#212529', color: '#1a8754' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingNGOs.map((ngo) => (
                    <tr key={ngo.id}>
                      <td style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left' }}>{ngo.name}</td>
                      <td style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left' }}>{ngo.submissionDate}</td>
                      <td style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: ngo.status === 'Approved' ? '#1a8754' : '#ffc107',
                          color: ngo.status === 'Approved' ? '#ffffff' : '#000'
                        }}>
                          {ngo.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left' }}>
                        <button 
                          onClick={() => handleReview('ngo', ngo.id)}
                          style={{ 
                            backgroundColor: '#1a8754', 
                            color: '#ffffff', 
                            padding: '8px 12px', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold' 
                          }}
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
          {activeTab === 'pending-campaigns' && (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left', backgroundColor: '#212529', color: '#1a8754' }}>Campaign</th>
                    <th style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left', backgroundColor: '#212529', color: '#1a8754' }}>Organization</th>
                    <th style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left', backgroundColor: '#212529', color: '#1a8754' }}>Submission Date</th>
                    <th style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left', backgroundColor: '#212529', color: '#1a8754' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCampaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left' }}>{campaign.name}</td>
                      <td style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left' }}>{campaign.organization}</td>
                      <td style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left' }}>{campaign.submissionDate}</td>
                      <td style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left' }}>
                        <button 
                          onClick={() => handleReview('campaign', campaign.id)}
                          style={{ 
                            backgroundColor: '#1a8754', 
                            color: '#ffffff', 
                            padding: '8px 12px', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold' 
                          }}
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
          {activeTab === 'pending-fund-usage' && (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left', backgroundColor: '#212529', color: '#1a8754' }}>Campaign</th>
                    <th style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left', backgroundColor: '#212529', color: '#1a8754' }}>Organization</th>
                    <th style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left', backgroundColor: '#212529', color: '#1a8754' }}>Amount (ETH)</th>
                    <th style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left', backgroundColor: '#212529', color: '#1a8754' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingFundUsage.map((fund) => (
                    <tr key={fund.id}>
                      <td style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left' }}>{fund.campaign}</td>
                      <td style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left' }}>{fund.organization}</td>
                      <td style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left' }}>{fund.amount}</td>
                      <td style={{ padding: '12px 15px', borderBottom: '1px solid #333', textAlign: 'left' }}>
                        <button 
                          onClick={() => handleReview('fund', fund.id)}
                          style={{ 
                            backgroundColor: '#1a8754', 
                            color: '#ffffff', 
                            padding: '8px 12px', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold' 
                          }}
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
          {selectedDocument && (
            <div style={{ 
              backgroundColor: '#212529', 
              marginTop: '20px', 
              padding: '20px', 
              borderRadius: '8px' 
            }}>
              <h4 style={{ marginBottom: '20px' }}>Document Review</h4>
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#f8f9fa' }}>
                      Organization: {selectedDocument.organization}
                    </label>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#f8f9fa' }}>
                      Document Type: {selectedDocument.documentType}
                    </label>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#f8f9fa' }}>
                      Submission Date: {selectedDocument.submissionDate}
                    </label>
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    backgroundColor: '#333', 
                    height: '200px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                  }}>
                    [Document Preview]
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '15px', marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#f8f9fa' }}>
                  Comments
                </label>
                <textarea 
                  rows={3} 
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #333', 
                    borderRadius: '4px', 
                    backgroundColor: '#333', 
                    color: '#ffffff' 
                  }} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleDocumentResponse('approve')}
                  style={{ 
                    backgroundColor: '#1a8754', 
                    color: '#ffffff', 
                    padding: '10px 15px', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold' 
                  }}
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleDocumentResponse('request')}
                  style={{ 
                    backgroundColor: '#6c757d', 
                    color: '#ffffff', 
                    padding: '10px 15px', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold' 
                  }}
                >
                  Request More Info
                </button>
                <button 
                  onClick={() => handleDocumentResponse('reject')}
                  style={{ 
                    backgroundColor: '#6c757d', 
                    color: '#ffffff', 
                    padding: '10px 15px', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold' 
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}