import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';

export default function ChangePhoneNumber() {
  const { user } = useAuth();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format phone number as USA format (XXX) XXX-XXXX
  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    
    // Format based on length
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  useEffect(() => {
    if (!user) {
      router.push('/welcome');
      return;
    }
  }, [user, router]);

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your current phone number');
      return;
    }

    // Compare only the digits (remove formatting)
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    const userPhoneDigits = user.phone ? user.phone.replace(/\D/g, '') : '';
    
    if (phoneDigits !== userPhoneDigits) {
      toast.error('Please enter your current phone number correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send verification code to current phone via email (same as email change process)
      const response = await apiService.auth.requestEmailChangeVerification({ currentEmail: user.email });
      
      if (response.data.success) {
        //toast.success('Verification code sent to your email address');
        // Navigate to phone change verification page for identity confirmation
        router.push({
          pathname: '/phone-change-verification',
          query: { 
            type: 'phone-change-step1',
            phone: phoneNumber,
            userId: user.id 
          }
        });
      }
    } catch (error) {
      console.error('Send code error:', error);
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5DA] font-['Nunito']">
      <Head>
        <title>Update Phone Number - tenantli</title>
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
                router.back();
              }}
              className="absolute left-[20px] top-1/2 -translate-y-1/2 w-[48px] h-[48px] -ml-2 flex items-center justify-center z-50"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#2E3642" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-['Nunito'] font-semibold text-[18px] leading-[25px] text-[#0B1420] px-16 text-center whitespace-nowrap">
              Update Phone Number
            </h1>
          </div>
        </div>
      </div>

      {/* Content Area with scrolling */}
      <div className="w-full max-w-[390px] mx-auto" style={{ paddingTop: 'calc(65px + env(safe-area-inset-top))' }}>
        <div className="px-[20px] pb-[120px]">

          {/* Current Phone Number Input */}
          <div className="flex flex-col gap-[8px] mb-[32px] pt-[32px]">
            <label className="font-['Nunito'] font-semibold text-[14px] leading-[19px] text-[#0B1420]">
              Your current phone number.
            </label>
            <div className="flex flex-row items-center px-[20px] py-[18px] gap-[8px] bg-white border border-[#D1E7D5] rounded-[16px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3083 15.275C18.3083 15.575 18.2417 15.8833 18.1 16.1833C17.9583 16.4833 17.775 16.7667 17.5333 17.0333C17.125 17.4833 16.675 17.8083 16.1667 18.0167C15.6667 18.225 15.125 18.3333 14.5417 18.3333C13.6917 18.3333 12.7833 18.1333 11.825 17.725C10.8667 17.3167 9.90833 16.7667 8.95833 16.075C8 15.375 7.09167 14.6 6.225 13.7417C5.36667 12.875 4.59167 11.9667 3.9 11.0167C3.21667 10.0667 2.66667 9.11667 2.26667 8.175C1.86667 7.225 1.66667 6.31667 1.66667 5.45C1.66667 4.88333 1.76667 4.34167 1.96667 3.84167C2.16667 3.33333 2.48333 2.86667 2.925 2.45C3.45833 1.925 4.04167 1.66667 4.65833 1.66667C4.89167 1.66667 5.125 1.71667 5.33333 1.81667C5.55 1.91667 5.74167 2.06667 5.89167 2.28333L7.825 5.00833C7.975 5.21667 8.08333 5.40833 8.15833 5.59167C8.23333 5.76667 8.275 5.94167 8.275 6.1C8.275 6.3 8.21667 6.5 8.1 6.69167C7.99167 6.88333 7.83333 7.08333 7.63333 7.28333L7 7.94167C6.90833 8.03333 6.86667 8.14167 6.86667 8.275C6.86667 8.34167 6.875 8.4 6.89167 8.46667C6.91667 8.53333 6.94167 8.58333 6.95833 8.63333C7.10833 8.91667 7.36667 9.29167 7.73333 9.75C8.10833 10.2083 8.50833 10.675 8.94167 11.1417C9.39167 11.6083 9.825 12.0417 10.2917 12.4417C10.75 12.8333 11.125 13.1083 11.4167 13.2667C11.4583 13.2833 11.5083 13.3083 11.5667 13.3333C11.6333 13.3583 11.7 13.3667 11.775 13.3667C11.9167 13.3667 12.025 13.3167 12.1167 13.225L12.75 12.6C12.9583 12.3917 13.1583 12.2333 13.35 12.1333C13.5417 12.0167 13.7333 11.9583 13.9417 11.9583C14.1 11.9583 14.2667 11.9917 14.45 12.0667C14.6333 12.1417 14.825 12.25 15.0333 12.3917L17.7917 14.3583C18.0083 14.5083 18.1583 14.6833 18.25 14.8917C18.3333 15.1 18.3833 15.3083 18.3833 15.5417" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10"/>
              </svg>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Phone Number"
                className="flex-1 font-['Nunito'] font-bold text-[14px] leading-[19px] text-[#0B1420] bg-transparent outline-none placeholder-[#A8B2BC]"
                disabled={isSubmitting}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FBF5DA] z-10">
        <div className="w-full max-w-[390px] mx-auto px-[20px] pb-[12px]">
          <button
            onClick={handleSendCode}
            disabled={isSubmitting || !phoneNumber.trim()}
            className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px] font-['Nunito'] font-bold text-[16px] leading-[22px] text-[#D1E7E2] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Code'}
          </button>
          {/* Bottom indicator line */}
          <div className="flex justify-center mt-[12px]">
            <div className="w-[138px] h-[4px] bg-[#1C2C40] rounded-[24px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}