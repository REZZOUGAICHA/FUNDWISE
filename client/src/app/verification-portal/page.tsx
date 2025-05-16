'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const [activeTab, setActiveTab] = useState('pending-ngo');
  const [selectedDocument, setSelectedDocument] = useState<DocumentReview | null>(null);

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

  const handleLogout = () => router.push('/login');

  const handleReview = (type: string, id: string) => {
    let document: DocumentReview | null = null;

    if (type === 'ngo') {
      const ngo = pendingNGOs.find(n => n.id === id);
      if (ngo) {
        document = { organization: ngo.name, documentType: 'Financial Statements', submissionDate: ngo.submissionDate };
      }
    } else if (type === 'campaign') {
      const campaign = pendingCampaigns.find(c => c.id === id);
      if (campaign) {
        document = { organization: campaign.organization, documentType: 'Campaign Documentation', submissionDate: campaign.submissionDate };
      }
    } else if (type === 'fund') {
      const fund = pendingFundUsage.find(f => f.id === id);
      if (fund) {
        document = { organization: fund.organization, documentType: 'Fund Usage Proof', submissionDate: new Date().toISOString().split('T')[0] };
      }
    }

    setSelectedDocument(document);
  };

  const handleDocumentResponse = (action: 'approve' | 'request' | 'reject') => {
    alert(`Document ${action === 'approve' ? 'approved' : action === 'request' ? 'needs more information' : 'rejected'}`);
    setSelectedDocument(null);
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <header className="bg-zinc-900 px-6 py-4 flex justify-between items-center border-b-2 border-emerald-700">
        <Link href="/">
          <div className="text-2xl font-bold text-emerald-700 cursor-pointer">FUNDWISE</div>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-200">Welcome, Admin</span>
          <button onClick={handleLogout} className="border border-emerald-700 text-emerald-700 px-4 py-2 rounded hover:bg-emerald-700 hover:text-white transition">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-emerald-700 text-2xl font-semibold mb-6 border-b border-emerald-700 pb-2">Verification Portal</h2>

        <div className="bg-zinc-900 rounded-lg p-6 border-l-4 border-emerald-700">
          <div className="flex border-b border-zinc-700 mb-6">
            {['pending-ngo', 'pending-campaigns', 'pending-fund-usage'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t ${activeTab === tab ? 'bg-emerald-700 text-white' : 'text-gray-200'}`}
              >
                {tab === 'pending-ngo' ? 'NGOs' : tab === 'pending-campaigns' ? 'Campaigns' : 'Fund Usage'}
              </button>
            ))}
          </div>

          {activeTab === 'pending-ngo' && (
            <NGOTable data={pendingNGOs} onReview={handleReview} />
          )}

          {activeTab === 'pending-campaigns' && (
            <CampaignTable data={pendingCampaigns} onReview={handleReview} />
          )}

          {activeTab === 'pending-fund-usage' && (
            <FundTable data={pendingFundUsage} onReview={handleReview} />
          )}

          {selectedDocument && (
            <DocumentReviewPanel doc={selectedDocument} onRespond={handleDocumentResponse} />
          )}
        </div>
      </main>
    </div>
  );
}

function NGOTable({ data, onReview }: { data: NGO[]; onReview: (type: string, id: string) => void }) {
  return (
    <table className="w-full text-left mb-6">
      <thead>
        <tr className="text-emerald-700">
          <th className="px-4 py-3">Organization</th>
          <th className="px-4 py-3">Submission Date</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(ngo => (
          <tr key={ngo.id} className="border-t border-zinc-700">
            <td className="px-4 py-3">{ngo.name}</td>
            <td className="px-4 py-3">{ngo.submissionDate}</td>
            <td className="px-4 py-3">
              <span className={`px-3 py-1 rounded-full text-xs ${ngo.status === 'Approved' ? 'bg-emerald-700 text-white' : 'bg-yellow-400 text-black'}`}>
                {ngo.status}
              </span>
            </td>
            <td className="px-4 py-3">
              <button onClick={() => onReview('ngo', ngo.id)} className="bg-emerald-700 text-white px-4 py-2 rounded font-bold">
                Review
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CampaignTable({ data, onReview }: { data: Campaign[]; onReview: (type: string, id: string) => void }) {
  return (
    <table className="w-full text-left mb-6">
      <thead>
        <tr className="text-emerald-700">
          <th className="px-4 py-3">Campaign</th>
          <th className="px-4 py-3">Organization</th>
          <th className="px-4 py-3">Submission Date</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(campaign => (
          <tr key={campaign.id} className="border-t border-zinc-700">
            <td className="px-4 py-3">{campaign.name}</td>
            <td className="px-4 py-3">{campaign.organization}</td>
            <td className="px-4 py-3">{campaign.submissionDate}</td>
            <td className="px-4 py-3">
              <button onClick={() => onReview('campaign', campaign.id)} className="bg-emerald-700 text-white px-4 py-2 rounded font-bold">
                Review
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FundTable({ data, onReview }: { data: FundUsage[]; onReview: (type: string, id: string) => void }) {
  return (
    <table className="w-full text-left mb-6">
      <thead>
        <tr className="text-emerald-700">
          <th className="px-4 py-3">Campaign</th>
          <th className="px-4 py-3">Organization</th>
          <th className="px-4 py-3">Amount (ETH)</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(fund => (
          <tr key={fund.id} className="border-t border-zinc-700">
            <td className="px-4 py-3">{fund.campaign}</td>
            <td className="px-4 py-3">{fund.organization}</td>
            <td className="px-4 py-3">{fund.amount}</td>
            <td className="px-4 py-3">
              <button onClick={() => onReview('fund', fund.id)} className="bg-emerald-700 text-white px-4 py-2 rounded font-bold">
                Review
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DocumentReviewPanel({ doc, onRespond }: { doc: DocumentReview; onRespond: (action: 'approve' | 'request' | 'reject') => void }) {
  return (
    <div className="bg-zinc-900 mt-6 p-6 rounded-lg">
      <h4 className="text-lg font-semibold mb-4">Document Review</h4>
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-gray-200">Organization: {doc.organization}</label>
          </div>
          <div>
            <label className="block text-gray-200">Document Type: {doc.documentType}</label>
          </div>
          <div>
            <label className="block text-gray-200">Submission Date: {doc.submissionDate}</label>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center h-48 bg-zinc-800 text-gray-500">
          [Document Preview]
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-gray-200 mb-2">Comments</label>
        <textarea className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white" rows={3}></textarea>
      </div>
      <div className="mt-4 flex gap-3">
        <button onClick={() => onRespond('approve')} className="bg-emerald-700 text-white px-4 py-2 rounded font-bold">Approve</button>
        <button onClick={() => onRespond('request')} className="bg-gray-600 text-white px-4 py-2 rounded font-bold">Request More Info</button>
        <button onClick={() => onRespond('reject')} className="bg-gray-600 text-white px-4 py-2 rounded font-bold">Reject</button>
      </div>
    </div>
  );
}
