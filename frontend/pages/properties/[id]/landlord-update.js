import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

// Debug helper
const DEBUG = true;
const logDebug = (...args) => {
  if (DEBUG) {
    console.log('[LANDLORD PAGE]', ...args);
  }
};

// Back arrow icon component
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function LandlordUpdate() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Landlord information
  const [landlordEmail, setLandlordEmail] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('');
  
  // Format phone number to US format: (123) 456-7890
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    
    // Remove all non-digit characters
    const phoneNumber = value.replace(/[^\d]/g, '');
    
    // Take only first 10 digits
    const phoneNumberLength = phoneNumber.length;
    
    // Return if empty
    if (phoneNumberLength < 1) return '';
    
    // Format the phone number based on length
    if (phoneNumberLength < 4) {
      return `(${phoneNumber}`;
    } else if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  // Load property data
  useEffect(() => {
    if (!id || authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const loadProperty = async () => {
      try {
        const response = await apiService.properties.getById(id);
        const propertyData = response.data;
        setProperty(propertyData);
        
        // Set landlord data if available
        if (propertyData.landlord_email) {
          setLandlordEmail(propertyData.landlord_email);
        }
        if (propertyData.landlord_phone) {
          setLandlordPhone(propertyData.landlord_phone);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading property data:', error);
        setLoading(false);
        router.push('/properties');
      }
    };

    loadProperty();
  }, [id, user, authLoading, router]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    const emailValue = landlordEmail.trim();
    const phoneValue = landlordPhone.trim();
    
    logDebug("Form values:", { emailValue, phoneValue });
    
    // At least one field must be filled
    if (!emailValue && !phoneValue) {
      return;
    }
    
    // Validate email if provided
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      return;
    }
    
    // Validate phone if provided - must be in US format
    if (phoneValue) {
      const phoneDigits = phoneValue.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        return;
      }
    }
    
    setSaving(true);
    
    try {
      // Use apiService directly
      logDebug('Starting the save operation through api.js');
      
      // Prepare data in the format expected by the backend
      const apiData = {
        email: emailValue,
        phone: phoneValue
      };
      
      logDebug('API çağrısı veri:', apiData);
      
      // Direkt olarak backend'in istediği formatta veri gönder
      const response = await apiService.properties.saveLandlordDetails(id, apiData);
      
      logDebug('Kayıt işlemi başarılı! Yanıt:', response.data);
      
      // ÖNEMLİ: localStorage'a kaydet - bunu tüm sayfalar için yedek mekanizma olarak kullanıyoruz
      localStorage.setItem('lastSharedPropertyId', id);
      logDebug('localStorage\'a propertyId kaydedildi:', id);
      
      // Doğru şekilde yönlendirme - query parametresi kullanarak
      logDebug('Şimdi details sayfasına yönlendiriliyor...');
      
      // Direkt router.replace ile yönlendir (tam sayfa yenileme)
      window.location.href = `/properties/details?propertyId=${id}`;
    } catch (error) {
      logDebug('Kayıt işlemi başarısız!', error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#FBF5DA] font-['Nunito'] overflow-x-hidden">
      {/* Meta tags */}
      <Head>
        <title>Landlord Information - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>
      
      {/* Status Bar Space */}
      <div className="w-full h-[40px] safe-area-top"></div>

      {/* Header - Fixed positioning */}
      <div className="fixed w-full h-[65px] left-0 top-[40px] z-10 bg-[#FBF5DA]">
        <div className="flex flex-row justify-center items-center py-[20px] px-[10px] gap-[10px] w-full h-[65px] safe-area-inset-left safe-area-inset-right">
          <button
            className="absolute left-[20px] top-[50%] transform -translate-y-1/2 p-2"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="w-full max-w-[270px] font-semibold text-[18px] leading-[140%] text-center text-[#0B1420]">
            Landlord Information
          </h1>
        </div>
      </div>
      
      {/* Main Content - Start after header */}
      <div className="flex flex-col items-center w-full pt-[125px] px-[20px] pb-[100px]">
        {/* Title and Description */}
        <div className="flex flex-col items-start w-full mb-6 gap-[4px]">
          <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420]">
            Where should we send your report?
          </h2>
          <p className="font-normal text-[14px] leading-[19px] text-[#515964]">
            We'll send your report directly to your landlord so it's officially on record.
          </p>
        </div>
        
        {/* Form Inputs */}
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="box-border flex flex-row items-center px-[20px] py-[18px] gap-[8px] w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.1666 17.0833H5.83331C3.33331 17.0833 1.66665 15.8333 1.66665 12.9166V7.08329C1.66665 4.16663 3.33331 2.91663 5.83331 2.91663H14.1666C16.6666 2.91663 18.3333 4.16663 18.3333 7.08329V12.9166C18.3333 15.8333 16.6666 17.0833 14.1666 17.0833Z" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.1667 7.5L11.5584 9.58333C10.7 10.2667 9.29169 10.2667 8.43335 9.58333L5.83335 7.5" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="landlordEmail"
                type="email"
                value={landlordEmail}
                onChange={(e) => setLandlordEmail(e.target.value)}
                className="flex-grow font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent focus:outline-none"
                placeholder="Landlord Email"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="box-border flex flex-row items-center px-[20px] py-[18px] gap-[8px] w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3084 15.2748C18.3084 15.5748 18.2417 15.8832 18.1 16.1832C17.9584 16.4832 17.775 16.7665 17.5334 17.0332C17.1417 17.4832 16.7084 17.8082 16.225 18.0165C15.75 18.2248 15.2334 18.3332 14.675 18.3332C13.8584 18.3332 12.9834 18.1332 12.0584 17.7248C11.1334 17.3165 10.2084 16.7665 9.29171 16.0748C8.36671 15.3748 7.48338 14.6082 6.64171 13.7748C5.80838 12.9332 5.04171 12.0498 4.34171 11.1248C3.65004 10.1998 3.10004 9.27484 2.70004 8.35817C2.30004 7.43317 2.10004 6.55817 2.10004 5.73317C2.10004 5.1915 2.20004 4.67484 2.40004 4.1915C2.60004 3.70817 2.91671 3.2665 3.35837 2.8665C3.89171 2.34984 4.47504 2.0915 5.09171 2.0915C5.32504 2.0915 5.55837 2.14984 5.76671 2.2665C5.98338 2.38317 6.17504 2.5415 6.32504 2.75817L8.10004 5.28317C8.25004 5.49984 8.35837 5.69984 8.43338 5.8915C8.50837 6.07484 8.55004 6.2665 8.55004 6.44984C8.55004 6.67484 8.49171 6.8998 8.37504 7.1165C8.26671 7.33317 8.10837 7.5665 7.90837 7.7665L7.30837 8.38317C7.21671 8.47484 7.17504 8.58317 7.17504 8.7165C7.17504 8.78317 7.18338 8.84151 7.20004 8.9165C7.22504 8.99151 7.25004 9.04984 7.26671 9.10817C7.40004 9.3415 7.62504 9.6415 7.94171 10.0082C8.26671 10.3748 8.61671 10.7498 8.99171 11.1248C9.37504 11.4998 9.74171 11.8582 10.1167 12.1832C10.4834 12.4998 10.7834 12.7165 11.025 12.8498C11.075 12.8665 11.1334 12.8915 11.2 12.9165C11.2750 12.9415 11.35 12.9498 11.425 12.9498C11.5667 12.9498 11.675 12.8998 11.7667 12.8082L12.3667 12.2165C12.575 12.0082 12.8084 11.8498 13.025 11.7498C13.2417 11.6332 13.4584 11.5748 13.6917 11.5748C13.875 11.5748 14.0667 11.6082 14.2584 11.6832C14.45 11.7582 14.65 11.8665 14.8667 12.0082L17.4334 13.8082C17.65 13.9582 17.8084 14.1415 17.9167 14.3498C18.0167 14.5582 18.0667 14.7665 18.0667 14.9998L18.3084 15.2748Z" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10"/>
              </svg>
              <input
                id="landlordPhone"
                type="tel"
                value={landlordPhone}
                onChange={(e) => setLandlordPhone(formatPhoneNumber(e.target.value))}
                className="flex-grow font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent focus:outline-none"
                placeholder="Landlord Phone"
              />
            </div>
          </div>
        </form>
      </div>
      
      {/* Fixed Bottom Button */}
      <div className="fixed left-0 right-0 bottom-0 z-10 bg-[#FBF5DA] py-4 px-5 safe-area-bottom">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || (!landlordEmail.trim() && !landlordPhone.trim())}
          className={`w-full h-[56px] flex justify-center items-center rounded-[16px] ${
            saving || (!landlordEmail.trim() && !landlordPhone.trim()) 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#1C2C40] hover:bg-[#243242] active:bg-[#0C1322]'
          } transition-colors duration-200`}
        >
          <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
            {saving ? 'Saving...' : 'Save'}
          </span>
        </button>
      </div>
    </div>
  );
}