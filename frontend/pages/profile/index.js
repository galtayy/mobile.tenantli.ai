import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
      return;
    }
    
    if (user) {
      setCurrentUser(user);
    }
  }, [user, loading, router]);

  // Fetch fresh user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && !loading) {
        try {
          const response = await apiService.auth.getUser();
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Error fetching fresh user data:', error);
          // Fallback to auth context user
          setCurrentUser(user);
        }
      }
    };

    fetchUserData();
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    ); // Loading fresh user data
  }

  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  // Role display formatting
  const getRoleName = (role) => {
    if (!role) return 'User';
    // Convert role to title case for display
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format phone number for display in USA format
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return 'Add phone number';
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX if we have 10 digits
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // Return original if not 10 digits
    return phone;
  };

  return (
    <div className="min-h-screen bg-[#FBF5DA] font-['Nunito']">
      <Head>
        <title>Profile - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <style jsx global>{`
          body, html {
            background-color: #FBF5DA !important;
            margin: 0;
            padding: 0;
            font-family: 'Nunito', sans-serif;
            overflow-x: hidden;
          }
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        `}</style>
      </Head>
      
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#FBF5DA]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="w-full max-w-[390px] mx-auto">
          <div className="h-[65px] flex items-center px-[20px] relative">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push('/');
              }}
              className="absolute left-[20px] top-1/2 -translate-y-1/2 w-[48px] h-[48px] -ml-2 flex items-center justify-center z-50"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#2E3642" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-['Nunito'] font-semibold text-[18px] leading-[25px] text-[#0B1420]">
              Profile
            </h1>
          </div>
        </div>
      </div>

      {/* Content Area with scrolling */}
      <div className="w-full max-w-[390px] mx-auto" style={{ paddingTop: 'calc(65px + env(safe-area-inset-top))' }}>
        <div className="px-[20px] pb-[120px]">
          {/* User Avatar Section */}
          <div className="flex flex-col items-center pt-[32px] pb-[32px]">
            <div className="w-[80px] h-[80px] bg-[#D1E7E2] rounded-full flex items-center justify-center">
              <span className="font-['Nunito'] font-semibold text-[36px] leading-[49px] text-[#1C2C40]">
                {getInitials(currentUser?.name)}
              </span>
            </div>
          </div>

          {/* User Information Fields */}
          <div className="flex flex-col gap-[16px] mb-[32px]">
            {/* Name Field */}
            <div className="flex flex-row items-center px-[20px] py-[18px] gap-[8px] bg-white border border-[#D1E7D5] rounded-[16px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10C12.0711 10 13.75 8.32107 13.75 6.25C13.75 4.17893 12.0711 2.5 10 2.5C7.92893 2.5 6.25 4.17893 6.25 6.25C6.25 8.32107 7.92893 10 10 10Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.1583 18.125C17.1583 15.2667 13.9333 12.9167 10 12.9167C6.06667 12.9167 2.84167 15.2667 2.84167 18.125" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="flex-1 font-['Nunito'] font-bold text-[14px] leading-[19px] text-[#515964]">
                {currentUser?.name || 'User Name'}
              </span>
            </div>

            {/* Email Field */}
            <div className="flex flex-row items-center px-[20px] py-[18px] gap-[8px] bg-white border border-[#D1E7D5] rounded-[16px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.1667 17.0833H5.83333C3.33333 17.0833 1.66667 15.8333 1.66667 12.9167V7.08333C1.66667 4.16667 3.33333 2.91667 5.83333 2.91667H14.1667C16.6667 2.91667 18.3333 4.16667 18.3333 7.08333V12.9167C18.3333 15.8333 16.6667 17.0833 14.1667 17.0833Z" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.1667 7.5L11.5583 9.58333C10.7 10.2667 9.29167 10.2667 8.43333 9.58333L5.83333 7.5" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="flex-1 font-['Nunito'] font-bold text-[14px] leading-[19px] text-[#515964]">
                {currentUser?.email || 'email@example.com'}
              </span>
            </div>

            {/* Phone Field (if available) */}
            <div className="flex flex-row items-center px-[20px] py-[18px] gap-[8px] bg-white border border-[#D1E7D5] rounded-[16px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3083 15.275C18.3083 15.575 18.2417 15.8833 18.1 16.1833C17.9583 16.4833 17.775 16.7667 17.5333 17.0333C17.125 17.4833 16.675 17.8083 16.1667 18.0167C15.6667 18.225 15.125 18.3333 14.5417 18.3333C13.6917 18.3333 12.7833 18.1333 11.825 17.725C10.8667 17.3167 9.90833 16.7667 8.95833 16.075C8 15.375 7.09167 14.6 6.225 13.7417C5.36667 12.875 4.59167 11.9667 3.9 11.0167C3.21667 10.0667 2.66667 9.11667 2.26667 8.175C1.86667 7.225 1.66667 6.31667 1.66667 5.45C1.66667 4.88333 1.76667 4.34167 1.96667 3.84167C2.16667 3.33333 2.48333 2.86667 2.925 2.45C3.45833 1.925 4.04167 1.66667 4.65833 1.66667C4.89167 1.66667 5.125 1.71667 5.33333 1.81667C5.55 1.91667 5.74167 2.06667 5.89167 2.28333L7.825 5.00833C7.975 5.21667 8.08333 5.40833 8.15833 5.59167C8.23333 5.76667 8.275 5.94167 8.275 6.1C8.275 6.3 8.21667 6.5 8.1 6.69167C7.99167 6.88333 7.83333 7.08333 7.63333 7.28333L7 7.94167C6.90833 8.03333 6.86667 8.14167 6.86667 8.275C6.86667 8.34167 6.875 8.4 6.89167 8.46667C6.91667 8.53333 6.94167 8.58333 6.95833 8.63333C7.10833 8.91667 7.36667 9.29167 7.73333 9.75C8.10833 10.2083 8.50833 10.675 8.94167 11.1417C9.39167 11.6083 9.825 12.0417 10.2917 12.4417C10.75 12.8333 11.125 13.1083 11.4167 13.2667C11.4583 13.2833 11.5083 13.3083 11.5667 13.3333C11.6333 13.3583 11.7 13.3667 11.775 13.3667C11.9167 13.3667 12.025 13.3167 12.1167 13.225L12.75 12.6C12.9583 12.3917 13.1583 12.2333 13.35 12.1333C13.5417 12.0167 13.7333 11.9583 13.9417 11.9583C14.1 11.9583 14.2667 11.9917 14.45 12.0667C14.6333 12.1417 14.825 12.25 15.0333 12.3917L17.7917 14.3583C18.0083 14.5083 18.1583 14.6833 18.25 14.8917C18.3333 15.1 18.3833 15.3083 18.3833 15.5417" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10"/>
              </svg>
              <span className="flex-1 font-['Nunito'] font-bold text-[14px] leading-[19px] text-[#515964]">
                {formatPhoneForDisplay(currentUser?.phone)}
              </span>
            </div>

            {/* Role/Account Type Field */}
            <div className="flex flex-row items-center px-[20px] py-[18px] gap-[8px] bg-white border border-[#D1E7D5] rounded-[16px]">
              <img src="/images/iconss/user-tag.svg" alt="Settings" className="w-[23px] h-[23px]" />
              <span className="flex-1 font-['Nunito'] font-bold text-[14px] leading-[19px] text-[#515964]">
                {getRoleName(currentUser?.role)}
              </span>
            </div>
          </div>

          {/* Security Section */}
          <div className="flex flex-col gap-[16px]">
            <h2 className="font-['Nunito'] font-bold text-[16px] leading-[22px] text-[#0B1420]">
              Security
            </h2>
            
            <div className="bg-white border border-[#D1E7D5] rounded-[16px] p-[8px]">
              {/* Change Email Option */}
              <Link href="/profile/change-email">
                <div className="flex flex-row items-center px-[20px] py-[18px] gap-[8px] hover:bg-gray-50 rounded-[16px] cursor-pointer transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.1667 17.0833H5.83333C3.33333 17.0833 1.66667 15.8333 1.66667 12.9167V7.08333C1.66667 4.16667 3.33333 2.91667 5.83333 2.91667H14.1667C16.6667 2.91667 18.3333 4.16667 18.3333 7.08333V12.9167C18.3333 15.8333 16.6667 17.0833 14.1667 17.0833Z" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.1667 7.5L11.5583 9.58333C10.7 10.2667 9.29167 10.2667 8.43333 9.58333L5.83333 7.5" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="flex-1 font-['Nunito'] font-bold text-[14px] leading-[19px] text-[#515964]">
                    Change Email
                  </span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.42505 16.6L12.8584 11.1667C13.5 10.525 13.5 9.47504 12.8584 8.83337L7.42505 3.40004" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>

              {/* Phone Number Option */}
              <Link href={currentUser?.phone ? "/profile/change-phone-number" : "/profile/add-phone-number"}>
                <div className="flex flex-row items-center px-[20px] py-[18px] gap-[8px] hover:bg-gray-50 rounded-[16px] cursor-pointer transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.3083 15.275C18.3083 15.575 18.2417 15.8833 18.1 16.1833C17.9583 16.4833 17.775 16.7667 17.5333 17.0333C17.125 17.4833 16.675 17.8083 16.1667 18.0167C15.6667 18.225 15.125 18.3333 14.5417 18.3333C13.6917 18.3333 12.7833 18.1333 11.825 17.725C10.8667 17.3167 9.90833 16.7667 8.95833 16.075C8 15.375 7.09167 14.6 6.225 13.7417C5.36667 12.875 4.59167 11.9667 3.9 11.0167C3.21667 10.0667 2.66667 9.11667 2.26667 8.175C1.86667 7.225 1.66667 6.31667 1.66667 5.45C1.66667 4.88333 1.76667 4.34167 1.96667 3.84167C2.16667 3.33333 2.48333 2.86667 2.925 2.45C3.45833 1.925 4.04167 1.66667 4.65833 1.66667C4.89167 1.66667 5.125 1.71667 5.33333 1.81667C5.55 1.91667 5.74167 2.06667 5.89167 2.28333L7.825 5.00833C7.975 5.21667 8.08333 5.40833 8.15833 5.59167C8.23333 5.76667 8.275 5.94167 8.275 6.1C8.275 6.3 8.21667 6.5 8.1 6.69167C7.99167 6.88333 7.83333 7.08333 7.63333 7.28333L7 7.94167C6.90833 8.03333 6.86667 8.14167 6.86667 8.275C6.86667 8.34167 6.875 8.4 6.89167 8.46667C6.91667 8.53333 6.94167 8.58333 6.95833 8.63333C7.10833 8.91667 7.36667 9.29167 7.73333 9.75C8.10833 10.2083 8.50833 10.675 8.94167 11.1417C9.39167 11.6083 9.825 12.0417 10.2917 12.4417C10.75 12.8333 11.125 13.1083 11.4167 13.2667C11.4583 13.2833 11.5083 13.3083 11.5667 13.3333C11.6333 13.3583 11.7 13.3667 11.775 13.3667C11.9167 13.3667 12.025 13.3167 12.1167 13.225L12.75 12.6C12.9583 12.3917 13.1583 12.2333 13.35 12.1333C13.5417 12.0167 13.7333 11.9583 13.9417 11.9583C14.1 11.9583 14.2667 11.9917 14.45 12.0667C14.6333 12.1417 14.825 12.25 15.0333 12.3917L17.7917 14.3583C18.0083 14.5083 18.1583 14.6833 18.25 14.8917C18.3333 15.1 18.3833 15.3083 18.3833 15.5417" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10"/>
                  </svg>
                  <span className="flex-1 font-['Nunito'] font-bold text-[14px] leading-[19px] text-[#515964]">
                    {currentUser?.phone ? 'Change Phone Number' : 'Add Phone Number'}
                  </span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.42505 16.6L12.8584 11.1667C13.5 10.525 13.5 9.47504 12.8584 8.83337L7.42505 3.40004" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>

              {/* Password Change Option */}
              <Link href="/profile/change-password">
                <div className="flex flex-row items-center px-[20px] py-[18px] gap-[8px] hover:bg-gray-50 rounded-[16px] cursor-pointer transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.4916 12.4416C14.7749 14.1499 12.3166 14.6749 10.1583 14.0083L6.2333 17.9166C5.9499 18.2083 5.3916 18.3833 4.9916 18.3249L3.1749 18.0749C2.5749 17.9916 2.0166 17.4249 1.9249 16.8249L1.6749 15.0083C1.6166 14.6083 1.8083 14.0499 2.0833 13.7666L6.0083 9.8499C5.3333 7.6833 5.8499 5.2249 7.5666 3.5166C10.0249 1.0583 14.0166 1.0583 16.4833 3.5166C18.9499 5.9749 18.9499 9.9833 16.4916 12.4416Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M5.74167 14.575L7.65833 16.4917" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12.083 9.16675C12.7734 9.16675 13.333 8.60722 13.333 7.91675C13.333 7.22627 12.7734 6.66675 12.083 6.66675C11.3925 6.66675 10.833 7.22627 10.833 7.91675C10.833 8.60722 11.3925 9.16675 12.083 9.16675Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="flex-1 font-['Nunito'] font-bold text-[14px] leading-[19px] text-[#515964]">
                    Password Change
                  </span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.42505 16.6L12.8584 11.1667C13.5 10.525 13.5 9.47504 12.8584 8.83337L7.42505 3.40004" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}