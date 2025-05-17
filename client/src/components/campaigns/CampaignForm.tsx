"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, DollarSign, FileText, Upload, Image as ImageIcon, Info, ArrowRight } from 'lucide-react';

export default function CampaignForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    startDate: '',
    endDate: '',
    image: null as File | null,
    category: '',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          data.append(key, value as string | Blob);
        }
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      router.push('/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden shadow-xl max-w-4xl mx-auto">
      {/* Form Header */}
      <div className="bg-black/40 p-6 border-b border-zinc-800">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FileText className="h-6 w-6 text-emerald-500 mr-3" />
          Create a New Campaign
        </h2>
        <p className="text-gray-400 mt-1">Fill out the form below to create your blockchain-powered fundraising campaign</p>
      </div>
      
      {/* Progress Steps */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center w-full">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${currentStep >= 1 ? 'bg-emerald-500 text-black' : 'bg-zinc-700 text-gray-300'}`}>
              1
            </div>
            <div className={`h-1 flex-1 mx-2 ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${currentStep >= 2 ? 'bg-emerald-500 text-black' : 'bg-zinc-700 text-gray-300'}`}>
              2
            </div>
            <div className={`h-1 flex-1 mx-2 ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${currentStep >= 3 ? 'bg-emerald-500 text-black' : 'bg-zinc-700 text-gray-300'}`}>
              3
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
            
            <div>
              <label htmlFor="title" className="block text-gray-300 mb-2 font-medium">
                Campaign Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/50 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
                placeholder="Enter a clear, descriptive title"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-gray-300 mb-2 font-medium">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black/50 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent appearance-none"
              >
                <option value="">Select a category</option>
                <option value="education">Education</option>
                <option value="health">Healthcare</option>
                <option value="environment">Environment</option>
                <option value="humanitarian">Humanitarian</option>
                <option value="technology">Technology</option>
                <option value="community">Community</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-gray-300 mb-2 font-medium">
                Campaign Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-black/50 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
                placeholder="Describe your campaign in detail. What are you raising funds for? How will the funds be used?"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg flex items-center"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Funding Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-4">Funding Details</h3>
            
            <div>
              <label htmlFor="goal" className="block text-gray-300 mb-2 font-medium">
                Funding Goal (ETH)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <input
                  type="number"
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  required
                  min="0.1"
                  step="0.01"
                  className="w-full pl-10 px-4 py-3 bg-black/50 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
                  placeholder="10.00"
                />
              </div>
              <p className="text-gray-500 text-sm mt-1">Enter the amount of ETH you want to raise</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-gray-300 mb-2 font-medium">
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 px-4 py-3 bg-black/50 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-gray-300 mb-2 font-medium">
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 px-4 py-3 bg-black/50 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 border border-zinc-800 flex items-start">
              <Info className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-300 text-sm">
                  Your campaign will be reviewed by our team before it goes live. Verification typically takes 1-2 business days.
                </p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all duration-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg flex items-center"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Campaign Image */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-4">Campaign Image</h3>
            
            <div>
              <label className="block text-gray-300 mb-4 font-medium">
                Upload a campaign image
              </label>
              
              {previewUrl ? (
                <div className="mb-4">
                  <div className="relative h-64 rounded-lg overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Campaign preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null);
                        setFormData(prev => ({ ...prev, image: null }));
                      }}
                      className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black/90"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500/30 transition-all group"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  <div className="mx-auto w-16 h-16 mb-4 bg-emerald-900/10 rounded-full flex items-center justify-center group-hover:bg-emerald-900/20 transition-all">
                    <ImageIcon className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-gray-300 mb-2">Click to upload a campaign image</p>
                  <p className="text-xs text-gray-500 mb-4">JPG, PNG or GIF (Max 5MB)</p>
                  <button 
                    type="button"
                    className="inline-flex items-center px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg hover:bg-zinc-700 transition-all"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select Image
                  </button>
                </div>
              )}
              <input 
                type="file"
                id="image"
                name="image"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-gray-500 text-sm mt-2">A high-quality image will help your campaign stand out</p>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-all duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.image}
                className={`px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg flex items-center ${
                  (isSubmitting || !formData.image) ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
