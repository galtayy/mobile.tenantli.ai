import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ConfigureRoom() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id, roomType, roomId, roomName: existingRoomName, returnUrl, readonly } = router.query;
  const [roomName, setRoomName] = useState('');
  const [initialRoomName, setInitialRoomName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputError, setInputError] = useState('');
  const isReadOnly = readonly === 'true';
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    // If we have an existing room name, use it
    if (existingRoomName) {
      setRoomName(existingRoomName);
      setInitialRoomName(existingRoomName);
    } else if (roomType) {
      // Otherwise, set initial room name based on room type
      let defaultName = '';
      switch (roomType) {
        case 'living':
          defaultName = 'Living Room';
          break;
        case 'bedroom':
          defaultName = 'Bedroom';
          break;
        case 'kitchen':
          defaultName = 'Kitchen';
          break;
        case 'bathroom':
          defaultName = 'Bathroom';
          break;
        case 'other':
          defaultName = 'Other Room';
          break;
        default:
          defaultName = 'New Room';
      }
      setRoomName(defaultName);
      setInitialRoomName(defaultName);
    }
  }, [roomType, existingRoomName]);
  
  const handleContinue = async () => {
    // Clear any previous errors
    setInputError('');
    
    if (roomName.trim() === '') {
      setInputError('Please enter a room name');
      return;
    }

    setIsSubmitting(true);

    console.log('[DEBUG] Starting handleContinue() function');
    console.log('[DEBUG] Current ID from router.query:', id);
    console.log('[DEBUG] Current roomType from router.query:', roomType);
    console.log('[DEBUG] Current roomId from router.query:', roomId);
    console.log('[DEBUG] Room name entered:', roomName);

    try {
      // Ensure ID is available before navigation
      if (!id) {
        console.error('Missing ID parameter for navigation');
        setInputError('Missing property ID');
        setIsSubmitting(false);
        return;
      }

      // First fetch existing rooms from the API instead of using localStorage
      // This ensures we always work with the most up-to-date data from the database
      let existingRooms = [];
      try {
        console.log('[DEBUG] Fetching existing rooms from API...');
        const response = await apiService.properties.getRooms(id);
        // The API returns an array directly, not nested under 'rooms'
        if (response.data && Array.isArray(response.data)) {
          existingRooms = response.data;
        } else {
          console.log('[DEBUG] API did not return an array:', response.data);
          existingRooms = [];
        }
        console.log('[DEBUG] Existing rooms from API:', existingRooms);
      } catch (fetchError) {
        console.error('Error fetching rooms from API:', fetchError);
        // Don't show error toast here, just continue silently
        // Continue with empty rooms array if fetch fails - we'll create a new room
      }

      // Check for duplicate room names
      const isDuplicateName = existingRooms.some(room => {
        // If we're editing an existing room, skip checking against itself
        if (roomId && roomId !== 'new' && room.roomId === roomId) {
          return false;
        }
        // Check if room name already exists (case-insensitive)
        return room.roomName && room.roomName.toLowerCase() === roomName.trim().toLowerCase();
      });

      if (isDuplicateName) {
        setInputError('A room with this name already exists');
        setIsSubmitting(false);
        return;
      }

      // Generate or use existing roomId
      let finalRoomId = roomId;
      if (!roomId || roomId === 'new') {
        // Create unique ID using timestamp and random number
        finalRoomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        console.log('[DEBUG] Generated new roomId:', finalRoomId);
      } else {
        console.log('[DEBUG] Using existing roomId:', finalRoomId);
      }

      // Create room data object
      const roomData = {
        roomName: roomName,
        roomType: roomType || 'other',
        roomId: finalRoomId,
        photoCount: 0,
        timestamp: new Date().toISOString()
      };

      console.log('[DEBUG] Room data to be saved:', roomData);

      // Update existing room or add new one
      const existingRoomIndex = existingRooms.findIndex(room => room.roomId === finalRoomId);

      if (existingRoomIndex >= 0) {
        // Update existing room but preserve important fields
        const existingRoom = existingRooms[existingRoomIndex];
        console.log('[DEBUG] Existing room data:', existingRoom);

        // Preserve existing values and only update modified ones
        existingRooms[existingRoomIndex] = {
          ...existingRoom,                     // Keep all existing data
          roomName: roomName,                  // Update only modified values
          roomType: roomType || existingRoom.roomType,
          timestamp: new Date().toISOString()
        };

        console.log('[DEBUG] Updated room data:', existingRooms[existingRoomIndex]);
      } else {
        // Add new room
        existingRooms.push(roomData);
        console.log('[DEBUG] Added new room:', roomData);
      }

      // Save rooms to the database via API - no longer using localStorage
      // This ensures data persistence and availability across devices
      try {
        console.log('[DEBUG] Saving rooms to database via API...');
        // Make sure we're passing the data correctly as {rooms: existingRooms}
        const saveResponse = await apiService.properties.saveRooms(id, existingRooms);
        console.log('[DEBUG] Successfully saved rooms to database:', saveResponse.data);

        // If API returns the saved rooms with server-generated IDs, use those instead
        if (saveResponse.data && saveResponse.data.rooms) {
          // Find the room we just saved in the response
          const savedRoom = saveResponse.data.rooms.find(room =>
            room.roomName === roomName && room.roomType === (roomType || 'other'));

          // Use the server-generated roomId if available
          if (savedRoom && savedRoom.roomId) {
            finalRoomId = savedRoom.roomId;
            console.log('[DEBUG] Using server-generated roomId:', finalRoomId);
          }
        }
      } catch (saveError) {
        console.error('Error saving rooms to database:', saveError);
        setInputError('Failed to save room');
        setIsSubmitting(false);
        return; // Stop execution if save fails - don't proceed to upload photos
      }

      // Navigate to upload-photos page after successful API call
      const timestamp = new Date().getTime();
      
      // Always navigate to upload-photos page, but pass returnUrl if it exists
      console.log("[DEBUG] Navigating to upload-photos page");

      // Log the final navigation parameters
      console.log("[DEBUG] Final navigation parameters:", {
        pathname: `/properties/${id}/upload-photos`,
        query: {
          roomName,
          roomType: roomType || '',
          roomId: finalRoomId, // Using the roomId from API or generated locally
          timestamp,
          returnUrl: returnUrl || '' // Pass returnUrl if it exists
        }
      });

      // Use Next.js router for client-side navigation
      // The roomId parameter is critical here - it must match what's in the database
      // so that uploaded photos are associated with the correct room
      const queryParams = {
        roomName,
        roomType: roomType || '',
        roomId: finalRoomId,
        t: timestamp // Cache-busting parameter
      };

      // Add returnUrl to query params if it exists
      if (returnUrl) {
        queryParams.returnUrl = returnUrl;
      }

      router.push({
        pathname: `/properties/${id}/upload-photos`,
        query: queryParams
      });
    } catch (error) {
      console.error('Error in room configuration process:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);

      // Show descriptive error message
      setInputError('Failed to save room configuration');
      setIsSubmitting(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleContinue();
    }
  };
  
  return (
    <>
      <Head>
        <title>{isReadOnly ? 'View Room' : (returnUrl?.includes('/summary') ? 'Edit Room' : 'Room Name')} - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
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
          
          /* iPhone X and newer notch handling */
          @supports (padding: max(0px)) {
            .safe-area-top {
              padding-top: max(env(safe-area-inset-top), 40px);
            }
            .safe-area-bottom {
              padding-bottom: max(env(safe-area-inset-bottom), 20px);
            }
          }
          
          /* Fix input focus zoom on iOS devices */
          @media screen and (-webkit-min-device-pixel-ratio: 0) { 
            select,
            textarea,
            input {
              font-size: 16px !important;
            }
          }
          
          /* Smooth transitions */
          * {
            -webkit-tap-highlight-color: transparent;
          }
          
          /* Scrolling performance */
          .scroll-y {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
          
          /* Button states */
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
        <div className="fixed top-0 w-full bg-[#FBF5DA] z-20">
          <div className="flex flex-row items-center px-[20px] h-[65px] gap-[10px]" style={{ paddingTop: 'env(safe-area-inset-top, 20px)' }}>
            {!returnUrl?.includes('/summary') && (
              <Link 
                href={id ? `/properties/${id}/add-rooms` : '/properties'}
                className="flex items-center relative z-10 hover:opacity-75 transition-opacity duration-200"
                aria-label="Go back"
              >
                <ArrowLeftIcon />
              </Link>
            )}
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
              {isReadOnly ? 'View Room' : (returnUrl?.includes('/summary') ? 'Edit Room' : 'Room Name')}
            </h1>
          </div>
        </div>
        
        {/* Content */}
        <div className="w-full max-w-[390px] mx-auto">
          <div className="absolute inset-0 bg-[#FBF5DA]"></div>
          <div className="relative min-h-screen mobile-full-height flex flex-col">
            <div className="h-[85px]"></div>
            
            {/* Main Content */}
            <div className="flex-1 px-5">
              <div className="font-bold text-[16px] leading-[22px] text-[#0B1420]">
                Give this room a name so you can easily recognize it later. Like "Bedroom 1" or "Guest Bath".
              </div>
              
              <div className="flex flex-col gap-[8px] w-full mt-6">
                <label className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                  Name Of This Room
                </label>
                
                <div className={`w-full h-[56px] flex items-center bg-[#F6FEF7] border rounded-[16px] px-5 ${
                  inputError ? 'border-red-500' : 'border-[#D1E7D5]'
                } ${isReadOnly ? '' : 'hover:border-[#1C2C40] transition-colors duration-200'}`}>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => {
                      if (!isReadOnly) {
                        setRoomName(e.target.value);
                        setInputError(''); // Clear error when user types
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter room name"
                    className="w-full font-bold text-[16px] leading-[22px] text-[#0B1420] bg-transparent border-none outline-none placeholder-[#A3ADB8]"
                    autoFocus={!isReadOnly}
                    readOnly={isReadOnly}
                  />
                </div>
                {inputError && (
                  <span className="text-red-500 text-[12px] leading-[16px] mt-1">
                    {inputError}
                  </span>
                )}
              </div>
            </div>
            
            {/* Fixed bottom button */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 bg-[#FBF5DA]">
              <div className="safe-area-bottom">
                {!isReadOnly ? (
                  <button
                    onClick={handleContinue}
                    disabled={isSubmitting}
                    className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] hover:bg-[#243242] active:bg-[#0C1322] rounded-[16px] transition-colors duration-200"
                  >
                    <span className="font-bold text-[16px] leading-[22px] text-center text-[#D1E7E2]">
                      {isSubmitting ? 'Saving...' : 'Continue'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(returnUrl || `/properties/${id}`)}
                    className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] hover:bg-[#243242] active:bg-[#0C1322] rounded-[16px] transition-colors duration-200"
                  >
                    <span className="font-bold text-[16px] leading-[22px] text-center text-[#D1E7E2]">
                      Back to Summary
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}