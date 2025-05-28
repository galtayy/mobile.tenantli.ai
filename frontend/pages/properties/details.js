import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';

// Back arrow icon component
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Arrow right icon component
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.94 3.33L10.2733 7.66333C10.64 8.02999 10.64 8.96333 10.2733 9.32999L5.94 13.6633" 
      stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Property Icon component
const PropertyIcon = () => (
  <img 
    src="/images/home.svg" 
    alt="Property" 
    width="45" 
    height="45" 
    className="object-contain"
  />
);

// Calendar Icon component
const CalendarIcon = () => (
  <img 
    src="/images/lease.svg" 
    alt="Calendar" 
    width="45" 
    height="45" 
    className="object-contain"
  />
);

// Activity Icon component
const ActivityIcon = () => (
  <img 
    src="/images/completed.svg" 
    alt="Activity" 
    width="45" 
    height="45" 
    className="object-contain"
  />
);

// Completed Icon component
const CompletedIcon = () => (
  <img 
    src="/images/completed.svg" 
    alt="Walkthrough" 
    width="45" 
    height="45" 
    className="object-contain"
  />
);

export default function PropertyDetails() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { propertyId, id } = router.query; // Get both propertyId and id from query
  
  // Client-side only code protection
  useEffect(() => {
    setIsClient(true);
  }, []); // Ensures we can access browser APIs safely

  // Load property data and related information
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const loadPropertyData = async () => {
      try {
        // ADIM 1: Mülk ID'sini bul - query params, localStorage vs.
        console.log('URL query params:', router.query);
        
        // Tüm olası kaynaklardan ID'yi almaya çalış
        const queryPropertyId = router.query.propertyId; // URL'deki propertyId
        const queryId = router.query.id; // URL'deki id
        const localStorageId = typeof window !== 'undefined' ? localStorage.getItem('lastSharedPropertyId') : null;
        
        console.log('Olası ID kaynakları:', {
          'Query propertyId': queryPropertyId,
          'Query id': queryId,
          'localStorage ID': localStorageId
        });
        
        // Sırasıyla kontrol et
        const propertyIdentifier = queryPropertyId || queryId || localStorageId;
        
        console.log('Kullanılan mülk ID:', propertyIdentifier);
        
        if (!propertyIdentifier) {
          console.error('Mülk ID bulunamadı! Mülk listesine yönlendiriliyor...');
          // If no property ID found anywhere, redirect to properties list
          router.push('/properties');
          return;
        }
        
        // ADIM 2: Mülk verisini yükle
        console.log(`Mülk verisi ${propertyIdentifier} ID'si ile yükleniyor...`);
        
        // Load property data with explicit ID
        const propertyResponse = await apiService.properties.getById(propertyIdentifier);
        const propertyData = propertyResponse.data;
        
        console.log('Mülk verisi yüklendi:', propertyData);
        
        if (!propertyData) {
          console.error('Mülk verisi bulunamadı!');
          toast.error('Mülk bilgileri yüklenemedi.');
          router.push('/properties');
          return;
        }
        
        // Veriyi state'e kaydet
        setProperty(propertyData);
        
        // Load property reports
        try {
          const reportsResponse = await apiService.reports.getByProperty(propertyIdentifier);
          setReports(reportsResponse.data || []);
        } catch (error) {
          console.error('Error loading property reports:', error);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading property data:', error);
        setLoading(false);
        router.push('/properties');
      }
    };

    loadPropertyData();
  }, [user, authLoading, router, propertyId, id]);

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
  const calculateDaysLeft = () => {
    if (!property || !property.contract_end_date) return null;
    
    const endDate = new Date(property.contract_end_date);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  const daysLeft = calculateDaysLeft();

  return (
    <>
      <Head>
        <title>Property Details - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="View property details and manage your rental" />
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
        `}</style>
      </Head>
      
      <div className="fixed inset-0 bg-[#FBF5DA]"></div>
      <div className="relative min-h-screen mobile-full-height w-full font-['Nunito'] overflow-hidden">
        {/* Status Bar Space */}
        <div className="h-10 w-full sm:h-0"></div>
        
        {/* Header */}
        <div className="absolute w-full h-[65px] left-0 top-[40px] sm:top-8 flex flex-row justify-center items-center px-4">
          <Link href="/" className="absolute left-[20px] top-1/2 -translate-y-1/2">
            <ArrowLeftIcon />
          </Link>
          <h1 className="font-semibold text-[18px] text-center text-[#0B1420]">
            Property Details
          </h1>
        </div>
        
        {/* Content Container */}
        <div className="w-full flex flex-col items-center px-[5%] pt-[121px] sm:pt-[100px]">
          {/* Welcome Section */}
          <div className="flex flex-row items-start justify-between w-full mb-4 max-w-[420px]">
            <div className="font-normal text-[20px] leading-[27px] text-[#0B1420]">
              Welcome Back, {isClient && user?.name ? user.name.split(' ')[0] : 'User'}
            </div>
            
            {daysLeft !== null && (
              <div className="flex justify-center items-center py-1 px-3 bg-[#F6E7A5] rounded-[32px]">
                <span className="font-semibold text-[14px] leading-[19px] text-[#946500]">
                  {daysLeft} Day{daysLeft !== 1 ? 's' : ''} Left
                </span>
              </div>
            )}
          </div>
          
          {/* Property Card */}
          <div className="w-full mb-4 max-w-[420px]" onClick={() => router.push(`/properties/${property?.id}/edit`)}>
            <div className="w-full p-4 bg-white border border-[#F6FEF7] rounded-[16px] relative cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="mr-4 w-[45px] h-[45px] flex items-center justify-center">
                  {/* Custom property icon */}
                  <PropertyIcon />
                </div>
                
                <div className="flex-1">
                  <div className="font-bold text-[14px] leading-[19px] text-[#2E3642] mb-1">
                    {property?.description || 'Address not available'}
                  </div>
                  <div className="font-normal text-[14px] leading-[19px] text-[#515964]">
                    {property?.unit_number ? `Unit ${property?.unit_number}` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lease Details Card */}
          <div className="w-full mb-6 max-w-[420px]" onClick={() => router.push(`/properties/${property?.id}/lease-details`)}>
            <div className="w-full p-4 bg-white border border-[#F6FEF7] rounded-[16px] relative cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="mr-4 w-[45px] h-[45px] flex items-center justify-center">
                  <CalendarIcon />
                </div>
                
                <div className="flex-1">
                  <div className="font-bold text-[14px] leading-[19px] text-[#2E3642] mb-1">
                    Lease Details
                  </div>
                  <div className="font-normal text-[14px] leading-[19px] text-[#515964]">
                    {property?.lease_duration || '0'} {property?.lease_duration_type || 'months'} - ${property?.deposit_amount || '0'}
                  </div>
                  <div className="font-normal text-[14px] leading-[19px] text-[#515964] mt-1">
                    Move out: {formatDate(property?.contract_end_date)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          {/* Recent Activity Section */}
          <div className="w-full mb-4 max-w-[420px]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-[16px] text-[#0B1420]">
                Recent Activity
              </h2>
            </div>
            
            <div className="space-y-3">
              {/* Activity Item 1 - Walkthrough Completed */}
              <div className="w-full bg-white border border-[#F6FEF7] rounded-[16px] p-4 cursor-pointer hover:bg-gray-50 transition-colors" 
                   onClick={() => router.push(`/properties/${property?.id}/summary`)}>
                <div className="flex items-center">
                  <div className="mr-4 w-[45px] h-[45px] flex items-center justify-center">
                    <CompletedIcon />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-bold text-[14px] leading-[19px] text-[#2E3642] mb-1">
                      Walkthrough Completed
                    </div>
                    
                    <div className="font-normal text-[14px] leading-[19px] text-[#515964]">
                      {formatDate(reports[0]?.created_at || new Date())}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Activity Item 2 - Logging Issue (if any) */}
              {reports.length > 1 && (
                <div className="w-full bg-white border border-[#F6FEF7] rounded-[16px] p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                     onClick={() => reports[1]?.id && router.push(`/reports/${reports[1].id}`)}>
                  <div className="flex items-center">
                    <div className="mr-4 w-[45px] h-[45px] flex items-center justify-center">
                      <ActivityIcon />
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-bold text-[14px] leading-[19px] text-[#2E3642] mb-1">
                        Logging Issue
                      </div>
                      
                      <div className="font-normal text-[14px] leading-[19px] text-[#515964]">
                        {formatDate(reports[1]?.created_at || new Date())}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Spacing */}
        <div className="pb-[120px]"></div>
      </div>
    </>
  );
}