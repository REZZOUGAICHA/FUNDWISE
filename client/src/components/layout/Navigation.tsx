"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Menu, X, Wallet, LogIn, UserPlus, 
  Home, BarChart2, Building, Shield, DollarSign, HelpCircle, 
  User, CreditCard, Clock, LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

// Define interfaces for our navigation items
interface DropdownItem {
  name: string;
  path: string;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  dropdown?: DropdownItem[];
}

const Navigation = () => {
  const { user, defaultRole, logout, connectWallet } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and dropdowns when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    setActiveDropdown(null);
  }, [pathname]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Skip navigation on login/signup pages
  if (pathname === '/login' || pathname === '/signup') return null;
  
  // Define base navigation items (common to all users)
  const baseNavItems: NavItem[] = [
    { 
      name: 'Home', 
      path: '/', 
      icon: <Home size={18} /> 
    },
    { 
      name: 'Campaigns', 
      path: '/campaigns', 
      icon: <BarChart2 size={18} />,
      dropdown: [
        { name: 'Browse Campaigns', path: '/campaigns' }
      ]
    },
    { 
      name: 'Organizations', 
      path: '/organizations', 
      icon: <Building size={18} />,
      dropdown: [
        { name: 'Browse Organizations', path: '/organizations' }
      ]
    }
  ];
  
  // Define "How It Works" navigation item (only for non-logged in users)
  const howItWorksItem: NavItem = { 
    name: 'How It Works', 
    path: '/how-to-donate', 
    icon: <HelpCircle size={18} /> 
  };

  // Define navigation items for each role
  const publicNavItems: NavItem[] = [
    ...baseNavItems,
    howItWorksItem
  ];

  const donorNavItems: NavItem[] = [
    ...baseNavItems,
    { 
      name: 'My Donations', 
      path: '/donations', 
      icon: <DollarSign size={18} /> 
    }
  ];

  const organizationNavItems: NavItem[] = [
    ...baseNavItems,
    { 
      name: 'My Campaigns', 
      path: '/my-campaigns', // Fixed spelling
      icon: <BarChart2 size={18} />,
      dropdown: [
        { name: 'My Campaigns', path: '/my-campaigns' }, // Fixed spelling
        { name: 'Create Campaign', path: '/campaigns/create' }
      ]
    },
    { 
      name: 'Fund Release', 
      path: '/fund-release', 
      icon: <CreditCard size={18} /> 
    }
  ];

  const auditorNavItems: NavItem[] = [
    ...baseNavItems,
    { 
      name: 'Verification Portal', 
      path: '/verification-portal', 
      icon: <Shield size={18} /> 
    }
  ];

  // Select navigation items based on user role or defaultRole
  let navItems: NavItem[] = publicNavItems;

  if (user) {
    switch (user.role) {
      case 'donor':
        navItems = donorNavItems;
        break;
      case 'organization':
        navItems = organizationNavItems;
        break;
      case 'audit':
        navItems = auditorNavItems;
        break;
      default:
        navItems = baseNavItems; // Logged in but unknown role - don't show "How It Works"
    }
  } else {
    // Use defaultRole for non-logged in users
    switch (defaultRole) {
      case 'donor':
        navItems = donorNavItems;
        break;
      case 'organization':
        navItems = organizationNavItems;
        break;
      case 'audit':
        navItems = auditorNavItems;
        break;
      default:
        navItems = publicNavItems; // Not logged in - show "How It Works"
    }
  }

  const toggleDropdown = (index: number): void => {
    if (activeDropdown === index) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(index);
    }
  };

  const isActive = (item: NavItem): boolean => {
    if (pathname === item.path) return true;
    if (item.dropdown && item.dropdown.some((subItem: DropdownItem) => pathname === subItem.path)) return true;
    return false;
  };

  // Determine if we should show the account button or user info
  const showAccountButton = !user && defaultRole === 'public';
  const showUserInfo = user || (defaultRole !== 'public');

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-lg border-b border-emerald-900/30' 
          : 'bg-transparent'
      }`}
    >
      <nav className={`container mx-auto px-4 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'}`}>
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="h-10 w-10 mr-3 relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-emerald-500 font-bold text-xl">F</span>
              </div>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">
              Fund<span className="text-emerald-500">Wise</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
            {navItems.map((item: NavItem, index: number) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(index)}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${
                        isActive(item)
                          ? 'text-emerald-400 font-medium bg-emerald-900/20'
                          : 'text-gray-300 hover:text-emerald-400 hover:bg-emerald-900/10'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </button>
                    
                    {activeDropdown === index && (
                      <div className="absolute left-0 mt-2 w-56 bg-zinc-900 border border-emerald-900/30 rounded-lg shadow-xl overflow-hidden animate-fade-in z-50">
                        {item.dropdown.map((subItem: DropdownItem) => (
                          <Link 
                            key={subItem.name}
                            href={subItem.path} 
                            className={`flex items-center px-4 py-3 text-gray-200 hover:bg-black/50 hover:text-emerald-400 transition-colors ${
                              pathname === subItem.path ? 'bg-emerald-900/20 text-emerald-400' : ''
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${
                      pathname === item.path
                        ? 'text-emerald-400 font-medium bg-emerald-900/20'
                        : 'text-gray-300 hover:text-emerald-400 hover:bg-emerald-900/10'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right section with buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {user && !user.isConnected && (
              <button 
                onClick={connectWallet}
                className="px-4 py-2 bg-black/30 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-900/20 transition-all duration-300 flex items-center"
              >
                <Wallet size={18} className="mr-2" />
                Connect Wallet
              </button>
            )}
            
            <div className="relative">
              {/* Always show Account button for public role */}
              {showAccountButton && (
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-4 py-2 bg-emerald-600 text-black rounded-lg hover:bg-emerald-500 transition-all duration-300 flex items-center"
                >
                  <User size={18} className="mr-2" />
                  Account
                </button>
              )}
              
              {/* Show user info and logout for logged in users or non-public roles */}
              {showUserInfo && (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="px-4 py-2 bg-emerald-600 text-black rounded-lg hover:bg-emerald-500 transition-all duration-300 flex items-center"
                  >
                    <User size={18} className="mr-2" />
                    {user ? user.name : defaultRole.charAt(0).toUpperCase() + defaultRole.slice(1)}
                  </button>
                  
                  {/* Always show logout button for user or non-public defaultRole */}
                  <button 
                    onClick={logout}
                    className="p-2 bg-emerald-900/20 text-emerald-400 rounded-lg hover:bg-emerald-900/30 transition-all duration-300"
                    aria-label="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              )}
              
              {/* Dropdown for Account button (only for public role) */}
              {isDropdownOpen && showAccountButton && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-emerald-900/30 rounded-lg shadow-xl overflow-hidden animate-fade-in z-50">
                  <Link 
                    href="/login" 
                    className="flex items-center px-4 py-3 text-gray-200 hover:bg-black/50 hover:text-emerald-400 transition-colors"
                  >
                    <LogIn size={16} className="mr-2" />
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="flex items-center px-4 py-3 text-gray-200 hover:bg-black/50 hover:text-emerald-400 transition-colors"
                  >
                    <UserPlus size={16} className="mr-2" />
                    Register
                  </Link>
                </div>
              )}
              
              {/* Dropdown for user profile (for logged in users) */}
              {isDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-emerald-900/30 rounded-lg shadow-xl overflow-hidden animate-fade-in z-50">
                  <div className="px-4 py-2 border-b border-emerald-900/30">
                    <p className="text-emerald-400 font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.role}</p>
                  </div>
                  
                  {user.role === 'donor' && (
                    <Link 
                      href="/donations" 
                      className="flex items-center px-4 py-3 text-gray-200 hover:bg-black/50 hover:text-emerald-400 transition-colors"
                    >
                      <Clock size={16} className="mr-2" />
                      My Donations
                    </Link>
                  )}
                  
                  {user.role === 'organization' && (
                    <Link 
                      href="/my-campaigns" 
                      className="flex items-center px-4 py-3 text-gray-200 hover:bg-black/50 hover:text-emerald-400 transition-colors"
                    >
                      <BarChart2 size={16} className="mr-2" />
                      My Campaigns
                    </Link>
                  )}
                  
                  <Link 
                    href="/profile" 
                    className="flex items-center px-4 py-3 text-gray-200 hover:bg-black/50 hover:text-emerald-400 transition-colors"
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            {/* Show logout button for user or non-public defaultRole */}
            {(user || defaultRole !== 'public') && (
              <button 
                onClick={logout}
                className="p-2 mr-2 bg-emerald-900/20 text-emerald-400 rounded-lg hover:bg-emerald-900/30 transition-all duration-300"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30 transition-colors duration-300 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div 
        className={`fixed inset-x-0 top-[60px] z-40 bg-black/95 backdrop-blur-lg border-t border-emerald-900/30 lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen border-b border-emerald-900/30' : 'max-h-0'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-2">
            {navItems.map((item: NavItem, index: number) => (
              <div key={item.name} className="flex flex-col">
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(index)}
                      className={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-between ${
                        isActive(item)
                          ? 'text-emerald-400 font-medium bg-emerald-900/20'
                          : 'text-gray-300 hover:text-emerald-400 hover:bg-emerald-900/10'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </div>
                    </button>
                    
                    {activeDropdown === index && (
                      <div className="ml-10 mt-1 space-y-1 animate-fade-in">
                        {item.dropdown.map((subItem: DropdownItem) => (
                          <Link 
                            key={subItem.name}
                            href={subItem.path}
                            className={`flex items-center px-4 py-2 rounded-lg text-gray-300 hover:bg-emerald-900/10 hover:text-emerald-400 transition-colors ${
                              pathname === subItem.path ? 'bg-emerald-900/20 text-emerald-400' : ''
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center ${
                      pathname === item.path
                        ? 'text-emerald-400 font-medium bg-emerald-900/20'
                        : 'text-gray-300 hover:text-emerald-400 hover:bg-emerald-900/10'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            <div className="h-px bg-emerald-900/30 my-2"></div>
            
            {/* Modified mobile menu footer */}
            {user ? (
              <>
                {/* If user is logged in, show minimal options in mobile menu */}
                {user.role === 'donor' && (
                  <Link 
                    href="/donations" 
                    className="px-4 py-3 bg-black/30 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-900/20 transition-all duration-300 flex items-center justify-center"
                  >
                    <Clock size={18} className="mr-2" />
                    My Donations
                  </Link>
                )}
                
                <Link 
                  href="/profile"
                  className="px-4 py-3 bg-black/30 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-900/20 transition-all duration-300 flex items-center justify-center"
                >
                  <User size={18} className="mr-2" />
                  Profile
                </Link>
              </>
            ) : defaultRole !== 'public' ? (
              // For non-public defaultRole but not logged in
              <Link 
                href="/profile"
                className="px-4 py-3 bg-black/30 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-900/20 transition-all duration-300 flex items-center justify-center"
              >
                <User size={18} className="mr-2" />
                Profile
              </Link>
            ) : (
              <>
                {/* If not logged in and public role, show wallet connect and login/register options */}
                <button 
                  onClick={connectWallet}
                  className="px-4 py-3 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-900/20 transition-all duration-300 flex items-center justify-center"
                >
                  <Wallet size={18} className="mr-2" />
                  Connect Wallet
                </button>
                
                <Link
                  href="/login" 
                  className="px-4 py-3 bg-emerald-600 text-black rounded-lg hover:bg-emerald-500 transition-all duration-300 flex items-center justify-center"
                >
                  <LogIn size={18} className="mr-2" />
                  Login
                </Link>
                
                <Link 
                  href="/signup" 
                  className="px-4 py-3 bg-black/30 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-900/20 transition-all duration-300 flex items-center justify-center"
                >
                  <UserPlus size={18} className="mr-2" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
