const { validationResult } = require('express-validator');
const Report = require('../models/report.model');
const Property = require('../models/property.model');
const db = require('../config/database');

exports.createReport = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { property_id, title, description, type, uuid, rooms } = req.body;
    const created_by = req.user.id;
    
    console.log(`[INFO] Creating report: ${title}, Property: ${property_id}, Type: ${type}, UUID: ${uuid || 'not provided'}`);
    
    // Odaları log'lama
    if (rooms) {
      console.log(`[INFO] Report includes ${rooms.length} room(s):`, rooms.map(r => r.name));
    }

    // Get and check property information
    const property = await Property.findById(property_id);
    if (!property) {
      console.log(`[ERROR] Property not found: ${property_id}`);
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create new report - explicitly pass UUID if provided
    const reportId = await Report.create({
      property_id,
      created_by,
      title,
      description,
      type,
      uuid: uuid || undefined, // Bu şekilde UUID boşsa model kendi uuid oluşturacak
      rooms: rooms // doğrudan rooms'u geç, model içinde JSON'a çevriliyor
    });

    // Get report information
    const report = await Report.findById(reportId);
    console.log(`[INFO] Report created successfully: ID=${reportId}, UUID=${report.uuid}`);

    res.status(201).json({
      message: 'Report created successfully',
      id: reportId,
      uuid: report.uuid, // UUID'yi yanıtta dön
      report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    // Get all reports belonging to the user
    const reports = await Report.findByUserId(req.user.id);

    res.json(reports);
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const reportId = req.params.id;

    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the report owner
    const isOwner = report.created_by === req.user.id;
    
    // Different users with reports for the same property can see each other's reports
    // This allows landlords and tenants to see each other's reports
    const property = await Property.findById(report.property_id);
    const hasPropertyAccess = property.user_id === req.user.id;
    
    if (!isOwner && !hasPropertyAccess) {
      return res.status(403).json({ message: 'You do not have permission to access this report' });
    }

    // Log report view
    await Report.logReportView(reportId, req.user.id);

    res.json(report);
  } catch (error) {
    console.error('Get report by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReportByUuid = async (req, res) => {
  try {
    const uuid = req.params.uuid;
    console.log(`[INFO] Accessing report via UUID: ${uuid}`);
    
    // URL oluşturma için protokol ve host bilgisi al - moved to top of function
    const apiProtocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const apiHost = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5050';
    
    // Production ortamı için baseUrl'i kontrol et
    // API_BASE_URL environment variable kullan veya default değer
    const baseUrl = process.env.API_BASE_URL || (
      process.env.NODE_ENV === 'production' 
        ? 'https://api.tenantli.ai'
        : `${apiProtocol}://${apiHost}`
    );
    
    if (!uuid) {
      return res.status(400).json({ message: 'UUID parameter is required' });
    }

    // Get report information by UUID
    const report = await Report.findByUuid(uuid);
    if (!report) {
      console.log(`[WARNING] Report not found with UUID: ${uuid}`);
      return res.status(404).json({ message: 'Report not found' });
    }
    
    console.log(`[INFO] Found report: ID=${report.id}, Title="${report.title}", Property=${report.property_id}`);

    // Herhangi bir kimlik doğrulama kontrolü yapma - bu endpoint public
    // Any user can access reports via UUID - this is by design
    // Log report view (viewer_id can be null for anonymous viewers)
    await Report.logReportView(report.id, req.user ? req.user.id : null);
    
    // Rapordaki fotoğrafları da çek
    const Photo = require('../models/photo.model');
    try {
      // Önemli: Rapor ID'sine bağlı tüm fotoğrafları getir
      const photos = await Photo.findByReportId(report.id);
      
      console.log(`[PHOTOS] Fetching photos for report ${report.id} (type: ${report.type}). Found ${photos.length} photos.`);
      if (photos.length > 0) {
        photos.forEach(p => console.log(`Photo ${p.id}: room_id=${p.room_id}, file_path=${p.file_path}, move_out=${p.move_out} (${typeof p.move_out})`));
      }
      
      // Fotoğraflar için URL'leri oluştur - using baseUrl instead of apiProtocol/apiHost
      const photosWithUrls = photos.map(photo => ({
        ...photo,
        file_path: photo.file_path, // file_path bilgisi ekle
        url: `/uploads/${photo.file_path}`,
        absolute_url: `${baseUrl}/uploads/${photo.file_path}`
      }));
      
      // Odaları JSON parse ile çöz
      let rooms = [];
      let moveInData = null;
      
      if (report.rooms_json) {
        try {
          rooms = JSON.parse(report.rooms_json);
          console.log(`[INFO] Parsed ${rooms.length} rooms from JSON data`);
          
          // Her oda için fotoğraf bul ve ekle
          for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i];
            // room_id'ye göre fotoğrafları bul
            // For move-out reports, we'll include ALL photos to let frontend filter them
            const roomPhotos = photos.filter(photo => {
              // Hem room_id'nin eşleştiğinden emin ol
              const isRoomMatch = photo.room_id === room.id;
              
              if (isRoomMatch) {
                console.log(`Photo ${photo.id} in room ${room.id}, move_out: ${photo.move_out} (${typeof photo.move_out})`);
              }
              
              // For move-out reports, include all photos for the room
              // For move-in reports, only include move-in photos
              if (report.type === 'move-out') {
                return isRoomMatch; // Include all photos for frontend filtering
              } else {
                // For move-in reports, only include photos where move_out is false or null
                const isMoveinPhoto = !photo.move_out || photo.move_out === false || photo.move_out === 0 || photo.move_out === '0' || photo.move_out === null;
                return isRoomMatch && isMoveinPhoto;
              }
            });
            
            console.log(`[INFO] Found ${roomPhotos.length} photos for room ${room.name} (ID: ${room.id}), report type: ${report.type}`);
            
            // Remove duplicate photos based on file_path
            const uniquePhotos = [];
            const seenFilePaths = new Set();
            
            for (const photo of roomPhotos) {
              if (!seenFilePaths.has(photo.file_path)) {
                seenFilePaths.add(photo.file_path);
                uniquePhotos.push(photo);
              }
            }
            
            console.log(`[INFO] After removing duplicates: ${uniquePhotos.length} unique photos for room ${room.name}`);
            
            // Notları ve fotoğrafları düzelt - using baseUrl instead of apiProtocol/apiHost
            rooms[i].photos = uniquePhotos.map(photo => ({
              ...photo,
              url: `/uploads/${photo.file_path}`,
              file_path: photo.file_path,
              absolute_url: `${baseUrl}/uploads/${photo.file_path}`
            }));
            
            // Fotoğraf sayısını gerçek fotoğraf sayısıyla güncelle
            rooms[i].photo_count = uniquePhotos.length;
            
            console.log(`Room ${room.name} photos: found ${roomPhotos.length} photos (reported count was ${room.photo_count || 0})`);
            console.log(`Updated room ${room.name} photo count to ${rooms[i].photo_count}`);
            
            // Ensure notes fields are properly mapped
            if (!rooms[i].moveOutNotes && room.moveOutNotes) {
              rooms[i].moveOutNotes = room.moveOutNotes;
            }
            if (!rooms[i].roomIssueNotes && room.roomIssueNotes) {
              rooms[i].roomIssueNotes = room.roomIssueNotes;
            }
            // Fallback for older data
            if (!rooms[i].moveOutNotes && !rooms[i].roomIssueNotes && room.notes) {
              if (report.type === 'move-out') {
                rooms[i].moveOutNotes = room.notes;
              } else {
                rooms[i].roomIssueNotes = room.notes;
              }
            }
            
            // Property adres bilgisini odaya ekle
            rooms[i].address = report.address;
            rooms[i].property_type = report.property_type || 'unknown';
          }
          
          // If this is a move-out report, also fetch move-in data
          if (report.type === 'move-out') {
            console.log(`[INFO] This is a move-out report, fetching move-in data for property ${report.property_id}`);
            
            try {
              // Find the most recent move-in report for this property
              const moveInReportQuery = `
                SELECT * FROM reports 
                WHERE property_id = ? AND type = 'move-in' 
                ORDER BY created_at DESC 
                LIMIT 1
              `;
              
              const [moveInReports] = await db.execute(moveInReportQuery, [report.property_id]);
              
              if (moveInReports.length > 0) {
                const moveInReport = moveInReports[0];
                console.log(`[INFO] Found move-in report ID ${moveInReport.id} for property ${report.property_id}`);
                
                // Get move-in photos
                const moveInPhotos = await Photo.findByReportId(moveInReport.id);
                console.log(`[INFO] Found ${moveInPhotos.length} move-in photos`);
                
                // Debug: Log move-in photo details
                if (moveInPhotos.length > 0) {
                  console.log('[INFO] Move-in photo details:');
                  moveInPhotos.forEach(p => console.log(`  Photo ${p.id}: room_id=${p.room_id}, move_out=${p.move_out} (${typeof p.move_out})`));
                }
                
                // Create move-in data structure
                moveInData = {
                  report: moveInReport,
                  photos: moveInPhotos.map(photo => ({
                    ...photo,
                    url: `/uploads/${photo.file_path}`,
                    absolute_url: `${baseUrl}/uploads/${photo.file_path}`
                  })),
                  rooms: []
                };
                
                // Parse move-in rooms data
                if (moveInReport.rooms_json) {
                  const moveInRooms = JSON.parse(moveInReport.rooms_json);
                  
                  for (let room of moveInRooms) {
                    // Find photos for each move-in room - only show photos with move_out=false/null
                    const moveInRoomPhotos = moveInPhotos.filter(photo => {
                      const isRoomMatch = photo.room_id === room.id;
                      // For move-in photos, include where move_out is false, 0, null, or undefined
                      const isMoveinPhoto = !photo.move_out || photo.move_out === false || photo.move_out === 0 || photo.move_out === '0' || photo.move_out === null;
                      
                      if (isRoomMatch) {
                        console.log(`Move-in photo check - Photo ${photo.id}, move_out: ${photo.move_out} (${typeof photo.move_out}), is move-in: ${isMoveinPhoto}`);
                      }
                      
                      return isRoomMatch && isMoveinPhoto;
                    });
                    
                    moveInData.rooms.push({
                      ...room,
                      photos: moveInRoomPhotos.map(photo => ({
                        ...photo,
                        url: `/uploads/${photo.file_path}`,
                        absolute_url: `${baseUrl}/uploads/${photo.file_path}`
                      })),
                      notes: room.roomIssueNotes || room.notes || [],
                      roomIssueNotes: room.roomIssueNotes || room.notes || []
                    });
                  }
                }
                
                console.log(`[INFO] Prepared move-in data with ${moveInData.rooms.length} rooms`);
                
                // Debug: Log final move-in room photo counts
                console.log('[INFO] Move-in room photo summary:');
                moveInData.rooms.forEach(room => {
                  console.log(`  Room ${room.name}: ${room.photos.length} photos`);
                });
              } else {
                console.log(`[INFO] No move-in report found for property ${report.property_id}`);
              }
            } catch (moveInError) {
              console.error('Error fetching move-in data:', moveInError);
            }
          }
          
        } catch (jsonError) {
          console.error('Error parsing rooms JSON:', jsonError);
        }
      }
      
      // Property bilgilerini doğru formata getir
      const property = {
        id: report.property_id,
        address: report.address,
        property_type: report.property_type || 'unknown',
        description: report.description || '',
        role_at_this_property: report.role_at_this_property || ''
      };

      // Property.js'den ek kiralama detaylarını getir
      try {
        const Property = require('../models/property.model');
        const propertyDetails = await Property.findById(report.property_id);
        
        if (propertyDetails) {
          console.log(`[PROPERTY DETAILS] Found property details:`, propertyDetails);  
          
          // Kiralama detaylarını rapora ekle
          report.lease_duration = propertyDetails.lease_duration;
          report.lease_duration_type = propertyDetails.lease_duration_type;
          report.deposit_amount = propertyDetails.deposit_amount;
          report.move_out_date = propertyDetails.move_out_date;
          report.contract_start_date = propertyDetails.contract_start_date;
          report.contract_end_date = propertyDetails.contract_end_date;
          report.address = propertyDetails.address;
          report.description = propertyDetails.description;
          
          // Property bilgilerini de güncelle
          property.lease_duration = propertyDetails.lease_duration;
          property.lease_duration_type = propertyDetails.lease_duration_type;
          property.deposit_amount = propertyDetails.deposit_amount;
          property.move_out_date = propertyDetails.move_out_date;
          property.contract_start_date = propertyDetails.contract_start_date;
          property.contract_end_date = propertyDetails.contract_end_date;
          property.address = propertyDetails.address;
          property.description = propertyDetails.description;
        }
      } catch (propertyError) {
        console.error('Error fetching property details:', propertyError);
      }
      
      // Fotoğrafları ve odaları da ekleyerek raporu döndür
      console.log(`[INFO] Found ${photos.length} photos for report ${report.id}`);
      
      console.log(`[INFO] Base URL for photos: ${baseUrl}`);
      console.log(`[INFO] Returning report with ${rooms.length} rooms and ${photosWithUrls.length} photos`);
      
      return res.json({
        ...report,
        photos: photosWithUrls,
        rooms: rooms,
        property: property,
        baseUrl: baseUrl,
        moveInData: moveInData  // Include move-in data if available
      });
    } catch (photoError) {
      console.error('Error fetching photos:', photoError);
      // Fotoğraf hatalarında sadece raporu döndür
      return res.json(report);
    }
  } catch (error) {
    console.error('Get report by uuid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateReport = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reportId = req.params.id;
    const { title, description, type, generate_new_uuid } = req.body;

    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the report owner
    const isOwner = report.created_by === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to edit this report' });
    }

    // Rapor daha önce reddedilmiş mi kontrol et
    const wasRejected = report.approval_status === 'rejected';
    
    // Update report
    const updateData = {
      title,
      description,
      type,
      // Eğer rapor reddedilmişse ve içerik değişiyorsa yeni bir UUID oluştur
      generate_new_uuid: wasRejected && generate_new_uuid
    };
    
    const updated = await Report.update(reportId, updateData);

    if (!updated) {
      return res.status(400).json({ message: 'Report could not be updated' });
    }

    // Get updated report information
    const updatedReport = await Report.findById(reportId);

    // Eğer rapor reddedilmişse ve başarıyla güncellendiyse bildirim gönder
    if (wasRejected) {
      // Log bilgisi
      console.log('Rejected report was updated: ', reportId);
    }

    res.json({
      message: 'Report updated successfully',
      report: updatedReport,
      was_rejected: wasRejected
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the report owner
    const isOwner = report.created_by === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to delete this report' });
    }

    // Delete report (cascade delete will also delete photos)
    const deleted = await Report.delete(reportId);

    if (!deleted) {
      return res.status(400).json({ message: 'Report could not be deleted' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReportsByProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    // Get property information
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user has access to this property
    // (User can be the property owner or have created a report for this property)
    const isPropertyOwner = property.user_id === req.user.id;
    
    // Get reports for the property
    const reports = await Report.findByPropertyId(propertyId);

    // If user is not the property owner, they should only see reports they created
    const filteredReports = isPropertyOwner 
      ? reports 
      : reports.filter(report => report.created_by === req.user.id);

    res.json(filteredReports);
  } catch (error) {
    console.error('Get reports by property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// E-posta servisini import et
const mailService = require('../services/mail.service');
const User = require('../models/user.model');

// Rapor arşivleme
exports.archiveReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { reason } = req.body;

    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the report owner or has admin access
    const isOwner = report.created_by === req.user.id;
    const isAdmin = req.user.role === 'admin'; // Eğer rol sistemi varsa kullan
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to archive this report' });
    }
    
    // Onay durumu ve zamanlaması için doğru tarih formatını kullan (MySQL için)
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS formatı
    
    // Raporu arşivle
    const updated = await Report.update(reportId, {
      is_archived: 1,
      archived_at: formattedDate,
      archive_reason: reason || 'Archived by user'
    });

    if (!updated) {
      return res.status(400).json({ message: 'Report could not be archived' });
    }

    res.json({ message: 'Report archived successfully' });
  } catch (error) {
    console.error('Archive report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rapor onaylama işlemi
exports.approveReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status, message, uuid } = req.body;
    
    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Kimlik doğrulama kontrolü - UUID varsa veya sahibiyse
    const isOwner = req.user && report.created_by === req.user.id;
    let hasAccess = isOwner;
    
    // UUID ile erişim kontrolü
    if (uuid && report.uuid === uuid) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have permission to approve this report' });
    }
    
    // Onay durumu ve zamanlaması için doğru tarih formatını kullan (MySQL için)
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS formatı
    
    // Raporu güncelle
    const updated = await Report.update(reportId, {
      approval_status: 'approved',
      approved_at: formattedDate,
      approved_message: message || 'Report has been approved'
    });
    
    if (!updated) {
      return res.status(400).json({ message: 'Report could not be approved' });
    }
    
    res.json({ message: 'Report has been approved successfully' });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rapor reddetme işlemi
exports.rejectReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status, message, uuid } = req.body;
    
    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Kimlik doğrulama kontrolü - UUID varsa veya sahibiyse
    const isOwner = req.user && report.created_by === req.user.id;
    let hasAccess = isOwner;
    
    // UUID ile erişim kontrolü
    if (uuid && report.uuid === uuid) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have permission to reject this report' });
    }
    
    // Onay durumu ve zamanlaması için doğru tarih formatını kullan (MySQL için)
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS formatı
    
    // Raporu güncelle
    const updated = await Report.update(reportId, {
      approval_status: 'rejected',
      rejected_at: formattedDate,
      rejection_message: message || 'Report has been rejected'
    });
    
    if (!updated) {
      return res.status(400).json({ message: 'Report could not be rejected' });
    }
    
    res.json({ message: 'Report has been rejected successfully' });
  } catch (error) {
    console.error('Reject report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rapor bildirim işlemi - E-posta gönderme
exports.sendReportNotification = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { 
      recipientEmail, 
      recipientName, 
      subject, 
      message, 
      status,
      reportUuid,
      isPublic
    } = req.body;
    
    // Verifikasyon
    if (!recipientEmail || !subject) {
      return res.status(400).json({ message: 'Recipient email and subject are required' });
    }
    
    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Kimlik doğrulama kontrolü - sadece sahip veya UUID ile erişim
    const isOwner = req.user && report.created_by === req.user.id;
    let hasAccess = isOwner;
    
    // Public erişim veya UUID ile erişim
    if (isPublic || (reportUuid && report.uuid === reportUuid)) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have permission to send notifications for this report' });
    }
    
    // Rapor kaynağını getir
    const property = await Property.findById(report.property_id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Rapor oluşturan kullanıcıyı getir
    const creator = await User.findById(report.created_by);
    
    // E-posta alacak kişi bilgileri
    // Öncelik sırası: request body > tenant_email > creator_email > .env default
    const emailToUse = req.body.recipientEmail || report.tenant_email || (creator ? creator.email : null) || process.env.EMAIL_FROM;
    const nameToUse = req.body.recipientName || report.tenant_name || (creator ? creator.name : 'Tenant');

    // Alici bilgilerini detaylı logla
    console.log('Alıcı bilgileri (son):', {
      email: emailToUse, 
      name: nameToUse,
      requestEmail: req.body.recipientEmail,
      reportTenantEmail: report.tenant_email,
      creatorEmail: creator ? creator.email : 'N/A'
    });
    
    const recipient = {
      email: emailToUse,
      name: nameToUse
    };
    
    // Rapor görüntüleme URL'ini oluştur
    // FRONTEND_BASE_URL environment variable kullan veya default değer
    const baseUrl = process.env.FRONTEND_BASE_URL || (
      process.env.NODE_ENV === 'production' 
        ? 'https://mobile.tenantli.ai'
        : 'http://localhost:3000'
    );
    
    const viewUrl = `${baseUrl}/reports/shared/${report.uuid}`;
    
    // Rapor detayları
    const reportDetails = {
      id: report.id,
      title: report.title,
      description: report.description,
      type: report.type,
      created_at: report.created_at,
      address: property.address,
      viewUrl: viewUrl
    };
    
    // E-posta gönderimi
    let emailResult;
    
    try {
      console.log('E-posta gönderimi başlatılıyor - status:', status);
      console.log('Alıcı detayları:', recipient, 'E-posta:', recipient.email);
      console.log('Rapor bilgileri:', {
        id: reportDetails.id,
        title: reportDetails.title,
        address: reportDetails.address,
        viewUrl: reportDetails.viewUrl
      });

      if (status === 'approved') {
        // Onay e-postası
        emailResult = await mailService.sendReportApprovalNotification(recipient, reportDetails);
      } else if (status === 'rejected') {
        // Red e-postası
        emailResult = await mailService.sendReportRejectionNotification(recipient, reportDetails);
      } else {
        // Özel e-posta
        emailResult = await mailService.sendCustomNotification(
          recipient,
          subject,
          message || 'You have a new notification about your property report.',
          reportDetails
        );
      }
      
      console.log('E-posta gönderme sonucu:', emailResult);
    } catch (emailError) {
      console.error('===== CONTROLLER: E-POSTA GÖNDERME HATASI =====');
      console.error('Hata detayı:', emailError);
      console.error('============================================');
      
      // E-posta gönderiminde hata olsa bile işlemi devam ettir
      return res.json({ 
        message: 'Report notification attempted, but email sending failed',
        success: true,
        emailStatus: 'failed',
        emailError: emailError.message
      });
    }
    
    if (!emailResult.success) {
      console.error('===== CONTROLLER: E-POSTA GÖNDERME HATASI =====');
      console.error('Hata detayı:', emailResult.error);
      console.error('Hata kodu:', emailResult.code);
      console.error('Hata yanıtı:', emailResult.response);
      console.error('============================================');
      
      // Hatıyı client'a döndermeyelim, ama yine de başarılı yanıt dönelim
      console.log('Client\'a başarılı mesaj döndürülüyor...');
      
      // Eğer e-posta gönderimi başarısız olsa bile işlemi başarılı say
      return res.json({ 
        message: 'Report action was completed, but there were issues with the email notification.',
        success: true,
        emailStatus: 'failed',
        emailError: emailResult.error
      });
      
      /* Önceki hata davranışı - tamamen hata döndürür
      return res.status(500).json({ 
        message: 'Error sending notification email', 
        error: emailResult.error,
        code: emailResult.code,
        response: emailResult.response 
      });
      */
    }
    
    // Bildirim başarılı
    res.json({ 
      message: 'Notification email sent successfully',
      messageId: emailResult.messageId 
    });
    
  } catch (error) {
    console.error('Send report notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
