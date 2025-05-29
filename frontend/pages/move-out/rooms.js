import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';

// Back icon component
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MoveOutRooms() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { propertyId } = router.query;
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomPhotos, setRoomPhotos] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [allRoomsCompleted, setAllRoomsCompleted] = useState(false);
  const [hasSharedReport, setHasSharedReport] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Check for success message on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const success = localStorage.getItem('moveOutSuccess');
      if (success === 'true') {
        console.log('Room move-out completed successfully!');
        localStorage.removeItem('moveOutSuccess');
        // You could add a toast notification here if needed
      }
    }
  }, []);
  
  // Fetch photos for a specific room
  const fetchRoomPhotos = useCallback(async (roomId) => {
    if (!propertyId || !roomId) return;
    
    try {
      console.log(`Fetching photos for room ${roomId}`);
      const photosResponse = await apiService.photos.getByRoom(propertyId, roomId);
      
      if (photosResponse.data && photosResponse.data.length > 0) {
        console.log(`Found ${photosResponse.data.length} photos for room ${roomId}`);
        
        // Get the first 4 photos for thumbnails
        const thumbnails = photosResponse.data.slice(0, 4).map(photo => {
          return {
            id: photo.id,
            src: apiService.getPhotoUrl(photo) || ''
          };
        });
        
        // Update the roomPhotos state with these thumbnails
        setRoomPhotos(prev => ({
          ...prev,
          [roomId]: thumbnails
        }));
      }
    } catch (error) {
      console.error(`Error fetching photos for room ${roomId}:`, error);
    }
  }, [propertyId]);

  // Check if all rooms have completed the move-out process
  const checkAllRoomsCompleted = useCallback(() => {
    if (rooms.length === 0) {
      setAllRoomsCompleted(false);
      return;
    }
    
    // A room is considered complete if it has moveOutCompleted, moveOutPhotoCount or moveOutNotes
    const allComplete = rooms.every(room => 
      room.moveOutCompleted ||
      (room.moveOutPhotoCount && room.moveOutPhotoCount > 0) || 
      (room.moveOutNotes && room.moveOutNotes.length > 0)
    );
    
    setAllRoomsCompleted(allComplete);
  }, [rooms]);

  // Fetch photos for all rooms
  const fetchAllRoomPhotos = useCallback(async (roomsList) => {
    if (!roomsList || !roomsList.length) return;
    
    // Process rooms in batches to avoid too many parallel requests
    const batchSize = 3;
    for (let i = 0; i < roomsList.length; i += batchSize) {
      const batch = roomsList.slice(i, i + batchSize);
      
      // Create promises for each room in the current batch
      const batchPromises = batch.map(room => fetchRoomPhotos(room.id));
      
      // Wait for the current batch to complete before moving to the next
      await Promise.all(batchPromises);
    }
  }, [fetchRoomPhotos]);

  const checkReportStatus = useCallback(async (propId) => {
    try {
      const response = await apiService.properties.hasSharedMoveOutReport(propId);
      console.log('Has shared move-out report:', response.data);
      setHasSharedReport(response.data.hasSharedMoveOutReport);
    } catch (error) {
      console.error('Error checking report status:', error);
    }
  }, []);

  const fetchPropertyData = useCallback(async (propId) => {
    try {
      setIsLoading(true);
      console.log('Move-out/rooms - Fetching property data for ID:', propId);
      
      // Get property details
      const propertyResponse = await apiService.properties.getById(propId);
      console.log('Move-out/rooms - Property API response:', propertyResponse);
      
      if (propertyResponse.data) {
        setProperty(propertyResponse.data);
        console.log('Move-out/rooms - Property loaded:', propertyResponse.data);
      }
      
      // Get rooms from API
      console.log('Move-out/rooms - Calling getRooms API for property:', propId);
      const roomsResponse = await apiService.properties.getRooms(propId);
      console.log('Move-out/rooms - Rooms API response:', roomsResponse);
      console.log('Move-out/rooms - Rooms data type:', typeof roomsResponse.data);
      console.log('Move-out/rooms - Rooms data:', roomsResponse.data);
      
      // Handle different response structures
      let roomsData = roomsResponse.data;
      if (roomsResponse.data && roomsResponse.data.rooms && Array.isArray(roomsResponse.data.rooms)) {
        // If rooms are nested under a 'rooms' property
        roomsData = roomsResponse.data.rooms;
      }
      
      if (roomsData && Array.isArray(roomsData)) {
        console.log('Move-out/rooms - Number of rooms received:', roomsData.length);
        
        // Get move-out data from localStorage
        const savedRooms = JSON.parse(localStorage.getItem(`property_${propId}_rooms`) || '[]');
        console.log('Move-out/rooms - Saved rooms from localStorage:', savedRooms);
        
        const formattedRooms = roomsData.map(room => {
          console.log('Move-out/rooms - Raw room data:', room);
          
          // Find the matching room in localStorage by roomId
          const savedRoom = savedRooms.find(saved => saved.roomId === room.roomId);
          console.log('Move-out/rooms - Found saved room:', savedRoom);
          
          // Backend returns camelCase field names
          const formattedRoom = {
            id: room.roomId,
            name: room.roomName || 'Unknown Room',
            type: room.roomType || 'other',
            photoCount: room.photoCount || 0,
            movein_items_noted: room.roomIssueNotes ? room.roomIssueNotes.length : 0,
            room_quality: room.roomQuality || null,
            roomIssueNotes: room.roomIssueNotes || [],
            // Move-out specific fields from localStorage or API
            moveOutNotes: savedRoom?.moveOutNotes || room.moveOutNotes || [],
            moveOutPhotoCount: savedRoom?.moveOutPhotoCount || room.moveOutPhotoCount || 0,
            moveOutDate: savedRoom?.moveOutDate || room.moveOutDate,
            moveOutCompleted: savedRoom?.moveOutCompleted || room.moveOutCompleted || false
          };
          console.log('Move-out/rooms - Formatted room:', formattedRoom);
          return formattedRoom;
        });
        setRooms(formattedRooms);
        console.log('Move-out/rooms - All formatted rooms:', formattedRooms);
        console.log('Move-out/rooms - Setting', formattedRooms.length, 'rooms to state');
      } else {
        console.log('Move-out/rooms - No rooms data or not an array:', roomsResponse.data);
        setRooms([]);
      }
      
    } catch (error) {
      console.error('Move-out/rooms - Error loading property data:', error);
      console.error('Move-out/rooms - Error details:', error.response?.data);
      setProperty(null);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
      return;
    }
    
    if (router.isReady && propertyId) {
      fetchPropertyData(propertyId);
      checkReportStatus(propertyId);
    }
  }, [user, loading, router, propertyId, router.isReady, fetchPropertyData, checkReportStatus]);
  
  // Fetch photos when rooms are loaded
  useEffect(() => {
    if (rooms.length > 0) {
      fetchAllRoomPhotos(rooms);
      checkAllRoomsCompleted();
    }
  }, [rooms, fetchAllRoomPhotos, checkAllRoomsCompleted]);
  
  const getRoomStatus = (room) => {
    // First check if move-out is completed (has photos and notes)
    if (room.moveOutCompleted || room.moveOutPhotoCount > 0 || (room.moveOutNotes && room.moveOutNotes.length > 0)) {
      return {
        text: 'Completed',
        color: 'text-[#4D935A]', 
        bgColor: 'bg-[#E8F5EA]',
        isCompleted: true
      };
    }
    
    // All other cases show "Not Started"
    return {
      text: 'Not Started',
      color: 'text-[#818A95]',
      bgColor: 'bg-[#F0F2F5]',
      isCompleted: false
    };
  };
  
  const getRoomIcon = (roomType) => {
    switch(roomType) {
      case 'bedroom':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 13.1866V18.5366C5 18.9144 5.14646 19.2767 5.40663 19.5451C5.66679 19.8135 6.01867 19.9666 6.38667 19.9666H17.6133C17.9813 19.9666 18.3332 19.8135 18.5934 19.5451C18.8535 19.2767 19 18.9144 19 18.5366V13.1866M7 13.1866V8.93657C7 8.55877 7.14646 8.19649 7.40663 7.92812C7.66679 7.65975 8.01867 7.50657 8.38667 7.50657H15.6133C15.9813 7.50657 16.3332 7.65975 16.5934 7.92812C16.8535 8.19649 17 8.55877 17 8.93657V13.1866M3 13.1866H21M7 10.3666H11M7 7.50657V4.64657" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'kitchen':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 10V20M15.5 10V20M15.5 20H21V4H3V20H15.5ZM9 7H15M12 7V10" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'bathroom':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7V4.5C8 3.67157 8.67157 3 9.5 3C10.3284 3 11 3.67157 11 4.5C11 5.32843 10.3284 6 9.5 6C8.67157 6 8 6.67157 8 7.5V18M4 11H20M5 18V20M19 18V20M6 11V15C6 16.6569 7.34315 18 9 18H15C16.6569 18 18 16.6569 18 15V11" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'living':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12V17H3V21H7V17H17V21H21V17H19V12L12 3L5 12Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3H3V10H10V3Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 3H14V10H21V3Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 14H14V21H21V14Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 14H3V21H10V14Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };
  
  const handleRoomClick = (room) => {
    // Navigate to the specific room documentation page
    // Pass readOnly flag if report has been shared
    router.push({
      pathname: '/move-out/room',
      query: {
        propertyId: propertyId,
        roomId: room.id,
        roomName: room.name,
        roomType: room.type,
        readOnly: hasSharedReport // Pass read-only flag
      }
    });
  };
  
  const handleContinue = () => {
    // Go to summary page
    router.push({
      pathname: '/move-out/summary',
      query: { propertyId: propertyId }
    });
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
        <title>Move Out - Room Selection | tenantli</title>
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
        `}</style>
      </Head>

      <div className="fixed inset-0 bg-[#FBF5DA]"></div>
      
      <div className="relative min-h-screen mobile-full-height w-full font-['Nunito'] overflow-hidden">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-[#FBF5DA] z-20">
          <div className="w-full max-w-[390px] mx-auto">
            <div className="flex flex-row items-center px-[20px] h-[65px] gap-[10px]" style={{ paddingTop: 'env(safe-area-inset-top, 20px)' }}>
              <button 
                className="relative z-50 w-10 h-10 flex items-center justify-center -ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Back button clicked in rooms page - going to dashboard');
                  router.push('/');
                }}
                aria-label="Go back"
              >
                <BackIcon />
              </button>
              <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
                Room Selection
              </h1>
            </div>
          </div>
        </div>
        
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-4 left-4 right-4 max-w-md mx-auto bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300">
            <p className="text-sm font-medium">{notification}</p>
          </div>
        )}
        
        {/* Content with Fixed Header and Button */}
        <div className="w-full max-w-[390px] mx-auto">
          <div className="absolute inset-0 bg-[#FBF5DA]"></div>
          <div className="relative min-h-screen mobile-full-height flex flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 scroll-y" style={{paddingTop: '85px', paddingBottom: '100px'}}>
              {/* Property Name */}
              <h2 className="font-bold text-[18px] text-[#0B1420] mt-2 mb-6">
                {property?.address || 'Property'}
              </h2>
              
              
              {/* Rooms List */}
              <div className="space-y-3">
                {console.log('Move-out/rooms - Rendering rooms:', rooms)}
                {console.log('Move-out/rooms - Number of rooms to display:', rooms.length)}
                {rooms.length === 0 ? (
                  <div className="w-full p-4 bg-white border border-[#D1E7D5] rounded-2xl">
                    <p className="text-center text-[#515964]">No rooms found for this property.</p>
                    <p className="text-center text-sm text-[#515964] mt-2">Please add rooms to the property first.</p>
                  </div>
                ) : (
                  rooms.map((room) => {
                    const status = getRoomStatus(room);
                    const roomPhotosList = roomPhotos[room.id] || [];
                    console.log('Move-out/rooms - Rendering room:', room);
                    
                    return (
                      <div
                        key={room.id}
                        className="room-card w-full h-auto min-h-[77px] mb-[16px] p-[16px] bg-white border border-[#D1E7D5] rounded-[16px] cursor-pointer hover:border-[#1C2C40] transition-colors duration-200 relative"
                        onClick={() => handleRoomClick(room)}
                      >
                        <div className="flex flex-row justify-between items-start w-full">
                          <div className="flex flex-row items-start">
                            <div className="flex flex-col items-start gap-[8px] flex-1 pr-2">
                              {/* Status text moved above room name */}
                              {status.text === 'Not Started' && (
                                <span className="inline-flex items-center justify-center px-[8px] py-[2px] bg-[#D5DADF] rounded-[32px] h-[20px] w-[101px]">
                                  <span className="font-['Nunito'] font-semibold text-[12px] leading-[16px] text-[#515964]">
                                    Not Started Yet
                                  </span>
                                </span>
                              )}
                              {status.text === 'Completed' && (
                                <span className="inline-flex items-center justify-center px-[8px] py-[2px] bg-[#E8F5EA] rounded-[32px] h-[20px] w-[101px]">
                                  <span className="font-['Nunito'] font-semibold text-[12px] leading-[16px] text-[#4D935A]">
                                    Completed
                                  </span>
                                </span>
                              )}
                              
                              <div className="flex flex-row items-center gap-[4px] w-full flex-wrap">
                                <span className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                                  {room.name}
                                </span>
                              </div>
                              <div className="flex flex-row items-center gap-[4px] h-[24px]">
                                <div className="flex flex-row">
                                  {roomPhotosList.length > 0 ? (
                                    roomPhotosList.slice(0, 4).map((photo, idx) => (
                                      <div
                                        key={photo.id || idx}
                                        className="w-[24px] h-[24px] rounded-full bg-gray-200 border border-[#D1E7E2] overflow-hidden"
                                        style={{
                                          marginLeft: idx > 0 ? '-8px' : '0',
                                          backgroundImage: photo.src ? `url(${photo.src})` : 'none',
                                          backgroundSize: 'cover',
                                          backgroundPosition: 'center',
                                          zIndex: 10 - idx
                                        }}
                                      >
                                        {!photo.src && (
                                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6C4 7.10457 4.89543 8 6 8Z" fill="#A3ADB8"/>
                                              <path d="M9.33333 2H6.66667C3.33333 2 2 3.33333 2 6.66667V9.33333C2 12.6667 3.33333 14 6.66667 14H9.33333C12.6667 14 14 12.6667 14 9.33333V6.66667C14 3.33333 12.6667 2 9.33333 2ZM12.3067 9.63333L10.2867 7.22C10.08 6.96667 9.82667 6.96667 9.62 7.22L7.88667 9.3C7.68667 9.55 7.43333 9.55 7.23333 9.3L6.65333 8.58C6.45333 8.33667 6.20667 8.34333 6.01333 8.59333L3.81333 11.4767C3.57333 11.7933 3.69333 12.06 4.10667 12.06H11.8867C12.3 12.06 12.4267 11.7933 12.3067 9.63333Z" fill="#A3ADB8"/>
                                            </svg>
                                          </div>
                                        )}
                                        {idx === 3 && roomPhotosList.length > 4 && (
                                          <div className="flex items-center justify-center w-full h-full bg-[#1C2C40] text-white font-bold text-[10px]">
                                            +{roomPhotosList.length - 4}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="w-[24px] h-[24px] rounded-full bg-gray-200 border border-[#D1E7E2] overflow-hidden">
                                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6C4 7.10457 4.89543 8 6 8Z" fill="#A3ADB8"/>
                                          <path d="M9.33333 2H6.66667C3.33333 2 2 3.33333 2 6.66667V9.33333C2 12.6667 3.33333 14 6.66667 14H9.33333C12.6667 14 14 12.6667 14 9.33333V6.66667C14 3.33333 12.6667 2 9.33333 2ZM12.3067 9.63333L10.2867 7.22C10.08 6.96667 9.82667 6.96667 9.62 7.22L7.88667 9.3C7.68667 9.55 7.43333 9.55 7.23333 9.3L6.65333 8.58C6.45333 8.33667 6.20667 8.34333 6.01333 8.59333L3.81333 11.4767C3.57333 11.7933 3.69333 12.06 4.10667 12.06H11.8867C12.3 12.06 12.4267 11.7933 12.3067 9.63333Z" fill="#A3ADB8"/>
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <span className="font-semibold text-[12px] leading-[16px] text-[#515964] ml-[6px]">
                                  ({roomPhotosList.length || room.photoCount || 0} {(roomPhotosList.length || room.photoCount || 0) === 1 ? 'Photo' : 'Photos'})
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center h-full">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 4.7998L15.52 11.3198C16.29 12.0898 16.29 13.3498 15.52 14.1198L9 20.6398" 
                                stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                  );
                  })
                )}
              </div>
            </div>
            
            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 px-5 pb-4 bg-[#FBF5DA] z-10">
              <div className="safe-area-bottom">
                <button
                  onClick={handleContinue}
                  disabled={!allRoomsCompleted}
                  className={`w-full h-[56px] flex justify-center items-center rounded-[16px] transition-colors duration-200 ${
                    allRoomsCompleted 
                      ? 'bg-[#1C2C40] hover:bg-[#243242] active:bg-[#0C1322]' 
                      : 'bg-[#E0E5EB] cursor-not-allowed'
                  }`}
                >
                  <span className={`font-bold text-[16px] leading-[22px] text-center ${
                    allRoomsCompleted ? 'text-[#D1E7E2]' : 'text-[#818A95]'
                  }`}>
                    {allRoomsCompleted ? 'Continue to Summary' : 'Complete All Rooms'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}