import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../lib/auth';

export default function Settings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
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
    <div className="flex flex-col items-center bg-[#FBF5DA] font-['Nunito'] min-h-screen">
      <Head>
        <title>Settings - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <style jsx global>{`
          body {
            background-color: #FBF5DA;
            margin: 0;
            padding: 0;
            font-family: 'Nunito', sans-serif;
          }
        `}</style>
      </Head>
      
      <div className="w-full max-w-[390px] relative">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-[#FBF5DA] z-20">
          <div className="w-full max-w-[390px] mx-auto">
            <div className="flex flex-row items-center px-[20px] h-[65px] gap-[10px]" style={{ paddingTop: 'env(safe-area-inset-top, 20px)' }}>
              <button 
                className="relative z-50 w-10 h-10 flex items-center justify-center -ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.back();
                }}
                aria-label="Go back"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
                Settings
              </h1>
            </div>
          </div>
        </div>
      
        {/* Main Content */}
        <div className="w-full px-4 pb-24" style={{ paddingTop: '85px' }}>
          {/* Notifications Section */}
          <div className="mb-6">
            <h2 className="font-semibold text-[14px] text-[#515964] mb-3 uppercase tracking-wider">Notifications</h2>
            
            {/* Push Notifications */}
            <div className="bg-white rounded-[16px] p-4 mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[16px] text-[#0B1420]">Push Notifications</h3>
                  <p className="text-[12px] text-[#515964] mt-1">Receive notifications about property updates</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications ? 'bg-[#4D935A]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="bg-white rounded-[16px] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[16px] text-[#0B1420]">Email Notifications</h3>
                  <p className="text-[12px] text-[#515964] mt-1">Receive important updates via email</p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    emailNotifications ? 'bg-[#4D935A]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* App Preferences Section */}
          <div className="mb-6">
            <h2 className="font-semibold text-[14px] text-[#515964] mb-3 uppercase tracking-wider">App Preferences</h2>
            
            {/* Auto-save */}
            <div className="bg-white rounded-[16px] p-4 mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[16px] text-[#0B1420]">Auto-save</h3>
                  <p className="text-[12px] text-[#515964] mt-1">Automatically save progress as you work</p>
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSave ? 'bg-[#4D935A]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      autoSave ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-6">
            <h2 className="font-semibold text-[14px] text-[#515964] mb-3 uppercase tracking-wider">About</h2>
            
            <div className="bg-white rounded-[16px] p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-[14px] text-[#515964]">Version</span>
                <span className="text-[14px] text-[#0B1420] font-medium">1.0.0</span>
              </div>
              <div className="border-t border-[#ECF0F5]"></div>
              <button 
                onClick={() => window.open('/terms', '_blank')}
                className="flex justify-between items-center w-full"
              >
                <span className="text-[14px] text-[#0B1420]">Terms of Service</span>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 3.33334L14.1667 10L7.5 16.6667" stroke="#818A95" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="border-t border-[#ECF0F5]"></div>
              <button 
                onClick={() => window.open('/privacy', '_blank')}
                className="flex justify-between items-center w-full"
              >
                <span className="text-[14px] text-[#0B1420]">Privacy Policy</span>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 3.33334L14.1667 10L7.5 16.6667" stroke="#818A95" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}