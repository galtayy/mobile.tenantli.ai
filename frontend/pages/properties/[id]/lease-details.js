import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

// Back arrow icon component
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Calendar Icon component
const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.66666 1.66667V4.16667" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.3333 1.66667V4.16667" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.91666 7.575H17.0833" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 7.08334V14.1667C17.5 16.6667 16.25 18.3333 13.3333 18.3333H6.66666C3.74999 18.3333 2.5 16.6667 2.5 14.1667V7.08334C2.5 4.58334 3.74999 2.91667 6.66666 2.91667H13.3333C16.25 2.91667 17.5 4.58334 17.5 7.08334Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Dollar Icon component
const DollarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.25 10.8333L8.33333 12.9167L13.75 7.5" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Clock Icon component
const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.8166 12.575L10.3833 11.1083C9.87499 10.8167 9.45831 10.0333 9.45831 9.44166V6.25" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Enhanced Document Viewer Modal Component
const DocumentViewerModal = ({ show, onClose, url, title, type = 'pdf' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  
  useEffect(() => {
    if (show && url) {
      setIsLoading(true);
      setError(false);
      
      // Make sure URL is absolute
      let absoluteUrl;
      if (url.startsWith('http')) {
        absoluteUrl = url;
      } else if (url.startsWith('/')) {
        // If it starts with /, use the correct base URL
        const isProduction = window.location.hostname !== 'localhost';
        const baseUrl = isProduction ? 'https://api.tenantli.ai' : 'http://localhost:5050';
        absoluteUrl = baseUrl + url;
      } else {
        absoluteUrl = window.location.origin + '/' + url;
      }
      console.log(`Setting document URL (${type})`, absoluteUrl);
      setPdfUrl(absoluteUrl);
      
      // Preload image if it's an image type
      if (type === 'image' || getFileType(url) === 'image') {
        const preloadImage = new Image();
        preloadImage.src = absoluteUrl;
        preloadImage.onload = handleLoad;
        preloadImage.onerror = handleError;
      }
    }
  }, [show, url, type]);
  
  if (!show) return null;

  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };
  
  // Determine file type based on URL extension
  const getFileType = (fileUrl) => {
    if (!fileUrl) return 'unknown';
    // Use regex to extract extension from URL, handling query parameters
    const extensionMatch = fileUrl.toLowerCase().match(/\.([a-z0-9]+)($|\?|#)/);
    const extension = extensionMatch ? extensionMatch[1] : fileUrl.split('.').pop().toLowerCase();
    
    console.log('Detected file extension:', extension);
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      console.log('Identified as image type');
      return 'image';
    } else if (extension === 'pdf') {
      console.log('Identified as PDF type');
      return 'pdf';
    } else {
      console.log('Unknown file type');
      return 'unknown';
    }
  };
  
  const fileType = type || getFileType(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-90"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] mx-4 my-8 bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b">
          <h3 className="font-semibold text-[16px] text-[#0B1420]">{title}</h3>
          <div className="flex items-center gap-3">
            {/* Download button */}
            <a
              href={pdfUrl || url}
              download={title}
              className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              title="Download"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 11L8 3" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 7L8 11L12 7" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 13H14" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            
            {/* Open in new tab button */}
            <a
              href={pdfUrl || url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              title="Open in new tab"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2H2V14H14V10" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 2H14V6" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2L8 8" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            
            {/* Close button */}
            <button 
              className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              onClick={onClose}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 4L12 12" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Document Viewer */}
        <div className="w-full h-[calc(100%-56px)] bg-gray-50 relative">
          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 56C45.255 56 56 45.255 56 32C56 18.745 45.255 8 32 8C18.745 8 8 18.745 8 32C8 45.255 18.745 56 32 56Z" stroke="#D14848" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M32 21.3333V32" stroke="#D14848" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M32 42.6667H32.0267" stroke="#D14848" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="mt-4 text-[16px] text-gray-600">Unable to load document</p>
              <a
                href={pdfUrl || url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-4 py-2 bg-[#1C2C40] text-white rounded-lg hover:bg-[#243242] transition-colors"
              >
                Open in new tab
              </a>
            </div>
          )}
          
          {/* Image viewer */}
          {fileType === 'image' && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <img 
                src={pdfUrl || url}
                alt={title}
                className="max-w-full max-h-full object-contain"
                onLoad={handleLoad}
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  handleError();
                }}
              />
            </div>
          )}
          
          {/* PDF viewer */}
          {fileType === 'pdf' && (
            <div className="w-full h-full">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={title}
                onLoad={() => {
                  console.log('PDF iframe loaded successfully');
                  handleLoad();
                }}
                style={{ minHeight: '600px' }}
                allowFullScreen
              />
            </div>
          )}
          
          {/* Unknown file type */}
          {fileType === 'unknown' && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 8H16C14.343 8 13 9.343 13 11V53C13 54.657 14.343 56 16 56H48C49.657 56 51 54.657 51 53V19L40 8Z" stroke="#515964" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M40 8V19H51" stroke="#515964" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="mt-4 text-[16px] text-gray-600">Preview not available</p>
              <a
                href={url}
                download={title}
                className="mt-4 px-4 py-2 bg-[#1C2C40] text-white rounded-lg hover:bg-[#243242] transition-colors"
              >
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function LeaseDetails() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [leaseDuration, setLeaseDuration] = useState('');
  const [leaseDurationType, setLeaseDurationType] = useState('months');
  const [loading, setLoading] = useState(true);
  const [leaseDocuments, setLeaseDocuments] = useState([]);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const { id } = router.query;
  
  // Set up duration type options
  const durationTypes = [
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' }
  ];

  // Load property data
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchProperty();
    }
  }, [id, user, authLoading, router]);

  // Fetch property data
  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await apiService.properties.getById(id);
      const property = response.data;
      
      // Helper function to clean and format date strings
      const cleanDateString = (dateStr) => {
        if (!dateStr) return '';
        // If the date includes T, Z etc. (ISO format), extract just the date part
        if (dateStr.includes('T')) {
          return dateStr.split('T')[0];
        }
        return dateStr;
      };

      // Helper function to clean deposit amount
      const cleanDepositAmount = (amount) => {
        if (!amount) return '';
        if (typeof amount === 'number' || (typeof amount === 'string' && amount.includes('.'))) {
          return parseInt(amount, 10).toString();
        }
        return amount.toString();
      };
      
      setProperty(property);
      setDepositAmount(cleanDepositAmount(property.deposit_amount));
      setContractStartDate(cleanDateString(property.contract_start_date));
      setContractEndDate(cleanDateString(property.contract_end_date));
      setLeaseDuration(property.lease_duration ? property.lease_duration.toString() : '');
      setLeaseDurationType(property.lease_duration_type || 'months');
      
      // Check if there are lease documents stored
      const documents = [];
      
      // Handle multiple documents (comma-separated URLs)
      if (property.lease_document_url) {
        const urls = property.lease_document_url.split(',');
        const names = property.lease_document_name ? property.lease_document_name.split(', ') : [];
        
        urls.forEach((url, index) => {
          const fullUrl = url.trim().startsWith('http') 
            ? url.trim() 
            : apiService.getBaseUrl() + url.trim();
          documents.push({
            url: fullUrl,
            name: names[index] || `Lease Document ${index + 1}`
          });
        });
      }
      
      // Check localStorage for multiple documents
      if (documents.length === 0) {
        try {
          // Try new format first
          const localStorageKey = `property_${id}_lease_documents`;
          const storedLeaseInfo = localStorage.getItem(localStorageKey);
          
          if (storedLeaseInfo) {
            const leaseInfo = JSON.parse(storedLeaseInfo);
            if (leaseInfo.documents && Array.isArray(leaseInfo.documents)) {
              leaseInfo.documents.forEach(doc => {
                const fullUrl = doc.url.startsWith('http') 
                  ? doc.url 
                  : apiService.getBaseUrl() + doc.url;
                documents.push({
                  url: fullUrl,
                  name: doc.name || 'Lease Document'
                });
              });
            }
          } else {
            // Try legacy single document format
            const legacyKey = `property_${id}_lease_document`;
            const legacyInfo = localStorage.getItem(legacyKey);
            if (legacyInfo) {
              const doc = JSON.parse(legacyInfo);
              const fullUrl = doc.url.startsWith('http') 
                ? doc.url 
                : apiService.getBaseUrl() + doc.url;
              documents.push({
                url: fullUrl,
                name: doc.name || 'Lease Document'
              });
            }
          }
        } catch (storageError) {
          console.error('Error reading lease documents from localStorage:', storageError);
        }
      }
      
      setLeaseDocuments(documents);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching property:', error);
      setLoading(false);
      router.push('/properties/details?propertyId=' + id);
    }
  };

  // Calculate end date based on start date and lease duration
  const calculateEndDate = () => {
    if (!contractStartDate || !leaseDuration) return '';
    
    const start = new Date(contractStartDate);
    if (isNaN(start.getTime())) return '';
    
    const end = new Date(start);
    if (leaseDurationType === 'weeks') {
      // Add weeks (7 days per week)
      end.setDate(end.getDate() + (parseInt(leaseDuration) * 7));
    } else if (leaseDurationType === 'months') {
      end.setMonth(end.getMonth() + parseInt(leaseDuration));
    } else {
      end.setFullYear(end.getFullYear() + parseInt(leaseDuration));
    }
    
    // Format as YYYY-MM-DD
    return end.toISOString().split('T')[0];
  };

  // Update contract end date when start date, duration, or duration type changes
  useEffect(() => {
    if (contractStartDate && leaseDuration) {
      const newEndDate = calculateEndDate();
      setContractEndDate(newEndDate);
    }
  }, [contractStartDate, leaseDuration, leaseDurationType]);

  // Handle document view
  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowPDFViewer(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Lease Details - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="tenantli" />
        <meta name="application-name" content="tenantli" />
        <link rel="apple-touch-icon" href="/path-to-icon.png" />
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');
          
          body {
            font-family: 'Nunito', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #FBF5DA;
            overflow-x: hidden;
          }
          
          .mobile-full-height {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
          
          .safe-area-top {
            padding-top: env(safe-area-inset-top, 40px);
          }
          
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
          
          .input-no-spinners::-webkit-outer-spin-button,
          .input-no-spinners::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          
          .input-no-spinners {
            -moz-appearance: textfield;
          }
          
          .button-hover {
            transition: all 0.3s ease;
          }
          
          .button-hover:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(28, 44, 64, 0.1);
          }
          
          .button-hover:active {
            transform: translateY(0);
          }
          
          .form-input {
            transition: all 0.3s ease;
          }
          
          .form-input:focus-within {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(28, 44, 64, 0.08);
          }
          
          @media (max-width: 390px) {
            body {
              font-size: 14px;
            }
          }
          
          @media (max-height: 667px) {
            .safe-area-top {
              padding-top: 20px;
            }
          }
        `}</style>
      </Head>
      
      <div className="fixed inset-0 bg-[#FBF5DA]"></div>
      
      <div className="relative min-h-screen mobile-full-height w-full font-['Nunito'] overflow-hidden">
        {/* Fixed Header */}
        <div className="fixed top-0 w-full bg-[#FBF5DA] z-20">
          <div className="flex flex-row items-center px-[20px] pt-[60px] pb-[20px] relative safe-area-top">
            <Link href="/" className="flex items-center relative z-10 hover:opacity-75 transition-opacity duration-200" aria-label="Go back">
              <ArrowLeftIcon />
            </Link>
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
              Lease Details
            </h1>
          </div>
        </div>
        
        {/* Content */}
        <div className="w-full max-w-[390px] mx-auto">
          <div className="absolute inset-0 bg-[#FBF5DA]"></div>
          <div className="relative min-h-screen mobile-full-height flex flex-col">
            <div className="h-[124px]"></div>
            
            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto px-5" style={{paddingBottom: '20px'}}>
              <div className="w-full space-y-6 pb-6">
                {/* Lease Details Title */}
                <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420] mt-6">
                  Lease Details 📂
                </h2>
                
                {/* Lease Duration Section */}
                <div className="space-y-2">
                  <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                    Lease Duration
                  </div>
                  
                  <div className="flex flex-row items-center gap-[16px] w-full">
                    {/* Duration Input */}
                    <div className="w-1/2 form-input flex flex-row items-center p-[18px_20px] gap-[8px] bg-gray-50 border border-[#D1E7D5] rounded-[16px]">
                      <ClockIcon />
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={leaseDuration}
                        placeholder="No duration set"
                        className="flex-1 font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none input-no-spinners"
                        disabled
                        readOnly
                      />
                    </div>
                    
                    {/* Duration Type Select */}
                    <div className="w-1/2 form-input flex flex-row items-center p-[18px_20px] gap-[8px] bg-gray-50 border border-[#D1E7D5] rounded-[16px] relative">
                      <ClockIcon />
                      <select
                        value={leaseDurationType}
                        className="flex-1 font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none appearance-none pr-8"
                        disabled
                        readOnly
                      >
                        {durationTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-[20px]">
                        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.6666 1.16667L5.99998 5.83334L1.33331 1.16667" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contract Start Date */}
                <div className="w-full">
                  <div className="font-bold text-[14px] leading-[19px] text-[#0B1420] mb-2">
                    Lease Start Date
                  </div>
                  <div className="form-input flex flex-row items-center p-[18px_20px] gap-[8px] w-full bg-gray-50 border border-[#D1E7D5] rounded-[16px]">
              <CalendarIcon />
              <div className="relative flex-1">
                <div className="text-[#515964] text-[14px] leading-[19px] font-bold">
                  {!contractStartDate ? "No start date set" : contractStartDate}
                </div>
                <input
                  type="date"
                  id="contract-start-date"
                  value={contractStartDate}
                  className="absolute w-full h-full top-0 left-0 opacity-0 z-10"
                  disabled
                  readOnly
                />
              </div>
                  </div>
                </div>
                
                {/* Contract End Date (Move out Date) */}
                <div className="w-full">
                  <div className="font-bold text-[14px] leading-[19px] text-[#0B1420] mb-2">
                    Move out Date
                  </div>
                  <div className="form-input flex flex-row items-center p-[18px_20px] gap-[8px] w-full bg-gray-50 border border-[#D1E7D5] rounded-[16px]">
              <CalendarIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#515964]">
                {contractEndDate || "Will be calculated"}
              </div>
                  </div>
                </div>
                
                {/* Deposit Amount */}
                <div className="w-full">
                  <div className="font-bold text-[14px] leading-[19px] text-[#0B1420] mb-2">
                    Deposit Amount
                  </div>
                  <div className="form-input flex flex-row items-center p-[18px_20px] gap-[8px] w-full bg-gray-50 border border-[#D1E7D5] rounded-[16px]">
              <DollarIcon />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={depositAmount}
                placeholder="No deposit amount set"
                className="flex-1 font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none input-no-spinners"
                disabled
                readOnly
              />
                  </div>
                </div>
                
                {/* Lease Documents Section */}
                <div className="w-full">
                  <div className="font-bold text-[14px] leading-[19px] text-[#0B1420] mb-2">
                    Lease Documents
                  </div>
                  
                  {leaseDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {leaseDocuments.map((doc, index) => (
                        <button
                          key={index}
                          onClick={() => handleViewDocument(doc)}
                          className="w-full form-input flex flex-row items-center justify-between p-[16px_20px] gap-[8px] bg-gray-50 border border-[#D1E7D5] rounded-[16px] hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-[12px]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M14 2V8H20" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 13H8" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 17H8" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 9H9H8" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="font-bold text-[14px] leading-[19px] text-[#515964] text-left">
                              {doc.name}
                            </span>
                          </div>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5 5L12.5 10L7.5 15" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="form-input flex flex-row justify-center items-center p-[16px_20px] gap-[8px] w-full bg-gray-50 border border-dashed border-[#D1E7D5] rounded-[16px]">
                      <div className="flex flex-col justify-center items-center gap-[8px]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H9H8" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="font-bold text-[14px] leading-[19px] text-center text-[#515964]">
                          No lease documents uploaded
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </div>
          </div>
        </div>
      </div>
      
      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewerModal
          show={showPDFViewer}
          onClose={() => {
            setShowPDFViewer(false);
            setSelectedDocument(null);
          }}
          url={selectedDocument.url}
          title={selectedDocument.name}
          type={selectedDocument.url?.toLowerCase().endsWith('.pdf') ? 'pdf' : 
                (selectedDocument.url?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? 'image' : 'unknown')}
        />
      )}
    </>
  );
}