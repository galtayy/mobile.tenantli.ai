import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { useAuth } from '../lib/auth';
import { apiService } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

// Improved Menu Icon component
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="18" height="2" rx="1" fill="#1C2C40"/>
    <rect x="2" y="10" width="18" height="2" rx="1" fill="#1C2C40"/>
    <rect x="2" y="15" width="18" height="2" rx="1" fill="#1C2C40"/>
  </svg>
);

// PNG ikonları kullanıyoruz, SVG bileşenleri artık gerekli değil

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    properties: 0,
    reports: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [properties, setProperties] = useState([]);
  const [showSideMenu, setShowSideMenu] = useState(false); // Default olarak kapalı
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePropertyId, setDeletePropertyId] = useState(null);
  const [bottomSheetPosition, setBottomSheetPosition] = useState({ x: 0, y: 0 });
  const sideMenuRef = useRef(null);
  const bottomSheetRef = useRef(null);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    } else if (user) {
      // Check if this is a newly verified user that should be redirected to onboarding
      const isNewlyVerified = localStorage.getItem('newlyVerified') === 'true';
      if (isNewlyVerified) {
        // Clear the flag and redirect to onboarding
        localStorage.removeItem('newlyVerified');
        router.push('/onboarding');
      } else {
        // Regular user, just make sure menu is closed
        setShowSideMenu(false);
      }
    }
  }, [user, loading, router]);
  
  // Close side menu and bottom sheet when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // No need to check sideMenuRef here since we handle this with the backdrop click
      
      // Only handle bottom sheet clicks
      if (bottomSheetRef.current && !bottomSheetRef.current.contains(event.target) && showBottomSheet) {
        setShowBottomSheet(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [bottomSheetRef, showBottomSheet]);
  
  // Handle menu closing with AnimatePresence
  const closeMenu = () => {
    // With AnimatePresence, we can simply set the state directly
    // The exit animation will be handled automatically
    setShowSideMenu(false);
  };

  useEffect(() => {
    if (user) {
      // Kullanıcı girişi yapıldığında verileri yükle
      fetchDashboardData();
    }
  }, [user]);
  
  // İlk giriş yaptığında, eğer hiç mülk yoksa direkt olarak addunit sayfasına yönlendir
  useEffect(() => {
    // İlk render'da değil, veri yüklendiğinde ve properties'in 0 olduğu durumda
    if (!loading && properties.length === 0 && stats.properties === 0 && user) {
      // Ancak doğrudan gelinen sayfa properties ise (direkt URL'den giriş yapıldıysa)
      const isDirectNavigation = typeof window !== 'undefined' && 
        window.performance?.navigation?.type === window.performance?.navigation?.TYPE_NAVIGATE;
      
      // Otomatik yönlendirme yapmayı burada devre dışı bırakıyoruz, çünkü kullanıcı
      // zaten doğrudan properties/addunit'e gitmiş olacak
      
      // Debugger amaçlı yönlendirme görünümü
      console.log("Properties length:", properties.length);
      console.log("Stats properties:", stats.properties);
    }
  }, [loading, properties, stats.properties, user, router]);

  // Removed deleteProperty function - single property only

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      // doğrudan API URL'sini kullanarak veri çekelim
      const axios = (await import('axios')).default;
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Environment Check
      const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
      const apiUrl = isProduction ? 'https://api.tenantli.ai' : 'http://localhost:5050';
      console.log('Using API URL:', apiUrl);
      
      // Properties verisini çek
      let propertiesList = [];
      try {
        console.log('Fetching properties from', `${apiUrl}/api/properties`);
        const propertiesResponse = await axios.get(`${apiUrl}/api/properties`, { headers });
        propertiesList = propertiesResponse.data || [];
        console.log(`Loaded ${propertiesList.length} properties`);
        
        // Mülkleri state'e kaydet
        setProperties(propertiesList);
      } catch (propError) {
        console.error('Failed to load properties:', propError);
        propertiesList = [];
      }
      
      // Reports verisini çek
      let reports = [];
      try {
        console.log('Fetching reports from', `${apiUrl}/api/reports`);
        const reportsResponse = await axios.get(`${apiUrl}/api/reports`, { headers });
        reports = reportsResponse.data || [];
        console.log(`Loaded ${reports.length} reports`);
      } catch (reportError) {
        console.error('Failed to load reports:', reportError);
        reports = [];
      }
      
      // İstatistikleri güncelle
      setStats({
        properties: propertiesList.length,
        reports: reports.length
      });
      
      // Aktiviteleri oluştur
      try {
        const activities = [];
        
        // Report activity
        if (reports && reports.length > 0) {
          // Sort by date (newest first)
          reports.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          
          // Add most recent report
          activities.push({
            id: `report-${reports[0].id || 1}`,
            type: 'create_report',
            title: 'Created new report',
            description: reports[0].title ? 
              `${reports[0].type || 'Report'}: ${reports[0].title}` : 
              'Property Report',
            time: '2 hours ago',
            icon: 'report'
          });
        }
        
        // Property activity
        if (propertiesList && propertiesList.length > 0) {
          // Add most recent property
          activities.push({
            id: `property-${propertiesList[0].id || 2}`,
            type: 'add_property',
            title: 'Added new property',
            description: propertiesList[0].address || 'Property Address',
            time: '3 days ago',
            icon: 'property'
          });
        }
        
        // Fallback for empty activities
        if (activities.length === 0) {
          activities.push({
            id: 'welcome-1',
            type: 'system',
            title: 'System Message',
            description: 'Welcome to tenantli',
            time: 'Just now',
            icon: 'report'
          });
        }
        
        setRecentActivity(activities);
        console.log('Recent activities created:', activities.length);
      } catch (activityError) {
        console.error('Error creating activities:', activityError);
        // Simple fallback
        setRecentActivity([{
          id: 'fallback-1',
          type: 'system',
          title: 'System Message',
          description: 'Welcome to tenantli',
          time: 'Just now',
          icon: 'report'
        }]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Delete property function
  const handleDeleteProperty = async () => {
    if (!deletePropertyId) return;
    
    try {
      const axios = (await import('axios')).default;
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
      const apiUrl = isProduction ? 'https://api.tenantli.ai' : 'http://localhost:5050';
      
      const response = await axios.delete(`${apiUrl}/api/properties/${deletePropertyId}`, { headers });
      
      // Refresh the dashboard data
      await fetchDashboardData();
      setShowDeleteConfirm(false);
      setDeletePropertyId(null);
      
      // Add success message
      console.log('Property deleted successfully');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property. Please try again.');
    }
  };

  // Show delete confirmation
  const showDeletePropertyConfirm = (propertyId) => {
    setDeletePropertyId(propertyId);
    setShowDeleteConfirm(true);
  };

  // Icon component for the activity feed
  const ActivityIcon = ({ type }) => {
    switch (type) {
      case 'report':
        return (
          <div className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 rounded-full p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'property':
        return (
          <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 rounded-full p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to welcome page
  }

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Calculate days left in lease
  const calculateDaysLeft = (property) => {
    if (!property || !property.contract_end_date) return null;
    
    const endDate = new Date(property.contract_end_date);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <>
      <Head>
        <title>tenantli - My Home</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Manage your rental properties with tenantli" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="stylesheet" href="/styles/modern/theme.css" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          body, html {
            background-color: #FBF5DA;
            min-height: 100vh;
            margin: 0;
            padding: 0;
          }
          @media (max-width: 640px) {
            .mobile-full-height {
              min-height: calc(100vh - env(safe-area-inset-bottom));
            }
          }
          .side-menu-backdrop {
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 30;
          }
        `}</style>
      </Head>
      
      <div className="fixed inset-0 bg-[#FBF5DA]"></div>
      <div className="relative min-h-screen mobile-full-height w-full font-['Nunito'] overflow-hidden flex flex-col bg-[#FBF5DA]">
        {/* Side Menu */}
      <AnimatePresence>
        {showSideMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-black z-30" 
              onClick={closeMenu}
            />
            <motion.div 
              ref={sideMenuRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 40,
                duration: 0.5
              }}
              className={`fixed top-0 left-0 h-full w-[280px] bg-[#F5F6F8] z-40`}
              style={{
                borderRadius: '0px',
                position: 'fixed',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
            {/* Header */}
            <div className="w-full h-[65px] mt-[40px] sm:mt-8">
              <div className="flex flex-row justify-center items-center px-4 w-full h-[65px] relative">
                <button 
                  className="absolute left-[20px] top-[50%] transform -translate-y-1/2"
                  onClick={closeMenu}
                  aria-label="Go back"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
                  Menu
                </h1>
              </div>
            </div>
            
            {/* Navigation Menu - Frame 873 */}
            <div className="w-full flex flex-col items-center p-[16px] mt-[10px]">
              {/* Move Out Option */}
              <div className="w-full h-[64px] mb-0 relative">
                <div className="flex flex-row items-center p-[12px_0px] gap-[16px] w-full h-[64px]">
                  <div className="w-[40px] h-[40px] flex items-center justify-center rounded-[225px]">
                    <img src="/images/iconss/moveout.png" alt="Move out" className="w-[40px] h-[40px]" />
                  </div>
                  <Link href="/move-out" className="font-['Nunito'] font-semibold text-[16px] leading-[22px] text-[#111519]">
                    Move out
                  </Link>
                </div>
                <div className="w-full h-0 border-b border-[#ECF0F5]"></div>
              </div>
              
              {/* Password Change Option */}
              <div className="w-full h-[64px] mb-0 relative">
                <div className="flex flex-row items-center p-[12px_0px] gap-[16px] w-full h-[64px]">
                  <div className="w-[40px] h-[40px] flex items-center justify-center rounded-[225px]">
                    <img src="/images/iconss/passwordchange.png" alt="Password Change" className="w-[40px] h-[40px]" />
                  </div>
                  <Link href="/profile/change-password" className="font-['Nunito'] font-semibold text-[16px] leading-[22px] text-[#111519]">
                    Password Change
                  </Link>
                </div>
                <div className="w-full h-0 border-b border-[#ECF0F5]"></div>
              </div>
              
              {/* Support Option */}
              <div className="w-full h-[64px] mb-0 relative">
                <div className="flex flex-row items-center p-[12px_0px] gap-[16px] w-full h-[64px]">
                  <div className="w-[40px] h-[40px] flex items-center justify-center rounded-[225px]">
                    <img src="/images/iconss/24support.png" alt="Support" className="w-[22px] h-[22px]" />
                  </div>
                  <button 
                    onClick={() => window.location.href = 'mailto:support@tenantli.ai'}
                    className="font-['Nunito'] font-semibold text-[16px] leading-[22px] text-[#111519] text-left"
                  >
                    Support
                  </button>
                </div>
                <div className="w-full h-0 border-b border-[#ECF0F5]"></div>
              </div>
              
              {/* Logout Option */}
              <div className="w-full h-[64px] mb-0 relative">
                <div className="flex flex-row items-center p-[12px_0px] gap-[16px] w-full h-[64px]">
                  <div className="w-[40px] h-[40px] flex items-center justify-center rounded-[225px]">
                    <img src="/images/iconss/logout.png" alt="Logout" className="w-[22px] h-[22px]" />
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      router.push('/login');
                    }}
                    className="font-['Nunito'] font-semibold text-[16px] leading-[22px] text-[#111519] text-left"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
        
        {/* Fixed Header */}
        <div className="fixed top-0 w-full bg-[#FBF5DA] z-20">
          <div className="flex flex-row items-center px-[20px] pt-[60px] pb-[20px] relative safe-area-top">
            <button 
              onClick={() => setShowSideMenu(true)}
              aria-label="Open menu"
              className="relative z-10"
            >
              <MenuIcon />
            </button>
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
              My Home
            </h1>
          </div>
        </div>
        
        {/* Content Container with spacer */}
        <div className="flex-1 overflow-y-auto" style={{paddingTop: '120px', paddingBottom: '100px'}}>
          <div className="w-full max-w-screen-lg mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8">
          {properties.length === 0 ? (
            // Empty state when no properties exist
            <div className="w-full flex flex-col justify-end items-center gap-[20px] mb-8">
              <div className="w-[248.82px] h-[135.29px] mt-[10px]">
                <img
                  src="/images/dashboard.png"
                  alt="Home illustration"
                  className="w-full h-full object-contain"
                  style={{ mixBlendMode: 'Luminosity' }}
                  loading="eager"
                />
              </div>

              <p className="w-full max-w-[311px] font-bold text-[16px] leading-[22px] text-center text-[#515964]">
                Add the place you're renting so we can help protect your deposit.
              </p>
            </div>
          ) : (
            // Property details view - Based on property/details.js
            properties.map((property) => {
              const daysLeft = calculateDaysLeft(property);
              
              return (
                <div key={property.id} className="w-full">
                  {/* Welcome Section */}
                  <div className="flex flex-row items-start justify-between w-full mb-4 max-w-[420px] mx-auto">
                    <div className="flex flex-col">
                      <div className="font-normal text-[20px] leading-[27px] text-[#0B1420]">
                        Welcome Back,
                      </div>
                      <div className="font-semibold text-[20px] leading-[27px] text-[#0B1420] mt-1">
                        {user?.name ? user.name.split(' ')[0] : 'User'}
                      </div>
                    </div>
                    
                    {daysLeft !== null && (
                      <div className="flex justify-center items-center py-1 px-3 bg-[#F6E7A5] rounded-[32px] whitespace-nowrap">
                        <span className="font-semibold text-[14px] leading-[19px] text-[#946500]">
                          {daysLeft} Day{daysLeft !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Property Card - Clickable for details */}
                  <div className="w-full mb-4 max-w-[420px] mx-auto">
                    <div 
                      className="w-full p-4 bg-white border border-[#F6FEF7] rounded-[16px] relative cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => router.push(`/properties/${property.id}/edit`)}>
                      <div className="flex items-center">
                        <div className="mr-4 w-[45px] h-[45px] flex items-center justify-center">
                          <img 
                            src="/images/home.png" 
                            alt="Property" 
                            width="45" 
                            height="45" 
                            className="object-contain"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-bold text-[14px] leading-[19px] text-[#2E3642] mb-1">
                            {property.address || 'Address not available'}
                          </div>
                          <div className="font-normal text-[14px] leading-[19px] text-[#515964]">
                            {property.unit_number ? `Unit ${property.unit_number}` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lease Details Card - Clickable for details */}
                  <div className="w-full mb-6 max-w-[420px] mx-auto">
                    <div 
                      className="w-full p-4 bg-white border border-[#F6FEF7] rounded-[16px] relative cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => router.push(`/properties/${property.id}/lease-details`)}>
                      <div className="flex items-center">
                        <div className="mr-4 w-[45px] h-[45px] flex items-center justify-center">
                          <img 
                            src="/images/lease.png" 
                            alt="Calendar" 
                            width="45" 
                            height="45" 
                            className="object-contain"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-bold text-[14px] leading-[19px] text-[#2E3642] mb-1">
                            Lease Details
                          </div>
                          <div className="font-normal text-[14px] leading-[19px] text-[#515964]">
                            {property.lease_duration || '0'} {property.lease_duration_type || 'months'} - ${property.deposit_amount || '0'}
                          </div>
                          <div className="font-normal text-[14px] leading-[19px] text-[#515964] mt-1">
                            Move out: {formatDate(property.contract_end_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                
                  {/* Delete Property Button */}
                  <div className="w-full mb-6 max-w-[420px] mx-auto">
                    <button
                      onClick={() => showDeletePropertyConfirm(property.id)}
                      className="w-full p-4 bg-red-50 border border-red-200 rounded-[16px] hover:bg-red-100 transition-colors flex items-center justify-center"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                        <path d="M7.5 2.5V5H12.5V2.5M2.5 5H17.5M3.75 5V16.25C3.75 17.075 4.425 17.5 5.25 17.5H14.75C15.575 17.5 16.25 17.075 16.25 16.25V5M8.75 8.75V13.75M11.25 8.75V13.75" 
                          stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-bold text-[16px] text-red-600">
                        Delete Property
                      </span>
                    </button>
                  </div>
                
                  {/* Recent Activity Section */}
                  <div className="w-full mb-4 max-w-[420px] mx-auto">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="font-bold text-[16px] text-[#0B1420]">
                        Recent Activity
                      </h2>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Activity Item 1 - Walkthrough Completed */}
                      <div className="w-full bg-white border border-[#F6FEF7] rounded-[16px] p-4 cursor-pointer hover:bg-gray-50 transition-colors" 
                           onClick={() => router.push(`/properties/${property.id}/summary?from=walkthrough`)}>
                        <div className="flex items-center">
                          <div className="mr-4 w-[45px] h-[45px] flex items-center justify-center">
                            <img 
                              src="/images/walkthrough.png" 
                              alt="Walkthrough" 
                              width="45" 
                              height="45" 
                              className="object-contain"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-bold text-[14px] leading-[19px] text-[#2E3642] mb-1">
                              Walkthrough Completed
                            </div>
                            
                            <div className="font-normal text-[14px] leading-[19px] text-[#515964]">
                              {formatDate(property.created_at || new Date())}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
        
        {/* Fixed Add Property Button - Only show if no properties exist */}
        {properties.length === 0 && (
          <div className="fixed bottom-0 left-0 right-0 px-5 pb-4 bg-[#FBF5DA] z-10">
            <div className="safe-area-bottom">
              <button
                onClick={() => router.push('/properties/addunit')}
                className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px] hover:bg-[#243242] active:bg-[#0C1322] transition-colors duration-200"
              >
                <span className="font-bold text-[16px] text-[#D1E7E2]">
                  Add New Home
                </span>
              </button>
              
              <button 
                className="w-full text-center font-semibold text-[#0B1420] text-sm mt-4"
                onClick={() => setShowBottomSheet(true)}
              >
                Why Add Your Home?
              </button>
            </div>
          </div>
        )}
        
        {/* Bottom Sheet */}
        <AnimatePresence>
          {showBottomSheet && (
            <>
              {/* Backdrop overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40 h-full w-full"
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                onClick={() => setShowBottomSheet(false)}
              />
              
              {/* Bottom sheet */}
              <motion.div
                ref={bottomSheetRef}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 w-full bg-white rounded-t-[16px] z-50 shadow-2xl"
              >
                {/* Drag handle */}
                <div className="flex flex-col items-center p-2.5 w-full">
                  <div className="w-12 h-1 bg-[#ECECEC] rounded-full" />
                </div>
                
                {/* Content container with max width for responsiveness */}
                <div className="w-full max-w-[390px] mx-auto px-6 pb-8">
                  <div className="flex flex-col items-center gap-4">
                    {/* Icon - Container with background */}
                    <div className="w-20 h-20 relative bg-[#FFF6ED] rounded-full flex items-center justify-center overflow-hidden">
                      {/* PNG görselinizi buraya ekleyebilirsiniz */}
                      <img 
                        src="/images/home.png"
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          // Fallback if image doesn't load
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      {/* Fallback icon if image fails to load */}
                      <div style={{display: 'none'}} className="text-[#55A363] text-4xl">
                        🏠
                      </div>
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex flex-col items-center gap-1">
                      <h2 className="font-bold text-lg text-center text-[#0B1420]">
                        Why Add Your Home?
                      </h2>
                      <p className="font-normal text-sm text-center text-[#2E3642] mt-1">
                        Adding your home creates a private, time-stamped record that protects your deposit like a digital receipt for move-in day.
                      </p>
                    </div>
                    
                    {/* Close Button */}
                    <button
                      onClick={() => setShowBottomSheet(false)}
                      className="mt-4 w-full h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px]"
                    >
                      <span className="font-bold text-[16px] text-[#D1E7E2]">
                        Got it
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black z-50" 
                onClick={() => setShowDeleteConfirm(false)}
              />
              
              {/* Dialog */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 flex items-center justify-center z-50"
              >
                <div className="w-[90%] max-w-[350px] bg-white rounded-[24px] p-6 shadow-lg">
                <div className="flex flex-col items-center gap-4">
                  {/* Icon */}
                  <div className="w-[60px] h-[60px] bg-red-100 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 7V3.5C8 2.67 8.67 2 9.5 2H14.5C15.33 2 16 2.67 16 3.5V7M3 7H21M5 7L5.91 19.14C5.95 19.89 6.58 20.5 7.33 20.5H16.67C17.42 20.5 18.05 19.89 18.09 19.14L19 7M9.5 11V16.5M14.5 11V16.5" 
                        stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex flex-col items-center gap-2">
                    <h3 className="font-bold text-lg text-[#0B1420]">
                      Delete Property?
                    </h3>
                    <p className="font-normal text-sm text-center text-[#515964]">
                      This will permanently delete your property and all associated data including photos, documents, and reports.
                    </p>
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex gap-3 w-full mt-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 h-[48px] border border-gray-300 rounded-[16px] font-bold text-[16px] text-[#515964] hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteProperty}
                      className="flex-1 h-[48px] bg-red-600 rounded-[16px] font-bold text-[16px] text-white hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
      </div>
    </>
  );
}