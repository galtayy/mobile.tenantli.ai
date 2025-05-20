import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';

// API base URL
const API_URL = typeof window !== 'undefined' 
  ? window.location.hostname !== 'localhost' 
    ? 'https://api.tenantli.ai'
    : 'http://localhost:5050'
  : 'https://api.tenantli.ai';
  
const logApiUrl = () => {
  if (typeof window !== 'undefined') {
    console.log('Using API_URL:', API_URL);
    console.log('Window hostname:', window.location.hostname);
  }
};

export default function SharedMoveOutReport() {
  const router = useRouter();
  const { uuid } = router.query;
  
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [propertyInfo, setPropertyInfo] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeRoomTab, setActiveRoomTab] = useState({});
  const [propertyDetailsOpen, setPropertyDetailsOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentPhotoArray, setCurrentPhotoArray] = useState([]);
  const [moveInData, setMoveInData] = useState(null);
  
  useEffect(() => {
    if (!router.isReady || !uuid) return;
    
    // Log API URL for debugging
    logApiUrl();
    
    // Rapor yükleniyor
    console.log(`[Report Viewer] Fetching report with UUID: ${uuid}`);
    fetchReport();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up report state');
      setReport(null);
      setPropertyInfo(null);
      setRooms([]);
      setActiveRoomTab({});
    };
  }, [router.isReady, uuid]);
  
  const fetchReport = async () => {
    try {
      setIsLoading(true);
      
      // Clear previous state
      setReport(null);
      setPropertyInfo(null);
      setRooms([]);
      setActiveRoomTab({});
      
      console.log('Fetching shared report with UUID:', uuid);
      
      // Fetch the report by UUID from the API
      try {
        // Get report data
        const reportResponse = await axios.get(`${API_URL}/api/reports/uuid/${uuid}`, {
          headers: { 'Accept': 'application/json' }
        });
        
        const reportData = reportResponse.data;
        console.log('Report data:', reportData);
        
        // Log report baseUrl if provided
        if (reportData && reportData.baseUrl) {
          console.log('Report base URL:', reportData.baseUrl);
        }
        
        // Backend dönüşünde rooms alanı var mı kontrol et
        if (reportData) {
          // Rooms direkt olarak API'den geliyorsa kullan
          const roomsData = reportData.rooms || [];
          console.log(`Found ${roomsData.length} rooms from API response`);
          
          // Log rooms ve fotoğraflarını (debug için)
          if (roomsData.length > 0) {
            roomsData.forEach(room => {
              console.log(`Room ${room.name}: ${room.photos ? room.photos.length : 0} photos`);
              if (room.photos && room.photos.length > 0) {
                room.photos.forEach((photo, i) => {
                  console.log(`Room ${room.name} Photo ${i+1}:`, photo);
                });
              }
            });
          }
          
          // Ayrıca reportData.photos varsa, onları da odalarla birleştir
          if (reportData.photos && reportData.photos.length > 0) {
            console.log(`Found ${reportData.photos.length} photos at report level, distributing to rooms`);
            
            reportData.photos.forEach(photo => {
              // Her fotoğrafın oda ID'sine göre odaya ekle
              if (photo.room_id) {
                const room = roomsData.find(r => r.id === photo.room_id);
                if (room) {
                  // Odaya fotoğraf ekle (önce mevcut olanları kontrol et)
                  if (!room.photos) room.photos = [];
                  
                  // Fotoğraf zaten mevcut mu kontrol et
                  const photoExists = room.photos.some(existingPhoto => 
                    (existingPhoto.id && existingPhoto.id === photo.id) ||
                    (existingPhoto.file_path && existingPhoto.file_path === photo.file_path) ||
                    (existingPhoto.url && existingPhoto.url === photo.url)
                  );
                  
                  if (!photoExists) {
                    room.photos.push(photo);
                    console.log(`Added photo ${photo.id} to room ${room.name}`);
                  } else {
                    console.log(`Photo ${photo.id} already exists in room ${room.name}, skipping`);
                  }
                }
              }
            });
          }
          
          // Eğer odalar API'den geliyorsa fotoğrafları da zaten içeriyor olmalı
          // Set the report data and rooms
          setReport(reportData);
          setPropertyInfo(reportData.property);
          setRooms(roomsData);
          
          // Set moveInData if available
          if (reportData.moveInData) {
            console.log(`Found moveInData with ${reportData.moveInData.rooms?.length || 0} rooms`);
            setMoveInData(reportData.moveInData);
          }
          
          // Initialize active tab for each room
          const initialActiveRoomTab = {};
          roomsData.forEach(room => {
            // For move-out reports, default to 'move-out' tab; otherwise 'photos'
            initialActiveRoomTab[room.id] = reportData.type === 'move-out' ? 'move-out' : 'photos';
          });
          setActiveRoomTab(initialActiveRoomTab);
          
          setIsLoading(false);
          return;
        }
      } catch (reportError) {
        console.error('Failed to fetch report:', reportError);
      }
      
      // Rapor verisini API'den alamadık, hata göster ve kullanıcıyı bilgilendir
      console.warn('API error or data not available for this report');
      const reportData = {
        id: uuid,
        title: 'Report Not Available',
        type: 'error',
        address: 'Report data could not be loaded',
        description: 'Unable to load move-out report details',
        created_at: new Date().toISOString(),
        property: {
          id: uuid,
          address: 'Property information not available',
          property_type: '',
          description: ''
        },
        tenant: {
          name: '',
          email: '',
          phone: ''
        },
        landlord: {
          name: '',
          email: '',
          phone: ''
        },
        rooms: []
      };
      
      // Kullanıcıya gösterilecek bir hata mesajı
      console.error('Report data could not be loaded. Please try again or contact support.');
      
      setReport(reportData);
      setPropertyInfo(reportData.property);
      setRooms(reportData.rooms);
      
      // Initialize active tab for each room
      const initialActiveRoomTab = {};
      reportData.rooms.forEach(room => {
        // For move-out reports, default to 'move-out' tab; otherwise 'photos'
        initialActiveRoomTab[room.id] = reportData.type === 'move-out' ? 'move-out' : 'photos';
      });
      setActiveRoomTab(initialActiveRoomTab);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching report:', error);
      setIsLoading(false);
    }
  };
  
  // Get photo URL - handles various photo object structures
  const getPhotoUrl = (photo) => {
    if (!photo) return 'https://via.placeholder.com/300x200?text=No+Photo';
    
    console.log('Processing photo:', photo);
    
    // Basit direktif - öncelikle her fotoğraf objesi için tüm yolları dene
    try {
      // Direct URL property
      if (photo.url) {
        // Eğer url /uploads ile başlıyorsa önüne API_URL ekle
        if (photo.url.startsWith('/uploads')) {
          return `${API_URL}${photo.url}`;
        }
        return photo.url;
      }
      
      // file_path property (Backend'den gelen en güvenilir yöntem)
      if (photo.file_path) {
        console.log(`Constructing URL from file_path: ${photo.file_path}`);
        return `${API_URL}/uploads/${photo.file_path}`;
      }
      
      // id property - genelde çalışan bir yöntem 
      if (photo.id && typeof photo.id === 'number') {
        console.log(`Constructing URL from photo ID: ${photo.id}`);
        return `${API_URL}/api/photos/${photo.id}/public`;
      }
      
      // Path property (common in API responses)
      if (photo.path) {
        // If path already contains http/https, return as is
        if (photo.path.startsWith('http')) return photo.path;
        // Otherwise, construct URL from API base
        return `${API_URL}/${photo.path.replace(/^\//, '')}`;
      }
      
      // Filename property
      if (photo.filename) return `${API_URL}/uploads/${photo.filename}`;
      
      // If photo is just a string (path or URL)
      if (typeof photo === 'string') {
        if (photo.startsWith('http')) return photo;
        return `${API_URL}/${photo.replace(/^\//, '')}`;
      }
    } catch (error) {
      console.error('Error constructing photo URL:', error);
    }
    
    // Fallback
    console.log('Falling back to placeholder for photo:', photo);
    return 'https://via.placeholder.com/300x200?text=Error+Loading';
  };
  
  // Toggle tabs
  const toggleRoomTab = (roomId, tab) => {
    setActiveRoomTab(prev => ({
      ...prev,
      [roomId]: tab
    }));
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }
  
  if (!report || report.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FBF5DA] px-4">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h1 className="text-xl font-bold text-[#1C2C40] mb-4">Report Not Available</h1>
        <p className="text-[#515964] text-center mb-6">
          {report && report.error ? report.description : "The report you are looking for could not be found. The link may be invalid or the report has been deleted."}
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-[#3B7145] text-white rounded-md hover:bg-[#2A5A32] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen max-w-[390px] mx-auto bg-[#FBF5DA] font-['Nunito']">
      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => {
            setSelectedPhoto(null);
            setCurrentPhotoArray([]);
            setCurrentPhotoIndex(0);
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center px-4">
            {/* Previous Button */}
            {currentPhotoArray.length > 1 && currentPhotoIndex > 0 && (
              <button 
                className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = currentPhotoIndex - 1;
                  setCurrentPhotoIndex(newIndex);
                  setSelectedPhoto({
                    url: getPhotoUrl(currentPhotoArray[newIndex]),
                    alt: `Photo ${newIndex + 1}`
                  });
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {/* Current Photo */}
            <img 
              src={selectedPhoto.url} 
              alt={selectedPhoto.alt}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next Button */}
            {currentPhotoArray.length > 1 && currentPhotoIndex < currentPhotoArray.length - 1 && (
              <button 
                className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = currentPhotoIndex + 1;
                  setCurrentPhotoIndex(newIndex);
                  setSelectedPhoto({
                    url: getPhotoUrl(currentPhotoArray[newIndex]),
                    alt: `Photo ${newIndex + 1}`
                  });
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto(null);
                setCurrentPhotoArray([]);
                setCurrentPhotoIndex(0);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 5L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Photo Counter */}
            {currentPhotoArray.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentPhotoIndex + 1} / {currentPhotoArray.length}
              </div>
            )}
          </div>
        </div>
      )}
      <Head>
        <title>{report.type === 'move-out' ? 'Move-Out Report' : 'Move-In Report'} - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      
      {/* Status Bar Space */}
      <div className="w-full h-[40px]"></div>
      
      {/* Move-out Tag for Move-out reports */}
      {report.type === 'move-out' && (
        <div className="px-5 mt-4">
          <span className="inline-flex items-center px-3 py-1 bg-[#FFE4D5] text-[#8B4513] font-semibold text-[12px] rounded-full">
            MOVE-OUT REPORT
          </span>
        </div>
      )}
      
      {/* Title + Subtext */}
      <div className="flex flex-col items-start px-5 gap-1 mt-[32px]">
        <div className="flex flex-row items-center justify-between w-full">
          <h1 className="font-bold text-[20px] leading-[27px] text-[#0B1420]">
            {report.type === 'move-out' ? 'Move-Out Walkthrough Details' : 'Move-In Walkthrough Details'}
          </h1>
        </div>
        <p className="font-normal text-[14px] leading-[19px] text-[#515964]">
          {report.type === 'move-out' 
            ? 'Final inspection details uploaded at the end of tenancy'
            : 'Initial inspection details uploaded at the start of tenancy'}
        </p>
      </div>
      
      {/* Property Selector - Now a dropdown */}
      <div className="px-5 mt-[24px]">
        <div 
          className={`flex flex-col bg-white border border-[#D1E7D5] rounded-[16px] overflow-hidden transition-all duration-300 ${propertyDetailsOpen ? 'mb-0' : 'mb-0'}`}
          onClick={() => setPropertyDetailsOpen(!propertyDetailsOpen)}
        >
          {/* Header always visible */}
          <div className="flex flex-row items-center p-[18px] gap-2 cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.38 2.6L2.13 8.25C1.55 8.7 1.13 9.7 1.26 10.4L2.46 17.33C2.63 18.35 3.6 19.18 4.63 19.18H15.36C16.38 19.18 17.36 18.34 17.53 17.33L18.73 10.4C18.85 9.7 18.43 8.7 17.86 8.25L10.61 2.6C10.11 2.21 9.87 2.21 9.38 2.6Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 15.8V13.05" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            <div className="flex-grow">
              <span className="font-bold text-[14px] leading-[19px] text-[#515964]">
                Home & Lease Details
              </span>
            </div>
            
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform duration-300 ${propertyDetailsOpen ? 'rotate-180' : ''}`}
            >
              <path d="M16.6 7.45834L11.1667 12.8917C10.525 13.5333 9.47503 13.5333 8.83336 12.8917L3.40002 7.45834" stroke="#515964" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Dropdown content - only visible when open */}
          <div 
            className={`transition-all duration-300 overflow-hidden ${propertyDetailsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="px-4 pb-4 pt-1 border-t border-[#F3F4F6]">
              <div className="grid grid-cols-1 gap-3 text-[14px]">
                <div className="flex flex-col">
                  <span className="text-[#515964] text-[12px]">Tenant:</span>
                  <p className="font-medium text-[#0B1420] text-[14px]">
                    {report.tenant_name || report.tenant?.name || report.creator_name || 'Tenant Name'}
                  </p>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[#515964] text-[12px]">Address:</span>
                  <p className="font-medium text-[#0B1420] text-[14px]">
                    {propertyInfo?.address || report.address || 'Property Address'}
                  </p>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[#515964] text-[12px]">Lease Duration:</span>
                  <p className="font-medium text-[#0B1420] text-[14px]">
                    {report.lease_duration ? `${report.lease_duration} ${report.lease_duration_type || 'months'}` : '12 months'}
                  </p>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[#515964] text-[12px]">{report.type === 'move-out' ? 'Move-out Date' : 'Move-in Date'}:</span>
                  <p className="font-medium text-[#0B1420] text-[14px]">
                    {report.contract_end_date 
                      ? new Date(report.contract_end_date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'Not specified'
                    }
                  </p>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[#515964] text-[12px]">Deposit Amount:</span>
                  <p className="font-medium text-[#0B1420] text-[14px]">
                    {report.deposit_amount ? `$${report.deposit_amount}` : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
      {/* Rooms Header */}
      <h2 className="font-bold text-[20px] leading-[27px] text-[#0B1420] px-5 mt-[24px]">
        {report.type === 'move-out' ? 'Before & After Comparison' : 'Rooms'}
      </h2>
      
      {/* Room Sections */}
      <div className="mt-4 pb-20">
        {rooms.map((room, index) => {
          // For move-out reports, we want to show move-in/move-out comparisons
          const isComparisonView = report.type === 'move-out';
          
          // Find corresponding move-in room data
          let moveInRoom = null;
          if (isComparisonView && moveInData && moveInData.rooms) {
            moveInRoom = moveInData.rooms.find(r => r.id === room.id || r.name === room.name);
          }
          
          const hasMoveinData = moveInRoom && (moveInRoom.photos?.length > 0 || moveInRoom.roomIssueNotes?.length > 0);
          const hasMoveoutData = room.moveOutNotes && room.moveOutNotes.length > 0;
          
          // Initialize active tab for this room if not set
          if (!activeRoomTab[room.id] && isComparisonView) {
            activeRoomTab[room.id] = 'move-out'; // Default to move-out tab for move-out reports
          } else if (!activeRoomTab[room.id]) {
            activeRoomTab[room.id] = 'photos';
          }
          
          return (
            <div key={room.id} className="mb-12">
              {/* Room Name */}
              <h3 className="font-bold text-[16px] leading-[22px] text-[#0B1420] px-5 mb-4">
                {room.name} {room.type && `(${room.type.charAt(0).toUpperCase() + room.type.slice(1)})`}
              </h3>
              
              {/* Tabs */}
              <div className="flex flex-row items-start px-5 gap-4 mb-4 flex-wrap">
                {isComparisonView ? (
                  // Move-out report: Show Move-in and Move-out tabs
                  <>
                    <div 
                      className={`flex flex-col gap-1 cursor-pointer ${activeRoomTab[room.id] === 'move-in' ? 'text-[#3B7145]' : 'text-[#515964]'}`}
                      onClick={() => toggleRoomTab(room.id, 'move-in')}
                    >
                      <span className="font-semibold text-[16px] leading-[22px]">
                        Move-In
                      </span>
                      {activeRoomTab[room.id] === 'move-in' && 
                        <div className="h-[1.5px] bg-[#3B7145]"></div>
                      }
                    </div>
                    
                    <div 
                      className={`flex flex-col gap-1 cursor-pointer ${activeRoomTab[room.id] === 'move-out' ? 'text-[#3B7145]' : 'text-[#515964]'}`}
                      onClick={() => toggleRoomTab(room.id, 'move-out')}
                    >
                      <span className="font-semibold text-[16px] leading-[22px]">
                        Move-Out
                      </span>
                      {activeRoomTab[room.id] === 'move-out' && 
                        <div className="h-[1.5px] bg-[#3B7145]"></div>
                      }
                    </div>
                  </>
                ) : (
                  // Move-in report: Show Photos and Notes tabs
                  <>
                    <div 
                      className={`flex flex-col gap-1 cursor-pointer ${activeRoomTab[room.id] === 'photos' ? 'text-[#3B7145]' : 'text-[#515964]'}`}
                      onClick={() => toggleRoomTab(room.id, 'photos')}
                    >
                      <span className="font-semibold text-[16px] leading-[22px]">
                        Photos ({room.photos ? room.photos.length : (room.photo_count || 0)})
                      </span>
                      {activeRoomTab[room.id] === 'photos' && 
                        <div className="h-[1.5px] bg-[#3B7145]"></div>
                      }
                    </div>
                    
                    <div 
                      className={`flex flex-col gap-1 cursor-pointer ${activeRoomTab[room.id] === 'notes' ? 'text-[#3B7145]' : 'text-[#515964]'}`}
                      onClick={() => toggleRoomTab(room.id, 'notes')}
                    >
                      <span className="font-semibold text-[16px] leading-[22px]">
                        Notes ({room.roomIssueNotes ? room.roomIssueNotes.length : 0})
                      </span>
                      {activeRoomTab[room.id] === 'notes' && 
                        <div className="h-[1.5px] bg-[#3B7145]"></div>
                      }
                    </div>
                  </>
                )}
              </div>
            
              {/* Content based on active tab */}
              {isComparisonView ? (
                // Move-out report content
                <>
                  {/* Move-in Content */}
                  {activeRoomTab[room.id] === 'move-in' && (
                    <div className="px-5">
                      {/* Move-in Photos - Use moveInData instead of filtering current room photos */}
                      <div className="mb-6">
                        {(() => {
                          // Find the corresponding move-in room data
                          const moveInRoom = moveInData?.rooms?.find(r => r.id === room.id);
                          const moveInPhotos = moveInRoom?.photos || [];
                          
                          return (
                            <>
                              <h4 className="font-semibold text-[14px] text-[#0B1420] mb-3">Photos ({moveInPhotos.length})</h4>
                              <div className="grid grid-cols-3 gap-4">
                                {moveInPhotos.length > 0 ? (
                                  moveInPhotos.slice(0, 6).map((photo, idx) => {
                              let photoUrl = getPhotoUrl(photo);
                              const uniqueKey = photo.id || photo.file_path || `${room.id}-movein-${idx}`;
                              
                              return (
                                <div 
                                  key={uniqueKey} 
                                  className="aspect-square bg-gray-200 rounded-[16px] overflow-hidden cursor-pointer"
                                  onClick={() => {
                                    setSelectedPhoto({ url: photoUrl, alt: `${room.name} move-in photo ${idx + 1}` });
                                    setCurrentPhotoArray(moveInPhotos);
                                    setCurrentPhotoIndex(idx);
                                  }}
                                >
                                  <img 
                                    src={photoUrl} 
                                    alt={`${room.name} move-in photo ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/150?text=Photo';
                                    }}
                                  />
                                </div>
                              );
                            })
                                ) : (
                                  <div className="col-span-3 py-4 text-center text-gray-500">
                                    No move-in photos available
                                  </div>
                                )}
                                </div>
                              </>
                            );
                          })()}
                      </div>
                      
                      {/* Move-in Notes */}
                      <div>
                        {(() => {
                          // Find the corresponding move-in room data
                          const moveInRoom = moveInData?.rooms?.find(r => r.id === room.id);
                          
                          return (
                            <>
                              <h4 className="font-semibold text-[14px] text-[#0B1420] mb-3">Notes ({moveInRoom?.roomIssueNotes?.length || 0})</h4>
                              {moveInRoom?.roomIssueNotes && moveInRoom.roomIssueNotes.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2">
                                  {moveInRoom.roomIssueNotes.map((note, noteIdx) => (
                                    <li key={noteIdx} className="font-medium text-[14px] leading-[19px] text-[#0B1420]">
                                      {note}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="font-medium text-[14px] leading-[19px] text-[#6B7280]">
                                  No move-in notes available
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {/* Move-out Content */}
                  {activeRoomTab[room.id] === 'move-out' && (
                    <div className="px-5">
                      {/* Move-out Photos - Filter to only show move-out photos */}
                      <div className="mb-6">
                        {(() => {
                          // Filter photos to only show move-out photos
                          const moveOutPhotos = room.photos ? room.photos.filter(photo => {
                            // Only include photos where move_out is true
                            const isMoveOut = photo.move_out === true || photo.move_out === 1 || photo.move_out === '1';
                            console.log(`Move-out tab - Photo ${photo.id}: move_out=${photo.move_out}, is move-out=${isMoveOut}`);
                            return isMoveOut;
                          }) : [];
                          
                          return (
                            <>
                              <h4 className="font-semibold text-[14px] text-[#0B1420] mb-3">Photos ({moveOutPhotos.length})</h4>
                              <div className="grid grid-cols-3 gap-4">
                                {moveOutPhotos.length > 0 ? (
                                  moveOutPhotos.slice(0, 6).map((photo, idx) => {
                              let photoUrl = getPhotoUrl(photo);
                              const uniqueKey = photo.id || photo.file_path || `${room.id}-moveout-${idx}`;
                              
                              return (
                                <div 
                                  key={uniqueKey} 
                                  className="aspect-square bg-gray-200 rounded-[16px] overflow-hidden cursor-pointer"
                                  onClick={() => {
                                    setSelectedPhoto({ url: photoUrl, alt: `${room.name} move-out photo ${idx + 1}` });
                                    setCurrentPhotoArray(moveOutPhotos);
                                    setCurrentPhotoIndex(idx);
                                  }}
                                >
                                  <img 
                                    src={photoUrl} 
                                    alt={`${room.name} move-out photo ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/150?text=Photo';
                                    }}
                                  />
                                </div>
                              );
                            })
                                  ) : (
                                    <div className="col-span-3 py-4 text-center text-gray-500">
                                      No move-out photos available
                                    </div>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                      </div>
                      
                      {/* Move-out Notes */}
                      <div>
                        <h4 className="font-semibold text-[14px] text-[#0B1420] mb-3">Notes ({room.moveOutNotes?.length || 0})</h4>
                        {room.moveOutNotes && room.moveOutNotes.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-2">
                            {room.moveOutNotes.map((note, noteIdx) => (
                              <li key={noteIdx} className="font-medium text-[14px] leading-[19px] text-[#0B1420]">
                                {note}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="font-medium text-[14px] leading-[19px] text-[#6B7280]">
                            No move-out notes available
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Move-in report content (existing)
                <>
                  {/* Photos Grid */}
                  {activeRoomTab[room.id] === 'photos' && (
                    <div className="px-5">
                      <div className="grid grid-cols-3 gap-4">
                        {room.photos && room.photos.length > 0 ? (
                          room.photos.slice(0, 6).map((photo, idx) => {
                            let photoUrl = getPhotoUrl(photo);
                            const uniqueKey = photo.id || photo.file_path || `${room.id}-${idx}`;
                            
                            return (
                              <div 
                                key={uniqueKey} 
                                className="aspect-square bg-gray-200 rounded-[16px] overflow-hidden cursor-pointer"
                                onClick={() => {
                                  setSelectedPhoto({ url: photoUrl, alt: `${room.name} photo ${idx + 1}` });
                                  setCurrentPhotoArray(room.photos);
                                  setCurrentPhotoIndex(idx);
                                }}
                              >
                                <img 
                                  src={photoUrl} 
                                  alt={`${room.name} photo ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/150?text=Photo';
                                  }}
                                />
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-3 py-4 text-center text-gray-500">
                            No photos available for this room
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Notes */}
                  {activeRoomTab[room.id] === 'notes' && (
                    <div className="px-5">
                      {room.roomIssueNotes && room.roomIssueNotes.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2">
                          {room.roomIssueNotes.map((note, noteIdx) => (
                            <li key={noteIdx} className="font-medium text-[14px] leading-[19px] text-[#0B1420]">
                              {note}
                            </li>
                          ))}
                        </ul>
                      ) : room.notes && room.notes.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2">
                          {room.notes.map((note, noteIdx) => (
                            <li key={noteIdx} className="font-medium text-[14px] leading-[19px] text-[#0B1420]">
                              {note}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="font-medium text-[14px] leading-[19px] text-[#6B7280]">
                          No notes available for this room.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}