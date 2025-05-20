import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';

// Back arrow icon component
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Icon components for menu items
const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.04167 18.9583H18.9583" stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.875 18.9583V5.83334C1.875 5.16667 2.2 4.53334 2.75 4.18334L8.75 0.516675C9.46667 0.0666748 10.3833 0.0666748 11.1 0.516675L17.1 4.18334C17.65 4.53334 17.975 5.16667 17.975 5.83334V18.9583" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.125 9.58333V18.9583" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.875 18.9583V9.58333" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.16667 5.83334H10.8333C11.5583 5.83334 12.1417 6.41667 12.1417 7.14167V8.80834C12.1417 9.53334 11.5583 10.1167 10.8333 10.1167H9.16667C8.44167 10.1167 7.85834 9.53334 7.85834 8.80834V7.14167C7.85834 6.41667 8.44167 5.83334 9.16667 5.83334Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3333 7.5C14.2538 7.5 15 6.75381 15 5.83333C15 4.91286 14.2538 4.16667 13.3333 4.16667C12.4129 4.16667 11.6667 4.91286 11.6667 5.83333C11.6667 6.75381 12.4129 7.5 13.3333 7.5Z" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.33334 17.5C9.25381 17.5 10 16.7538 10 15.8333C10 14.9129 9.25381 14.1667 8.33334 14.1667C7.41286 14.1667 6.66667 14.9129 6.66667 15.8333C6.66667 16.7538 7.41286 17.5 8.33334 17.5Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.3333 7.5V9.16667C13.3333 9.83333 13.0833 10.475 12.6333 10.9417L5.83334 17.5" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SupportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.53333 9.6C5.8 7.875 7.10833 6.70833 8.75 6.65833C10.775 6.6 12.1667 8.05833 12.1667 10C12.1667 11.2583 11.4833 12.35 10.4583 12.9C9.75 13.2917 9.16667 13.9083 9.16667 14.7833V15" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99167 15H10.0083" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.41667 6.30001C7.675 3.30001 9.21667 2.07501 12.5917 2.07501H12.7C16.425 2.07501 17.9167 3.56667 17.9167 7.29167V12.725C17.9167 16.45 16.425 17.9417 12.7 17.9417H12.5917C9.25 17.9417 7.70834 16.7333 7.425 13.7833" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.5 10H3.01666" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.875 7.2083L2.08334 9.99997L4.875 12.7916" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Menu() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchProperties();
    }
  }, [user, authLoading, router]);

  const fetchProperties = async () => {
    try {
      const response = await apiService.properties.getAll();
      setProperties(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login page
  }

  return (
    <div className="flex flex-col items-center bg-[#FBF5DA] font-['Nunito'] min-h-screen">
      <Head>
        <title>Menu - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <style jsx global>{`
          body {
            background-color: #FBF5DA;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            width: 100%;
            font-family: 'Nunito', sans-serif;
          }
          .safe-area-top {
            padding-top: env(safe-area-inset-top, 40px);
          }
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
        `}</style>
      </Head>
      
      <div className="w-full max-w-[390px] relative">
        {/* Status Bar Space */}
        <div className="h-[40px] w-full safe-area-top"></div>
        
        {/* Header */}
        <div className="w-full h-[65px]">
          <div className="flex flex-row justify-center items-center px-[10px] py-[20px] w-full h-[65px] relative">
            <button 
              className="absolute left-[20px] top-[50%] transform -translate-y-1/2"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
              Menu
            </h1>
          </div>
        </div>
      
        {/* Navigation Menu */}
        <div className="flex flex-col items-center w-full px-4">
          {/* Move Out Option */}
          <div className="w-full border-b border-[#ECF0F5]">
            <div className="flex flex-row items-center p-[12px] gap-[16px] w-full h-[64px]">
              <div className="w-[40px] h-[40px] flex items-center justify-center opacity-40 rounded-[225px]">
                <BuildingIcon />
              </div>
              <Link href="/" className="font-semibold text-[16px] leading-[22px] text-[#111519]">
                Move out
              </Link>
            </div>
          </div>
          
          {/* Password Change Option */}
          <div className="w-full border-b border-[#ECF0F5]">
            <div className="flex flex-row items-center p-[12px] gap-[16px] w-full h-[64px]">
              <div className="w-[40px] h-[40px] flex items-center justify-center opacity-40 rounded-[225px]">
                <KeyIcon />
              </div>
              <Link href="/profile/change-password" className="font-semibold text-[16px] leading-[22px] text-[#111519]">
                Password Change
              </Link>
            </div>
          </div>
          
          {/* Support Option */}
          <div className="w-full border-b border-[#ECF0F5]">
            <div className="flex flex-row items-center p-[12px] gap-[16px] w-full h-[64px]">
              <div className="w-[40px] h-[40px] flex items-center justify-center opacity-40 rounded-[225px]">
                <SupportIcon />
              </div>
              <Link href="/support" className="font-semibold text-[16px] leading-[22px] text-[#111519]">
                Support
              </Link>
            </div>
          </div>
          
          {/* Logout Option */}
          <div className="w-full">
            <div className="flex flex-row items-center p-[12px] gap-[16px] w-full h-[64px]">
              <div className="w-[40px] h-[40px] flex items-center justify-center opacity-40 rounded-[225px]">
                <LogoutIcon />
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  router.push('/login');
                }}
                className="font-semibold text-[16px] leading-[22px] text-[#111519] text-left"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}