"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CampaignCard from '@/components/campaigns/CampaignCard';
import { ArrowRight, ChevronRight, Globe, Shield, BarChart2, CheckCircle } from 'lucide-react';

// Mock data for featured campaigns
const featuredCampaigns = [
  {
    id: '1',
    title: 'Clean Water Initiative',
    description: 'Fund 10 new wells in communities facing water scarcity',
    image_url: '/background1.jpg',
    target_amount: 20,
    current_amount: 15,
    start_date: '2025-04-15T00:00:00Z',
    end_date: '2025-07-15T23:59:59Z',
    status: 'active',
    organization_id: '1',
    organizationName: 'Global Relief'
  },
  {
    id: '2',
    title: 'Education for All',
    description: 'Help us build a new school in rural Tanzania to serve 500 children',
    image_url: '/background7.jpg',
    target_amount: 15,
    current_amount: 0,
    start_date: '2025-05-01T00:00:00Z',
    end_date: '2025-08-01T23:59:59Z',
    status: 'pending',
    organization_id: '2',
    organizationName: 'Education First'
  },
  {
    id: '3',
    title: 'Medical Supplies Drive',
    description: 'Provide essential medical supplies to underserved communities',
    image_url: '/background4.jpg',
    target_amount: 10,
    current_amount: 5,
    start_date: '2025-03-01T00:00:00Z',
    end_date: '2025-06-01T23:59:59Z',
    status: 'active',
    organization_id: '3',
    organizationName: 'Health Alliance'
  }
];

