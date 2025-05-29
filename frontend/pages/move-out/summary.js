import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';
import { toast } from 'react-toastify';

// Back arrow icon
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Arrow right icon  
const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.42505 16.6L12.8584 11.1667C13.5 10.525 13.5 9.47502 12.8584 8.83336L7.42505 3.40002" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MoveOutSummary() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { propertyId, from } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [property, setProperty] = useState(null);
  const [isReportAlreadySent, setIsReportAlreadySent] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState({
    address: 'Not specified',
    lease_duration: null,
    lease_duration_type: 'months',
    deposit_amount: null,
    contract_start_date: null,
    contract_end_date: null,
    move_in_date: null,
    moveout_date: null,
    landlord_email: null,
    landlord_phone: null
  });
  const [userData, setUserData] = useState(null);
  const [landlordData, setLandlordData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomPhotos, setRoomPhotos] = useState({});

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/welcome');
    }
  }, [user, authLoading, router]);

  // Load property and room data
  useEffect(() => {
    if (!propertyId) return;

    const loadData = async () => {
      try {
        // Check if coming from walkthrough completed
        if (from === 'walkthrough') {
          setIsReportAlreadySent(true);
        } else {
          // Check if report has already been shared
          try {
            const reportStatusResponse = await apiService.properties.hasSharedMoveOutReport(propertyId);
            if (reportStatusResponse.data && reportStatusResponse.data.hasSharedMoveOutReport) {
              setIsReportAlreadySent(true);
            }
          } catch (error) {
            console.error('Error checking report status:', error);
          }
        }
        
        // Load property data from API
        const propertyResponse = await apiService.properties.getById(propertyId);
        const propertyData = propertyResponse.data;
        
        if (!propertyData) {
          console.error('Failed to load property data');
          toast.error('Failed to load property information');
          return;
        }

        console.log('Property data:', propertyData);
        setProperty(propertyData);

        // Set property details
        const details = {
          ...propertyDetails,
          address: propertyData.address || propertyData.propertyName || 'Not specified',
          lease_duration: propertyData.lease_duration || null,
          lease_duration_type: propertyData.lease_duration_type || 'months',
          deposit_amount: propertyData.deposit_amount || null,
          contract_start_date: propertyData.contract_start_date || null,
          contract_end_date: propertyData.contract_end_date || null,
          move_in_date: propertyData.move_in_date || null,
          moveout_date: propertyData.moveout_date || null,
          landlord_email: propertyData.landlord_email || null,
          landlord_phone: propertyData.landlord_phone || null
        };

        setPropertyDetails(details);

        // Load user data from localStorage or use current user
        const savedUserDetails = localStorage.getItem(`property_${propertyId}_user`);
        if (savedUserDetails) {
          try {
            const parsedUserData = JSON.parse(savedUserDetails);
            setUserData(parsedUserData);
          } catch (e) {
            console.error('Error parsing user details:', e);
            setUserData({
              name: user?.name || '',
              email: user?.email || '',
              phone: ''
            });
          }
        } else {
          setUserData({
            name: user?.name || '',
            email: user?.email || '',
            phone: ''
          });
        }

        // Load landlord data
        if (propertyData.landlord_email || propertyData.landlord_phone) {
          setLandlordData({
            email: propertyData.landlord_email || '',
            phone: propertyData.landlord_phone || ''
          });
        } else {
          const savedLandlordDetails = localStorage.getItem(`property_${propertyId}_landlord`);
          if (savedLandlordDetails) {
            try {
              const parsedLandlordData = JSON.parse(savedLandlordDetails);
              setLandlordData(parsedLandlordData);
            } catch (e) {
              console.error('Error parsing landlord details:', e);
              setLandlordData({ email: '', phone: '' });
            }
          } else {
            setLandlordData({ email: '', phone: '' });
          }
        }

        // Load rooms from API or localStorage
        try {
          const roomsResponse = await apiService.properties.getRooms(propertyId);
          if (roomsResponse.data && roomsResponse.data.length > 0) {
            const formattedRooms = roomsResponse.data.map(room => ({
              id: room.roomId,
              roomId: room.roomId,
              name: room.roomName,
              roomName: room.roomName,
              type: room.roomType,
              roomType: room.roomType,
              photoCount: room.photoCount || 0,
              roomQuality: room.roomQuality || null,
              roomIssueNotes: room.roomIssueNotes || [],
              moveOutNotes: room.moveOutNotes || [],
              moveOutPhotoCount: room.moveOutPhotoCount || 0,
              moveOutCompleted: room.moveOutCompleted || false,
              moveOutDate: room.moveOutDate || null
            }));
            setRooms(formattedRooms);
            
            // Load photos for each room
            for (const room of formattedRooms) {
              await fetchRoomPhotos(room.id);
            }
          }
        } catch (error) {
          console.error('Error loading rooms:', error);
          // Fallback to localStorage
          const savedRooms = localStorage.getItem(`property_${propertyId}_rooms`);
          if (savedRooms) {
            const parsedRooms = JSON.parse(savedRooms);
            const formattedRooms = parsedRooms.map(room => ({
              id: room.roomId,
              roomId: room.roomId,
              name: room.roomName,
              roomName: room.roomName,
              type: room.roomType,
              roomType: room.roomType,
              photoCount: room.photoCount || 0,
              moveOutPhotoCount: room.moveOutPhotoCount || 0,
              roomQuality: room.roomQuality || null,
              roomIssueNotes: room.roomIssueNotes || [],
              moveOutNotes: room.moveOutNotes || [],
              moveOutCompleted: room.moveOutCompleted || false,
              moveOutDate: room.moveOutDate || null
            }));
            setRooms(formattedRooms);
          }
        }
      } catch (error) {
        console.error('Error loading property data:', error);
        toast.error('Failed to load property details');
      }
    };

    loadData();
  }, [propertyId, user, from]);

  // Fetch photos for a room
  const fetchRoomPhotos = async (roomId) => {
    try {
      // Fetch move-out photos
      const moveOutPhotosResponse = await apiService.photos.getByRoom(propertyId, roomId, true);
      
      if (moveOutPhotosResponse.data && moveOutPhotosResponse.data.length > 0) {
        const photos = moveOutPhotosResponse.data.map(photo => ({
          id: photo.id,
          src: apiService.getPhotoUrl(photo),
          url: apiService.getPhotoUrl(photo),
          note: photo.note || '',
          timestamp: photo.created_at || photo.timestamp || ''
        }));
        
        setRoomPhotos(prev => ({
          ...prev,
          [roomId]: { photos }
        }));
      }
    } catch (error) {
      console.error(`Error fetching photos for room ${roomId}:`, error);
    }
  };

  // Calculate number of photos for a room
  const getPhotoCount = (roomId) => {
    if (roomPhotos[roomId]) {
      if (Array.isArray(roomPhotos[roomId])) {
        return roomPhotos[roomId].length;
      } else if (roomPhotos[roomId].photos && Array.isArray(roomPhotos[roomId].photos)) {
        return roomPhotos[roomId].photos.length;
      }
    }
    
    // Use the moveOutPhotoCount from room data as fallback
    const room = rooms.find(r => r.id === roomId || r.roomId === roomId);
    if (room && room.moveOutPhotoCount) {
      return room.moveOutPhotoCount;
    }
    
    return 0;
  };

  // Get number of notes for a room
  const getNoteCount = (room) => {
    try {
      if (room.moveOutNotes && Array.isArray(room.moveOutNotes)) {
        return room.moveOutNotes.length;
      }
      return 0;
    } catch (error) {
      console.error("Error calculating note count:", error, room);
      return 0;
    }
  };

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';

    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return 'Not specified';
      }

      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '.');
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Not specified';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Not specified';

    try {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        console.error("Invalid currency amount:", amount);
        return 'Not specified';
      }

      return `$${numericAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    } catch (error) {
      console.error("Error formatting currency:", error);
      return 'Not specified';
    }
  };

  // Handle creating and sending move-out report
  const handleCreateReport = async () => {
    setIsSubmitting(true);
    
    try {
      // Check if we already have a move-out report for this property
      const reportResponse = await apiService.reports.getByProperty(propertyId);
      const moveOutReports = reportResponse.data ? reportResponse.data.filter(r => r.type === 'move-out') : [];
      
      if (moveOutReports.length === 0) {
        // No move-out report found, create one
        console.log('Creating new move-out report for property:', propertyDetails.address);
        
        // Create report data with all rooms
        const reportData = {
          property_id: propertyId,
          title: `Move-out Walkthrough for ${propertyDetails.address}`,
          description: 'Automatically generated move-out walkthrough report',
          type: 'move-out',
          address: propertyDetails.address,
          tenant_name: userData?.name || user?.name || '',
          tenant_email: userData?.email || user?.email || '',
          tenant_phone: userData?.phone || '',
          landlord_name: 'Property Owner',
          landlord_email: landlordData?.email || propertyDetails.landlord_email || '',
          landlord_phone: landlordData?.phone || propertyDetails.landlord_phone || '',
          rooms: rooms.map(room => ({
            id: room.id,
            name: room.name,
            type: room.type,
            notes: room.moveOutNotes || [],
            moveOutNotes: room.moveOutNotes || [],
            moveOutDate: room.moveOutDate,
            moveOutCompleted: room.moveOutCompleted,
            moveOutPhotoCount: room.moveOutPhotoCount || 0
          }))
        };
        
        // Create the report
        const createResponse = await apiService.reports.create(reportData);
        const reportId = createResponse.data.id;
        const reportUuid = createResponse.data.uuid;
        
        // Associate photos with the report
        if (Object.keys(roomPhotos).length > 0) {
          console.log('Associating photos with the report');
          
          for (const roomId in roomPhotos) {
            const roomData = rooms.find(r => r.id === roomId);
            
            if (roomData && roomPhotos[roomId]?.photos) {
              // Associate each photo with the report
              for (const photo of roomPhotos[roomId].photos) {
                if (photo && photo.id) {
                  try {
                    await apiService.photos.associateWithReport(photo.id, reportId, {
                      roomId: roomId,
                      roomName: roomData.name
                    });
                  } catch (photoError) {
                    console.error(`Error associating photo ${photo.id} with report:`, photoError);
                  }
                }
              }
            }
          }
        }
        
        // Send email notification to landlord
        if (landlordData?.email || propertyDetails.landlord_email) {
          const recipientEmail = landlordData?.email || propertyDetails.landlord_email;
          console.log('Sending email notification to landlord:', recipientEmail);
          
          const notificationData = {
            recipientEmail: recipientEmail,
            recipientName: 'Property Owner',
            subject: 'New Move-out Walkthrough Report Shared',
            message: `A new move-out walkthrough report has been shared with you for property at ${propertyDetails.address}. You can view the report by clicking the button below.`,
            status: 'custom',
            reportId: reportId,
            reportUuid: reportUuid
          };
          
          await apiService.reports.sendNotification(reportId, notificationData);
        } else {
          console.log('No landlord email found to send notification');
        }
        
        // Navigate to success page
        router.push(`/reports/share-success?id=${reportId}&uuid=${reportUuid}`);
      } else {
        // Report already exists, just navigate to it
        const existingReport = moveOutReports[0];
        router.push(`/reports/share-success?id=${existingReport.id}&uuid=${existingReport.uuid}`);
      }
    } catch (error) {
      console.error('Error creating or sending report:', error);
      toast.error('Failed to create or send the report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property || !propertyId) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-[#FBF5DA]">
        <Head>
          <title>Loading - tenantli</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
          <meta name="theme-color" content="#FBF5DA" />
        </Head>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-[#FBF5DA] font-['Nunito']">
      <Head>
        <title>Move-Out Summary - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <style jsx global>{`
          body {
            background-color: #FBF5DA;
            overflow-x: hidden;
            position: fixed;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            font-family: 'Nunito', sans-serif;
          }
          
          #__next {
            height: 100%;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
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
        `}</style>
      </Head>
      
      {/* Header */}
      <div className="fixed top-0 w-full max-w-[390px] bg-[#FBF5DA] z-20">
        <div className="flex flex-row items-center px-[20px] h-[65px] gap-[10px]" style={{ paddingTop: 'env(safe-area-inset-top, 20px)' }}>
          <button 
            className="relative z-50 w-10 h-10 flex items-center justify-center -ml-2"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
            Move-Out Summary
          </h1>
        </div>
      </div>
      
      {/* Scrollable content */}
      <div className="flex flex-col min-h-screen pb-[100px]" style={{ paddingTop: '85px' }}>
        <div className="flex-1 px-4 py-5">
          <div className="max-w-[400px] mx-auto sm:max-w-2xl">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#D1E7D5] overflow-hidden">
              {/* Property & User Information List */}
              <div className="divide-y divide-[#ECF0F5]">
                {/* User Info */}  
                <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-sm text-[#0B1420]">
                    Tenant
                  </span>
                  <span className="text-sm font-bold text-[#1C2C40]">
                    {userData?.name || user?.name || ''}
                  </span>
                </div>
              
                {/* Property Address */}
                <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-sm text-[#0B1420] min-w-[100px]">
                    Address
                  </span>
                  <span className="text-sm font-bold text-[#1C2C40] text-right flex-1 ml-4">
                    {propertyDetails.address && propertyDetails.address !== 'Not specified' ? propertyDetails.address : 'Not specified'}
                  </span>
                </div>

                {/* Lease Duration */}
                <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-sm text-[#0B1420] min-w-[100px]">
                    Lease Duration
                  </span>
                  <span className="text-sm font-bold text-[#1C2C40] text-right flex-1 ml-4">
                    {propertyDetails.lease_duration && propertyDetails.lease_duration !== 'null'
                      ? `${propertyDetails.lease_duration} ${propertyDetails.lease_duration_type || 'months'}`
                      : 'Not specified'}
                  </span>
                </div>

                {/* Move Out Date */}
                <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-sm text-[#0B1420] min-w-[100px]">
                    Move out Date
                  </span>
                  <span className="text-sm font-bold text-[#1C2C40] text-right flex-1 ml-4">
                    {(() => {
                      // Find the most recent move-out date from rooms
                      let latestMoveOutDate = null;
                      if (rooms && rooms.length > 0) {
                        rooms.forEach(room => {
                          if (room.moveOutDate) {
                            const roomDate = new Date(room.moveOutDate);
                            if (!latestMoveOutDate || roomDate > latestMoveOutDate) {
                              latestMoveOutDate = roomDate;
                            }
                          }
                        });
                      }
                      
                      if (latestMoveOutDate) {
                        return formatDate(latestMoveOutDate.toISOString());
                      }
                      
                      // If no move-out date found, show today's date
                      return formatDate(new Date().toISOString());
                    })()}
                  </span>
                </div>

                {/* Deposit Amount */}
                <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-sm text-[#0B1420] min-w-[100px]">
                    Deposit Amount
                  </span>
                  <span className="text-sm font-bold text-[#1C2C40] text-right flex-1 ml-4">
                    {propertyDetails.deposit_amount && propertyDetails.deposit_amount !== 'null'
                      ? formatCurrency(propertyDetails.deposit_amount)
                      : 'Not specified'}
                  </span>
                </div>
                
                {/* Landlord Email */}
                <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-sm text-[#0B1420]">
                    Landlord Mail
                  </span>
                  <span className="text-sm font-bold text-[#1C2C40] truncate ml-4">
                    {propertyDetails.landlord_email || landlordData?.email || 'Not provided'}
                  </span>
                </div>
                
                {/* Landlord Phone */}
                <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-sm text-[#0B1420]">
                    Landlord Phone
                  </span>
                  <span className="text-sm font-bold text-[#1C2C40]">
                    {propertyDetails.landlord_phone || landlordData?.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            
              {/* Rooms List */}
              {rooms.length > 0 && (
                <div className="mt-4 mb-2 px-4">
                  <h2 className="text-base font-semibold text-[#0B1420] mb-3">Rooms</h2>
                </div>
              )}
              
              {rooms.length > 0 && rooms.map((room, index) => {
                const roomId = room.roomId || room.id;
                const displayName = room.roomName || room.name || room.type || room.roomType || `Room ${index + 1}`;
                const roomType = room.roomType || room.type || 'other';
                const isRoomCompleted = room.moveOutCompleted || (room.moveOutPhotoCount > 0) || (room.moveOutNotes && room.moveOutNotes.length > 0);
                
                console.log(`[Summary] Room: ${displayName}, moveOutCompleted: ${room.moveOutCompleted}, moveOutPhotoCount: ${room.moveOutPhotoCount || getPhotoCount(roomId)}, moveOutNotes: ${getNoteCount(room)}`);

                return (
                  <div 
                    key={roomId} 
                    className="px-4 py-3 flex items-start justify-between cursor-pointer hover:bg-gray-50 transition-colors duration-200 border-t border-[#ECF0F5] first:border-t-0"
                    onClick={() => {
                      router.push({
                        pathname: `/move-out/room`,
                        query: {
                          propertyId: propertyId,
                          roomId: roomId,
                          roomName: displayName,
                          roomType: roomType,
                          returnUrl: `/move-out/summary?propertyId=${propertyId}${isReportAlreadySent ? '&from=walkthrough' : ''}`,
                          isReport: isReportAlreadySent ? 'true' : 'false',
                          readOnly: isReportAlreadySent ? 'true' : 'false' // Add readOnly parameter
                        }
                      });
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {isRoomCompleted && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="8" r="8" fill="#1C2C40"/>
                            <path d="M6.66667 8.66667L7.33333 9.33333L9.33333 7.33333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        <span className="text-sm font-semibold text-[#0B1420]">
                          {displayName}
                        </span>
                        {getNoteCount(room) > 0 && (
                          <span className="text-xs text-[#515964]">
                            ({getNoteCount(room)} {getNoteCount(room) === 1 ? 'item' : 'items'} noted)
                          </span>
                        )}
                        {getNoteCount(room) === 0 && (
                          <span className="text-xs text-[#515964]">
                            (No Notes)
                          </span>
                        )}
                      </div>

                      {getPhotoCount(roomId) > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="relative h-6 z-10">
                            {/* Show photo count indicators */}
                            <div className="flex -space-x-2">
                              {[...Array(Math.min(4, getPhotoCount(roomId) || 0))].map((_, i) => {
                                let photoUrl = null;
                                try {
                                  if (roomPhotos[roomId]?.photos?.[i]?.url || roomPhotos[roomId]?.photos?.[i]?.src) {
                                    photoUrl = roomPhotos[roomId].photos[i].url || roomPhotos[roomId].photos[i].src;
                                  }
                                } catch (e) {
                                  console.error(`Error getting photo URL for room ${roomId}:`, e);
                                }

                                return (
                                  <div
                                    key={i}
                                    className="relative w-6 h-6 bg-gray-200 border-2 border-white rounded-full overflow-hidden shadow-sm"
                                    style={{
                                      backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center',
                                      zIndex: 10 - i
                                    }}
                                  >
                                    {!photoUrl && (
                                      <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6C4 7.10457 4.89543 8 6 8Z" fill="#A3ADB8"/>
                                          <path d="M9.33333 2H6.66667C3.33333 2 2 3.33333 2 6.66667V9.33333C2 12.6667 3.33333 14 6.66667 14H9.33333C12.6667 14 14 12.6667 14 9.33333V6.66667C14 3.33333 12.6667 2 9.33333 2ZM12.3067 9.63333L10.2867 7.22C10.08 6.96667 9.82667 6.96667 9.62 7.22L7.88667 9.3C7.68667 9.55 7.43333 9.55 7.23333 9.3L6.65333 8.58C6.45333 8.33667 6.20667 8.34333 6.01333 8.59333L3.81333 11.4767C3.57333 11.7933 3.69333 12.06 4.10667 12.06H11.8867C12.3 12.06 12.4267 11.7933 12.3067 9.63333Z" fill="#A3ADB8"/>
                                        </svg>
                                      </div>
                                    )}
                                    {getPhotoCount(roomId) > 4 && i === 3 && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-[#1C2C40] text-white text-[10px] font-bold">
                                        +{getPhotoCount(roomId) - 3}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <span className="text-xs text-[#515964]">
                            ({getPhotoCount(roomId)} {getPhotoCount(roomId) === 1 ? 'Photo' : 'Photos'})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      <ArrowRightIcon />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-[#FBF5DA] shadow-inner safe-area-bottom z-50">
        <div className="max-w-[400px] mx-auto sm:max-w-2xl">
          <form onSubmit={(e) => { e.preventDefault(); if (!isReportAlreadySent) handleCreateReport(); }}>
            <button
              type="submit"
              disabled={isSubmitting || isReportAlreadySent}
              className="w-full h-14 bg-[#1C2C40] text-white font-semibold rounded-2xl shadow-sm hover:bg-[#283c56] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C2C40]"
              aria-label={isReportAlreadySent ? 'Move-out report already shared' : (isSubmitting ? 'Creating move-out report...' : 'Create & Share Report')}
            >
              {isReportAlreadySent ? 'Move-out Report Already Shared' : (isSubmitting ? 'Creating Report...' : 'Share Walkthrough')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}