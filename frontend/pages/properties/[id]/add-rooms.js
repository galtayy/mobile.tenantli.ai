import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Head from 'next/head';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';
import { getRoomPhotoUrl } from '../../../lib/helpers/photoHelper';
import { motion, AnimatePresence } from 'framer-motion';

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3V13" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 8H13" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Living Room icon
const LivingRoomIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 22H22" stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.95 22L3 9L6 11V14H18V11L21 9V22" stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinejoin="round"/>
    <path d="M4 6V4C4 2.9 4.9 2 6 2H18C19.1 2 20 2.9 20 4V6" stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 11H6V7C6 5.9 6.9 5 8 5H16C17.1 5 18 5.9 18 7V11Z" stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Bedroom icon
const BedroomIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20Z" stroke="#1C2C40" strokeWidth="1.5"/>
    <path d="M4 8H20" stroke="#1C2C40" strokeWidth="1.5"/>
    <path d="M12 8V20" stroke="#1C2C40" strokeWidth="1.5"/>
  </svg>
);

// Kitchen icon
const KitchenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="#1C2C40" strokeWidth="1.5"/>
    <path d="M7.5 5V19" stroke="#1C2C40" strokeWidth="1.5"/>
    <path d="M12 12H16" stroke="#1C2C40" strokeWidth="1.5"/>
  </svg>
);

// Bathroom icon
const BathroomIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 9H20V18C20 20 18.5 22 16 22H8C5.5 22 4 20 4 18V9Z" stroke="#1C2C40" strokeWidth="1.5"/>
    <path d="M4 5C4 3 5 2 7 2H17C19 2 20 3 20 5V9H4V5Z" stroke="#1C2C40" strokeWidth="1.5"/>
    <circle cx="16" cy="5.5" r="1.5" stroke="#1C2C40" strokeWidth="1.5"/>
  </svg>
);

// Other icon
const OtherIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8H22V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V8Z" stroke="#0B1420" strokeWidth="1.5"/>
    <path d="M5 2V8" stroke="#0B1420" strokeWidth="1.5"/>
    <path d="M9 2V8" stroke="#0B1420" strokeWidth="1.5"/>
    <path d="M15 2V8" stroke="#0B1420" strokeWidth="1.5"/>
    <path d="M19 2V8" stroke="#0B1420" strokeWidth="1.5"/>
  </svg>
);

// Arrow right icon
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.94001 13.2799L10.6 8.61989C11.14 8.07989 11.14 7.17989 10.6 6.63989L5.94001 1.97989" 
      stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Room Card Component
