import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';

// Back icon component
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Camera icon component - You can replace this with your custom PNG
// To use a custom PNG, replace this component with the img tag below:
// <img src="/images/your-custom-icon.png" alt="Camera" width="40" height="40" />
const CameraIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.0004 11.26V6.00049H26.0004V11.26" fill="#B0BEC5" />
    <path d="M28.0004 13.3339V30.0006H5.33374V13.3339H28.0004Z" fill="#ECEFF1" />
    <path d="M23.3333 16.6667C22.4167 16.6667 21.6667 17.4167 21.6667 18.3333C21.6667 19.25 22.4167 20 23.3333 20C24.25 20 25 19.25 25 18.3333C25 17.4167 24.25 16.6667 23.3333 16.6667Z" fill="#FFC107" />
    <path d="M13.9334 24.0195C13.5667 25.0195 12.5334 25.6862 11.3334 25.6862C9.33339 25.6862 7.73339 24.0862 7.73339 22.0862C7.73339 20.0862 9.33339 18.4862 11.3334 18.4862C12.5334 18.4862 13.5667 19.1528 13.9334 20.1528" fill="#4CAF50" />
    <path d="M16.7334 22.0195C16.7334 18.8528 19.3 16.2861 22.4667 16.2861C25.6334 16.2861 28.2 18.8528 28.2 22.0195C28.2 25.1861 25.6334 27.7528 22.4667 27.7528C19.3 27.7528 16.7334 25.1861 16.7334 22.0195Z" fill="#388E3C" />
  </svg>
);

