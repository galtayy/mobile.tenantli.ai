import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { apiService } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { getRoomPhotoUrl } from '../../../lib/helpers/photoHelper';
import { motion, AnimatePresence } from 'framer-motion';

// Room icon components (aynı)
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

// Add icon
const AddIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12H18" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18V6" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

// Arrow right icon
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.94001 13.2799L10.6 8.61989C11.14 8.07989 11.14 7.17989 10.6 6.63989L5.94001 1.97989" 
      stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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
      <div className={`absolute bottom-0 left-0 right-0 w-full h-[385px] bg-white rounded-t-[24px] overflow-hidden bottom-sheet ${animationClass} safe-area-bottom`}>
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
        <div className="w-full max-w-[350px] mx-auto">
          {/* Living Room Option */}
          <div
            className="flex flex-row justify-between items-center h-[56px] border-b border-[#ECF0F5] px-0 py-[16px]"
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
            className="flex flex-row justify-between items-center h-[56px] border-b border-[#ECF0F5] px-0 py-[16px]"
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
            className="flex flex-row justify-between items-center h-[56px] border-b border-[#ECF0F5] px-0 py-[16px]"
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
            className="flex flex-row justify-between items-center h-[56px] border-b border-[#ECF0F5] px-0 py-[16px]"
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
            className="flex flex-row justify-between items-center h-[56px] px-0 py-[16px]"
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

