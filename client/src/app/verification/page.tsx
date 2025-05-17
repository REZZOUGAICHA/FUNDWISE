"use client";

import { JSX, SetStateAction, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Clock, AlertCircle, FileText, Upload, ChevronLeft, Calendar, DollarSign, Users, Shield } from 'lucide-react';

// Status badge component
type StatusType = "completed" | "in progress" | "pending" | "rejected";

interface StatusBadgeProps {
  status: StatusType | string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusStyles: Record<StatusType, string> = {
    completed: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    "in progress": "bg-blue-500/20 text-blue-500 border-blue-500/30",
    pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    rejected: "bg-red-500/20 text-red-500 border-red-500/30"
  };
  
  const statusIcons: Record<StatusType, JSX.Element> = {
    completed: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
    "in progress": <Clock className="h-3.5 w-3.5 mr-1.5" />,
    pending: <Clock className="h-3.5 w-3.5 mr-1.5" />,
    rejected: <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
  };
  
  const normalizedStatus = status.toLowerCase() as StatusType;
  
  return (
    <div className={`px-3 py-1.5 rounded-full flex items-center text-xs font-medium ${statusStyles[normalizedStatus]}`}>
      {statusIcons[normalizedStatus]}
      {status}
    </div>
  );
};

export default function VerificationStatusPage() {
  const [activeTab, setActiveTab] = useState('ngo-verification');
  const [selectedCampaign, setSelectedCampaign] = useState('clean-water');
  
  const handleTabChange = (tabId: SetStateAction<string>) => {
    setActiveTab(tabId);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200 mt-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-black h-64">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/30 to-black/80 z-10" />
        <Image 
          src="/background4.jpg" 
          alt="Verification Banner"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          className="opacity-40"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)]"></div>
        
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-6 w-fit"
          >
            <ChevronLeft size={18} className="mr-1" />
            Back to home
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
            <Shield className="mr-3 h-8 w-8 text-emerald-500" />
            Verification Status
          </h1>
          <p className="text-lg text-emerald-400 max-w-3xl">
            Track your organization and campaign verification progress in real-time
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Tab Navigation */}
          <div className="flex flex-wrap mb-8 gap-2">
            <button 
              onClick={() => handleTabChange('ngo-verification')}
              className={`px-6 py-3 font-medium rounded-lg transition-all duration-300 flex items-center ${
                activeTab === 'ngo-verification' 
                  ? 'bg-emerald-600 text-black shadow-lg shadow-emerald-600/20' 
                  : 'bg-zinc-800/80 text-gray-300 hover:bg-zinc-700/80'
              }`}
            >
              <Users className="mr-2 h-5 w-5" />
              Organization Verification
            </button>
            <button 
              onClick={() => handleTabChange('campaign-verification')}
              className={`px-6 py-3 font-medium rounded-lg transition-all duration-300 flex items-center ${
                activeTab === 'campaign-verification' 
                  ? 'bg-emerald-600 text-black shadow-lg shadow-emerald-600/20' 
                  : 'bg-zinc-800/80 text-gray-300 hover:bg-zinc-700/80'
              }`}
            >
              <FileText className="mr-2 h-5 w-5" />
              Campaign Verification
            </button>
          </div>

          {/* NGO Verification Content */}
          {activeTab === 'ngo-verification' && (
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 p-8 mb-12 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
                <div>
                  <h3 className="text-2xl font-bold text-white">Organization Verification</h3>
                  <p className="text-emerald-400 mt-1">Global Relief Initiative</p>
                </div>
                <StatusBadge status="In Progress" />
              </div>
              
              {/* Progress Tracker */}
              <div className="relative mb-16 px-4">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-zinc-800"></div>
                <div className="absolute top-5 left-0 w-1/2 h-1 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
                
                {/* Steps */}
                <div className="flex justify-between relative">
                  {/* Step 1: Submission */}
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto bg-emerald-600 text-black rounded-full flex items-center justify-center font-bold relative z-10 shadow-lg shadow-emerald-600/20">
                      <span>1</span>
                    </div>
                    <div className="mt-3 text-emerald-400 font-medium">Submission</div>
                    <div className="text-xs mt-1 text-emerald-400">Completed</div>
                  </div>
                  
                  {/* Step 2: Document Review */}
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto bg-emerald-600 text-black rounded-full flex items-center justify-center font-bold relative z-10 shadow-lg shadow-emerald-600/20">
                      <span>2</span>
                      <div className="absolute -inset-1 rounded-full border border-emerald-500/40 animate-ping-slow"></div>
                    </div>
                    <div className="mt-3 text-emerald-400 font-medium">Document Review</div>
                    <div className="text-xs mt-1 text-emerald-400">In Progress</div>
                  </div>
                  
                  {/* Step 3: Background Check */}
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto bg-zinc-800 text-gray-400 rounded-full flex items-center justify-center font-bold relative z-10 border border-zinc-700">
                      <span>3</span>
                    </div>
                    <div className="mt-3 text-gray-400 font-medium">Background Check</div>
                    <div className="text-xs mt-1 text-gray-500">Pending</div>
                  </div>
                  
                  {/* Step 4: Approval */}
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto bg-zinc-800 text-gray-400 rounded-full flex items-center justify-center font-bold relative z-10 border border-zinc-700">
                      <span>4</span>
                    </div>
                    <div className="mt-3 text-gray-400 font-medium">Approval</div>
                    <div className="text-xs mt-1 text-gray-500">Pending</div>
                  </div>
                </div>
              </div>
              
              {/* Document Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-black/40 p-6 rounded-xl border border-zinc-800 hover:border-emerald-900/30 transition-all duration-300">
                  <h4 className="text-xl font-semibold mb-6 text-white flex items-center">
                    <FileText className="h-5 w-5 text-emerald-500 mr-2" />
                    Required Documents
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex items-center justify-between">
                      <div className="flex items-center text-emerald-400">
                        <CheckCircle className="h-5 w-5 mr-3 text-emerald-500" />
                        <span>Registration Certificate</span>
                      </div>
                      <button className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">View</button>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center text-emerald-400">
                        <CheckCircle className="h-5 w-5 mr-3 text-emerald-500" />
                        <span>Tax Exemption Document</span>
                      </div>
                      <button className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">View</button>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <AlertCircle className="h-5 w-5 mr-3 text-yellow-500" />
                        <span>Financial Statements (Last 2 years)</span>
                      </div>
                      <button className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">Upload</button>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center text-emerald-400">
                        <CheckCircle className="h-5 w-5 mr-3 text-emerald-500" />
                        <span>Board Member List</span>
                      </div>
                      <button className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">View</button>
                    </li>
                  </ul>
                </div>

                <div className="bg-black/40 p-6 rounded-xl border border-zinc-800 hover:border-emerald-900/30 transition-all duration-300">
                  <h4 className="text-xl font-semibold mb-6 text-white flex items-center">
                    <AlertCircle className="h-5 w-5 text-emerald-500 mr-2" />
                    Verification Feedback
                  </h4>
                  <div className="p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg text-yellow-400 mb-6">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <p>Please upload the missing financial statements to proceed with the verification. We require statements from the past 2 years.</p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold mt-6 mb-3 text-white">Next Steps</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-emerald-500 mr-3 mt-0.5">1</div>
                      <p className="text-gray-300">Upload the missing financial statements</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-emerald-500 mr-3 mt-0.5">2</div>
                      <p className="text-gray-300">Our team will review your documents within 2-3 business days</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-emerald-500 mr-3 mt-0.5">3</div>
                      <p className="text-gray-300">You'll receive an email notification once the review is complete</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Upload Area */}
              <div className="bg-black/40 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                  <h4 className="text-xl font-semibold text-white flex items-center">
                    <Upload className="h-5 w-5 text-emerald-500 mr-2" />
                    Upload Missing Documents
                  </h4>
                </div>
                
                <div className="border-2 border-dashed border-zinc-800 rounded-lg mx-6 my-6 p-8 text-center hover:border-emerald-500/30 transition-all cursor-pointer group">
                  <div className="mx-auto w-16 h-16 mb-4 bg-emerald-900/10 rounded-full flex items-center justify-center group-hover:bg-emerald-900/20 transition-all">
                    <Upload className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-gray-300 mb-2">Drag and drop your files here, or click to browse</p>
                  <p className="text-xs text-gray-500 mb-4">Supported formats: PDF, JPG, PNG (Max size: 10MB)</p>
                  <button className="inline-flex items-center px-5 py-2.5 bg-emerald-600 text-black rounded-lg font-medium transition-all hover:bg-emerald-500 shadow-lg shadow-emerald-600/20">
                    <Upload className="w-4 h-4 mr-2" />
                    Select Files
                  </button>
                </div>
                
                <div className="p-6 bg-black/20 border-t border-zinc-800 flex justify-end">
                  <button className="px-6 py-3 bg-emerald-600 text-black rounded-lg font-medium hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center">
                    Submit Documents
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Campaign Verification Content */}
          {activeTab === 'campaign-verification' && (
            <div className="space-y-8">
              {/* Campaign Selection */}
              <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 p-6 shadow-xl">
                <label className="block text-white font-medium mb-2">Select Campaign</label>
                <div className="relative">
                  <select 
                    className="w-full p-3 pl-4 pr-10 bg-black border border-zinc-800 rounded-lg text-white appearance-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                  >
                    <option value="clean-water">Clean Water Initiative</option>
                    <option value="education">Education for All</option>
                    <option value="medical">Medical Supplies Drive</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 p-8 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Campaign Verification</h3>
                    <p className="text-emerald-400 mt-1">Clean Water Initiative</p>
                  </div>
                  <StatusBadge status="In Progress" />
                </div>
                
                {/* Progress Tracker */}
                <div className="relative mb-16 px-4">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 w-full h-1 bg-zinc-800"></div>
                  <div className="absolute top-5 left-0 w-2/3 h-1 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
                  
                  {/* Steps */}
                  <div className="flex justify-between relative">
                    {/* Step 1: Submission */}
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto bg-emerald-600 text-black rounded-full flex items-center justify-center font-bold relative z-10 shadow-lg shadow-emerald-600/20">
                        <span>1</span>
                      </div>
                      <div className="mt-3 text-emerald-400 font-medium">Submission</div>
                      <div className="text-xs mt-1 text-emerald-400">Completed</div>
                    </div>
                    
                    {/* Step 2: Review */}
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto bg-emerald-600 text-black rounded-full flex items-center justify-center font-bold relative z-10 shadow-lg shadow-emerald-600/20">
                        <span>2</span>
                      </div>
                      <div className="mt-3 text-emerald-400 font-medium">Initial Review</div>
                      <div className="text-xs mt-1 text-emerald-400">Completed</div>
                    </div>
                    
                    {/* Step 3: Verification */}
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto bg-emerald-600 text-black rounded-full flex items-center justify-center font-bold relative z-10 shadow-lg shadow-emerald-600/20">
                        <span>3</span>
                        <div className="absolute -inset-1 rounded-full border border-emerald-500/40 animate-ping-slow"></div>
                      </div>
                      <div className="mt-3 text-emerald-400 font-medium">Verification</div>
                      <div className="text-xs mt-1 text-emerald-400">In Progress</div>
                    </div>
                    
                    {/* Step 4: Approval */}
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto bg-zinc-800 text-gray-400 rounded-full flex items-center justify-center font-bold relative z-10 border border-zinc-700">
                        <span>4</span>
                      </div>
                      <div className="mt-3 text-gray-400 font-medium">Approval</div>
                      <div className="text-xs mt-1 text-gray-500">Pending</div>
                    </div>
                  </div>
                </div>
                
                {/* Verification Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="bg-black/40 p-6 rounded-xl border border-zinc-800 hover:border-emerald-900/30 transition-all duration-300">
                    <h4 className="text-xl font-semibold mb-6 text-white flex items-center">
                      <FileText className="h-5 w-5 text-emerald-500 mr-2" />
                      Campaign Information
                    </h4>
                    <div className="space-y-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center mr-4">
                          <FileText className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">Campaign Title</div>
                          <div className="text-white font-medium">Clean Water Initiative</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center mr-4">
                          <DollarSign className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">Target Amount</div>
                          <div className="text-white font-medium">20 ETH</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center mr-4">
                          <Calendar className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">Timeline</div>
                          <div className="text-white font-medium">April 15, 2025 - July 15, 2025</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center mr-4">
                          <Clock className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">Status</div>
                          <div className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">Verification in progress</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 p-6 rounded-xl border border-zinc-800 hover:border-emerald-900/30 transition-all duration-300">
                    <h4 className="text-xl font-semibold mb-6 text-white flex items-center">
                      <AlertCircle className="h-5 w-5 text-emerald-500 mr-2" />
                      Verification Feedback
                    </h4>
                    <div className="p-4 bg-emerald-600/10 border border-emerald-600/20 rounded-lg text-emerald-400 mb-6">
                      <div className="flex">
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p>Your campaign has passed initial review. We're now verifying the project details and impact estimates.</p>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold mt-6 mb-3 text-white">Verification Timeline</h4>
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="relative mr-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-black">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-zinc-700"></div>
                        </div>
                        <div className="pb-5">
                          <p className="text-white font-medium">Document Review</p>
                          <p className="text-xs text-gray-400">May 15, 2025</p>
                          <p className="text-sm text-gray-300 mt-1">All required documents have been verified</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="relative mr-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-black">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-zinc-700"></div>
                        </div>
                        <div className="pb-5">
                          <p className="text-white font-medium">Impact Assessment</p>
                          <p className="text-xs text-gray-400">May 16, 2025</p>
                          <p className="text-sm text-gray-300 mt-1">Project impact has been evaluated</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="relative mr-4">
                          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black">
                            <Clock className="h-4 w-4" />
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-medium">Final Verification</p>
                          <p className="text-xs text-gray-400">In Progress</p>
                          <p className="text-sm text-gray-300 mt-1">Estimated completion: May 19, 2025</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Requirements */}
                <div className="bg-black/40 p-6 rounded-xl border border-zinc-800 hover:border-emerald-900/30 transition-all duration-300 mb-8">
                  <h4 className="text-xl font-semibold mb-6 text-white flex items-center">
                    <AlertCircle className="h-5 w-5 text-emerald-500 mr-2" />
                    Additional Requirements
                  </h4>
                  <div className="space-y-6">
                    <div className="flex items-start p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-white font-medium">Project Implementation Timeline</h5>
                        <p className="text-gray-400 text-sm mt-1">Please provide a detailed timeline for project implementation including key milestones.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-white font-medium">Partner Information</h5>
                        <p className="text-gray-400 text-sm mt-1">Submit details about any partner organizations or contractors involved in the project.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Upload Area */}
                <div className="bg-black/40 rounded-xl border border-zinc-800 overflow-hidden">
                  <div className="p-6 border-b border-zinc-800">
                    <h4 className="text-xl font-semibold text-white flex items-center">
                      <Upload className="h-5 w-5 text-emerald-500 mr-2" />
                      Upload Additional Documentation
                    </h4>
                  </div>
                  
                  <div className="border-2 border-dashed border-zinc-800 rounded-lg mx-6 my-6 p-8 text-center hover:border-emerald-500/30 transition-all cursor-pointer group">
                    <div className="mx-auto w-16 h-16 mb-4 bg-emerald-900/10 rounded-full flex items-center justify-center group-hover:bg-emerald-900/20 transition-all">
                      <Upload className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-gray-300 mb-2">Upload additional documentation</p>
                    <p className="text-xs text-gray-500 mb-4">Supported formats: PDF, DOC, DOCX (Max size: 10MB)</p>
                    <button className="inline-flex items-center px-5 py-2.5 bg-emerald-600 text-black rounded-lg font-medium transition-all hover:bg-emerald-500 shadow-lg shadow-emerald-600/20">
                      <Upload className="w-4 h-4 mr-2" />
                      Select Files
                    </button>
                  </div>
                  
                  <div className="p-6 bg-black/20 border-t border-zinc-800 flex justify-end">
                    <button className="px-6 py-3 bg-emerald-600 text-black rounded-lg font-medium hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center">
                      Submit Additional Documents
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
