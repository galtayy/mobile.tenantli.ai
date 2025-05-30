import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';
import { toast } from 'react-toastify';

export default function NewEmail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to welcome page
  }

  const handleSendCode = async (e) => {
    e.preventDefault();
    
    if (!newEmail) {
      toast.error('New email address is required');
      return;
    }

    if (newEmail === user.email) {
      toast.error('New email must be different from current email');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('That doesn’t look like a valid email.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update only email using partial update
      const response = await apiService.user.updateProfile({ 
        email: newEmail
      });
      
      if (response.data) {
        // Navigate to success page
        router.push('/email-change-success');
      }
    } catch (error) {
      console.error('Update email error:', error);
      toast.error(error.response?.data?.message || 'Failed to update email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5DA] font-['Nunito']">
      <Head>
        <title>New Email Address - tenantli</title>
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
          /* Hide toast notifications on this page */
          .Toastify__toast-container {
            display: none !important;
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
            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-['Nunito'] font-semibold text-[18px] leading-[25px] text-[#0B1420]">
              Change Your Email
            </h1>
          </div>
        </div>
      </div>

      {/* Content Area with scrolling */}
      <div className="w-full max-w-[390px] mx-auto" style={{ paddingTop: 'calc(65px + env(safe-area-inset-top))' }}>
        <div className="px-[20px] pb-[120px]">
          {/* Content Section */}
          <div className="flex flex-col items-start pt-[16px] gap-[24px] w-[350px]">
            {/* Description */}
            <div className="w-[350px] font-['Nunito'] font-bold text-[16px] leading-[22px] text-[#0B1420]">
              Great! Now enter your new email address — we'll send a verification code to confirm the change.
            </div>
            
            {/* Email Input */}
            <form onSubmit={handleSendCode} className="w-full">
              <div className="flex flex-row items-center py-[18px] px-[20px] gap-[8px] w-[350px] h-[56px] bg-white border border-[#D1E7D5] rounded-[16px]">
                {/* Email Icon */}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.1667 17.0833H5.83333C3.33333 17.0833 1.66667 15.8333 1.66667 12.9167V7.08333C1.66667 4.16667 3.33333 2.91667 5.83333 2.91667H14.1667C16.6667 2.91667 18.3333 4.16667 18.3333 7.08333V12.9167C18.3333 15.8333 16.6667 17.0833 14.1667 17.0833Z" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.1667 7.5L11.5583 9.58333C10.7 10.2667 9.29167 10.2667 8.43333 9.58333L5.83333 7.5" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
                {/* Input Field */}
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="New Email"
                  className="flex-1 font-['Nunito'] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none placeholder-[#515964]"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FBF5DA] z-10">
        <div className="w-full max-w-[390px] mx-auto px-[20px] pb-[12px]">
          <button
            onClick={handleSendCode}
            disabled={isSubmitting}
            className="w-[350px] h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px] font-['Nunito'] font-bold text-[16px] leading-[22px] text-[#D1E7E2] disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}