export default function PropertyDetail() {
  const { user, loading: authLoading } = useAuth();
  const [property, setProperty] = useState(null);
  const [reports, setReports] = useState([]);
  const [roomPhotos, setRoomPhotos] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoomTypeSelector, setShowRoomTypeSelector] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchProperty();
      fetchPropertyReports();
      loadRooms(); // Doğrudan API'den odalara erişiyoruz
    }
  }, [id, user, authLoading, router]);
  
  // Room bilgilerini doğrudan API'den yükle
  const loadRooms = async () => {
    try {
      console.log('Loading rooms directly from API for property:', id);
      
      const roomsResponse = await apiService.properties.getRooms(id);
      console.log('API response for rooms:', roomsResponse.data);
      
      if (roomsResponse.data && Array.isArray(roomsResponse.data)) {
        // Her odayı konsola yazdır - debug
        roomsResponse.data.forEach(room => {
          console.log(`[DEBUG] Room from API - ID: ${room.roomId}, Name: ${room.roomName}, Quality: ${room.roomQuality}, Photos: ${room.photoCount}`);
        });
        
        // Oda verilerini formatlayarak state'e kaydet
        const formattedRooms = roomsResponse.data.map(room => ({
          id: room.roomId,
          name: room.roomName || 'Unnamed Room',
          type: room.roomType || 'other',
          itemsNoted: Array.isArray(room.roomIssueNotes) ? room.roomIssueNotes.length : 0,
          photoCount: parseInt(room.photoCount) || 0,
          roomQuality: room.roomQuality ? String(room.roomQuality) : null,
          isCompleted: room.isCompleted || (parseInt(room.photoCount) > 0 && 
            (room.roomQuality === 'good' || (room.roomQuality === 'attention' && Array.isArray(room.roomIssueNotes) && room.roomIssueNotes.length > 0)))
        }));
        
        console.log('Formatted rooms from API:', formattedRooms);
        // Debug: Individual rooms with isCompleted status
        formattedRooms.forEach(room => {
          console.log(`Room: ${room.name}, isCompleted: ${room.isCompleted}, photoCount: ${room.photoCount}, roomQuality: ${room.roomQuality}, itemsNoted: ${room.itemsNoted}`);
        });
        setRooms(formattedRooms);
        
        // Fotoğrafları yükle
        fetchRoomPhotos(roomsResponse.data);
      } else {
        console.log('No rooms found in API response');
      }
    } catch (error) {
      console.error('Error loading rooms from API:', error);
      // API hatası durumunda localStorage'dan yüklemeyi deneyelim
      try {
        console.log('Falling back to localStorage for rooms');
        const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
        
        if (savedRooms.length > 0) {
          console.log('Found saved rooms in localStorage:', savedRooms.length);
          
          // Verileri doğru şekilde formatlayarak state'e kaydet
          const formattedRooms = savedRooms.map(room => ({
            id: room.roomId,
            name: room.roomName || 'Unnamed Room',
            type: room.roomType || 'other', 
            itemsNoted: Array.isArray(room.roomIssueNotes) ? room.roomIssueNotes.length : 0,
            photoCount: parseInt(room.photoCount) || 0,
            roomQuality: room.roomQuality ? String(room.roomQuality) : null,
            isCompleted: room.isCompleted || (parseInt(room.photoCount) > 0 && 
              (room.roomQuality === 'good' || (room.roomQuality === 'attention' && Array.isArray(room.roomIssueNotes) && room.roomIssueNotes.length > 0)))
          }));
          
          setRooms(formattedRooms);
          // Fotoğrafları yükle
          fetchRoomPhotos(savedRooms);
        } else {
          console.log('No rooms found in localStorage');
        }
      } catch (localError) {
        console.error('Error loading rooms from localStorage:', localError);
      }
    }
  };
  
  // Fetch photos for rooms - tüm oda listesini parametre olarak alarak
  const fetchRoomPhotos = async (roomsList) => {
    try {
      if (!id || !roomsList || !Array.isArray(roomsList)) {
        console.log('No property ID or rooms list, skipping photo fetch');
        return;
      }

      console.log('Fetching photos for all rooms in property:', id);
      
      try {
        // Tüm mülk için fotoğrafları al
        const response = await apiService.photos.getByProperty(id);
        console.log('Property photos from API:', response.data);
        
        if (response.data) {
          let photosByRoom = {};
          
          // API yanıtında photosByRoom nesnesi varsa kullan
          if (response.data.photosByRoom) {
            console.log('Using photosByRoom from API response');
            photosByRoom = response.data.photosByRoom;
          }
          // Yoksa, fotoğrafları oda ID'lerine göre gruplayalım
          else if (Array.isArray(response.data)) {
            console.log('Grouping photos by room_id');
            
            // Her fotoğrafı uygun odayla eşleştir
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

  const fetchProperty = async () => {
    try {
      console.log('Fetching property details:', id);
      const response = await apiService.properties.getById(id);
      console.log('Property details response:', response.data);
      setProperty(response.data);
    } catch (error) {
      console.error('Property fetch error:', error);
      toast.error('An error occurred while loading property information.');
    } finally {
      setLoading(false);
    }
  };

  // Handle selection from room type selector
  const handleRoomTypeSelect = (type) => {
    setShowRoomTypeSelector(false);

    // Navigate to configure-room page with the selected room type
    if (id) {
      router.push({
        pathname: `/properties/${id}/configure-room`,
        query: { roomType: type }
      });
    } else {
      console.error('Missing property ID. Cannot navigate to configure room page.');
      toast.error('Unable to add room. Please try again later.');
    }
  };

  // Oda silme fonksiyonu
  const deleteRoom = async (e, roomId) => {
    // Event yayılmasını engelle, böylece kartın tıklama olayını tetiklemez
    e.stopPropagation();

    console.log('[DEBUG] Attempting to delete room with ID:', roomId);

    // Silme işlemini onaylama
    if (confirm('Bu odayı silmek istediğinizden emin misiniz?')) {
      try {
        // Backend'den odayı sil - doğru API metodunu kullan
        console.log('[DEBUG] Sending delete request for room:', roomId, 'property:', id);
        const deleteResponse = await apiService.properties.deleteRoom(id, roomId);
        console.log('[DEBUG] Delete response:', deleteResponse.data);
        console.log('[DEBUG] Room deleted from backend:', roomId);

        // Backend silindikten sonra localStorage'ı da güncelle
        const savedRooms = JSON.parse(localStorage.getItem(`property_${id}_rooms`) || '[]');
        
        // roomId veya string formata bakarak filtrele
        const updatedRooms = savedRooms.filter(room => {
          const currentRoomId = room.roomId || room.id;
          return currentRoomId !== roomId && currentRoomId !== String(roomId);
        });
        
        localStorage.setItem(`property_${id}_rooms`, JSON.stringify(updatedRooms));

        // Ekrandaki odaları güncelle - string/number kontrolü ile
        setRooms(rooms.filter(room => room.id !== roomId && room.id !== String(roomId)));

        // Odanın fotoğraflarını da temizle
        try {
          localStorage.removeItem(`property_${id}_room_${roomId}_photos`);

          // Ortak fotoğraf nesnesinden de silelim
          const allRoomPhotos = JSON.parse(localStorage.getItem(`property_${id}_room_photos`) || '{}');
          if (allRoomPhotos[roomId]) {
            delete allRoomPhotos[roomId];
            localStorage.setItem(`property_${id}_room_photos`, JSON.stringify(allRoomPhotos));
            console.log('[DEBUG] Removed photos for room:', roomId);
          }
        } catch (photoError) {
          console.error('Oda fotoğrafları silinirken hata oluştu:', photoError);
        }

        // Toast mesajı kaldırıldı
      } catch (error) {
        console.error('Oda silinirken hata oluştu:', error);
        // Hata durumunda da toast mesajı gösterilmiyor
      }
    }
  };

  const fetchPropertyReports = async () => {
    try {
      console.log('Fetching reports for property:', id);
      const response = await apiService.reports.getByProperty(id);
      console.log('Reports response:', response.data);
      setReports(response.data);
    } catch (error) {
      console.error('Reports fetch error:', error);
      toast.error('An error occurred while loading reports.');
    }
  };

  // Get room icon based on room type
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

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
        <div className="mt-4 text-[#1C2C40] text-lg">Loading property data...</div>
      </div>
    );
  }

  // Not found state
  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FBF5DA]">
        <div className="text-xl text-[#1C2C40] mb-4">Property not found or you don't have access</div>
        <button 
          onClick={() => router.push('/properties')}
          className="px-4 py-2 bg-[#1C2C40] text-white rounded-[8px]"
        >
          Go to properties list
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{property?.address || 'Property Details'} - tenantli</title>
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
            min-height: 100vh;
            width: 100%;
            overflow-x: hidden;
          }
          
          .mobile-full-height {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }

          /* Safe Area Insets for modern iOS/Android devices */
          .safe-area-top {
            padding-top: env(safe-area-inset-top, 40px);
          }

          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }

          .safe-area-left {
            padding-left: env(safe-area-inset-left, 0px);
          }

          .safe-area-right {
            padding-right: env(safe-area-inset-right, 0px);
          }

          /* iPhone X and newer notch handling */
          @supports (padding: max(0px)) {
            .safe-area-top {
              padding-top: max(env(safe-area-inset-top), 40px);
            }
            .safe-area-bottom {
              padding-bottom: max(env(safe-area-inset-bottom), 20px);
            }
            .safe-area-left {
              padding-left: max(env(safe-area-inset-left), 0px);
            }
            .safe-area-right {
              padding-right: max(env(safe-area-inset-right), 0px);
            }
          }

          /* Better touch handling */
          button, a {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          /* Fix for iOS momentum scrolling */
          .smooth-scroll {
            -webkit-overflow-scrolling: touch;
          }

          /* Bottom Sheet Animations */
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

          /* Bottom Sheet Animation */
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }

          .animate-slide-up {
            animation: slideUp 0.3s ease-out forwards;
          }

          /* Responsive adjustments */
          @media (max-width: 390px) {
            .room-container {
              width: 90% !important;
            }

            .room-card {
              width: 100% !important;
            }

            .bottom-button {
              width: 90% !important;
              left: 5% !important;
            }
          }

          /* Landscape orientation */
          @media (orientation: landscape) {
            .bottom-button {
              position: relative !important;
              margin: 20px auto !important;
              left: auto !important;
              bottom: auto !important;
            }

            .content-container {
              padding-bottom: 100px !important;
            }
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
              onClick={() => router.push('/')}
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
                  stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
              {property.description || property.address || 'Property Details'}
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
              {/* Room List */}
              <div className="pb-24">
                {rooms.length > 0 ? (
                  <AnimatePresence>
                    {rooms.map((room, index) => (
                      <RoomCard 
                        key={room.id || index}
                        room={room}
                        index={index}
                        router={router}
                        id={id}
                        deleteRoom={deleteRoom}
                        roomPhotos={roomPhotos}
                        apiService={apiService}
                        getRoomPhotoUrl={getRoomPhotoUrl}
                      />
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="box-border w-[350px] max-w-full p-[16px] bg-white border border-[#D1E7D5] rounded-[16px] mb-[16px] text-center">
                    <p className="font-semibold text-[14px] leading-[19px] text-[#515964]">
                      No rooms have been added yet. Use the Room Management feature to add rooms to your property.
                    </p>
                    <button
                      className="mt-4 font-bold text-[14px] text-[#55A363] underline"
                      onClick={() => {
                        // RoomTypeSelector kullanarak yeni oda ekle, hızlı ve sorunsuz
                        if (!showRoomTypeSelector) {
                          setShowRoomTypeSelector(true);
                        }
                      }}
                    >
                      Add New Room
                    </button>
                  </div>
                )}
                
                {/* Add New Room Button */}
                <button
                  className="box-border flex flex-row justify-center items-center p-[18px_20px] gap-[8px] w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] mt-[16px] cursor-pointer hover:border-[#1C2C40] transition-colors duration-200"
                  onClick={() => {
                    // RoomTypeSelector doğrudan göster, hızlı geçiş sağla
                    if (!showRoomTypeSelector) {
                      setShowRoomTypeSelector(true);
                    }
                  }}
                >
                  <AddIcon />
                  <span className="font-bold text-[14px] leading-[19px] text-center text-[#515964]">
                    Add New Room
                  </span>
                </button>
              </div>
            </div>
            
            {/* Fixed bottom button */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 bg-[#FBF5DA]">
              <div className="safe-area-bottom">
                <button
                  onClick={() => {
                    router.push({
                      pathname: `/properties/${id}/landlord-details`,
                      query: { propertyId: property.id }
                    });
                  }}
                  className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] hover:bg-[#243242] active:bg-[#0C1322] rounded-[16px] transition-colors duration-200"
                >
                  <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                    Finish Walkthrough
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
        onClose={() => setShowRoomTypeSelector(false)}
      />
    </>
  );
}