// Stats for the animated counter
const impactStats = [
  { label: 'Campaigns Funded', value: 120, suffix: '+', icon: <BarChart2 className="h-8 w-8 text-emerald-500" /> },
  { label: 'Total Donations', value: 1500, suffix: 'ETH', icon: <Globe className="h-8 w-8 text-emerald-500" /> },
  { label: 'Verified Organizations', value: 45, suffix: '', icon: <Shield className="h-8 w-8 text-emerald-500" /> }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [counters, setCounters] = useState(impactStats.map(() => 0));
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);

  // Automatic slideshow for hero section with smoother transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Improved intersection observer with ref
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    );

    if (statsRef.current) observer.observe(statsRef.current);

    return () => {
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, []);

  // Enhanced animated counting effect with easing
  useEffect(() => {
    if (!isVisible) return;

    const duration = 2500;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;
    
    const timer = setInterval(() => {
      frame++;
      // Using easeOutQuad for smoother animation
      const progress = 1 - Math.pow(1 - frame / totalFrames, 2);
      
      setCounters(impactStats.map((stat) => {
        return Math.floor(progress * stat.value);
      }));

      if (frame === totalFrames) {
        clearInterval(timer);
        setCounters(impactStats.map(stat => stat.value));
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [isVisible]);

  const heroSlides = [
    {
      title: "Transparent Donations for a Better World",
      subtitle: "FundWise ensures every donation is tracked and verified, giving you confidence that your contribution makes a real impact.",
      image: "/background7.jpg"
    },
    {
      title: "Verified Organizations You Can Trust",
      subtitle: "Every organization on FundWise undergoes a thorough verification process to ensure legitimacy and transparency.",
      image: "/background6.jpg"
    },
    {
      title: "Track Your Impact",
      subtitle: "See exactly how your donations are used with verified proof of fund usage from organizations.",
      image: "/background2.jpg"
    }
  ];

  return (
    <main className="overflow-x-hidden bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-gray-200">
      {/* Enhanced Hero Section with Slideshow */}
      <section className="relative h-[700px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-all duration-1500 ease-in-out ${
              currentSlide === index 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/60 z-10" />
            <Image 
              src={slide.image} 
              alt={slide.title}
              fill
              style={{ objectFit: 'cover' }}
              priority={index === 0}
              className="transform transition-transform duration-10000 ease-in-out scale-110"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.15)_0%,_transparent_70%)] z-20"></div>
            <div className="relative z-30 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white animate-fade-in-up">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-emerald-400/90 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                {slide.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-5 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Link href="/campaigns" className="px-8 py-4 bg-black/40 backdrop-blur-sm text-emerald-400 rounded-lg font-medium hover:bg-black/60 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:-translate-y-1 border border-emerald-500/30 flex items-center">
                  Browse Campaigns
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/campaigns/create" className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 transform hover:-translate-y-1 flex items-center">
                  Start a Campaign
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {/* Enhanced slideshow indicators */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-30">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-emerald-500 w-6' 
                  : 'bg-emerald-900/60 hover:bg-emerald-700/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-24 bg-black relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.05)_0%,_transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">How FundWise Works</h2>
          <p className="text-center text-emerald-400 max-w-2xl mx-auto mb-16">Our transparent donation process ensures your contributions make a real difference.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line (visible on md screens and up) */}
            <div className="hidden md:block absolute top-24 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            
            <div className="text-center relative group">
              <div className="bg-black rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20 border border-emerald-500/40 relative z-10 group-hover:scale-110 transition-all duration-300">
                <span className="text-emerald-500 text-3xl font-bold">1</span>
                <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping-slow"></div>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Create a Campaign</h3>
              <p className="text-gray-400 max-w-xs mx-auto">Organizations create verified campaigns with clear goals and transparent timelines.</p>
            </div>
            
            <div className="text-center relative group">
              <div className="bg-black rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20 border border-emerald-500/40 relative z-10 group-hover:scale-110 transition-all duration-300" style={{ animationDelay: '1s' }}>
                <span className="text-emerald-500 text-3xl font-bold">2</span>
                <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping-slow" style={{ animationDelay: '1s' }}></div>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Donate Securely</h3>
              <p className="text-gray-400 max-w-xs mx-auto">Make donations using cryptocurrency with complete transaction transparency.</p>
            </div>
            
            <div className="text-center relative group">
              <div className="bg-black rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20 border border-emerald-500/40 relative z-10 group-hover:scale-110 transition-all duration-300" style={{ animationDelay: '2s' }}>
                <span className="text-emerald-500 text-3xl font-bold">3</span>
                <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping-slow" style={{ animationDelay: '2s' }}></div>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Track Impact</h3>
              <p className="text-gray-400 max-w-xs mx-auto">See exactly how your donations are used with verified proof of fund usage.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Enhanced Impact Stats Section with Chart Animation */}
      <section 
        ref={statsRef}
        className="py-20 bg-zinc-900/80 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.1)_0%,_transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-white">Our Impact</h2>
          <p className="text-center text-emerald-400 max-w-2xl mx-auto mb-16">Together we're making a difference through transparent donations.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {impactStats.map((stat, index) => (
              <div key={index} className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-emerald-900/30 hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 text-center">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="relative h-32 flex items-center justify-center mb-4">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="45" 
                      className="stroke-emerald-900/50 stroke-[8]" 
                      fill="none" 
                    />
                    <circle 
                      cx="50" cy="50" r="45" 
                      className="stroke-emerald-500 stroke-[8]" 
                      fill="none" 
                      strokeDasharray="283" 
                      strokeDashoffset={283 - (counters[index] / stat.value) * 283}
                      style={{ 
                        transition: 'stroke-dashoffset 2s ease-in-out',
                      }}
                    />
                  </svg>
                  <p className="absolute text-4xl font-bold text-white">
                    {counters[index]}<span className="text-emerald-400">{stat.suffix}</span>
                  </p>
                </div>
                <p className="text-xl text-emerald-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Redesigned Featured Campaigns Section */}
      <section className="py-24 bg-black relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0.4)_0%,_transparent_100%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">Featured Campaigns</h2>
          <p className="text-center text-emerald-400 max-w-2xl mx-auto mb-16">Support these verified campaigns making a difference around the world.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign, index) => (
              <div 
                key={campaign.id} 
                className="animate-fade-in-up transform transition-all duration-500" 
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CampaignCard {...campaign} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-14">
            <Link 
              href="/campaigns" 
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 inline-flex items-center"
            >
              View All Campaigns
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Enhanced Join Movement Section */}
      <section className="py-24 bg-zinc-900/80 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-900/20 animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-900/10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.1)_0%,_transparent_70%)]"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-900/30 p-10 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Join the Transparent Donation Movement</h2>
            <p className="text-xl mb-10 max-w-3xl mx-auto text-emerald-400">
              Whether you're a donor looking to make an impact or an organization seeking funding, 
              FundWise provides the tools and transparency you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/how-to-donate" 
                className="px-8 py-4 bg-black text-emerald-400 rounded-lg font-medium hover:bg-zinc-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:-translate-y-1 inline-flex items-center border border-emerald-500/50"
              >
                How to Donate
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/organizations/register" 
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 inline-flex items-center"
              >
                Register Organization
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* New Testimonials Section */}
      <section className="py-24 bg-black relative">
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">What People Say</h2>
          <p className="text-center text-emerald-400 max-w-2xl mx-auto mb-16">Hear from our community of donors and organizations.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-emerald-900/30 hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30">JD</div>
                <div className="ml-4">
                  <h4 className="font-semibold text-white">Jane Doe</h4>
                  <p className="text-sm text-emerald-500">Donor</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-4 -left-2 text-emerald-500/20 text-6xl font-serif">"</div>
                <p className="text-gray-300 relative z-10">I love how I can track exactly where my donations go. The transparency FundWise provides gives me confidence that my contributions are making a real difference.</p>
                <div className="absolute -bottom-8 -right-2 text-emerald-500/20 text-6xl font-serif">"</div>
              </div>
            </div>
            
            <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-emerald-900/30 hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30">MS</div>
                <div className="ml-4">
                  <h4 className="font-semibold text-white">Mark Smith</h4>
                  <p className="text-sm text-emerald-500">Organization Leader</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-4 -left-2 text-emerald-500/20 text-6xl font-serif">"</div>
                <p className="text-gray-300 relative z-10">FundWise has revolutionized how we fundraise. The platform's transparency tools have helped us build trust with donors and increase our impact.</p>
                <div className="absolute -bottom-8 -right-2 text-emerald-500/20 text-6xl font-serif">"</div>
              </div>
            </div>
            
            <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-xl shadow-lg md:col-span-2 lg:col-span-1 border border-emerald-900/30 hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30">AJ</div>
                <div className="ml-4">
                  <h4 className="font-semibold text-white">Alex Johnson</h4>
                  <p className="text-sm text-emerald-500">Community Partner</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-4 -left-2 text-emerald-500/20 text-6xl font-serif">"</div>
                <p className="text-gray-300 relative z-10">The impact tracking features have been invaluable for our community projects. We can easily show stakeholders the direct results of their support.</p>
                <div className="absolute -bottom-8 -right-2 text-emerald-500/20 text-6xl font-serif">"</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* New Newsletter Section */}
      <section className="py-16 bg-black/80 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.05)_0%,_transparent_70%)]"></div>
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-emerald-900/30 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-10">
                <h3 className="text-2xl font-bold mb-2 text-white">Stay Updated</h3>
                <p className="text-emerald-400">Get the latest news about campaigns and impact.</p>
              </div>
              <div className="w-full md:w-auto">
                <form className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="px-4 py-3 rounded-lg bg-black text-gray-200 border border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-w-[280px] placeholder-gray-600" 
                  />
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-black rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-colors duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 flex items-center justify-center"
                  >
                    Subscribe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
