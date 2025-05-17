'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NGOTable } from './NGOTable';
import { CampaignTable } from './CampaignTable';
import { DocumentReviewPanel } from './DocumentReviewPanel';
import { FundTable } from './FundTable';

interface NGO {
  id: string;
  name: string;
  verification_status: string;
}

interface Campaign {
  id: string;
  title: string;
  status: string;
}

interface Proof {
  id: string;
  campaign_id: string;
  status: string;
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
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized: No token found');
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/api/verification/pending', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to fetch data');
        }

        const data = await res.json();
        setNgos(data.ngos);
        setCampaigns(data.campaigns);
        setProofs(data.proofs);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => router.push('/login');

  const handleReview = (type: string, id: string) => {
    let document: DocumentReview | null = null;

    if (type === 'ngo') {
      const ngo = ngos.find(n => n.id === id);
      if (ngo) {
        document = { organization: ngo.name, documentType: 'Financial Statements', submissionDate: new Date().toISOString().split('T')[0] };
      }
    } else if (type === 'campaign') {
      const campaign = campaigns.find(c => c.id === id);
      if (campaign) {
        document = { organization: campaign.title, documentType: 'Campaign Documentation', submissionDate: new Date().toISOString().split('T')[0] };
      }
    } else if (type === 'fund') {
      const fund = proofs.find(f => f.id === id);
      if (fund) {
        document = { organization: fund.campaign_id, documentType: 'Fund Usage Proof', submissionDate: new Date().toISOString().split('T')[0] };
      }
    }

    setSelectedType(type);
    setSelectedId(id);
    setSelectedDocument(document);
  };

  const handleDocumentResponse = async (action: 'approve' | 'request' | 'reject') => {
    if (action === 'approve' && selectedType && selectedId) {
      const token = localStorage.getItem('token');
      const urlMap: Record<string, string> = {
        ngo: 'organization',
        campaign: 'campaign',
        fund: 'proof',
      };

      try {
        const res = await fetch(`http://localhost:3001/api/verification/approve/${urlMap[selectedType]}?id=${selectedId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Approval failed');
        }

        alert(`${selectedType} approved successfully!`);
        window.location.reload();
      } catch (err: any) {
        alert(`Failed to approve ${selectedType}: ${err.message}`);
      }
    } else {
      alert(`Document ${action === 'request' ? 'needs more information' : 'rejected'}`);
    }

    setSelectedDocument(null);
    setSelectedType('');
    setSelectedId('');
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

        {error && <div className="text-red-500 mb-4">{error}</div>}

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
            <NGOTable data={ngos} onReview={handleReview} />
          )}

          {activeTab === 'pending-campaigns' && (
            <CampaignTable data={campaigns} onReview={handleReview} />
          )}

          {activeTab === 'pending-fund-usage' && (
            <FundTable data={proofs} onReview={handleReview} />
          )}

          {selectedDocument && (
            <DocumentReviewPanel doc={selectedDocument} onRespond={handleDocumentResponse} />
          )}
        </div>
      </main>
    </div>
  );
}