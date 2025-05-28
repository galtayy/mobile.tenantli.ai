import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../lib/auth';

export default function ShareSuccess() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { url, uuid } = router.query;
  
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/welcome');
      return;
    }
    
    // Get the shared URL from query params or localStorage
    const reportUrl = url || localStorage.getItem('report_share_url');
    const reportUuid = uuid || localStorage.getItem('report_uuid');
    
    if (reportUrl) {
      setShareUrl(reportUrl);
    } else if (reportUuid) {
      // URL yoksa ama UUID varsa, URL'yi oluştur
      const baseUrl = window.location.origin;
      const constructedUrl = `${baseUrl}/reports/shared/${reportUuid}`;
      setShareUrl(constructedUrl);
      console.log('Constructed share URL from UUID:', constructedUrl);
    }
    
    // Clean up after successful render
    return () => {
      // Clear localStorage items related to sharing
      localStorage.removeItem('report_share_url');
      localStorage.removeItem('report_uuid');
      localStorage.removeItem('report_share_success');
      localStorage.removeItem('lastSharedPropertyId');
    };
  }, [user, authLoading, router, url]);
  
  // Copy link to clipboard with multiple fallbacks
  const copyToClipboard = async () => {
    try {
      if (shareUrl) {
        let copySuccess = false;
        
        console.log('Attempting to copy URL:', shareUrl);
        
        // Method 1: Modern clipboard API (most reliable but requires secure context)
        if (navigator.clipboard && window.isSecureContext) {
          try {
            console.log('Trying navigator.clipboard.writeText method');
            await navigator.clipboard.writeText(shareUrl);
            copySuccess = true;
            console.log('Clipboard API success');
          } catch (clipboardErr) {
            console.error('Clipboard API failed:', clipboardErr);
            // Continue to fallback methods
          }
        }
        
        // Method 2: execCommand with textarea (older browser fallback)
        if (!copySuccess) {
          try {
            console.log('Trying execCommand method');
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            
            // Apply styling to hide the textarea
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.opacity = '0';
            textArea.style.zIndex = '-9999';
            
            // Ensure it works on iOS
            textArea.contentEditable = true;
            textArea.readOnly = false;
            
            // Append, select, copy, remove
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            if (successful) {
              copySuccess = true;
              console.log('execCommand success');
            } else {
              console.error('execCommand failed');
            }
            
            document.body.removeChild(textArea);
          } catch (execErr) {
            console.error('execCommand method failed:', execErr);
          }
        }
        
        // If both built-in methods failed, notify user
        if (copySuccess) {
          setCopied(true);
          console.log('Link copied to clipboard!');
          
          // Reset copy state after 3 seconds
          setTimeout(() => {
            setCopied(false);
          }, 3000);
        } else {
          console.error('All clipboard methods failed');
          // Provide user feedback
          alert('Copy failed. Please manually copy this link: ' + shareUrl);
        }
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Unable to copy link. Please manually copy: ' + shareUrl);
    }
  };
  
  // Determine if this is move-in or move-out
  const [reportType, setReportType] = useState('Walkthrough');
  
  useEffect(() => {
    // Check the localStorage for lastSharedPropertyId to determine if it's a move-in report
    const lastSharedPropertyId = localStorage.getItem('lastSharedPropertyId');
    if (lastSharedPropertyId) {
      setReportType('Move-In Walkthrough');
    } else if (localStorage.getItem('report_share_success')) {
      setReportType('Move-Out');
    }
  }, []);
  
  // Send email with link
  const sendEmail = () => {
    if (shareUrl) {
      const subject = encodeURIComponent(`${reportType} Report`);
      const body = encodeURIComponent(
        `Hello,\n\nI've prepared a ${reportType.toLowerCase()} report for your property. You can view it here:\n\n${shareUrl}\n\nThank you.`
      );
      
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };
  

  return (
    <div className="relative w-full min-h-screen max-w-[500px] mx-auto bg-[#FBF5DA] font-['Nunito'] overflow-hidden">
      <Head>
        <title>Report Sent - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      
      {/* Simple top spacing */}
      <div className="w-full h-[100px]"></div>
      
      {/* Success Illustration */}
      <div className="w-[300px] h-[180px] ml-[-20px] mt-5">
        <img 
          src="/images/reportsend.svg" 
          alt="Success" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Success Content */}
      <div className="flex flex-col items-center p-0 gap-[8px] w-[300px] h-auto mx-auto mt-5">
        <h2 className="w-full font-bold text-[24px] leading-[120%] text-center text-[#0B1420]">
          Your report was sent!
        </h2>
        <p className="w-full font-normal text-[14px] leading-[140%] text-center text-[#515964] mt-2 mb-4">
          We've sent your time-stamped {reportType.toLowerCase()} report to your landlord. You're covered.
        </p>
        
        {shareUrl && (
          <div className="w-full mt-4">
            <p className="font-medium text-[14px] leading-[19px] text-[#6B7280] mb-2 text-center">
              Share this report:
            </p>
            
            <div className="flex items-center bg-[#F3F4F6] rounded-[12px] p-3 mb-4">
              <div className="flex-grow truncate text-[14px] leading-[19px] text-[#0B1420] text-left">
                {shareUrl}
              </div>
              <button 
                onClick={copyToClipboard}
                className="ml-2 flex-shrink-0"
              >
                {copied ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#4D935A"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="#1C2C40"/>
                  </svg>
                )}
              </button>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={sendEmail}
                className="flex flex-col items-center"
              >
                <div className="bg-[#1C2C40] w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#D1E7E2"/>
                  </svg>
                </div>
                <span className="text-[12px] leading-[16px] text-[#515964]">Email</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Done Button */}
      <div className="fixed bottom-8 left-0 right-0 mx-auto w-[90%] max-w-[350px]">
        <button 
          onClick={() => router.push('/')}
          className="w-full h-[56px] flex flex-row justify-center items-center bg-[#1C2C40] rounded-[16px] font-bold text-[16px] text-[#D1E7E2]"
        >
          Done
        </button>
      </div>
    </div>
  );
}