// Enhanced photo viewer component with navigation
const PhotoViewer = ({ show, onClose, photos = [], initialIndex = 0 }) => {
  // Animation states
  const [animationClass, setAnimationClass] = useState('');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);
  
  // Handle animation timing
  useEffect(() => {
    let animationTimeout;
    if (show) {
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
  }, [show]);
  
  // Handle close with animation
  const handleClose = () => {
    setAnimationClass('');
    // Wait for animation to finish before closing
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  // Navigate to previous photo
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  // Navigate to next photo
  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  // Handle touch start for swipe gesture
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };
  
  // Handle touch end for swipe gesture
  const handleTouchEnd = (e) => {
    if (!isSwiping) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;
    
    // Swipe threshold of 50px
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe right - go to previous photo
        handlePrevious();
      } else {
        // Swipe left - go to next photo
        handleNext();
      }
    }
    
    setIsSwiping(false);
  };
  
  if (!show && !animationClass) {
    return null;
  }
  
  const currentPhoto = photos[currentIndex];
  const hasMultiplePhotos = photos.length > 1;
  
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with fade animation */}
      <div 
        className={`absolute inset-0 bg-black bg-opacity-90 photo-viewer-overlay ${animationClass}`}
        onClick={handleClose}
      ></div>
      
      {/* Photo Viewer Content */}
      <div className={`absolute inset-0 flex items-center justify-center photo-viewer ${animationClass}`}>
        {/* Close button */}
        <button 
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black bg-opacity-50 rounded-full"
          onClick={handleClose}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 4L12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {/* Photo counter */}
        {hasMultiplePhotos && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-black bg-opacity-50 rounded-full">
            <span className="text-white text-sm font-semibold">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>
        )}
        
        {/* Previous button */}
        {hasMultiplePhotos && currentIndex > 0 && (
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-opacity"
            onClick={handlePrevious}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        {/* Next button */}
        {hasMultiplePhotos && currentIndex < photos.length - 1 && (
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-opacity"
            onClick={handleNext}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        {/* Photo - full screen with swipe support */}
        <div 
          className="w-full h-full flex items-center justify-center p-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img 
            src={currentPhoto?.src || ''}
            alt="Room photo"
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
            onError={(e) => {
              console.error(`Error loading full-size image`);
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFRkVGRUYiLz48cGF0aCBkPSJNODUgMTEwSDExNVYxMTVIODVWMTEwWiIgZmlsbD0iIzk5OSIvPjxwYXRoIGQ9Ik0xMDAgNzBDOTEuNzE1IDcwIDg1IDc2LjcxNSA4NSA4NUM4NSA5My4yODUgOTEuNzE1IDEwMCAxMDAgMTAwQzEwOC4yODUgMTAwIDExNSA5My4yODUgMTE1IDg1QzExNSA3Ni43MTUgMTA4LjI4NSA3MCAxMDAgNzBaTTEwMCA5NUM5NC40NzcgOTUgOTAgOTAuNTIzIDkwIDg1QzkwIDc5LjQ3NyA5NC40NzcgNzUgMTAwIDc1QzEwNS41MjMgNzUgMTEwIDc5LjQ3NyAxMTAgODVDMTEwIDkwLjUyMyAxMDUuNTIzIDk1IDEwMCA5NVoiIGZpbGw9IiM5OTkiLz48L3N2Zz4=';
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Bottom sheet component for photo selection
const PhotoOptionBottomSheet = ({ show, onClose, onTakePhoto, onChooseFromGallery }) => {
  // Animation states
  const [animationClass, setAnimationClass] = useState('');
  
  console.log('[DEBUG] PhotoOptionBottomSheet rendered - show:', show);
  
  // Handle animation timing
  useEffect(() => {
    console.log('[DEBUG] PhotoOptionBottomSheet useEffect triggered - show:', show);
    let animationTimeout;
    if (show) {
      // Small delay to let the component render first, then add the visible class
      animationTimeout = setTimeout(() => {
        console.log('[DEBUG] Adding visible class to bottom sheet');
        setAnimationClass('visible');
      }, 10);
    } else {
      setAnimationClass('');
    }
    
    return () => {
      if (animationTimeout) clearTimeout(animationTimeout);
    };
  }, [show]);
  
  // Handle selection with animation
  const handlePhotoOption = (callback) => {
    console.log('[DEBUG] handlePhotoOption called');
    setAnimationClass('');
    // Wait for animation to finish before selecting
    setTimeout(() => {
      console.log('[DEBUG] Executing callback after animation');
      callback();
    }, 300);
  };
  
  // Handle close with animation
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
            Add a Photo
          </h3>
        </div>
        
        {/* Photo Options */}
        <div className="w-full max-w-[350px] mx-auto">
          {/* Take a Photo Option */}
          <div 
            className="flex flex-row items-center h-[56px] border-b border-[#ECF0F5] px-5 py-[16px] hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            onClick={() => {
              console.log('[DEBUG] Take Photo option clicked');
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
              console.log('[DEBUG] Choose From Gallery option clicked');
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

export default function MoveOutRoom() {
  console.log('[DEBUG] MoveOutRoom component rendered');
  
  const { user, loading } = useAuth();
  const router = useRouter();
  const { propertyId, roomId, returnUrl, isReport, readOnly } = router.query;
  
  console.log('[DEBUG] Query params:', { propertyId, roomId, returnUrl, isReport, readOnly });
  
  const [isLoading, setIsLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('');
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [notes, setNotes] = useState('');
  const [notesList, setNotesList] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [previousNotes, setPreviousNotes] = useState([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const isReadOnly = isReport === 'true' || readOnly === 'true';
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [allPhotos, setAllPhotos] = useState([]);
  
  console.log('[DEBUG] isReport value:', isReport);
  console.log('[DEBUG] isReadOnly value:', isReadOnly);
  console.log('[DEBUG] newPhotos count:', newPhotos.length);
  console.log('[DEBUG] notesList count:', notesList.length);
  
  // Add useEffect to log when photos change
  useEffect(() => {
    console.log('[DEBUG] newPhotos changed:', newPhotos.length, newPhotos);
  }, [newPhotos]);
  
  useEffect(() => {
    console.log('[DEBUG] notesList changed:', notesList.length, notesList);
  }, [notesList]);
  
  console.log('[DEBUG] isReadOnly:', isReadOnly);
  console.log('[DEBUG] showPhotoOptions:', showPhotoOptions);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
      return;
    }
    
    if (router.isReady && propertyId && roomId) {
      fetchRoomData();
    }
  }, [user, loading, router, propertyId, roomId, router.isReady]);

  const fetchRoomData = async () => {
    try {
      setIsLoading(true);
      console.log(`Fetching room data for property ${propertyId}, room ${roomId}`);
      
      // First, try to get from API
      let roomDataLoaded = false;
      let apiRoomData = null;
      
      try {
        const roomsResponse = await apiService.properties.getRooms(propertyId);
        console.log('Rooms from API:', roomsResponse.data);
        
        if (roomsResponse.data && roomsResponse.data.length > 0) {
          apiRoomData = roomsResponse.data.find(room => room.roomId === roomId);
          if (apiRoomData) {
            console.log('Found room in API:', apiRoomData);
            roomDataLoaded = true;
          }
        }
      } catch (apiError) {
        console.error('Failed to fetch rooms from API:', apiError);
      }
      
      // If API data not available, fallback to localStorage
      if (!roomDataLoaded) {
        const savedRooms = JSON.parse(localStorage.getItem(`property_${propertyId}_rooms`) || '[]');
        console.log('Falling back to localStorage, rooms:', savedRooms);
        
        const roomFromStorage = savedRooms.find(room => room.roomId === roomId);
        if (roomFromStorage) {
          console.log('Using room from localStorage:', roomFromStorage);
          apiRoomData = roomFromStorage;
          roomDataLoaded = true;
        }
      }
      
      if (roomDataLoaded && apiRoomData) {
        console.log('Setting room data from source:', apiRoomData);
        
        // Oda bilgilerini ayarla
        setRoomData(apiRoomData);
        setRoomName(apiRoomData.roomName || 'Room');
        setRoomType(apiRoomData.roomType || 'other');
        
        // Önceki notları ayarla
        if (apiRoomData.roomIssueNotes && apiRoomData.roomIssueNotes.length > 0) {
          setPreviousNotes(apiRoomData.roomIssueNotes);
        } else {
          setPreviousNotes([]);
        }
        
        // Move-out notlarını ayarla
        console.log('[LOAD] Room move-out notes from data source:', {
          hasNotes: !!apiRoomData.moveOutNotes,
          noteType: typeof apiRoomData.moveOutNotes,
          noteCount: Array.isArray(apiRoomData.moveOutNotes) ? apiRoomData.moveOutNotes.length : 0,
          notes: apiRoomData.moveOutNotes
        });
        
        if (apiRoomData.moveOutNotes && apiRoomData.moveOutNotes.length > 0) {
          console.log('[LOAD] Setting notes from data source:', apiRoomData.moveOutNotes);
          setNotesList(apiRoomData.moveOutNotes);
          setNotes(apiRoomData.moveOutNotes.join('\n')); // backward compatibility
        } else {
          console.log('[LOAD] No move-out notes found in data source, clearing notes');
          setNotesList([]);
          setNotes('');
        }
        
        // Move-in fotoğraflarını getir (move_out=false)
        try {
          console.log('Fetching move-in photos for room:', roomId);
          const photosResponse = await apiService.photos.getByRoom(propertyId, roomId, false);
          
          console.log('Raw move-in photo API response:', photosResponse);
          
          if (photosResponse.data && photosResponse.data.length > 0) {
            console.log('Found photos for room:', photosResponse.data);
            
            // Check the structure of the first photo to debug
            const samplePhoto = photosResponse.data[0];
            console.log('Sample photo data structure:', {
              id: samplePhoto.id,
              path: samplePhoto.path,
              url: samplePhoto.url,
              fullPath: samplePhoto.path || samplePhoto.url,
              hasHttp: (samplePhoto.path || samplePhoto.url || '').startsWith('http')
            });
            
            // API URL'ini al
            const apiUrl = apiService.getBaseUrl();
            
            // Use the helper function to construct photo URLs
            const photoUrls = photosResponse.data.map(photo => {
              // Log the photo object to debug
              console.log('Processing photo:', photo);
              
              // Use the helper function from apiService
              const fullUrl = apiService.getPhotoUrl(photo);
              
              console.log('Constructed photo URL:', fullUrl);
              
              return {
                id: photo.id,
                src: fullUrl || '',
                note: photo.note || '',
                timestamp: photo.created_at || photo.timestamp || '',
                roomId: photo.room_id || roomId,
                propertyId: photo.property_id || propertyId,
                isMoveIn: true
              };
            });
            
            console.log('Final photo URLs:', photoUrls);
            setExistingPhotos(photoUrls);
          } else {
            console.log('No move-in photos found for room');
            setExistingPhotos([]);
          }
        } catch (photosError) {
          console.error('Failed to fetch move-in photos:', photosError);
          setExistingPhotos([]);
        }
        
        // Move-out fotoğraflarını getir (move_out=true)
        try {
          console.log('Fetching move-out photos for room:', roomId);
          const moveOutPhotosResponse = await apiService.photos.getByRoom(propertyId, roomId, true);
          
          console.log('Raw move-out photo API response:', moveOutPhotosResponse);
          
          if (moveOutPhotosResponse.data && moveOutPhotosResponse.data.length > 0) {
            console.log('Found move-out photos for room:', moveOutPhotosResponse.data);
            
            // Process move-out photos
            const moveOutPhotoUrls = moveOutPhotosResponse.data.map(photo => {
              const fullUrl = apiService.getPhotoUrl(photo);
              
              return {
                id: photo.id,
                src: fullUrl || '',
                note: photo.note || '',
                timestamp: photo.created_at || photo.timestamp || '',
                roomId: photo.room_id || roomId,
                propertyId: photo.property_id || propertyId,
                file: null,
                name: photo.file_path || ''
              };
            });
            
            setNewPhotos(moveOutPhotoUrls);
            console.log('Move-out photos loaded:', moveOutPhotoUrls);
          } else {
            console.log('No move-out photos found for room');
          }
        } catch (moveOutPhotoError) {
          console.error('Error fetching move-out photos:', moveOutPhotoError);
        }
      } else {
        console.log('Room not found in either API or localStorage');
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
      console.error('Error loading room information');
    } finally {
      setIsLoading(false);
    }
  };

  // Compress image function
  const compressImage = async (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
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

          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Create a new File object with the compressed blob
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                console.log(`[DEBUG] Image compressed: ${file.size} bytes -> ${blob.size} bytes`);
                resolve(compressedFile);
              } else {
                reject(new Error('Canvas toBlob failed'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Image load failed'));
      };
      reader.onerror = () => reject(new Error('File read failed'));
    });
  };
  
  const handleTakePhoto = () => {
    console.log('[DEBUG] handleTakePhoto called');
    try {
      // Create a file input element programmatically
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*'; // Accept all image types
      fileInput.capture = 'environment'; // Prefer the back camera
      
      // Listen for the change event on the file input
      fileInput.onchange = async (event) => {
        console.log('[DEBUG] File input change event triggered');
        const file = event.target.files[0];
        if (file) {
          try {
            console.log(`[DEBUG] Original file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            
            // Compress the image if it's larger than 2MB
            let processedFile = file;
            if (file.size > 2 * 1024 * 1024) {
              console.log('[DEBUG] Compressing image...');
              processedFile = await compressImage(file);
              console.log(`[DEBUG] Compressed file size: ${(processedFile.size / 1024 / 1024).toFixed(2)} MB`);
            }
            
            // Process the image file
            setNewPhotos(prevPhotos => {
              const updatedPhotos = [...prevPhotos, {
                id: `new_${Date.now()}`,
                src: URL.createObjectURL(processedFile),
                file: processedFile,
                name: file.name
              }];
              console.log('[DEBUG] Updated photos array:', updatedPhotos);
              return updatedPhotos;
            });
          } catch (error) {
            console.error('[ERROR] Failed to process image:', error);
            alert('Failed to process image. Please try again.');
          }
        } else {
          console.log('[DEBUG] No file selected');
        }
      };
      
      // Trigger the file input click event to open the camera
      console.log('[DEBUG] Triggering file input click');
      fileInput.click();
    } catch (error) {
      console.error('[ERROR] Error accessing camera:', error);
      console.error('Camera access failed');
    }
    
    setShowPhotoOptions(false);
  };

  const handleChooseFromGallery = () => {
    console.log('[DEBUG] handleChooseFromGallery called');
    try {
      // Create a file input element programmatically
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*'; // Accept all image types
      fileInput.multiple = true; // Allow selecting multiple images
      
      // Listen for the change event on the file input
      fileInput.onchange = async (event) => {
        console.log('[DEBUG] Gallery file input change event triggered');
        const files = event.target.files;
        if (files && files.length > 0) {
          console.log('[DEBUG] Files selected:', files.length);
          try {
            // Process each selected image file
            const processedPhotos = [];
            
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              console.log(`[DEBUG] Processing file ${i+1}/${files.length}: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
              
              // Compress the image if it's larger than 2MB
              let processedFile = file;
              if (file.size > 2 * 1024 * 1024) {
                console.log(`[DEBUG] Compressing image ${i+1}...`);
                processedFile = await compressImage(file);
                console.log(`[DEBUG] Compressed size: ${(processedFile.size / 1024 / 1024).toFixed(2)} MB`);
              }
              
              processedPhotos.push({
                id: `new_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                src: URL.createObjectURL(processedFile),
                file: processedFile,
                name: file.name
              });
            }
            
            console.log('[DEBUG] Processed photos:', processedPhotos);
            
            // Add all processed photos to the existing photos array
            setNewPhotos(prevPhotos => {
              const updatedPhotos = [...prevPhotos, ...processedPhotos];
              console.log('[DEBUG] Updated photos array:', updatedPhotos);
              return updatedPhotos;
            });
          } catch (error) {
            console.error('[ERROR] Failed to process images:', error);
            alert('Failed to process some images. Please try again.');
          }
        } else {
          console.log('[DEBUG] No files selected from gallery');
        }
      };
      
      // Trigger the file input click event to open the gallery
      console.log('[DEBUG] Triggering gallery file input click');
      fileInput.click();
    } catch (error) {
      console.error('[ERROR] Error accessing gallery:', error);
      console.error('Gallery access failed');
    }
    
    setShowPhotoOptions(false);
  };
  
  const handleDeletePhoto = async (index) => {
    console.log('[DEBUG] handleDeletePhoto called for index:', index);
    
    // Get the photo to delete
    const photoToDelete = newPhotos[index];
    console.log('[DEBUG] Photo to delete:', photoToDelete);
    
    // If the photo has an ID, it's from the database - delete it from the server
    if (photoToDelete && photoToDelete.id) {
      try {
        console.log('[DEBUG] Deleting photo from server:', photoToDelete.id);
        await apiService.photos.delete(photoToDelete.id);
        console.log('[DEBUG] Photo deleted from server successfully');
      } catch (error) {
        console.error('[ERROR] Failed to delete photo from server:', error);
      }
    }
    
    // Remove from local state
    setNewPhotos(prevPhotos => {
      console.log('[DEBUG] Current photos before deletion:', prevPhotos);
      const newPhotoArray = [...prevPhotos];
      newPhotoArray.splice(index, 1);
      console.log('[DEBUG] Photos after deletion:', newPhotoArray);
      return newPhotoArray;
    });
  };
  
  const handlePhotoClick = (photo, index) => {
    console.log('Photo clicked:', photo);
    // Combine existing and new photos for navigation
    const photos = [...existingPhotos, ...newPhotos.map(p => ({
      ...p,
      src: p.src,
      note: p.note || 'Move-out photo (new)',
      timestamp: p.timestamp || new Date().toISOString(),
      roomId: roomId,
      propertyId: propertyId,
      isMoveOut: true
    }))];
    setAllPhotos(photos);
    setSelectedPhotoIndex(index);
    setShowPhotoViewer(true);
  };
  
  const handleSubmit = async () => {
    if (!propertyId || !roomId) {
      console.error('Room or property information is missing');
      return;
    }
    
    console.log('[SUBMIT] Starting submission with:', {
      newPhotosCount: newPhotos.length,
      notes: notesList,
      currentNote: currentNote,
      hasNotes: notesList.length > 0 || currentNote.trim().length > 0
    });
    
    // Add current note if it exists
    let finalNotes = [...notesList];
    if (currentNote.trim()) {
      finalNotes.push(currentNote.trim());
    }
    
    console.log('[SUBMIT] Final notes to save:', finalNotes);
    
    if (newPhotos.length === 0 && finalNotes.length === 0) {
      console.error('Please add at least one photo or note');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mevcut odayı kaydet
      const savedRooms = JSON.parse(localStorage.getItem(`property_${propertyId}_rooms`) || '[]');
      const roomIndex = savedRooms.findIndex(room => room.roomId === roomId);
      
      // Use the final notes list
      console.log('[SUBMIT] Move-out notes:', finalNotes);
      console.log('[SUBMIT] Photo count:', newPhotos.length);
      
      const moveOutCompleted = newPhotos.length > 0 || finalNotes.length > 0;
      console.log('[SUBMIT] Move-out completed:', moveOutCompleted);
      
      if (roomIndex >= 0) {
        // Mevcut oda bilgilerini güncelle
        savedRooms[roomIndex] = {
          ...savedRooms[roomIndex],
          moveOutNotes: finalNotes,
          moveOutPhotoCount: newPhotos.length,
          moveOutDate: new Date().toISOString(),
          moveOutCompleted: moveOutCompleted
        };
        console.log('[SUBMIT] Updated existing room:', savedRooms[roomIndex]);
      } else {
        // Yeni oda oluştur
        const newRoom = {
          roomId: roomId,
          roomName: roomName,
          roomType: roomType,
          moveOutNotes: finalNotes,
          moveOutPhotoCount: newPhotos.length,
          moveOutDate: new Date().toISOString(),
          moveOutCompleted: moveOutCompleted
        };
        savedRooms.push(newRoom);
        console.log('[SUBMIT] Created new room:', newRoom);
      }
      
      // localStorage'a kaydet
      localStorage.setItem(`property_${propertyId}_rooms`, JSON.stringify(savedRooms));
      
      // Fotoğrafları sunucuya yükle - only upload new photos with file objects
      const photosToUpload = newPhotos.filter(photo => photo.file);
      console.log(`[SUBMIT] Photos to upload: ${photosToUpload.length} out of ${newPhotos.length} total photos`);
      
      if (photosToUpload.length > 0) {
        for (let i = 0; i < photosToUpload.length; i++) {
          const photo = photosToUpload[i];
          
          try {
            // Create form data with the actual file
            const formData = new FormData();
            console.log(`[DEBUG] Uploading file: ${photo.name}, size: ${(photo.file.size / 1024 / 1024).toFixed(2)} MB, type: ${photo.file.type}`);
            formData.append('photo', photo.file, photo.name || `moveout_photo_${Date.now()}_${i}.jpg`);
            formData.append('note', 'Move-out photo');
            formData.append('property_id', propertyId);
            formData.append('room_id', roomId);
            formData.append('move_out', 'true');
            
            // Upload photo
            console.log(`[DEBUG] Uploading move-out photo to API: ${apiService.getBaseUrl()}/api/photos/upload-room/${propertyId}/${roomId}`);
            const uploadResponse = await apiService.photos.uploadForRoom(propertyId, roomId, formData);
            console.log(`Photo ${i+1} uploaded successfully, response:`, uploadResponse.data);
          } catch (uploadError) {
            console.error(`Failed to upload photo ${i+1}:`, uploadError);
            console.error(`[ERROR] Move-out upload error details:`, {
              message: uploadError.message,
              status: uploadError.response?.status,
              data: uploadError.response?.data,
              config: {
                url: uploadError.config?.url,
                method: uploadError.config?.method,
                baseURL: uploadError.config?.baseURL
              }
            });
            // Show error to user
            if (typeof window !== 'undefined' && window.alert) {
              window.alert(`Failed to upload photo ${i+1}. Please check your connection and try again.`);
            }
          }
        }
      }
      
      // API'ye odayı kaydet - moveOutCompleted alanı da dahil
      try {
        // API için formatla
        const apiRooms = savedRooms.map(room => {
          console.log('[SUBMIT] Mapping room for API:', room);
          console.log('[SUBMIT] Room moveOutNotes details:', {
            hasNotes: !!room.moveOutNotes,
            noteCount: Array.isArray(room.moveOutNotes) ? room.moveOutNotes.length : 0,
            notes: room.moveOutNotes
          });
          
          const mappedRoom = {
            roomName: room.roomName,
            roomType: room.roomType,
            roomId: room.roomId,
            photoCount: room.photoCount || 0,
            roomQuality: room.roomQuality,
            roomIssueNotes: room.roomIssueNotes || [],
            isCompleted: room.isCompleted || false,
            // Move-out specific fields
            moveOutNotes: room.moveOutNotes || [],
            moveOutPhotoCount: room.moveOutPhotoCount || 0,
            moveOutCompleted: room.moveOutCompleted || false,
            moveOutDate: room.moveOutDate,
            timestamp: room.timestamp || new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          };
          console.log('[SUBMIT] Mapped room result:', mappedRoom);
          console.log('[SUBMIT] Mapped moveOutNotes:', mappedRoom.moveOutNotes);
          return mappedRoom;
        });
        
        console.log('[SUBMIT] Final API payload:', JSON.stringify(apiRooms, null, 2));
        const response = await apiService.properties.saveRooms(propertyId, apiRooms);
        console.log('Rooms save API response:', response);
        console.log('Rooms saved to API successfully with move-out data');
      } catch (saveError) {
        console.error('Failed to save rooms to API:', saveError);
        console.error('Error details:', saveError.response?.data);
        // Sadece localStorage'a kaydedildi, tamamen başarısız değil
      }
      
      console.log('Your changes have been saved!');
      
      // Show success message if toast is available
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('moveOutSuccess', 'true');
      }
      
      // Odalar sayfasına geri dön
      setTimeout(() => {
        router.push(`/move-out/rooms?propertyId=${propertyId}`);
      }, 500);
    } catch (error) {
      console.error('Error submitting room data:', error);
      console.error('Error saving changes');
      setIsSubmitting(false);
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Move Out - Room Documentation | tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <style jsx global>{`
          body {
            background-color: #FBF5DA;
            margin: 0;
            padding: 0;
            font-family: 'Nunito', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          .mobile-full-height {
            height: 100vh;
            height: 100dvh;
          }
          
          .safe-area-top {
            padding-top: env(safe-area-inset-top, 40px);
          }
          
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
          
          @supports (padding: max(0px)) {
            .safe-area-top {
              padding-top: max(env(safe-area-inset-top), 40px);
            }
            .safe-area-bottom {
              padding-bottom: max(env(safe-area-inset-bottom), 20px);
            }
          }
          
          * {
            -webkit-tap-highlight-color: transparent;
          }
          
          .scroll-y {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
          
          button:active {
            transform: scale(0.98);
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
          /* Bottom sheet animations */
          .bottom-sheet {
            transform: translateY(100%);
            transition: transform 0.3s ease-out;
          }
          
          .bottom-sheet.visible {
            transform: translateY(0);
          }
          
          .bottom-sheet-overlay {
            opacity: 0;
            transition: opacity 0.3s ease-out;
          }
          
          .bottom-sheet-overlay.visible {
            opacity: 1;
          }
          
          /* Photo viewer animations */
          .photo-viewer-overlay {
            opacity: 0;
            transition: opacity 0.2s ease-out;
          }
          
          .photo-viewer-overlay.visible {
            opacity: 1;
          }
          
          .photo-viewer {
            opacity: 0;
            transform: scale(0.95);
            transition: opacity 0.2s ease-out, transform 0.2s ease-out;
          }
          
          .photo-viewer.visible {
            opacity: 1;
            transform: scale(1);
          }
        `}</style>
      </Head>
      
      <div className="fixed inset-0 bg-[#FBF5DA]"></div>
      
      <div className="relative min-h-screen mobile-full-height w-full font-['Nunito'] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="fixed top-0 w-full bg-[#FBF5DA] z-10">
          <div className="flex flex-row items-center px-[20px] pt-[60px] pb-[20px] relative">
            <button 
              className="flex items-center relative z-10 hover:opacity-75 transition-opacity duration-200"
              onClick={() => router.push(returnUrl || `/move-out/rooms?propertyId=${propertyId}`)}
              aria-label="Go back"
            >
              <BackIcon />
            </button>
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
              {isReadOnly ? 'Room Details' : 'Room Documentation'}
            </h1>
          </div>
        </div>
        
        {/* Content */}
        <div className="w-full max-w-[390px] mx-auto flex flex-col flex-1">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 pt-[120px] pb-24 scroll-y">
          <h2 className="font-bold text-[18px] text-[#0B1420] mt-4">
            {roomName}
          </h2>
          
          {/* Previous Photos Section */}
          {existingPhotos.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[14px] text-[#0B1420]">
                  Photos from Move-In
                </h3>
                <p className="font-normal text-[14px] text-[#515964]">
                  These photos were taken during move-in — please review them for comparison.
                </p>
              </div>
              
              <div className="flex flex-row flex-wrap gap-2 mt-4">
                {existingPhotos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="w-[81.5px] h-[81.5px] bg-gray-200 rounded-2xl overflow-hidden cursor-pointer relative hover:scale-105 transition-transform duration-200"
                    onClick={() => handlePhotoClick(photo, index)}
                  >
                    <img 
                      src={photo.src}
                      alt={`Room photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Error loading image ${index}:`, photo.src);
                        e.target.onerror = null; 
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNFRkVGRUYiLz48cGF0aCBkPSJNMzAgNTVINTBWNTdIMzBWNTVaIiBmaWxsPSIjOTk5Ii8+PHBhdGggZD0iTTQwIDI1QzM0LjQ4IDI1IDMwIDI5LjQ4IDMwIDM1QzMwIDQwLjUyIDM0LjQ4IDQ1IDQwIDQ1QzQ1LjUyIDQ1IDUwIDQwLjUyIDUwIDM1QzUwIDI5LjQ4IDQ1LjUyIDI1IDQwIDI1Wk00MCA0M0MzNS41OCA0MyAzMiAzOS40MiAzMiAzNUMzMiAzMC41OCAzNS41OCAyNyA0MCAyN0M0NC40MiAyNyA0OCAzMC41OCA0OCAzNUM0OCAzOS40MiA0NC40MiA0MyA0MCA0M1oiIGZpbGw9IiM5OTkiLz48L3N2Zz4=';
                        e.target.classList.add('error-image');
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Previous Notes Section */}
          {previousNotes.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-row justify-between items-center mb-4">
                <h3 className="font-bold text-[14px] text-[#0B1420]">
                  Issues noted at move-in
                </h3>
                {previousNotes.length > 2 && (
                  <button
                    onClick={() => setShowAllNotes(!showAllNotes)}
                    className="font-bold text-[14px] text-[#4D935A]"
                  >
                    {showAllNotes ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                {(showAllNotes ? previousNotes : previousNotes.slice(0, 2)).map((note, index) => (
                  <div key={index} className="p-[16px] bg-white border border-[#D1E7D5] rounded-[16px] shadow-sm">
                    <p className="font-semibold text-[14px] leading-[19px] text-[#515964]">{note}</p>
                  </div>
                ))}
              </div>
              
              {!showAllNotes && previousNotes.length > 2 && (
                <p className="text-[12px] text-[#979FA9] mt-2">
                  {previousNotes.length - 2} more issues hidden
                </p>
              )}
            </div>
          )}
          
          {/* Current Documentation Section */}
          <div className="mt-8">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-[14px] text-[#0B1420]">
                Document the Room's Current Condition
              </h3>
              <p className="font-normal text-[14px] text-[#515964]">
                Add photos to show how the room looks as you move out.
              </p>
            </div>
            
            {/* New photos display */}
            {newPhotos.length > 0 && (
              <div className="flex flex-row flex-wrap gap-2 mt-4">
                {newPhotos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="w-[81.5px] h-[81.5px] bg-gray-200 rounded-2xl overflow-hidden relative cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => handlePhotoClick(photo, existingPhotos.length + index)}
                  >
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${photo.src})` }}
                    ></div>
                    
                    {/* Delete button */}
                    {!isReadOnly && (
                      <button 
                        className="absolute top-2 right-2 z-10 w-[28px] h-[28px] flex items-center justify-center bg-[#D14848] rounded-full shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(index);
                        }}
                      >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 3.98667C11.78 3.76667 9.54667 3.65333 7.32 3.65333C6 3.65333 4.68 3.72 3.36 3.85333L2 3.98667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.66669 3.31999L5.81335 2.43999C5.92002 1.80666 6.00002 1.33333 7.12669 1.33333H8.87335C10 1.33333 10.0867 1.83999 10.1867 2.44666L10.3334 3.31999" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12.5667 6.09333L12.1334 12.8067C12.06 13.8533 12 14.6667 10.14 14.6667H5.86002C4.00002 14.6667 3.94002 13.8533 3.86668 12.8067L3.43335 6.09333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.88669 11H9.10669" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.33331 8.33333H9.66665" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Photo upload button */}
            {!isReadOnly && (
              <button
                onClick={() => {
                  console.log('[DEBUG] Photo upload button clicked');
                  console.log('[DEBUG] Current isReadOnly state:', isReadOnly);
                  console.log('[DEBUG] Current showPhotoOptions state:', showPhotoOptions);
                  setShowPhotoOptions(true);
                }}
                className="box-border flex flex-col items-center justify-center w-full h-[99px] mt-4 bg-white border border-dashed border-[#D1E7D5] rounded-[16px] hover:bg-gray-50 hover:border-[#55A363] transition-all duration-200 active:scale-98"
              >
                <div className="flex flex-col items-center justify-center gap-2 py-[14px]">
                  {<img src="/images/iconss/camera.png"/>}
                  <p className="font-bold text-[14px] leading-[19px] text-center text-[#515964]">
                    Take Photo & Add From Gallery
                  </p>
                </div>
              </button>
            )}
            
            {/* Notes section */}
            <div className="mt-6">
              <div className="flex flex-row justify-between items-center mb-4">
                <h3 className="font-bold text-[14px] text-[#0B1420]">Move-Out Notes</h3>
                {!isReadOnly && currentNote && (
                  <span 
                    className="font-bold text-[14px] leading-[19px] text-[#4D935A] cursor-pointer"
                    onClick={() => {
                      console.log('[DEBUG] Add note clicked');
                      console.log('[DEBUG] Current note:', currentNote);
                      console.log('[DEBUG] Notes list length:', notesList.length);
                      if (notesList.length < 15 && currentNote.trim()) {
                        const updatedNotes = [...notesList, currentNote];
                        console.log('[DEBUG] Updated notes list:', updatedNotes);
                        setNotesList(updatedNotes);
                        setCurrentNote('');
                      }
                    }}
                  >
                    Add
                  </span>
                )}
              </div>
              
              {isReadOnly ? (
                // Read-only notes display
                notesList.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {notesList.map((note, index) => (
                      <div key={index} className="p-[16px] bg-white border border-[#D1E7D5] rounded-[16px]">
                        <p className="font-semibold text-[14px] leading-[19px] text-[#515964]">{note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px] text-[#979FA9]">No notes available</p>
                )
              ) : (
                // Editable notes input
                <>
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="e.g., minor wear and tear on walls"
                    className="w-full h-[74px] p-[18px_20px] bg-white border border-[#D1E7D5] rounded-[16px] font-semibold text-[14px] leading-[19px] text-[#515964] resize-none"
                    maxLength={150}
                    disabled={notesList.length >= 15}
                  />
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[12px] leading-[16px] text-[#979FA9]">
                      {notesList.length}/15 notes added
                    </span>
                    <span className="text-[12px] leading-[16px] text-[#979FA9]">
                      {currentNote.length}/150
                    </span>
                  </div>
                  
                  {/* Display Added Notes */}
                  {notesList.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                      {notesList.map((note, index) => (
                        <div key={index} className="flex justify-between items-center p-[16px] bg-white border border-[#D1E7D5] rounded-[16px]">
                          <p className="font-semibold text-[14px] leading-[19px] text-[#515964]">{note}</p>
                          <button 
                            onClick={() => {
                              console.log('[DEBUG] Delete note clicked for index:', index);
                              console.log('[DEBUG] Current notes list:', notesList);
                              const newNotes = [...notesList];
                              newNotes.splice(index, 1);
                              console.log('[DEBUG] Updated notes list after deletion:', newNotes);
                              setNotesList(newNotes);
                            }}
                            className="ml-2"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14 3.98667C11.78 3.76667 9.54667 3.65333 7.32 3.65333C6 3.65333 4.68 3.72 3.36 3.85333L2 3.98667" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5.66669 3.31999L5.81335 2.43999C5.92002 1.80666 6.00002 1.33333 7.12669 1.33333H8.87335C10 1.33333 10.0867 1.83999 10.1867 2.44666L10.3334 3.31999" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12.5667 6.09333L12.1334 12.8067C12.06 13.8533 12 14.6667 10.14 14.6667H5.86002C4.00002 14.6667 3.94002 13.8533 3.86668 12.8067L3.43335 6.09333" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.88669 11H9.10669" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.33331 8.33333H9.66665" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            </div>
            
          </div>
          
          {/* Fixed bottom button */}
          <div className="fixed bottom-0 left-0 right-0 px-5 pb-4 bg-[#FBF5DA] z-10">
              <div className="safe-area-bottom">
                {isReadOnly ? (
                  <button
                    onClick={() => router.push(returnUrl || `/properties/${propertyId}/summary?from=walkthrough`)}
                    className="w-full h-[56px] flex justify-center items-center rounded-[16px] bg-[#1C2C40] hover:bg-[#243242] active:bg-[#0C1322] transition-colors duration-200"
                  >
                    <span className="font-bold text-[16px] leading-[22px] text-center text-[#D1E7E2]">
                      Back to Summary
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (newPhotos.length === 0 && notesList.length === 0 && !currentNote.trim())}
                    className={`w-full h-[56px] flex justify-center items-center rounded-[16px] transition-colors duration-200 ${
                      isSubmitting || (newPhotos.length === 0 && notesList.length === 0 && !currentNote.trim())
                        ? 'bg-[#E0E5EB] cursor-not-allowed' 
                        : 'bg-[#1C2C40] hover:bg-[#243242] active:bg-[#0C1322]'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        <span className="font-bold text-[16px] leading-[22px] text-center text-[#D1E7E2]">
                          Saving...
                        </span>
                      </div>
                    ) : (
                      <span className={`font-bold text-[16px] leading-[22px] text-center ${
                        newPhotos.length === 0 && notesList.length === 0 && !currentNote.trim() ? 'text-[#818A95]' : 'text-[#D1E7E2]'
                      }`}>
                        Finish This Room
                      </span>
                    )}
                  </button>
                )}
              </div>
          </div>
        </div>
        
        {/* Photo Options Bottom Sheet */}
        <PhotoOptionBottomSheet 
          show={showPhotoOptions}
          onClose={() => setShowPhotoOptions(false)}
          onTakePhoto={handleTakePhoto}
          onChooseFromGallery={handleChooseFromGallery}
        />
        
        {/* Photo Viewer */}
        <PhotoViewer
          show={showPhotoViewer}
          onClose={() => setShowPhotoViewer(false)}
          photos={allPhotos}
          initialIndex={selectedPhotoIndex}
        />
      </div>
    </>
  );
}