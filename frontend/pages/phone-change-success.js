import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../lib/auth';

export default function PhoneChangeSuccess() {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-[#FBF5DA] font-['Nunito']">
      <Head>
        <title>Phone Number Updated - tenantli</title>
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
            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-['Nunito'] font-semibold text-[18px] leading-[25px] text-[#0B1420]">
              Phone Number Updated
            </h1>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-[390px] mx-auto" style={{ paddingTop: 'calc(65px + env(safe-area-inset-top))' }}>
        <div className="px-[20px] pb-[120px]">
          <div className="flex flex-col items-center justify-center pt-[80px] gap-[32px]">
            {/* Success Icon */}
            <div className="w-[120px] h-[120px] bg-[#E8F5EB] rounded-full flex items-center justify-center">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#1C2C40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Success Message */}
            <div className="text-center">
              <h2 className="font-['Nunito'] font-bold text-[24px] leading-[32px] text-[#0B1420] mb-[8px]">
                Phone Number Updated!
              </h2>
              <p className="font-['Nunito'] font-normal text-[16px] leading-[22px] text-[#515964]">
                Your phone number has been successfully updated in your profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FBF5DA] z-10">
        <div className="w-full max-w-[390px] mx-auto px-[20px] pb-[12px]">
          <button
            onClick={() => router.push('/profile')}
            className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px] font-['Nunito'] font-bold text-[16px] leading-[22px] text-[#D1E7E2]"
          >
            Back to Profile
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