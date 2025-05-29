import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../lib/auth';
import { ArrowLeft } from 'lucide-react';

export default function Menu({ isOpen, onClose }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Check if this is being used as a standalone page or as a component
  const isStandalone = isOpen === undefined && onClose === undefined;
  const isMenuOpen = isStandalone ? true : isOpen;
  const handleClose = isStandalone ? () => router.back() : onClose;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    }
  }, [user, loading, router]);

  // Define icon components with simpler structure
  const IconWrapper = ({ children, className = "" }) => (
    <div className={`w-[40px] h-[40px] flex items-center justify-center opacity-40 rounded-[225px] ${className}`}>
      {children}
    </div>
  );
  
  // Vuesax style icon components
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F5F6F8] font-['Nunito']">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to welcome page
  }

  return (
    <>
      {/* Overlay */}
      {isMenuOpen && !isStandalone && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={handleClose}
        />
      )}
      
      {/* Side Menu */}
      <div className={`fixed left-0 top-0 w-full max-w-[390px] h-full bg-[#F5F6F8] font-['Nunito'] z-50 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Meta tags for better PWA experience */}
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta name="theme-color" content="#F5F6F8" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        </Head>
      
        {/* Status Bar area */}
        <div className="w-full bg-[#F5F6F8]" style={{ paddingTop: 'env(safe-area-inset-top, 20px)' }}></div>
      
        {/* Header */}
        <div className="w-full h-[65px] bg-[#F5F6F8]">
          <div className="flex flex-row justify-center items-center px-[20px] h-[65px] relative">
            <button 
              className="absolute left-[24px] -ml-2"
              onClick={handleClose}
              aria-label="Close menu"
            >
              <ArrowLeft size={24} color="#2E3642" strokeWidth={1.5} />
            </button>
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
              Menu
            </h1>
          </div>
        </div>
      
        {/* Navigation Menu */}
        <div className="flex flex-col items-center px-[24px] pt-[8px]">
        {/* Move Out Option */}
        <div className="w-[342px] h-[64px] flex-none order-0 flex-grow-0 relative">
          <div className="flex flex-row items-center p-[12px_0px] gap-[16px] absolute w-[342px] h-[64px] left-0 top-0">
            <div className="w-[40px] h-[40px] flex items-center justify-center opacity-40 rounded-[225px]">
              <BuildingIcon />
            </div>
            <Link href="/" className="font-semibold text-[16px] leading-[22px] text-[#111519]" onClick={handleClose}>
              Move out
            </Link>
          </div>
          <div className="absolute w-[322px] h-0 left-[10px] top-[64px] border-[1px_solid_#ECF0F5]"></div>
        </div>
        
        {/* Password Change Option */}
        <div className="w-[342px] h-[64px] flex-none order-1 flex-grow-0 relative">
          <div className="flex flex-row items-center p-[12px_0px] gap-[16px] absolute w-[342px] h-[64px] left-0 top-0">
            <div className="w-[40px] h-[40px] flex items-center justify-center opacity-40 rounded-[225px]">
              <KeyIcon />
            </div>
            <Link href="/profile/change-password" className="font-semibold text-[16px] leading-[22px] text-[#111519]" onClick={handleClose}>
              Password Change
            </Link>
          </div>
          <div className="absolute w-[322px] h-0 left-[10px] top-[64px] border-[1px_solid_#ECF0F5]"></div>
        </div>
        
        {/* Support Option - Currently non-functional */}
        <div className="w-[342px] h-[64px] flex-none order-3 flex-grow-0 relative">
          <div className="flex flex-row items-center p-[12px_0px] gap-[16px] absolute w-[342px] h-[64px] left-0 top-0">
            <div className="w-[40px] h-[40px] flex items-center justify-center opacity-40 rounded-[225px]">
              <SupportIcon />
            </div>
            <button 
              onClick={() => window.location.href = 'mailto:support@tenantli.ai'}
              className="font-semibold text-[16px] leading-[22px] text-[#111519] text-left"
            >
              Support
            </button>
          </div>
          <div className="absolute w-[322px] h-0 left-[10px] top-[64px] border-[1px_solid_#ECF0F5]"></div>
        </div>
        
        {/* Logout Option */}
        <div className="w-[342px] h-[64px] flex-none order-5 flex-grow-0 relative">
          <div className="flex flex-row items-center p-[12px_0px] gap-[16px] absolute w-[342px] h-[64px] left-0 top-0">
            <div className="w-[40px] h-[40px] flex items-center justify-center opacity-40 rounded-[225px]">
              <LogoutIcon />
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                handleClose();
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
    </>
  );
}