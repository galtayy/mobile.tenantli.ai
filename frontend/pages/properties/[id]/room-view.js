import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

// Back icon component
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Enhanced photo viewer component with navigation
const PhotoViewer = ({ show, onClose, photos = [], initialIndex = 0 }) => {
  const [animationClass, setAnimationClass] = useState('');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);
  
  useEffect(() => {
    let animationTimeout;
    if (show) {
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
  
  const handleClose = () => {
    setAnimationClass('');
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };
  
  const handleTouchEnd = (e) => {
    if (!isSwiping) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;
    
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
    setIsSwiping(false);
  };
  
  if (!show) return null;
  
  const currentPhoto = photos[currentIndex];
  if (!currentPhoto) return null;
  
  return (
    <div 
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
        animationClass === 'visible' ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full"
        style={{ top: 'env(safe-area-inset-top, 16px)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {photos.length > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1" 
          style={{ top: 'env(safe-area-inset-top, 16px)' }}>
          <span className="text-white text-sm">{currentIndex + 1} / {photos.length}</span>
        </div>
      )}
      
      <div className="w-full h-full flex items-center justify-center relative">
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        <img 
          src={currentPhoto.src || currentPhoto.url} 
          alt={`Photo ${currentIndex + 1}`}
          className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
            animationClass === 'visible' ? 'scale-100' : 'scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        />
        
        {currentIndex < photos.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      
      {currentPhoto.note && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-safe">
          <p className="text-white text-sm">{currentPhoto.note}</p>
        </div>
      )}
    </div>
  );
};

export default function RoomView() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id: propertyId, roomId, roomName, roomType, returnUrl } = router.query;
  
  const [roomData, setRoomData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/welcome');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (propertyId && roomId) {
      loadRoomData();
    }
  }, [propertyId, roomId]);

  const loadRoomData = async () => {
    try {
      setIsLoading(true);
      
      // Try to load room data from API first
      try {
        const roomsResponse = await apiService.properties.getRooms(propertyId);
        const rooms = roomsResponse.data || [];
        console.log('Looking for room with ID:', roomId, 'Type:', typeof roomId);
        console.log('Available rooms:', rooms.map(r => ({ 
          id: r.id, 
          roomId: r.roomId,
          name: r.name || r.roomName,
          notes: r.notes || r.roomIssueNotes
        })));
        
        const currentRoom = rooms.find(r => {
          const match = (r.id == roomId) || 
                       (r.roomId == roomId) || 
                       (r.id === parseInt(roomId)) || 
                       (r.roomId === parseInt(roomId)) ||
                       (r.id === roomId.toString()) ||
                       (r.roomId === roomId.toString());
          if (match) {
            console.log('Found matching room:', r);
          }
          return match;
        });
        
        if (currentRoom) {
          console.log('Current room data:', currentRoom);
          setRoomData(currentRoom);
          
          // Extract notes - try multiple possible fields
          let extractedNotes = [];
          
          // Try notes field
          if (currentRoom.notes) {
            if (Array.isArray(currentRoom.notes)) {
              extractedNotes = currentRoom.notes;
            } else if (typeof currentRoom.notes === 'string' && currentRoom.notes.trim()) {
              extractedNotes = currentRoom.notes.split(',').filter(note => note.trim());
            }
          }
          
          // Try roomIssueNotes field
          if (extractedNotes.length === 0 && currentRoom.roomIssueNotes) {
            if (Array.isArray(currentRoom.roomIssueNotes)) {
              extractedNotes = currentRoom.roomIssueNotes;
            } else if (typeof currentRoom.roomIssueNotes === 'string' && currentRoom.roomIssueNotes.trim()) {
              extractedNotes = currentRoom.roomIssueNotes.split(',').filter(note => note.trim());
            }
          }
          
          // Try issueNotes field
          if (extractedNotes.length === 0 && currentRoom.issueNotes) {
            if (Array.isArray(currentRoom.issueNotes)) {
              extractedNotes = currentRoom.issueNotes;
            } else if (typeof currentRoom.issueNotes === 'string' && currentRoom.issueNotes.trim()) {
              extractedNotes = currentRoom.issueNotes.split(',').filter(note => note.trim());
            }
          }
          
          console.log('Extracted notes:', extractedNotes);
          setNotes(extractedNotes);
        } else {
          console.log('No matching room found for ID:', roomId);
        }
      } catch (apiError) {
        console.error('Error fetching room data from API:', apiError);
      }
      
      // Try to load photos
      try {
        console.log('Loading photos for room:', roomId, 'in property:', propertyId);
        const photosResponse = await apiService.photos.getByRoom(propertyId, roomId, false);
        console.log('Photos response:', photosResponse.data);
        
        if (photosResponse.data && photosResponse.data.length > 0) {
          const processedPhotos = photosResponse.data.map(photo => ({
            id: photo.id,
            src: apiService.getPhotoUrl(photo),
            url: apiService.getPhotoUrl(photo),
            note: photo.note || '',
            timestamp: photo.created_at || photo.timestamp || ''
          }));
          console.log('Processed photos:', processedPhotos);
          setPhotos(processedPhotos);
        }
      } catch (photoError) {
        console.error('Error fetching photos:', photoError);
      }
      
      // Also check localStorage as fallback
      const savedRooms = localStorage.getItem(`property_${propertyId}_rooms`);
      if (savedRooms) {
        const parsedRooms = JSON.parse(savedRooms);
        const localRoom = parsedRooms.find(r => 
          (r.id == roomId) || 
          (r.roomId == roomId)
        );
        
        if (localRoom && !roomData) {
          setRoomData(localRoom);
          
          // Extract notes from localStorage data
          if (localRoom.notes) {
            if (Array.isArray(localRoom.notes)) {
              setNotes(localRoom.notes);
            }
          } else if (localRoom.roomIssueNotes) {
            if (Array.isArray(localRoom.roomIssueNotes)) {
              setNotes(localRoom.roomIssueNotes);
            }
          }
        }
      }
      
      // Check localStorage for photos as additional fallback
      const roomPhotosKey = `property_${propertyId}_room_${roomId}_photos`;
      const savedPhotos = localStorage.getItem(roomPhotosKey);
      console.log('Checking localStorage for photos, key:', roomPhotosKey);
      
      if (savedPhotos) {
        try {
          const parsedPhotos = JSON.parse(savedPhotos);
          console.log('Found photos in localStorage:', parsedPhotos);
          if (parsedPhotos && parsedPhotos.length > 0 && photos.length === 0) {
            setPhotos(parsedPhotos);
          }
        } catch (e) {
          console.error('Error parsing localStorage photos:', e);
        }
      }
      
      // Also check for room photos in the property_room_photos key
      const allRoomPhotosKey = `property_${propertyId}_room_photos`;
      const allRoomPhotos = localStorage.getItem(allRoomPhotosKey);
      if (allRoomPhotos) {
        try {
          const parsedAllPhotos = JSON.parse(allRoomPhotos);
          if (parsedAllPhotos[roomId]) {
            console.log('Found room photos in all photos object:', parsedAllPhotos[roomId]);
            if (parsedAllPhotos[roomId].photos && parsedAllPhotos[roomId].photos.length > 0 && photos.length === 0) {
              setPhotos(parsedAllPhotos[roomId].photos);
            }
          }
        } catch (e) {
          console.error('Error parsing all room photos:', e);
        }
      }
      
    } catch (error) {
      console.error('Error loading room data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
    setShowPhotoViewer(true);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{roomName || 'Room Details'} - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <style jsx global>{`
          body {
            background-color: #FBF5DA !important;
            margin: 0;
            padding: 0;
            font-family: 'Nunito', sans-serif;
          }
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
        `}</style>
      </Head>

      <div className="min-h-screen bg-[#FBF5DA] font-['Nunito']">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#FBF5DA]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="w-full max-w-[390px] mx-auto">
            <div className="h-[65px] flex items-center px-[20px] relative">
              <button 
                onClick={() => router.push(returnUrl || `/properties/${propertyId}/summary`)}
                className="absolute left-[20px] top-1/2 -translate-y-1/2 w-[48px] h-[48px] -ml-2 flex items-center justify-center z-50"
              >
                <BackIcon />
              </button>
              <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-['Nunito'] font-semibold text-[18px] leading-[25px] text-[#0B1420]">
                {roomName || 'Room Details'}
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full max-w-[390px] mx-auto" style={{ paddingTop: 'calc(65px + env(safe-area-inset-top))' }}>
          <div className="px-[20px] pb-[20px]">
            {/* Photos Section */}
            {photos.length > 0 && (
              <div className="mb-6">
                <h2 className="font-bold text-[16px] text-[#0B1420] mb-4">Photos ({photos.length})</h2>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div 
                      key={photo.id || index}
                      onClick={() => handlePhotoClick(index)}
                      className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img 
                        src={photo.src || photo.url} 
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {notes.length > 0 && (
              <div className="mb-6">
                <h2 className="font-bold text-[16px] text-[#0B1420] mb-4">Notes ({notes.length})</h2>
                <div className="space-y-2">
                  {notes.map((note, index) => (
                    <div 
                      key={index}
                      className="bg-white rounded-lg p-4 border border-[#D1E7D5]"
                    >
                      <p className="text-[14px] text-[#515964]">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {photos.length === 0 && notes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-[#E8F5EB] rounded-full flex items-center justify-center mb-4">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#4D935A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="#4D935A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 15L16 10L5 21" stroke="#4D935A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-[16px] text-[#515964] text-center">No photos or notes for this room</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Viewer */}
      <PhotoViewer 
        show={showPhotoViewer}
        onClose={() => setShowPhotoViewer(false)}
        photos={photos}
        initialIndex={selectedPhotoIndex}
      />

    </>
  );
}