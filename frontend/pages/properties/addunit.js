import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';

// Input Error Component
const InputError = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="mt-1 ml-2 text-xs text-red-400 font-medium flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1"/>
        <path d="M6 3.5V6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <circle cx="6" cy="8.5" r="0.5" fill="currentColor"/>
      </svg>
      {message}
    </div>
  );
};

// Vuesax style icon components
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.38 2.6L2.13 8.25C1.55 8.7 1.13 9.7 1.26 10.4L2.46 17.33C2.63 18.35 3.6 19.18 4.63 19.18H15.36C16.38 19.18 17.36 18.34 17.53 17.33L18.73 10.4C18.85 9.7 18.43 8.7 17.86 8.25L10.61 2.6C10.11 2.21 9.87 2.21 9.38 2.6Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 15.8V13.05" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 11.1917C11.436 11.1917 12.6 10.0276 12.6 8.59171C12.6 7.15578 11.436 5.99171 10 5.99171C8.56407 5.99171 7.40001 7.15578 7.40001 8.59171C7.40001 10.0276 8.56407 11.1917 10 11.1917Z" stroke="#292D32" strokeWidth="1.5"/>
    <path d="M3.01666 7.07496C4.65833 -0.141705 15.35 -0.133372 16.9833 7.08329C17.9417 11.3166 15.3083 14.9 13 17.1166C11.325 18.7333 8.67499 18.7333 6.99166 17.1166C4.69166 14.9 2.05833 11.3083 3.01666 7.07496Z" stroke="#292D32" strokeWidth="1.5"/>
  </svg>
);

const HouseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.04167 18.9583H18.9583" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.875 18.9583V5.83334C1.875 5.16667 2.2 4.53334 2.75 4.18334L8.75 0.516675C9.46667 0.0666748 10.3833 0.0666748 11.1 0.516675L17.1 4.18334C17.65 4.53334 17.975 5.16667 17.975 5.83334V18.9583" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.8333 9.16666H9.16667C8.42501 9.16666 7.83334 9.75833 7.83334 10.5V18.9583H12.1667V10.5C12.1667 9.75833 11.575 9.16666 10.8333 9.16666Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.83334 6.25H5.83334C5.375 6.25 5.00001 6.625 5.00001 7.08333V9.08333C5.00001 9.54166 5.375 9.91666 5.83334 9.91666H7.83334C8.29167 9.91666 8.66667 9.54166 8.66667 9.08333V7.08333C8.66667 6.625 8.29167 6.25 7.83334 6.25Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.1667 6.25H12.1667C11.7083 6.25 11.3333 6.625 11.3333 7.08333V9.08333C11.3333 9.54166 11.7083 9.91666 12.1667 9.91666H14.1667C14.625 9.91666 15 9.54166 15 9.08333V7.08333C15 6.625 14.625 6.25 14.1667 6.25Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.66666 1.66667V4.16667" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.3333 1.66667V4.16667" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.91666 7.575H17.0833" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 7.08334V14.1667C17.5 16.6667 16.25 18.3333 13.3333 18.3333H6.66666C3.74999 18.3333 2.5 16.6667 2.5 14.1667V7.08334C2.5 4.58334 3.74999 2.91667 6.66666 2.91667H13.3333C16.25 2.91667 17.5 4.58334 17.5 7.08334Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.0789 11.4167H13.0864" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.0789 13.9167H13.0864" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99626 11.4167H10.0038" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99626 13.9167H10.0038" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.91192 11.4167H6.91941" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.91192 13.9167H6.91941" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DollarCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.25 10.8333L8.33333 12.9167L13.75 7.5" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DocumentUploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 17V11L7 13" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11L11 13" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 10H18C15 10 14 9 14 6V2L22 10Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.8166 12.575L10.3833 11.1083C9.87499 10.8167 9.45831 10.0333 9.45831 9.44166V6.25" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InfoCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 6.66667V10.8333" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99542 13.3333H10.0029" stroke="#515964" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function AddUnit() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  
  // Debug log to understand the issue
  useEffect(() => {
    console.log('Address value updated to:', address);
  }, [address]);
  const [unitNumber, setUnitNumber] = useState('');
  const googleSelectedAddressRef = useRef(null);
  const [bathrooms, setBathrooms] = useState('');
  const [livingRooms, setLivingRooms] = useState('');
  const [kitchenCount, setKitchenCount] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [parkingSpaces, setParkingSpaces] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [contractStartDate, setContractStartDate] = useState('');
  const [leaseDuration, setLeaseDuration] = useState('');
  const [leaseDurationType, setLeaseDurationType] = useState('months');
  const [leaseDocuments, setLeaseDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDurationTypeSelector, setShowDurationTypeSelector] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [errors, setErrors] = useState({
    propertyName: '',
    address: '',
    unitNumber: '',
    depositAmount: '',
    contractStartDate: '',
    leaseDuration: '',
    moveInDate: ''
  });
  
  // Google Maps Autocomplete refs
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  
  // Check if all required fields are filled and dates are valid
  const isFormValid = () => {
    const finalAddress = addressInputRef.current ? addressInputRef.current.value : address;
    const allFieldsFilled = propertyName && finalAddress && depositAmount && 
                           contractStartDate && leaseDuration && moveInDate;
    
    // Date validation: Move-in date cannot be before lease start date
    let datesValid = true;
    if (contractStartDate && moveInDate) {
      const leaseStart = new Date(contractStartDate);
      const moveIn = new Date(moveInDate);
      datesValid = moveIn >= leaseStart;
    }
    
    return allFieldsFilled && datesValid;
  };
  
  // Handle Enter key for navigation
  const handleEnterKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Handle animation timing
  useEffect(() => {
    let animationTimeout;
    if (showDurationTypeSelector) {
      // Small delay to let the component render first, then add the visible class
      animationTimeout = setTimeout(() => {
        setAnimationClass('visible');
      }, 10);
    } else {
      setAnimationClass('');
    }
    
    return () => {
      if (animationTimeout) clearTimeout(animationTimeout);
    };
  }, [showDurationTypeSelector]);
  
  // Close the bottom sheet with animation
  const closeBottomSheet = () => {
    setAnimationClass('');
    // Wait for animation to finish before hiding the component
    setTimeout(() => {
      setShowDurationTypeSelector(false);
    }, 300); // Match the animation duration (0.3s)
  };
  
  // Select duration type with animation
  const selectDurationType = (type) => {
    setLeaseDurationType(type);
    closeBottomSheet();
  };


  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    }
  }, [user, loading, router]);



  // Initialize Google Maps Autocomplete
  useEffect(() => {
    let checkGoogleMaps;
    let timeoutId;
    let placeChangedListener;
    
    const initializeAutocomplete = () => {
      try {
        if (window.google && 
            window.google.maps && 
            window.google.maps.places && 
            addressInputRef.current &&
            !autocompleteRef.current) {
          
          console.log('Initializing Google Maps Autocomplete');
          
          // Set the initial style for the input field
          if (addressInputRef.current) {
            addressInputRef.current.style.textAlign = 'left';
            addressInputRef.current.style.paddingLeft = '0';
          }
          
          // Force complete re-render of Google's CSS to ensure styles work
          const pacStyle = document.createElement('style');
          pacStyle.textContent = `
            .pac-container {
              z-index: 9999 !important;
              border-radius: 14px !important;
              border: 1px solid #D1E7D5 !important;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
              margin-top: 4px !important;
              font-family: 'Nunito', sans-serif !important;
              background-color: white !important;
              position: fixed !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
              width: 85% !important;
              max-width: 460px !important;
              max-height: 250px !important;
              overflow-y: auto !important;
            }
            .pac-logo:after { display: none !important; }
            .pac-item {
              padding: 10px 14px !important;
              cursor: pointer !important;
              display: flex !important;
              align-items: center !important;
              border-bottom: 1px solid #f0f0f0 !important;
              font-family: 'Nunito', sans-serif !important;
              height: auto !important;
              min-height: 42px !important;
            }
            .pac-item:last-child { border-bottom: none !important; }
            .pac-item:hover { background-color: #F6FEF7 !important; }
            .pac-item-selected, .pac-item-selected:hover { background-color: #F1FCF4 !important; }
            .pac-item-query {
              font-size: 13px !important;
              font-weight: 600 !important;
              color: #515964 !important;
              padding-right: 4px !important;
              font-family: 'Nunito', sans-serif !important;
            }
            .pac-matched { font-weight: 700 !important; color: #0B1420 !important; font-size: 13px !important; }
            .pac-item span { font-size: 13px !important; color: #515964 !important; }
            .pac-icon {
              display: block !important;
              background-image: url(https://maps.gstatic.com/mapfiles/api-3/images/autocomplete-icons.png) !important;
              background-size: contain !important;
              width: 16px !important;
              height: 16px !important;
              margin-right: 8px !important;
            }
            /* Fix the input field from jumping around */
            input.gm-style-input,
            .pac-target-input {
              text-align: left !important;
              padding-left: 0 !important;
              text-indent: 0 !important;
            }
            
            /* Additional fixes for the input when typing */
            div.pac-container ~ input,
            input.pac-target-input {
              text-align: left !important;
              padding-left: 0 !important;
              text-indent: 0 !important;
            }
            .pac-container .pac-icon {
              margin-top: 0 !important;
            }
            .pac-container .pac-item-query,
            .pac-container .pac-matched {
              position: relative !important;
              left: 0 !important;
              padding-left: 0 !important;
            }
            @media (max-width: 480px) {
              .pac-container { width: 85% !important; max-height: 220px !important; margin-top: 6px !important; }
              .pac-item { padding: 10px 12px !important; min-height: 38px !important; }
              .pac-item-query, .pac-item span, .pac-matched { font-size: 12px !important; }
              /* Remove duplicate entry */
            }
          `;
          document.head.appendChild(pacStyle);
          
          const options = {
            types: ['address'],
            fields: ['formatted_address', 'address_components', 'geometry'],
            componentRestrictions: { country: ['us', 'gb', 'ca', 'au'] },
            language: 'en'  // Explicitly set language to English
          };
          
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            addressInputRef.current,
            options
          );
          
          // Prevent Google from modifying the input styles
          // MutationObserver to watch for Google's style changes and revert them
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes' && addressInputRef.current) {
                if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
                  // Make sure the style remains as we want
                  addressInputRef.current.style.textAlign = 'left';
                  addressInputRef.current.style.paddingLeft = '0';
                  addressInputRef.current.style.textIndent = '0';
                }
              }
            });
          });
          
          // Store observer for cleanup
          if (!window.googleMapObservers) window.googleMapObservers = [];
          window.googleMapObservers.push(observer);
          
          // Start observing the input element for style and class changes
          if (addressInputRef.current) {
            observer.observe(addressInputRef.current, { 
              attributes: true, 
              attributeFilter: ['style', 'class'] 
            });
            
            // Ensure initial styles are applied
            addressInputRef.current.style.textAlign = 'left';
            addressInputRef.current.style.paddingLeft = '0';
            addressInputRef.current.style.textIndent = '0';
          }
          
          // Prevent form submission on enter key in autocomplete
          google.maps.event.addDomListener(addressInputRef.current, 'keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          });
          
          // Apply custom CSS to make sure the dropdown appears properly
          const applyCustomStyles = () => {
            const pacContainers = document.querySelectorAll('.pac-container');
            pacContainers.forEach(container => {
              // Ensure styles are applied with !important
              container.style.setProperty('z-index', '9999', 'important');
              container.style.setProperty('position', 'fixed', 'important');
              container.style.setProperty('left', '50%', 'important');
              container.style.setProperty('transform', 'translateX(-50%)', 'important');
              container.style.setProperty('width', '85%', 'important');
              container.style.setProperty('max-width', '460px', 'important');
              container.style.setProperty('border-radius', '14px', 'important');
              container.style.setProperty('border', '1px solid #D1E7D5', 'important');
              container.style.setProperty('background-color', 'white', 'important');
              container.style.setProperty('font-family', '"Nunito", sans-serif', 'important');
              container.style.setProperty('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.08)', 'important');
              container.style.setProperty('max-height', '250px', 'important');
              
              // Style all items inside container
              const items = container.querySelectorAll('.pac-item');
              items.forEach(item => {
                item.style.setProperty('padding', '10px 14px', 'important');
                item.style.setProperty('min-height', '42px', 'important');
                item.style.setProperty('border-bottom', '1px solid #f0f0f0', 'important');
              });
              
              // Style all text elements consistently
              const allTextElements = container.querySelectorAll('.pac-item-query, .pac-item span, .pac-matched');
              allTextElements.forEach(el => {
                el.style.setProperty('font-size', '13px', 'important');
                el.style.setProperty('color', '#515964', 'important');
                el.style.setProperty('font-family', '"Nunito", sans-serif', 'important');
              });
              
              // Set matched text differently
              const matchedTexts = container.querySelectorAll('.pac-matched');
              matchedTexts.forEach(el => {
                el.style.setProperty('font-weight', '700', 'important');
                el.style.setProperty('color', '#0B1420', 'important');
              });
              
              // Style the icons
              const icons = container.querySelectorAll('.pac-icon');
              icons.forEach(icon => {
                icon.style.setProperty('width', '16px', 'important');
                icon.style.setProperty('height', '16px', 'important');
                icon.style.setProperty('margin-right', '8px', 'important');
              });
            });
          };
          
          // Apply styles when dropdown opens and during typing
          addressInputRef.current.addEventListener('focus', () => {
            // Apply styles after a short delay to ensure Google's dropdown is rendered
            setTimeout(applyCustomStyles, 100);
          });
          
          addressInputRef.current.addEventListener('input', () => {
            // Maintain consistent style during typing
            if (addressInputRef.current) {
              addressInputRef.current.style.textAlign = 'left';
              addressInputRef.current.style.paddingLeft = '0';
              addressInputRef.current.style.textIndent = '0';
            }
            // Apply dropdown styles with each keystroke - use requestAnimationFrame for smoother updates
            requestAnimationFrame(applyCustomStyles);
            // And also double-check after a brief delay
            setTimeout(applyCustomStyles, 10);
          });
          
          // Also handle keydown/keyup events for additional stability
          ['keydown', 'keyup', 'keypress'].forEach(eventType => {
            addressInputRef.current.addEventListener(eventType, () => {
              if (addressInputRef.current) {
                addressInputRef.current.style.textAlign = 'left';
                addressInputRef.current.style.paddingLeft = '0';
                addressInputRef.current.style.textIndent = '0';
              }
            });
          });
          
          // Additional listener for Google's dropdown changes
          const dropdownObserver = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
              if (mutation.addedNodes.length) {
                // Apply styles when new DOM nodes are added (like when dropdown appears)
                applyCustomStyles();
              }
            }
          });
          dropdownObserver.observe(document.body, { childList: true, subtree: true });
          
          setGoogleMapsLoaded(true);
          
          placeChangedListener = autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            
            if (place && place.formatted_address) {
              const newAddress = place.formatted_address;
              console.log('Google Maps selected:', newAddress);
              
              // Update state and ref value
              setAddress(newAddress);
              googleSelectedAddressRef.current = newAddress;
              
              // Focus the next field (unitNumber) after selecting an address
              setTimeout(() => {
                const unitNumberInput = document.querySelector('input[placeholder="Unit number"]');
                if (unitNumberInput) unitNumberInput.focus();
              }, 100);
            }
          });
          
          console.log('Google Maps Autocomplete initialized successfully');
          
          if (checkGoogleMaps) clearInterval(checkGoogleMaps);
          if (timeoutId) clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('Error initializing Google Maps Autocomplete:', error);
      }
    };
    
    // Delay initialization slightly
    timeoutId = setTimeout(() => {
      initializeAutocomplete();
      
      if (!autocompleteRef.current) {
        checkGoogleMaps = setInterval(initializeAutocomplete, 200);
        
        setTimeout(() => {
          if (checkGoogleMaps) clearInterval(checkGoogleMaps);
          console.log('Google Maps loading timeout');
        }, 10000);
      }
    }, 100);
    
    return () => {
      if (checkGoogleMaps) clearInterval(checkGoogleMaps);
      if (timeoutId) clearTimeout(timeoutId);
      
      if (placeChangedListener) {
        try {
          window.google.maps.event.removeListener(placeChangedListener);
        } catch (error) {
          console.error('Error clearing Google Maps listeners:', error);
        }
      }
      
      if (autocompleteRef.current && window.google && window.google.maps && window.google.maps.event) {
        try {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        } catch (error) {
          console.error('Error clearing Google Maps listeners:', error);
        }
      }
      
      // Remove any dynamically added style elements
      const pacStyles = document.querySelectorAll('style');
      pacStyles.forEach(style => {
        if (style.textContent.includes('.pac-container')) {
          style.remove();
        }
      });
      
      // Remove any MutationObservers we created
      try {
        // Any observers that were created will be stopped
        if (window.googleMapObservers) {
          window.googleMapObservers.forEach(observer => observer.disconnect());
          window.googleMapObservers = [];
        }
      } catch (error) {
        console.error('Error cleaning up observers:', error);
      }
    };
  }, [address]);

  // Check if user already has a property
  useEffect(() => {
    const checkExistingProperty = async () => {
      if (user && !loading) {
        try {
          const response = await apiService.properties.getAll();
          if (response.data && response.data.length > 0) {
            // User already has a property, redirect to property details
            const propertyId = response.data[0].id;
            router.push(`/properties/details?propertyId=${propertyId}`);
          }
        } catch (error) {
          console.error('Error checking existing properties:', error);
        }
      }
    };

    checkExistingProperty();
  }, [user, loading, router]);

  // Calculate end date based on start date and lease duration
  const calculateEndDate = (startDate, duration, durationType) => {
    if (!startDate || !duration) return '';
    
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return '';
    
    const end = new Date(start);
    if (durationType === 'weeks') {
      // Add weeks (7 days per week)
      end.setDate(end.getDate() + (parseInt(duration) * 7));
    } else if (durationType === 'months') {
      end.setMonth(end.getMonth() + parseInt(duration));
    } else {
      end.setFullYear(end.getFullYear() + parseInt(duration));
    }
    
    // Format as YYYY-MM-DD
    return end.toISOString().split('T')[0];
  };

  // Compress image function
  const compressImage = async (file, maxWidth = 1920, maxHeight = 1920, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      try {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
          console.log('[DEBUG] Not an image file, returning original');
          resolve(file);
          return;
        }

        const reader = new FileReader();
        
        reader.onload = (event) => {
          const img = new Image();
          
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              // Calculate new dimensions
              if (width > height) {
                if (width > maxWidth) {
                  height = Math.round((height * maxWidth) / width);
                  width = maxWidth;
                }
              } else {
                if (height > maxHeight) {
                  width = Math.round((width * maxHeight) / height);
                  height = maxHeight;
                }
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);

              // Try different quality levels if needed
              let currentQuality = quality;
              const tryCompress = () => {
                canvas.toBlob(
                  (blob) => {
                    if (blob) {
                      // Check if compressed size is reasonable
                      if (blob.size > 3 * 1024 * 1024 && currentQuality > 0.3) {
                        // Still too large, try lower quality
                        currentQuality -= 0.1;
                        console.log(`[DEBUG] Image still large (${(blob.size / 1024 / 1024).toFixed(2)}MB), trying quality ${currentQuality}`);
                        tryCompress();
                      } else {
                        // Create a new File object with the compressed blob
                        const compressedFile = new File([blob], file.name, {
                          type: 'image/jpeg',
                          lastModified: Date.now()
                        });
                        console.log(`[DEBUG] Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
                        resolve(compressedFile);
                      }
                    } else {
                      console.error('[ERROR] Canvas toBlob failed');
                      resolve(file); // Return original file if compression fails
                    }
                  },
                  'image/jpeg',
                  currentQuality
                );
              };
              
              tryCompress();
            } catch (error) {
              console.error('[ERROR] Canvas processing failed:', error);
              resolve(file); // Return original file if processing fails
            }
          };
          
          img.onerror = () => {
            console.error('[ERROR] Image load failed');
            resolve(file); // Return original file if image load fails
          };
          
          img.src = event.target.result;
        };
        
        reader.onerror = () => {
          console.error('[ERROR] File read failed');
          resolve(file); // Return original file if read fails
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('[ERROR] Compression setup failed:', error);
        resolve(file); // Return original file if any error occurs
      }
    });
  };

  // Handle file selection - support multiple files
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    
    for (const file of files) {
      console.log(`[DEBUG] Processing file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB, type: ${file.type}`);
      
      let processedFile = file;
      
      // Check if it's an image that needs compression
      if (file.type.startsWith('image/')) {
        // Check for HEIC format
        const isHEIC = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic');
        
        // Compress images larger than 2MB or HEIC format
        if (file.size > 2 * 1024 * 1024 || isHEIC) {
          console.log('[DEBUG] Compressing/converting image...');
          try {
            processedFile = await compressImage(file);
            console.log(`[DEBUG] Processed file size: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
          } catch (error) {
            console.error('[ERROR] Failed to compress image:', error);
            // Continue with original file
          }
        }
      }
      
      // No size limit check since we're compressing
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(processedFile.type) && !processedFile.type.startsWith('image/')) {
        alert(`${file.name} is not a supported file type (PDF, JPG, PNG) and will be skipped`);
        continue;
      }
      
      validFiles.push(processedFile);
    }
    
    if (validFiles.length > 0) {
      setLeaseDocuments(prevDocs => [...prevDocs, ...validFiles]);
      console.log('Lease documents selected:', validFiles.map(f => f.name).join(', '));
    }
  };
  
  // Remove a selected file
  const removeDocument = (index) => {
    setLeaseDocuments(prevDocs => prevDocs.filter((_, i) => i !== index));
  };

  // Handle take photo
  const handleTakePhoto = () => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.capture = 'environment';
      
      fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          try {
            console.log(`[DEBUG] Photo taken: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            
            let processedFile = file;
            const isHEIC = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic');
            
            if (file.size > 2 * 1024 * 1024 || isHEIC) {
              console.log('[DEBUG] Compressing photo...');
              processedFile = await compressImage(file);
              console.log(`[DEBUG] Compressed size: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
            }
            
            setLeaseDocuments(prevDocs => [...prevDocs, processedFile]);
          } catch (error) {
            console.error('[ERROR] Failed to process photo:', error);
            alert('Failed to process photo. Please try again.');
          }
        }
      };
      
      fileInput.click();
    } catch (error) {
      console.error('[ERROR] Error accessing camera:', error);
    }
    
    setShowPhotoOptions(false);
  };

  // Handle choose from gallery
  const handleChooseFromGallery = () => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*,application/pdf';
      fileInput.multiple = true;
      
      fileInput.onchange = async (event) => {
        await handleFileChange(event);
      };
      
      fileInput.click();
    } catch (error) {
      console.error('[ERROR] Error accessing gallery:', error);
    }
    
    setShowPhotoOptions(false);
  };

  // Photo Options Modal Component
  const PhotoOptionsModal = ({ show, onClose, onTakePhoto, onChooseFromGallery }) => {
    const [animationClass, setAnimationClass] = useState('');
    
    useEffect(() => {
      if (show) {
        // Small delay to trigger animation
        setTimeout(() => {
          setAnimationClass('animate-in');
        }, 10);
      }
    }, [show]);
    
    const handlePhotoOption = (callback) => {
      handleClose();
      setTimeout(() => {
        callback();
      }, 350);
    };
    
    const handleClose = () => {
      setAnimationClass('');
      // Wait for animation to finish before closing
      setTimeout(() => {
        onClose();
      }, 300);
    };
    
    if (!show && !animationClass) {
      return null;
    }
    
    return (
      <div className="fixed inset-0 z-50">
        {/* Overlay with fade animation */}
        <div 
          className={`absolute inset-0 bg-black bg-opacity-50 bottom-sheet-overlay ${animationClass}`}
          onClick={handleClose}
        ></div>
        
        {/* Bottom Sheet */}
        <div className={`absolute bottom-0 left-0 right-0 w-full h-[217px] bg-white rounded-t-[24px] overflow-hidden bottom-sheet ${animationClass} safe-area-bottom`}>
          {/* Handle Bar */}
          <div className="flex justify-center items-center pt-[10px] pb-0">
            <div className="w-[95px] h-[6px] bg-[#ECECEC] rounded-[24px]"></div>
          </div>
          
          {/* Title */}
          <div className="flex justify-center items-center h-[55px]">
            <h3 className="font-bold text-[18px] leading-[25px] text-[#0B1420]">
              Add a Document
            </h3>
          </div>
          
          {/* Photo Options */}
          <div className="w-full max-w-[350px] mx-auto">
            {/* Take a Photo Option */}
            <div 
              className="flex flex-row items-center h-[56px] border-b border-[#ECF0F5] px-5 py-[16px] hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              onClick={() => {
                handlePhotoOption(onTakePhoto);
              }}
            >
              <div className="flex flex-row items-center gap-[12px]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.76 22H17.24C20 22 21.1 20.31 21.23 18.25L21.75 9.99C21.89 7.83 20.17 6 18 6C17.39 6 16.83 5.65 16.55 5.11L15.83 3.66C15.37 2.75 14.17 2 13.15 2H10.86C9.83 2 8.63 2.75 8.17 3.66L7.45 5.11C7.17 5.65 6.61 6 6 6C3.83 6 2.11 7.83 2.25 9.99L2.77 18.25C2.89 20.31 4 22 6.76 22Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.5 8H13.5" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18C13.79 18 15.25 16.54 15.25 14.75C15.25 12.96 13.79 11.5 12 11.5C10.21 11.5 8.75 12.96 8.75 14.75C8.75 16.54 10.21 18 12 18Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                  Take a Photo
                </div>
              </div>
            </div>
            
            {/* Choose From Gallery Option */}
            <div 
              className="flex flex-row items-center h-[56px] px-5 py-[16px] hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              onClick={() => {
                handlePhotoOption(onChooseFromGallery);
              }}
            >
              <div className="flex flex-row items-center gap-[12px]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.67 18.95L7.6 15.64C8.39 15.11 9.53 15.17 10.24 15.78L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                  Choose From Gallery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Always perform validation
    // Clear previous errors
    setErrors({
      propertyName: '',
      address: '',
      unitNumber: '',
      depositAmount: '',
      contractStartDate: '',
      leaseDuration: '',
      moveInDate: ''
    });

    // Validate required fields
    let hasErrors = false;
    const newErrors = {};
    
    if (!propertyName) {
      newErrors.propertyName = 'Please enter a property name';
      hasErrors = true;
    }
    
    const finalAddress = addressInputRef.current ? addressInputRef.current.value : address;
    if (!finalAddress) {
      newErrors.address = 'Please enter an address';
      hasErrors = true;
    }
    
    // Unit number is now optional, so we don't validate it
    
    if (!depositAmount) {
      newErrors.depositAmount = 'Please enter deposit amount';
      hasErrors = true;
    }
    
    if (!contractStartDate) {
      newErrors.contractStartDate = 'Please enter contract start date';
      hasErrors = true;
    }
    
    if (!leaseDuration) {
      newErrors.leaseDuration = 'Please enter lease duration';
      hasErrors = true;
    }
    
    if (!moveInDate) {
      newErrors.moveInDate = 'Please enter move-in date';
      hasErrors = true;
    }
    
    // Date validation: Move-in date cannot be before lease start date
    if (contractStartDate && moveInDate) {
      const leaseStart = new Date(contractStartDate);
      const moveIn = new Date(moveInDate);
      
      if (moveIn < leaseStart) {
        newErrors.moveInDate = 'Move-in date cannot be before lease start date';
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate contract end date
      const calculatedEndDate = calculateEndDate(
        contractStartDate,
        leaseDuration,
        leaseDurationType
      );

      // Create a reusable data object for both localStorage and API
      const formData = {
        propertyName,
        address,
        unitNumber,
        depositAmount,
        moveInDate,
        contractStartDate,
        calculatedEndDate,
        leaseDuration,
        leaseDurationType,
        bathrooms,
        livingRooms,
        kitchenCount,
        squareFootage,
        yearBuilt,
        parkingSpaces,
        leaseDocuments: leaseDocuments.map(doc => doc.name)
      };

      // Just use the state value for consistency
      const finalAddress = address;
      
      // Prepare property data for API
      const propertyData = {
        address: finalAddress, // Use the current input value
        description: propertyName, // This is the property name/nickname
        property_type: 'apartment', // Default property type
        unit_number: unitNumber, // Store unit number in separate field
        
        // Debug info
        _debug_info: 'unit_number should be saved separately from property_type',
        role_at_this_property: 'renter',
        deposit_amount: depositAmount,
        move_in_date: moveInDate,
        contract_start_date: contractStartDate,
        contract_end_date: calculatedEndDate,
        lease_duration: leaseDuration,
        lease_duration_type: leaseDurationType,
        bathrooms,
        living_rooms: livingRooms,
        kitchen_count: kitchenCount,
        square_footage: squareFootage,
        year_built: yearBuilt,
        parking_spaces: parkingSpaces,
        // Initialize lease document fields as null
        lease_document_url: null,
        lease_document_name: null,
        // Mark as incomplete for tracking
        setup_completed: false,
        created_at: new Date().toISOString()
      };

      // Remove fields that might cause issues with the current database schema
      // We'll add them back when the schema is updated
      const safePropertyData = { ...propertyData };
      delete safePropertyData.bathrooms;
      delete safePropertyData.living_rooms;
      delete safePropertyData.square_footage;
      delete safePropertyData.year_built;
      delete safePropertyData.parking_spaces;

      // Make sure unit_number is included in the safe data
      if (unitNumber) {
        safePropertyData.unit_number = unitNumber;
      }
      
      // If we have lease documents, mark that we have documents pending
      if (leaseDocuments.length > 0) {
        // We'll add the URLs after upload, but mark that we have documents pending
        safePropertyData.lease_document_name = leaseDocuments.map(doc => doc.name).join(', ');
      }
      
      console.log('Creating incomplete property that will be completed later:', safePropertyData);
      
      // Submit the property data
      const response = await apiService.properties.create(safePropertyData);
      
      // If we have lease documents, upload them
      if (leaseDocuments.length > 0) {
        try {
          const uploadedDocuments = [];
          const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
          const apiUrl = isProduction ? 'https://api.tenantli.ai' : 'http://localhost:5050';
          const token = localStorage.getItem('token');
          const axios = (await import('axios')).default;
          
          // Upload each document with retry mechanism
          let uploadedCount = 0;
          let failedUploads = [];
          
          for (let i = 0; i < leaseDocuments.length; i++) {
            const document = leaseDocuments[i];
            let retryCount = 0;
            const maxRetries = 3;
            let uploadSuccess = false;
            
            while (retryCount < maxRetries && !uploadSuccess) {
              try {
                console.log(`[DEBUG] Uploading document ${i+1}/${leaseDocuments.length}: ${document.name}, size: ${(document.size / 1024 / 1024).toFixed(2)}MB`);
                
                // Additional compression for large images
                let fileToUpload = document;
                if (document.type.startsWith('image/') && document.size > 3 * 1024 * 1024) {
                  console.log('[DEBUG] Document still large, applying additional compression');
                  fileToUpload = await compressImage(document, 1280, 1280, 0.6);
                  console.log(`[DEBUG] Compressed to: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
                }
                
                const fileFormData = new FormData();
                fileFormData.append('file', fileToUpload);
                fileFormData.append('propertyId', response.data.id);
                fileFormData.append('fileType', 'lease');
                
                console.log(`[DEBUG] Upload attempt ${retryCount + 1} to: ${apiUrl}/api/files/upload`);
                
                // Create a timeout promise (30 seconds)
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Upload timeout')), 30000)
                );
                
                // Race between upload and timeout
                const uploadPromise = axios.post(
                  `${apiUrl}/api/files/upload`, 
                  fileFormData,
                  {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                      'Authorization': `Bearer ${token}`
                    },
                    onUploadProgress: (progressEvent) => {
                      // Calculate overall progress
                      const fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                      const overallProgress = Math.round(((i * 100) + fileProgress) / leaseDocuments.length);
                      setUploadProgress(overallProgress);
                    }
                  }
                );
                
                const uploadResponse = await Promise.race([uploadPromise, timeoutPromise]);
                
                if (uploadResponse.data && uploadResponse.data.fileUrl) {
                  uploadedDocuments.push({
                    url: uploadResponse.data.fileUrl,
                    name: uploadResponse.data.originalName || document.name
                  });
                  uploadSuccess = true;
                  uploadedCount++;
                  console.log(`[DEBUG] Document ${i+1} uploaded successfully`);
                }
              } catch (fileUploadError) {
                retryCount++;
                console.error(`[ERROR] Failed to upload document ${document.name} (attempt ${retryCount}):`, fileUploadError);
                console.error('[ERROR] Upload error details:', {
                  message: fileUploadError.message,
                  status: fileUploadError.response?.status,
                  data: fileUploadError.response?.data
                });
                
                if (retryCount < maxRetries) {
                  console.log(`[DEBUG] Retrying upload in ${retryCount} seconds...`);
                  await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
                } else {
                  console.error(`[ERROR] Upload failed after ${maxRetries} attempts`);
                  failedUploads.push({
                    name: document.name,
                    error: fileUploadError.message
                  });
                }
              }
            }
          }
          
          // Show error only if there were failures
          if (failedUploads.length > 0) {
            console.error('[ERROR] Some uploads failed:', failedUploads);
            alert(`Failed to upload ${failedUploads.length} document(s). You can try uploading them again later.`);
          }
          
          // Log success silently for debugging
          if (uploadedCount > 0) {
            console.log(`[DEBUG] ${uploadedCount} documents uploaded successfully`);
          }
          
          setUploadStatus('success');
          
          // Store the uploaded documents info
          if (uploadedDocuments.length > 0) {
            try {
              // Update property with lease documents info
              const updatePayload = {
                lease_document_url: uploadedDocuments.map(doc => doc.url).join(','),
                lease_document_name: uploadedDocuments.map(doc => doc.name).join(', ')
              };
              
              await apiService.properties.update(response.data.id, updatePayload);
              console.log('Lease documents info updated successfully');
            } catch (updateError) {
              console.error('Error updating property with lease URLs:', updateError);
              
              // Store lease documents info in localStorage as a fallback
              try {
                const leaseDocumentsInfo = {
                  documents: uploadedDocuments,
                  uploadedAt: new Date().toISOString()
                };
                
                localStorage.setItem(`property_${response.data.id}_lease_documents`, JSON.stringify(leaseDocumentsInfo));
                console.log('Lease documents info saved to localStorage as fallback');
              } catch (storageError) {
                console.error('Failed to save lease documents info to localStorage:', storageError);
              }
            }
          }
        } catch (uploadError) {
          console.error('Error uploading lease documents:', uploadError);
          setUploadStatus('error');
          setUploadProgress(0);
          alert('Property created but some lease documents failed to upload. You can upload them later.');
        }
      }

      // Store all form data in localStorage with the proper property ID
      try {
        const propertyId = response.data.id;
        const addUnitKey = `property_${propertyId}_addunit`;
        localStorage.setItem(addUnitKey, JSON.stringify(formData));
        console.log(`Saved addunit data to localStorage with key: ${addUnitKey}`);

        // Mark property as incomplete in localStorage for cleanup tracking
        localStorage.setItem(`property_${propertyId}_incomplete`, 'true');
        console.log('Property marked as incomplete for cleanup tracking');
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
        // Continue even if localStorage fails
      }

      // Navigate to the page for adding rooms
      router.push(`/properties/${response.data.id}/add-rooms`);
    } catch (error) {
      console.error('Property creation error:', error);
      
      // Check if the error is because user already has a property
      if (error.response && error.response.data && error.response.data.message && 
          error.response.data.message.includes('already have a property')) {
        
        // Extract the existing property ID if provided
        const existingPropertyId = error.response.data.existingPropertyId;
        if (existingPropertyId) {
          // Redirect to the existing property
          router.push(`/properties/details?propertyId=${existingPropertyId}`);
        } else {
          // Otherwise redirect to main page which will show the property
          router.push('/');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-[#FBF5DA] overflow-hidden overflow-x-hidden">
      <Head>
        <title>Add Home - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="description" content="Add your rental property details and manage your home with tenantli" />
        <link rel="manifest" href="/manifest.json" />
        {/* CSP meta tag can cause issues with Google Maps, removing it */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
          
          * {
            box-sizing: border-box;
          }
          
          body {
            background-color: #FBF5DA;
            margin: 0;
            padding: 0;
            width: 100%;
            font-family: 'Nunito', sans-serif;
            overflow: hidden;
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
            user-select: none;
            -webkit-user-select: none;
          }
          
          html {
            position: fixed;
            overflow: hidden;
            overflow-x: hidden;
            width: 100%;
            height: 100%;
          }
          
          :root {
            --safe-area-top: env(safe-area-inset-top, 20px);
            --safe-area-bottom: env(safe-area-inset-bottom, 20px);
          }
          
          .safe-area-top {
            padding-top: var(--safe-area-top);
          }
          
          .safe-area-bottom {
            padding-bottom: var(--safe-area-bottom);
          }
          
          /* Mobile-first responsive design */
          @media (max-width: 390px) {
            .form-container {
              padding: 0 16px;
            }
            
            input, select {
              font-size: 16px !important; /* Prevent zoom on iOS */
            }
          }
          
          @media (min-width: 768px) {
            body {
              display: flex;
              justify-content: center;
              align-items: center;
            }
          }
          
          /* Reset all Google Autocomplete styles */
          .pac-container {
            z-index: 9999 !important;
            border-radius: 14px !important;
            border: 1px solid #D1E7D5 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
            margin-top: 4px !important;
            font-family: 'Nunito', sans-serif !important;
            background-color: white !important;
            transform: none !important;
            max-height: 250px !important;
            overflow-y: auto !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 85% !important;
            max-width: 460px !important;
          }
          
          .pac-logo:after {
            display: none !important;
          }
          
          .pac-icon {
            display: block !important;
            background-image: url(https://maps.gstatic.com/mapfiles/api-3/images/autocomplete-icons.png) !important;
            background-size: contain !important;
            background-position: center !important;
            width: 16px !important;
            height: 16px !important;
            margin-right: 8px !important;
          }
          
          .pac-item {
            padding: 10px 14px !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            border-bottom: 1px solid #f0f0f0 !important;
            font-family: 'Nunito', sans-serif !important;
            height: auto !important;
            min-height: 42px !important;
          }
          
          .pac-item:hover {
            background-color: #F6FEF7 !important;
          }
          
          .pac-item:last-child {
            border-bottom: none !important;
          }
          
          .pac-item-query {
            font-size: 13px !important;
            font-weight: 600 !important;
            color: #515964 !important;
            padding-right: 4px !important;
            font-family: 'Nunito', sans-serif !important;
          }
          
          /* Ensure all spans in pac-items are consistent */
          .pac-item span {
            font-size: 13px !important;
            font-family: 'Nunito', sans-serif !important;
            color: #515964 !important;
          }
          
          .pac-matched {
            font-weight: 700 !important;
            color: #0B1420 !important;
            font-size: 13px !important;
          }
          
          .pac-item-selected,
          .pac-item-selected:hover {
            background-color: #F1FCF4 !important;
          }
          
          /* Additional styles for ensuring visibility */
          .pac-container.pac-logo {
            position: fixed !important;
            top: auto !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 85% !important;
            max-width: 460px !important;
          }
          
          /* Mobile optimizations */
          @media (max-width: 480px) {
            .pac-container {
              width: 85% !important;
              max-height: 220px !important;
              -webkit-overflow-scrolling: touch !important;
              margin-top: 6px !important;
            }
            
            .pac-item {
              padding: 10px 12px !important;
              min-height: 38px !important;
            }
            
            .pac-item-query, .pac-item span, .pac-matched {
              font-size: 12px !important;
            }
          }
          
          /* Hide scrollbar for all browsers */
          ::-webkit-scrollbar {
            display: none;
            width: 0 !important;
          }
          
          /* Hide scrollbar for Firefox */
          * {
            scrollbar-width: none;
          }
          
          /* Hide scrollbar for IE, Edge */
          * {
            -ms-overflow-style: none;
          }
          
          /* Ensure scrollable content on mobile */
          .scrollable-form {
            -webkit-overflow-scrolling: touch;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          
          /* Additional mobile-specific scrollbar hiding */
          @media (max-width: 768px) {
            body, html {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            
            body::-webkit-scrollbar,
            html::-webkit-scrollbar {
              display: none;
              width: 0 !important;
            }
            
            .scrollable-form::-webkit-scrollbar {
              display: none;
              width: 0 !important;
            }
          }
          
          /* Hide all elements in date input */
          input[type="date"] {
            color: transparent;
          }
          input[type="date"]::-webkit-datetime-edit,
          input[type="date"]::-webkit-inner-spin-button,
          input[type="date"]::-webkit-calendar-picker-indicator {
            appearance: none;
            -webkit-appearance: none;
            display: none;
          }
          
          /* Remove spinners for number inputs */
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
          
          /* Custom styling for select dropdown */
          select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-color: transparent;
            width: 100%;
            font-size: 14px;
            font-weight: bold;
            color: #515964;
            cursor: pointer;
            padding-right: 20px; /* Make room for custom arrow */
          }
          
          /* Hide default arrow in IE */
          select::-ms-expand {
            display: none;
          }
          
          /* Make the select element fill the entire parent container for better tap target */
          .select-container {
            position: relative;
            width: 100%;
            height: 100%;
          }
          
          /* Show dropdown on tap/click */
          select:focus {
            outline: none;
          }
          
          /* Animation for the bottom sheet */
          .bottom-sheet-overlay {
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
          }
          
          .bottom-sheet-overlay.visible,
          .bottom-sheet-overlay.animate-in {
            opacity: 1;
          }
          
          .bottom-sheet {
            transform: translateY(100%);
            transition: transform 0.3s ease-in-out;
          }
          
          .bottom-sheet.visible,
          .bottom-sheet.animate-in {
            transform: translateY(0);
          }
        `}</style>
      </Head>
      
      <div className="w-full h-full max-w-[500px] relative bg-[#FBF5DA] overflow-hidden overflow-x-hidden">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-[#FBF5DA] z-20">
          <div className="w-full max-w-[390px] mx-auto">
            <div className="flex flex-row items-center px-[20px] h-[65px] gap-[10px]" style={{ paddingTop: 'env(safe-area-inset-top, 20px)' }}>
              <button 
                className="relative z-50 w-10 h-10 flex items-center justify-center -ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push('/');
                }}
                aria-label="Go back"
              >
                <ArrowLeftIcon />
              </button>
              <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
                Add Home
              </h1>
            </div>
          </div>
        </div>
        
        {/* Form - Scrollable content */}
        <div className="h-full pt-[85px] pb-[120px] overflow-y-scroll overflow-x-hidden scrollable-form" style={{scrollbarWidth: "none", msOverflowStyle: "none", WebkitScrollbar: {display: "none", width: 0}}}>
          <form onSubmit={handleSubmit} className="w-full px-5 pb-32 form-container" onKeyDown={handleEnterKey}>
            {/* Add your home details section */}
            <div className="w-full mt-4 mb-6">
              <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420]">
                Add your home details 🏡
              </h2>
            </div>
          
            {/* Property Name Input */}
            <div className="mb-4">
              <div className={`box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] ${
                errors.propertyName ? 'bg-red-50 border-red-300' : 'bg-white border-[#D1E7D5]'
              } border rounded-[16px] hover:border-[#A8D5B8] transition-all duration-200`}>
                <div className="flex-shrink-0 min-w-[20px]">
                  <HomeIcon />
                </div>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => {
                    setPropertyName(e.target.value);
                    setErrors(prev => ({ ...prev, propertyName: '' }));
                  }}
                  placeholder="What should we call this place?"
                  className="flex-1 h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none placeholder-[#A0A0A0]"
                  required
                />
              </div>
              <InputError message={errors.propertyName} />
            </div>
          
            {/* Address Input with Google Autocomplete */}
            <div className="mb-4">
              <div className={`box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] ${
                errors.address ? 'bg-red-50 border-red-300' : 'bg-white border-[#D1E7D5]'
              } border rounded-[16px] hover:border-[#A8D5B8] transition-all duration-200`}>
              <div className="flex-shrink-0 min-w-[20px]">
                <LocationIcon />
              </div>
              <input
                ref={addressInputRef}
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setErrors(prev => ({ ...prev, address: '' }));
                  
                  // Apply styles immediately on each keystroke
                  requestAnimationFrame(() => {
                    if (addressInputRef.current) {
                      // Force text alignment and styles
                      addressInputRef.current.style.textAlign = 'left';
                      addressInputRef.current.style.paddingLeft = '0';
                      
                      // Style the autocomplete dropdown each time text changes
                      const pacContainers = document.querySelectorAll('.pac-container');
                      pacContainers.forEach(container => {
                        container.style.setProperty('z-index', '9999', 'important');
                        container.style.setProperty('position', 'fixed', 'important');
                        container.style.setProperty('left', '50%', 'important');
                        container.style.setProperty('transform', 'translateX(-50%)', 'important');
                        container.style.setProperty('width', '85%', 'important');
                        container.style.setProperty('max-width', '460px', 'important');
                      });
                    }
                  });
                  
                  // Double check after a brief delay
                  setTimeout(() => {
                    if (addressInputRef.current) {
                      addressInputRef.current.style.textAlign = 'left';
                    }
                  }, 10);
                }}
                onFocus={() => {
                  // Ensure the input's style remains consistent when focused
                  if (addressInputRef.current) {
                    addressInputRef.current.style.textAlign = 'left';
                    addressInputRef.current.style.paddingLeft = '0';
                  }
                  
                  // Apply styles on focus
                  setTimeout(() => {
                    const pacContainers = document.querySelectorAll('.pac-container');
                    pacContainers.forEach(container => {
                      Object.assign(container.style, {
                        zIndex: '9999 !important',
                        position: 'fixed !important',
                        left: '50% !important',
                        transform: 'translateX(-50%) !important',
                        width: '85% !important',
                        maxWidth: '460px !important',
                        borderRadius: '14px !important',
                        maxHeight: '250px !important',
                        backgroundColor: 'white !important'
                      });
                      
                      // Style the dropdown items too
                      const items = container.querySelectorAll('.pac-item');
                      items.forEach(item => {
                        item.style.padding = '10px 14px';
                        item.style.minHeight = '42px';
                      });
                      
                      const queries = container.querySelectorAll('.pac-item-query');
                      queries.forEach(query => {
                        query.style.fontSize = '14px';
                        query.style.color = '#515964';
                      });
                    });
                  }, 100);
                }}
                onBlur={(e) => {
                  // If we have a Google selected address in the ref, prioritize it
                  if (googleSelectedAddressRef.current) {
                    setAddress(googleSelectedAddressRef.current);
                  } else {
                    setAddress(e.target.value);
                  }
                  setErrors(prev => ({ ...prev, address: '' }));
                }}
                onInput={() => {
                  // Ensure the input's style remains consistent during typing
                  if (addressInputRef.current) {
                    addressInputRef.current.style.textAlign = 'left';
                    addressInputRef.current.style.paddingLeft = '0';
                  }
                }}
                placeholder="Where is this located?"
                className="flex-1 h-auto min-h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none placeholder-[#A0A0A0] text-left"
                style={{textAlign: 'left', paddingLeft: 0}}
                required
                autoComplete="off"
                spellCheck="false"
              />
            </div>
              <InputError message={errors.address} />
            </div>
          
            {/* Unit Number Input */}
            <div className="mb-6">
              <div className={`box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] ${
                errors.unitNumber ? 'bg-red-50 border-red-300' : 'bg-white border-[#D1E7D5]'
              } border rounded-[16px] hover:border-[#A8D5B8] transition-all duration-200`}>
              <div className="flex-shrink-0 min-w-[20px]">
                <HouseIcon />
              </div>
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => {
                  setUnitNumber(e.target.value);
                  setErrors(prev => ({ ...prev, unitNumber: '' }));
                }}
                placeholder="Unit number (optional)"
                className="flex-1 h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none placeholder-[#A0A0A0]"
              />
            </div>
              <InputError message={errors.unitNumber} />
            </div>
          
            {/* Lease Details Section */}
            <div className="w-full mb-4">
              <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420]">
                Lease Details 📂
              </h2>
            </div>
          
            {/* Lease Duration */}
            <div className="flex flex-col items-start gap-[8px] w-full mb-4">
              <div className="w-full font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Lease Duration
              </div>
            
            {/* Lease Duration Inputs */}
            <div className="w-full">
              <div className="w-full flex flex-row gap-[10px]">
                {/* Duration Input - equal width */}
                <div className={`box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-1/2 h-[56px] ${
                  errors.leaseDuration ? 'bg-red-50 border-red-300' : 'bg-white border-[#D1E7D5]'
                } border rounded-[16px] hover:border-[#A8D5B8] transition-all duration-200`}>
                  <div className="flex-shrink-0 min-w-[20px]">
                    <ClockIcon />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={leaseDuration}
                    onChange={(e) => {
                      setLeaseDuration(e.target.value.replace(/[^0-9]/g, ''));
                      setErrors(prev => ({ ...prev, leaseDuration: '' }));
                    }}
                    placeholder="Duration"
                    className="flex-1 h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none placeholder-[#A0A0A0]"
                  />
                </div>
              
              {/* Duration Type Select - equal width */}
              <div className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-1/2 h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] hover:border-[#A8D5B8] transition-all duration-200">
                <div className="flex-shrink-0 min-w-[20px]">
                  <ClockIcon />
                </div>
                <div 
                  className="flex-1 relative cursor-pointer"
                  onClick={() => setShowDurationTypeSelector(true)}
                >
                  {/* Visual representation of select (always visible) */}
                  <div className="font-bold text-[14px] leading-[19px] text-[#515964]">
                    {leaseDurationType === 'weeks' 
                      ? 'Weeks' 
                      : leaseDurationType === 'months'
                        ? 'Months'
                        : 'Years'}
                  </div>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.6666 1.16667L5.99998 5.83334L1.33331 1.16667" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              </div>
              <InputError message={errors.leaseDuration} />
            </div>
            </div>
          
            {/* Contract Start Date */}
            <div className="mb-4">
              <div onClick={() => document.getElementById('contract-start-date').showPicker()} className={`box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] ${
                errors.contractStartDate ? 'bg-red-50 border-red-300' : 'bg-white border-[#D1E7D5]'
              } border rounded-[16px] relative cursor-pointer hover:border-[#A8D5B8] transition-all duration-200`}>
              <div className="flex-shrink-0 min-w-[20px]">
                <CalendarIcon />
              </div>
              <div className="relative flex-1">
                <div className="absolute left-0 text-[#A0A0A0] text-[14px] leading-[19px] font-bold">
                  {!contractStartDate ? "Lease start date" : contractStartDate}
                </div>
                <input
                  type="date"
                  id="contract-start-date"
                  value={contractStartDate}
                  onChange={(e) => {
                    setContractStartDate(e.target.value);
                    setErrors(prev => ({ ...prev, contractStartDate: '' }));
                    // Also check if move-in date is valid now
                    if (moveInDate && e.target.value) {
                      const leaseStart = new Date(e.target.value);
                      const moveIn = new Date(moveInDate);
                      if (moveIn >= leaseStart) {
                        setErrors(prev => ({ ...prev, moveInDate: '' }));
                      }
                    }
                  }}
                  className="w-full h-[19px] opacity-0 z-10 cursor-pointer"
                />
              </div>
            </div>
              <InputError message={errors.contractStartDate} />
            </div>
          
            {/* Move In Date */}
            <div className="mb-4">
              <div onClick={() => document.getElementById('move-in-date').showPicker()} className={`box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] ${
                errors.moveInDate ? 'bg-red-50 border-red-300' : 'bg-white border-[#D1E7D5]'
              } border rounded-[16px] relative cursor-pointer hover:border-[#A8D5B8] transition-all duration-200`}>
                <div className="flex-shrink-0 min-w-[20px]">
                  <CalendarIcon />
                </div>
                <div className="relative flex-1">
                  <div className="absolute left-0 text-[#A0A0A0] text-[14px] leading-[19px] font-bold">
                    {!moveInDate ? "Move in date" : moveInDate}
                  </div>
                  <input
                    type="date"
                    id="move-in-date"
                    value={moveInDate}
                    onChange={(e) => {
                      setMoveInDate(e.target.value);
                      setErrors(prev => ({ ...prev, moveInDate: '' }));
                    }}
                    className="w-full h-[19px] opacity-0 z-10 cursor-pointer"
                  />
                </div>
              </div>
              <InputError message={errors.moveInDate} />
            </div>
          
            {/* Deposit Amount */}
            <div className="mb-4">
              <div className={`box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] ${
                errors.depositAmount ? 'bg-red-50 border-red-300' : 'bg-white border-[#D1E7D5]'
              } border rounded-[16px] hover:border-[#A8D5B8] transition-all duration-200`}>
              <div className="flex-shrink-0 min-w-[20px]">
                <DollarCircleIcon />
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={depositAmount}
                onChange={(e) => {
                  setDepositAmount(e.target.value.replace(/[^0-9]/g, ''));
                  setErrors(prev => ({ ...prev, depositAmount: '' }));
                }}
                placeholder="Deposit amount"
                className="flex-1 h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none placeholder-[#A0A0A0]"
              />
            </div>
              <InputError message={errors.depositAmount} />
            </div>
          
            {/* Upload Lease - Multiple Files */}
            <div className="w-full mb-12">
              <div 
                onClick={() => setShowPhotoOptions(true)}
                className={`box-border flex flex-row justify-center items-center p-[16px_20px] gap-[8px] w-full h-[120px] bg-white border-2 border-dashed rounded-[16px] cursor-pointer transition-all duration-200 overflow-hidden relative ${
                leaseDocuments.length > 0 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-[#D1E7D5] hover:border-[#A8D5B8]'
              }`}>
              <div className="flex flex-col justify-center items-center gap-[8px] w-full">
                {leaseDocuments.length > 0 ? (
                  <>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="24" cy="24" r="24" fill="#10B981"/>
                      <path d="M20 24L23 27L28 21" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="font-bold text-[14px] leading-[19px] text-center text-green-700">
                      {leaseDocuments.length} file{leaseDocuments.length > 1 ? 's' : ''} selected
                    </div>
                    <div className="text-[12px] text-green-600">
                      Click to add more files
                    </div>
                  </>
                ) : (
                  <>
                    <DocumentUploadIcon />
                    <div className="font-bold text-[14px] leading-[19px] text-center text-[#515964]">
                      Upload lease documents
                    </div>
                    <div className="text-[12px] text-[#515964] text-center">
                      PDF, JPG, PNG
                    </div>
                  </>
                )}
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
              
              {/* Display selected files */}
              {leaseDocuments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {leaseDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-[#D1E7D5] rounded-[12px]">
                      <div className="flex-1 flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.6667 1.66667H5C4.55797 1.66667 4.13405 1.84226 3.82149 2.15482C3.50893 2.46738 3.33334 2.89131 3.33334 3.33334V16.6667C3.33334 17.1087 3.50893 17.5326 3.82149 17.8452C4.13405 18.1577 4.55797 18.3333 5 18.3333H15C15.442 18.3333 15.866 18.1577 16.1785 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V6.66667L11.6667 1.66667Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11.6667 1.66667V6.66667H16.6667" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div className="flex-1">
                          <div className="font-semibold text-[12px] text-[#0B1420] truncate max-w-[200px]">
                            {doc.name}
                          </div>
                          <div className="text-[10px] text-[#515964]">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="p-1.5 hover:bg-red-50 rounded-[8px] transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 4L4 12" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 4L12 12" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
        
        {/* Next Button - Fixed at bottom */}
        <div className="fixed left-0 right-0 bottom-0 w-full max-w-[500px] mx-auto bg-gradient-to-t from-[#FBF5DA] via-[#FBF5DA] to-transparent pt-8 pb-4 px-5 safe-area-bottom z-20">
          <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md hover:bg-[#263449] transition-colors duration-200 disabled:opacity-50 disabled:hover:bg-[#1C2C40] disabled:cursor-not-allowed"
        >
          <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
            {isSubmitting ? 'Processing...' : 'Next'}
          </span>
        </button>
        </div>
      </div>
      
      {/* Bottom sheet for duration type selection */}
      {showDurationTypeSelector && (
        <div className="fixed inset-0 z-50">
          {/* Overlay with fade animation */}
          <div 
            className={`absolute inset-0 bg-black bg-opacity-40 bottom-sheet-overlay ${animationClass}`}
            onClick={closeBottomSheet}
          ></div>
          
          {/* Bottom Sheet with slide-up animation */}
          <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] overflow-hidden safe-area-bottom bottom-sheet ${animationClass}`}>
            {/* Handle Bar for better UX */}
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-[36px] h-[4px] bg-[#E0E0E0] rounded-full"></div>
            </div>
            
            {/* Title */}
            <div className="w-full h-[65px] flex justify-center items-center border-b border-[#EBEBEB]">
              <h3 className="font-bold text-[18px] leading-[25px] text-[#0B1420]">
                Duration
              </h3>
            </div>
            
            {/* Options */}
            <div>
              {/* Weeks Option */}
              <div 
                className={`flex flex-row items-center p-[20px] cursor-pointer hover:bg-[#F5F8F7] transition-colors duration-200 ${leaseDurationType === 'weeks' ? 'bg-[#F5F8F7]' : 'bg-white'}`}
                onClick={() => selectDurationType('weeks')}
              >
                <div className="flex-1">
                  <div className="font-bold text-[16px] leading-[22px] text-[#0B1420]">Weeks</div>
                </div>
                {leaseDurationType === 'weeks' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              
              {/* Months Option */}
              <div 
                className={`flex flex-row items-center p-[20px] cursor-pointer hover:bg-[#F5F8F7] transition-colors duration-200 ${leaseDurationType === 'months' ? 'bg-[#F5F8F7]' : 'bg-white'}`}
                onClick={() => selectDurationType('months')}
              >
                <div className="flex-1">
                  <div className="font-bold text-[16px] leading-[22px] text-[#0B1420]">Months</div>
                </div>
                {leaseDurationType === 'months' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              
              {/* Years Option */}
              <div 
                className={`flex flex-row items-center p-[20px] cursor-pointer hover:bg-[#F5F8F7] transition-colors duration-200 ${leaseDurationType === 'years' ? 'bg-[#F5F8F7]' : 'bg-white'}`}
                onClick={() => selectDurationType('years')}
              >
                <div className="flex-1">
                  <div className="font-bold text-[16px] leading-[22px] text-[#0B1420]">Years</div>
                </div>
                {leaseDurationType === 'years' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            
            {/* Cancel Button */}
            <div className="p-5 pb-8">
              <button
                className="w-full h-[56px] flex justify-center items-center bg-white border border-[#EBEBEB] rounded-[16px] hover:bg-[#F9F9F9] transition-colors duration-200"
                onClick={closeBottomSheet}
              >
                <span className="font-bold text-[16px] leading-[22px] text-[#1C2C40]">
                  Cancel
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Photo Options Modal */}
      <PhotoOptionsModal
        show={showPhotoOptions}
        onClose={() => setShowPhotoOptions(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromGallery={handleChooseFromGallery}
      />
      
    </div>
  );
}