const RoomCard = ({ room, index, router, id, deleteRoom, roomPhotos, apiService, getRoomPhotoUrl }) => {
  const [isSwipedLeft, setIsSwipedLeft] = useState(false);
  const isRoomCompleted = room.isCompleted;
  
  return (
    <motion.div
      key={room.id || index}
      className="relative overflow-hidden mb-[16px]"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background - shows full width of card */}
      <div className="absolute inset-0 bg-red-500 rounded-[16px]" />
      
      {/* Delete button area - 15% width on right side - Only visible when swiped */}
      <div
        className={`absolute inset-y-0 right-0 w-[15%] bg-red-500 rounded-r-[16px] flex items-center justify-center z-20 ${isSwipedLeft ? 'visible' : 'invisible'}`}
      >
        <button
          className="w-full h-full flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[DEBUG] Delete button clicked for room:', room.id);
            deleteRoom(e, room.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Odayı sil"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 4.98C15.5583 4.70833 13.6 4.56667 11.65 4.56667C10 4.56667 8.35 4.65 6.7 4.81667L5 4.98" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.08333 4.14167L7.26667 3.05C7.4 2.25833 7.5 1.66667 8.90833 1.66667H11.0917C12.5 1.66667 12.6083 2.29167 12.7333 3.05833L12.9167 4.14167" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.7083 7.61667L15.1667 16.0083C15.075 17.3167 15 18.3333 12.675 18.3333H7.32499C5 18.3333 4.92499 17.3167 4.83333 16.0083L4.29167 7.61667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.60833 13.75H11.3833" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.91667 10.4167H12.0833" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {/* Swipeable room card */}
      <motion.div
        className="room-card relative"
        style={{ zIndex: isSwipedLeft ? 5 : 10 }}
        drag="x"
        dragConstraints={{ left: -60, right: 0 }}
        dragElastic={{ left: 0.2, right: 0 }}
        dragSnapToOrigin={false}
        dragDirection="horizontal"
        onDragEnd={(event, info) => {
          // Sola yeterince sürüklendi mi kontrol et
          if (info.offset.x < -30) {
            setIsSwipedLeft(true);
          } else {
            setIsSwipedLeft(false);
          }
        }}
        animate={{ x: isSwipedLeft ? -60 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        whileDrag={{ cursor: "grabbing" }}
      >
        <div
          className="p-[16px] bg-white border border-[#D1E7D5] rounded-[16px] cursor-pointer hover:border-[#1C2C40] transition-colors duration-200"
          onClick={() => {
            if (!isSwipedLeft) {
              router.push({
                pathname: `/properties/${id}/configure-room`,
                query: {
                  roomName: room.name,
                  roomType: room.type,
                  roomId: room.id
                }
              });
            }
          }}
        >
          <div className="flex flex-row justify-between items-start w-full">
            <div className="flex flex-row items-start">
              <div className="flex flex-col items-start gap-[8px] flex-1 pr-2">
                <div className="flex flex-row items-center gap-[4px] w-full flex-wrap">
                  {isRoomCompleted && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                      <circle cx="8" cy="8" r="8" fill="#1C2C40"/>
                      <path d="M6.66667 8.66667L7.33333 9.33333L9.33333 7.33333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  <span className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                    {room.name}
                  </span>
                  {room.roomQuality === 'attention' && room.itemsNoted > 0 && (
                    <span className="font-semibold text-[14px] leading-[19px] text-[#0B1420]">
                      ({room.itemsNoted} {room.itemsNoted === 1 ? 'item' : 'items'} noted)
                    </span>
                  )}
                  {room.roomQuality === 'good' && (
                    <span className="font-semibold text-[14px] leading-[19px] text-[#55A363]">
                      (Looks good)
                    </span>
                  )}
                  {(!room.roomQuality || room.roomQuality === 'null' || room.roomQuality === 'undefined') && (
                    <span className="font-semibold text-[14px] leading-[19px] text-[#515964]">
                      (No assessment)
                    </span>
                  )}
                </div>
                <div className="flex flex-row items-center gap-[4px] h-[24px]">
                  <div className="flex flex-row">
                {console.log('Room photos for', room.id, ':', roomPhotos[room.id]?.photos?.length || 0, 'photos')}
                {Array.from({ length: Math.min(room.photoCount || 0, 4) }).map((_, i) => {
                  // Console log for debugging
                  console.log('Rendering photo', i, 'for room', room.id);

                  // Get photo URL from room photos if available
                  let photoUrl = null;

                  try {
                    // Use the imported helper function
                    photoUrl = getRoomPhotoUrl(roomPhotos, room, i);
                    
                    // Fallback if helper doesn't work
                    if (!photoUrl) {
                      if (roomPhotos[room.id]?.photos?.[i]?.url) {
                        photoUrl = roomPhotos[room.id].photos[i].url;
                      } else if (roomPhotos[room.id]?.photos?.[i]?.file_path) {
                        photoUrl = `${apiService.getBaseUrl()}/uploads/${roomPhotos[room.id].photos[i].file_path}`;
                      }
                    }
                  } catch (error) {
                    console.error(`Error rendering photo ${i} for room ${room.id}:`, error);
                  }

                  console.log('Photo URL for', room.id, ':', photoUrl);

                  return (
                    <div
                      key={i}
                      className="w-[24px] h-[24px] rounded-full bg-gray-200 border border-[#D1E7E2] overflow-hidden"
                      style={{
                        marginLeft: i > 0 ? '-8px' : '0',
                        backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: 10 - i // Higher z-index for first items
                      }}
                    >
                      {!photoUrl && (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6C4 7.10457 4.89543 8 6 8Z" fill="#A3ADB8"/>
                            <path d="M9.33333 2H6.66667C3.33333 2 2 3.33333 2 6.66667V9.33333C2 12.6667 3.33333 14 6.66667 14H9.33333C12.6667 14 14 12.6667 14 9.33333V6.66667C14 3.33333 12.6667 2 9.33333 2ZM12.3067 9.63333L10.2867 7.22C10.08 6.96667 9.82667 6.96667 9.62 7.22L7.88667 9.3C7.68667 9.55 7.43333 9.55 7.23333 9.3L6.65333 8.58C6.45333 8.33667 6.20667 8.34333 6.01333 8.59333L3.81333 11.4767C3.57333 11.7933 3.69333 12.06 4.10667 12.06H11.8867C12.3 12.06 12.4267 11.7933 12.3067 9.63333Z" fill="#A3ADB8"/>
                          </svg>
                        </div>
                      )}
                      {i === 3 && room.photoCount > 4 && (
                        <div className="flex items-center justify-center w-full h-full bg-[#1C2C40] text-white font-bold text-[10px]">
                          +{room.photoCount - 3}
                        </div>
                      )}
                    </div>
                  );
                })}
                  </div>
                  <span className="font-semibold text-[12px] leading-[16px] text-[#515964] ml-[6px]">
                    ({parseInt(room.photoCount) || 0} {parseInt(room.photoCount) === 1 ? 'Photo' : 'Photos'})
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center h-full">
              <ArrowRightIcon />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Room type selection component
const RoomTypeSelector = ({ show, onSelect, onClose }) => {
  // Animation states
  const [animationClass, setAnimationClass] = useState('');
  
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
  
  // Handle selection with animation
  const handleSelect = (type) => {
    setAnimationClass('');
    // Wait for animation to finish before selecting
    setTimeout(() => {
      onSelect(type);
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
        className={`absolute inset-0 bg-black bg-opacity-40 bottom-sheet-overlay ${animationClass}`}
        onClick={handleClose}
      ></div>
      
      {/* Bottom Sheet */}
      <div className={`absolute bottom-0 left-0 right-0 w-full h-auto max-h-[80vh] bg-white rounded-t-[24px] overflow-hidden bottom-sheet ${animationClass}`} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Handle Bar */}
        <div className="flex justify-center items-center pt-[10px] pb-0">
          <div className="w-[95px] h-[6px] bg-[#ECECEC] rounded-[24px]"></div>
        </div>
        
        {/* Title */}
        <div className="flex justify-center items-center h-[55px]">
          <h3 className="font-bold text-[18px] leading-[25px] text-[#0B1420]">
            Choose Room Type
          </h3>
        </div>
        
        {/* Room Type Options */}
        <div className="w-full max-w-[480px] mx-auto px-4">
          {/* Living Room Option */}
          <div 
            className="room-option flex flex-row justify-between items-center h-[56px] border-b border-[#ECF0F5] px-0 py-[16px] cursor-pointer hover:bg-gray-50"
            onClick={() => handleSelect('living')}
          >
            <div className="flex flex-row items-center gap-[12px]">
              <LivingRoomIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Living Room
              </div>
            </div>
          </div>
          
          {/* Bedroom Option */}
          <div 
            className="room-option flex flex-row justify-between items-center h-[56px] border-b border-[#ECF0F5] px-0 py-[16px] cursor-pointer hover:bg-gray-50"
            onClick={() => handleSelect('bedroom')}
          >
            <div className="flex flex-row items-center gap-[12px]">
              <BedroomIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Bedroom
              </div>
            </div>
          </div>
          
          {/* Kitchen Option */}
          <div 
            className="room-option flex flex-row justify-between items-center h-[56px] border-b border-[#ECF0F5] px-0 py-[16px] cursor-pointer hover:bg-gray-50"
            onClick={() => handleSelect('kitchen')}
          >
            <div className="flex flex-row items-center gap-[12px]">
              <KitchenIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Kitchen
              </div>
            </div>
          </div>
          
          {/* Bathroom Option */}
          <div 
            className="room-option flex flex-row justify-between items-center h-[56px] border-b border-[#ECF0F5] px-0 py-[16px] cursor-pointer hover:bg-gray-50"
            onClick={() => handleSelect('bathroom')}
          >
            <div className="flex flex-row items-center gap-[12px]">
              <BathroomIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Bathroom
              </div>
            </div>
          </div>
          
          {/* Other Option */}
          <div 
            className="room-option flex flex-row justify-between items-center h-[56px] px-0 py-[16px] cursor-pointer hover:bg-gray-50"
            onClick={() => handleSelect('other')}
          >
            <div className="flex flex-row items-center gap-[12px]">
              <OtherIcon />
              <div className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                Other
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AddRooms() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoomTypeSelector, setShowRoomTypeSelector] = useState(false);
  const [currentEditingRoom, setCurrentEditingRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomPhotos, setRoomPhotos] = useState({});
  const [isPropertySetupComplete, setIsPropertySetupComplete] = useState(false);
  const formRef = useRef(null);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    }
  }, [user, loading, router]);
  
  // Ensure we have ID parameter before attempting any navigation
  useEffect(() => {
    if (!id && !loading) {
      console.error('Missing ID parameter');
      // Redirect to a safe page if ID is missing
      router.push('/properties');
    }
  }, [id, router, loading]);
  
  useEffect(() => {
    const fetchProperty = async () => {
      if (id) {
        try {
          setIsLoading(true);

          // Always try to load from database API first to get the latest data
          try {
            console.log('[FETCH DEBUG] Loading rooms from database API...');
            const roomsResponse = await apiService.properties.getRooms(id);
            console.log('[FETCH DEBUG] API response for rooms:', roomsResponse.data);

            if (roomsResponse.data && roomsResponse.data.length > 0) {
              // Format and use the rooms from the database
              const apiRooms = roomsResponse.data.map(room => ({
                id: room.roomId,
                name: room.roomName,
                type: room.roomType,
                photoCount: room.photoCount || 0,
                roomQuality: room.roomQuality || null,
                roomIssueNotes: room.roomIssueNotes || [],
                timestamp: room.timestamp
              }));

              // Store in localStorage for later use
              localStorage.setItem(`property_${id}_rooms`, JSON.stringify(roomsResponse.data));

              // Set state
              console.log('[FETCH DEBUG] Setting rooms state with API rooms:', apiRooms);
              setRooms(apiRooms);
              // Fetch photos for rooms
              fetchRoomPhotos(roomsResponse.data);
            } else {
              console.log('[FETCH DEBUG] No rooms found in database');
              
              // If no rooms in database, check localStorage as fallback
              const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
              console.log('[FETCH DEBUG] Checking localStorage as fallback:', savedRooms);

              if (savedRooms.length > 0) {
                console.log('[FETCH DEBUG] Found rooms in localStorage, formatting...');
                // Convert the saved room data to the format expected by the component
                const formattedRooms = savedRooms.map(room => ({
                  id: room.roomId,
                  name: room.roomName,
                  type: room.roomType,
                  photoCount: room.photoCount || 0,
                  roomQuality: room.roomQuality || null,
                  roomIssueNotes: room.roomIssueNotes || [],
                  timestamp: room.timestamp
                }));
                console.log('[FETCH DEBUG] Setting rooms state with formatted rooms:', formattedRooms);
                setRooms(formattedRooms);
                // Fetch photos for rooms
                fetchRoomPhotos(savedRooms);
              }
            }
          } catch (error) {
            console.error('Error loading rooms from API:', error);
          }
          
          // Fetch property data from API
          const response = await apiService.properties.getById(id);
          console.log('[FETCH DEBUG] Property data from API:', response.data);
          setProperty(response.data);
        } catch (error) {
          console.error('Error fetching property:', error);
          toast.error('Failed to load property details');
          
          // Even if API fails, we want to try loading rooms from localStorage
          try {
            const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
            if (savedRooms.length > 0) {
              const formattedRooms = savedRooms.map(room => ({
                id: room.roomId,
                name: room.roomName,
                type: room.roomType,
                photoCount: room.photoCount || 0,
                roomQuality: room.roomQuality || null,
                roomIssueNotes: room.roomIssueNotes || [],
                timestamp: room.timestamp
              }));
              setRooms(formattedRooms);
              // Fetch photos for rooms
              fetchRoomPhotos(savedRooms);
            }
          } catch (e) {
            console.error('Error loading rooms from localStorage:', e);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProperty();
  }, [id]);
  
  // Handle the return from configure-room page or upload-photos page
  useEffect(() => {
    // Değişkeni saklamak için
    const success = router.query.success;
    const roomName = router.query.roomName;
    const roomType = router.query.roomType;
    const roomId = router.query.roomId;
    const timestamp = router.query.t;
    
    // Debug logları ekleyelim
    console.log('[DEBUG] Current router.query:', router.query);
    console.log('[DEBUG] Current ID param:', id);
    console.log('[DEBUG] Current success param:', success);
    console.log('[DEBUG] Current timestamp param:', timestamp);
    console.log('[DEBUG] Current localStorage rooms:', JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]'));
    
    // If we got a success parameter or timestamp, we're returning from another page
    if (success || timestamp) {
      // Check if we're returning from the upload-photos page
      if (success === 'true' && !roomName) {
        console.log('Returning from upload-photos page with success');
        // Fetch fresh data from the database
        if (id) {
          try {
            console.log('[REFRESH DEBUG] Fetching fresh room data from API...');
            apiService.properties.getRooms(id).then(roomsResponse => {
              console.log('[REFRESH DEBUG] API response for rooms:', roomsResponse.data);
              
              if (roomsResponse.data && roomsResponse.data.length > 0) {
                // Format and use the rooms from the database
                const apiRooms = roomsResponse.data.map(room => ({
                  id: room.roomId,
                  name: room.roomName,
                  type: room.roomType,
                  photoCount: room.photoCount || 0,
                  roomQuality: room.roomQuality || null,
                  roomIssueNotes: room.roomIssueNotes || [],
                  timestamp: room.timestamp
                }));
                
                // Update localStorage
                localStorage.setItem(`property_${id}_rooms`, JSON.stringify(roomsResponse.data));
                
                // Set state
                console.log('[REFRESH DEBUG] Setting rooms state with fresh API rooms:', apiRooms);
                setRooms(apiRooms);
                // Fetch photos for rooms
                fetchRoomPhotos(roomsResponse.data);
              }
            }).catch(error => {
              console.error('[REFRESH DEBUG] Error fetching fresh room data:', error);
              // Fall back to localStorage if API fails
              const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
              if (savedRooms.length > 0) {
                const formattedRooms = savedRooms.map(room => ({
                  id: room.roomId,
                  name: room.roomName,
                  type: room.roomType,
                  photoCount: room.photoCount || 0,
                  roomQuality: room.roomQuality || null,
                  roomIssueNotes: room.roomIssueNotes || [],
                  timestamp: room.timestamp
                }));
                setRooms(formattedRooms);
                fetchRoomPhotos(savedRooms);
              }
            });
          } catch (error) {
            console.error('[REFRESH DEBUG] Error in refresh logic:', error);
          }
        }
      }
      // Check if we're returning from the configure-room page
      else if (roomName && roomType) {
        // Add or update room
        if (roomId === 'new') {
          // Add new room with unique ID including random component
          const uniqueRoomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          setRooms(prev => [...prev, { 
            id: uniqueRoomId,
            name: roomName,
            type: roomType,
            photoCount: 0
          }]);
          toast.success('Room added successfully!');
        } else {
          // Update existing room
          const roomIdToUpdate = roomId;
          
          // Use setRooms with function to avoid dependency on rooms state
          setRooms(prevRooms => {
            const roomIndexToUpdate = prevRooms.findIndex(r => r.id === roomIdToUpdate);
            
            if (roomIndexToUpdate >= 0) {
              const newRooms = [...prevRooms];
              newRooms[roomIndexToUpdate] = {
                ...newRooms[roomIndexToUpdate],
                name: roomName,
                type: roomType
              };
              toast.success('Room updated successfully!');
              return newRooms;
            }
            
            return prevRooms;
          });
        }
      }
      // If we just have a timestamp (from upload-photos navigation), refresh rooms
      else if (timestamp && !success) {
        console.log('[TIMESTAMP DEBUG] Timestamp detected, refreshing room data from API...');
        if (id) {
          apiService.properties.getRooms(id).then(roomsResponse => {
            console.log('[TIMESTAMP DEBUG] API response for rooms:', roomsResponse.data);
            
            if (roomsResponse.data && roomsResponse.data.length > 0) {
              // Format and use the rooms from the database
              const apiRooms = roomsResponse.data.map(room => ({
                id: room.roomId,
                name: room.roomName,
                type: room.roomType,
                photoCount: room.photoCount || 0,
                roomQuality: room.roomQuality || null,
                roomIssueNotes: room.roomIssueNotes || [],
                timestamp: room.timestamp
              }));
              
              // Update localStorage
              localStorage.setItem(`property_${id}_rooms`, JSON.stringify(roomsResponse.data));
              
              // Set state
              console.log('[TIMESTAMP DEBUG] Setting rooms state with fresh API rooms:', apiRooms);
              setRooms(apiRooms);
              // Fetch photos for rooms
              fetchRoomPhotos(roomsResponse.data);
            }
          }).catch(error => {
            console.error('[TIMESTAMP DEBUG] Error fetching fresh room data:', error);
          });
        }
      }
      
      // Use setTimeout to avoid potential React render issues
      setTimeout(() => {
        // Clean up query parameters after processing using window.history
        if (typeof window !== 'undefined') {
          const url = window.location.pathname;
          window.history.replaceState({}, document.title, url);
        }
      }, 0);
    }
  }, [router.query, id]);
  
  const addNewRoom = () => {
    setShowRoomTypeSelector(true);
    setCurrentEditingRoom('new');
  };
  
  // Delete room function
  const deleteRoom = async (e, roomId) => {
    // Stop event propagation to prevent card click
    e.stopPropagation();

    console.log('[DEBUG] Attempting to delete room with ID:', roomId);

    // Confirm deletion
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        // Delete room from backend
        console.log('[DEBUG] Sending delete request for room:', roomId, 'property:', id);
        const deleteResponse = await apiService.properties.deleteRoom(id, roomId);
        console.log('[DEBUG] Delete response:', deleteResponse.data);
        console.log('[DEBUG] Room deleted from backend:', roomId);

        // Update localStorage after backend deletion
        const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
        
        // Filter by roomId or string format
        const updatedRooms = savedRooms.filter(room => {
          const currentRoomId = room.roomId || room.id;
          return currentRoomId !== roomId && currentRoomId !== String(roomId);
        });
        
        localStorage.setItem(`property_${id}_rooms`, JSON.stringify(updatedRooms));

        // Update rooms on screen - with string/number check
        setRooms(rooms.filter(room => room.id !== roomId && room.id !== String(roomId)));

        // Clean up room photos
        try {
          localStorage.removeItem(`property_${id}_room_${roomId}_photos`);

          // Remove from shared photos object
          const allRoomPhotos = JSON.parse(localStorage.getItem(`property_${id}_room_photos`) || '{}');
          if (allRoomPhotos[roomId]) {
            delete allRoomPhotos[roomId];
            localStorage.setItem(`property_${id}_room_photos`, JSON.stringify(allRoomPhotos));
            console.log('[DEBUG] Removed photos for room:', roomId);
          }
        } catch (photoError) {
          console.error('Error deleting room photos:', photoError);
        }

        // Success - no toast message as per original
      } catch (error) {
        console.error('Error deleting room:', error);
        // Error - no toast message as per original
      }
    }
  };

  const handleRoomTypeSelect = (type) => {
    setShowRoomTypeSelector(false);
    
    // Make sure ID is available before navigation
    if (!id) {
      console.error('Missing ID parameter for navigation');
      toast.error('Missing property ID. Please try again.');
      return;
    }
    
    // Navigate to the room configuration page
    if (currentEditingRoom === 'new') {
      // Creating a new room
      // Use window.location for direct navigation
      window.location.href = `/properties/${id}/configure-room?roomType=${encodeURIComponent(type)}`;
    } else {
      // Editing an existing room - currentEditingRoom is the index
      const roomToEdit = rooms[currentEditingRoom];
      if (roomToEdit) {
        // Use window.location for direct navigation
        window.location.href = `/properties/${id}/configure-room?roomType=${encodeURIComponent(type)}&roomId=${encodeURIComponent(roomToEdit.id)}&initialName=${encodeURIComponent(roomToEdit.name)}`;
      }
    }
  };
  
  const getRoomIcon = (type) => {
    switch (type) {
      case 'living':
        return <LivingRoomIcon />;
      case 'bedroom':
        return <BedroomIcon />;
      case 'kitchen':
        return <KitchenIcon />;
      case 'bathroom':
        return <BathroomIcon />;
      default:
        return <OtherIcon />;
    }
  };
  
  
  const updateRoomName = (roomId, newName) => {
    // Update the room name in the state
    const roomIndex = rooms.findIndex(room => room.id === roomId);
    if (roomIndex >= 0) {
      const newRooms = [...rooms];
      newRooms[roomIndex].name = newName;
      setRooms(newRooms);
      
      // Also update in localStorage
      if (id) {
        const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
        const savedRoomIndex = savedRooms.findIndex(room => room.roomId === roomId);
        if (savedRoomIndex >= 0) {
          savedRooms[savedRoomIndex].roomName = newName;
          localStorage.setItem(`property_${id}_rooms`, JSON.stringify(savedRooms));
        }
      }
    }
  };
  
  const openRoomTypeSelector = (index) => {
    setCurrentEditingRoom(index);
    setShowRoomTypeSelector(true);
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!id) {
      toast.error('Missing property ID. Please try again.');
      return;
    }

    try {
      // Save to localStorage
      const roomsToSave = rooms.map(room => ({
        roomId: room.id,
        roomName: room.name,
        roomType: room.type,
        photoCount: room.photoCount || 0,
        roomQuality: room.roomQuality || null,
        roomIssueNotes: room.roomIssueNotes || [],
        timestamp: room.timestamp || new Date().toISOString()
      }));

      localStorage.setItem(`property_${id}_rooms`, JSON.stringify(roomsToSave));

      // Save to database API
      console.log('Saving rooms to API:', roomsToSave);
      await apiService.properties.saveRooms(id, roomsToSave);

      // Removed success toast message
    } catch (error) {
      console.error('Error saving rooms to database:', error);
      toast.error('Rooms saved locally, but failed to sync with database. You can continue.');
    }

    // Navigate to the landlord details page to complete property setup
    setTimeout(() => {
      // Use window.location for most reliable navigation
      window.location.href = `/properties/${id}/landlord-details`;
    }, 1000);
  };

  // Fetch photos for rooms
  const fetchRoomPhotos = async (roomsList) => {
    try {
      if (!id || !roomsList || !Array.isArray(roomsList)) {
        console.log('No property ID or rooms list, skipping photo fetch');
        return;
      }

      console.log('Fetching photos for all rooms in property:', id);
      
      try {
        // Fetch all photos for the property
        const response = await apiService.photos.getByProperty(id);
        console.log('Property photos from API:', response.data);
        
        if (response.data) {
          let photosByRoom = {};
          
          // Use photosByRoom from API response if available
          if (response.data.photosByRoom) {
            console.log('Using photosByRoom from API response');
            photosByRoom = response.data.photosByRoom;
          }
          // Otherwise, group photos by room_id
          else if (Array.isArray(response.data)) {
            console.log('Grouping photos by room_id');
            
            // Group each photo by its room
            response.data.forEach(photo => {
              if (photo.room_id) {
                if (!photosByRoom[photo.room_id]) {
                  photosByRoom[photo.room_id] = { photos: [] };
                }
                photosByRoom[photo.room_id].photos.push({
                  ...photo,
                  url: photo.url || `/uploads/${photo.file_path}`
                });
              }
            });
          }
          
          console.log('Final photosByRoom:', photosByRoom);
          setRoomPhotos(photosByRoom);
        }
      } catch (error) {
        console.error('Error fetching photos from API:', error);
      }
    } catch (error) {
      console.error('Failed to fetch room photos:', error);
    }
  };

  // Check if property setup is complete
  useEffect(() => {
    const checkPropertySetupComplete = () => {
      // Property should have basic info (address, description) and at least one room with photos
      const hasBasicInfo = property && property.address && property.description;
      const hasRooms = rooms && rooms.length > 0;
      const hasCompletedRoom = rooms.some(room => {
        const isCompleted = room.isCompleted || (parseInt(room.photoCount) > 0 && 
          (room.roomQuality === 'good' || (room.roomQuality === 'attention' && Array.isArray(room.roomIssueNotes) && room.roomIssueNotes.length > 0)));
        return isCompleted && room.photoCount > 0;
      });
      
      console.log('Property setup check:', {
        hasBasicInfo,
        hasRooms,
        hasCompletedRoom,
        property: property ? { address: property.address, description: property.description } : null,
        roomsCount: rooms.length,
        completedRooms: rooms.filter(room => {
          const isCompleted = room.isCompleted || (parseInt(room.photoCount) > 0 && 
            (room.roomQuality === 'good' || (room.roomQuality === 'attention' && Array.isArray(room.roomIssueNotes) && room.roomIssueNotes.length > 0)));
          return isCompleted && room.photoCount > 0;
        }).length
      });
      
      const isComplete = hasBasicInfo && hasRooms && hasCompletedRoom;
      setIsPropertySetupComplete(isComplete);
    };

    if (property !== null && rooms !== null && !isLoading) {
      checkPropertySetupComplete();
    }
  }, [property, rooms, isLoading]);

  // Handle Enter key globally
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [id, rooms]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FBF5DA]">
        <div className="text-[#1C2C40] text-lg">Loading...</div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Add Rooms - tenantli</title>
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
          body {
            background-color: #FBF5DA;
            margin: 0;
            padding: 0;
            font-family: 'Nunito', sans-serif;
            height: 100vh;
            width: 100%;
            overflow: hidden;
          }
          
          #__next {
            width: 100%;
            height: 100%;
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
          
          /* iPhone X and newer notch handling */
          @supports (padding: max(0px)) {
            .safe-area-top {
              padding-top: max(env(safe-area-inset-top), 40px);
            }
            .safe-area-bottom {
              padding-bottom: max(env(safe-area-inset-bottom), 20px);
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
          
          /* Responsive design */
          @media (min-width: 768px) {
            .mobile-container {
              max-width: 480px;
              margin: 0 auto;
            }
          }
          
          /* Hover effects */
          @media (hover: hover) {
            .btn-primary:hover {
              background-color: #152036;
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            .btn-add:hover {
              background-color: #f8f8f8;
              border-color: #a4c4a8;
            }
            
            .room-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .room-option:hover {
              background-color: #f8f8f8;
            }
          }
          
          /* Transitions */
          .btn-primary, .btn-add, .room-card, .room-option {
            transition: all 0.2s ease;
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
        <div className="absolute top-0 w-full bg-[#FBF5DA] z-10">
          <div className="flex flex-row items-center px-[20px] pt-[60px] pb-[20px] relative">
            <button 
              className="flex items-center relative z-10 hover:opacity-75 transition-opacity duration-200"
              onClick={async () => {
                // Check if property is incomplete and should be deleted
                const isIncomplete = localStorage.getItem(`property_${id}_incomplete`);
                
                if (isIncomplete === 'true' && id) {
                  // Delete the incomplete property
                  try {
                    console.log('Deleting incomplete property:', id);
                    await apiService.properties.delete(id);
                    
                    // Clean up localStorage
                    localStorage.removeItem(`property_${id}_incomplete`);
                    localStorage.removeItem(`property_${id}_addunit`);
                    localStorage.removeItem(`property_${id}_rooms`);
                    
                    console.log('Incomplete property deleted successfully');
                    router.push('/properties/addunit');
                  } catch (deleteError) {
                    console.error('Error deleting incomplete property:', deleteError);
                    
                    // Clean up localStorage regardless
                    localStorage.removeItem(`property_${id}_incomplete`);
                    localStorage.removeItem(`property_${id}_addunit`);
                    localStorage.removeItem(`property_${id}_rooms`);
                    
                    // If property not found (404), go to dashboard
                    if (deleteError.response && deleteError.response.status === 404) {
                      console.log('Property not found, redirecting to dashboard');
                      router.push('/');
                    } else {
                      // For other errors, go back to addunit
                      router.push('/properties/addunit');
                    }
                  }
                } else if (id) {
                  // Property is complete, go to dashboard
                  router.push('/');
                } else {
                  router.back();
                }
              }}
              aria-label="Go back"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
              {property?.description || property?.address || 'Property Details'}
            </h1>
          </div>
        </div>
      
        {/* Content */}
        <div className="w-full max-w-[390px] mx-auto">
          <div className="absolute inset-0 bg-[#FBF5DA]"></div>
          <div className="relative min-h-screen mobile-full-height flex flex-col">
            <div className="h-[120px]"></div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5">
              {/* Content Section */}
              <div className="pt-6">
                <div className="max-w-[480px] mx-auto">
                  <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420]">
                    Let's build your walkthrough one room at a time 📂
                  </h2>
                  <p className="font-normal text-[14px] leading-[19px] text-[#515964] mt-1">
                    Add rooms one by one so we can help you document everything properly.
                  </p>
                </div>
              </div>
              
              {/* Room List */}
              <div className="pt-6">
                {rooms.length > 0 && (
                  <AnimatePresence>
                    {rooms.map((room, index) => {
                      // Ensure room has required properties for RoomCard
                      const roomWithCompleteData = {
                        ...room,
                        isCompleted: room.isCompleted || (parseInt(room.photoCount) > 0 && 
                          (room.roomQuality === 'good' || (room.roomQuality === 'attention' && Array.isArray(room.roomIssueNotes) && room.roomIssueNotes.length > 0))),
                        itemsNoted: Array.isArray(room.roomIssueNotes) ? room.roomIssueNotes.length : 0
                      };
                      
                      return (
                        <RoomCard 
                          key={room.id || index}
                          room={roomWithCompleteData}
                          index={index}
                          router={router}
                          id={id}
                          deleteRoom={deleteRoom}
                          roomPhotos={roomPhotos}
                          apiService={apiService}
                          getRoomPhotoUrl={getRoomPhotoUrl}
                        />
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
              
              {/* Add New Room Button */}
              <div className="py-4 pb-24">
                <button 
                  type="button"
                  onClick={addNewRoom}
                  className="btn-add w-full h-[56px] flex justify-center items-center bg-white border border-[#D1E7D5] rounded-[16px] hover:border-[#1C2C40] transition-colors duration-200"
                >
                  <div className="flex flex-row items-center gap-[4px]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 12H18" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 18V6" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-bold text-[14px] leading-[19px] text-[#515964]">
                      Add New Room
                    </span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Fixed bottom button */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 bg-[#FBF5DA]">
              <div className="safe-area-bottom">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={rooms.length === 0}
                  className={`w-full h-[56px] flex justify-center items-center rounded-[16px] transition-colors duration-200 ${
                    rooms.length === 0 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-[#1C2C40] hover:bg-[#243242] active:bg-[#0C1322]'
                  }`}
                >
                  <span className={`font-bold text-[16px] leading-[22px] ${
                    rooms.length === 0 ? 'text-gray-500' : 'text-[#D1E7E2]'
                  }`}>
                    Continue
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Room Type Selector Bottom Sheet */}
      <RoomTypeSelector 
        show={showRoomTypeSelector}
        onSelect={handleRoomTypeSelect}
        onClose={() => {
          setShowRoomTypeSelector(false);
          setCurrentEditingRoom(null);
        }}
      />
    </>
  );
}