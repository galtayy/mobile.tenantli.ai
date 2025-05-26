const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const multer = require('multer');
const sharp = require('sharp');
const Photo = require('../models/photo.model');
const Report = require('../models/report.model');
const Property = require('../models/property.model');
const db = require('../config/database');

// Kimlik doğrulama gerektirmeden rapora ait tüm fotoğrafları getirme endpoint'i
exports.getPublicReportPhotos = async (req, res) => {
  try {
    const reportId = req.params.reportId;
    
    if (!reportId) {
      return res.status(400).json({ message: 'Rapor ID belirtilmedi' });
    }
    
    // Log inceleme için
    console.log(`[DEBUG] Public access requested for photos of report ${reportId}`);
    
    // Rapor var mı kontrol et
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }
    
    // Güvenli erişim için gerekli başlıkları ekle
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Rapora ait fotoğrafları getir
    const photos = await Photo.findByReportId(reportId);
    
    // Debug için bağlantı bilgilerini yazdır
    console.log(`[DEBUG] ${photos.length} photos found for report ${reportId}`);
    console.log(`[DEBUG] Protocol: ${req.protocol}, Host: ${req.get('host')}`);
    console.log(`[DEBUG] X-Forwarded headers:`, req.headers['x-forwarded-proto'], req.headers['x-forwarded-host']);
    
    // URL'den ziyade file_path + url alanı döndür - bu frontend'de daha esnek bir şekilde işlenebilir
    const photosWithPaths = photos.map(photo => {
      // Fotoğraf bilgilerini döndür
      return {
        ...photo,
        file_path: photo.file_path, // file_path'i açıkça döndür
        url: `/uploads/${photo.file_path}` // Göreceli URL döndür
      };
    });
    
    res.json(photosWithPaths);
  } catch (error) {
    console.error('Get public photos by report error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kimlik doğrulama gerektirmeden fotoğraf dosyasına erişim sağlayan endpoint
exports.getPublicPhoto = async (req, res) => {
  try {
    const filename = req.params.filename;
    
    if (!filename) {
      return res.status(400).json({ message: 'Dosya adı belirtilmedi' });
    }
    
    // Güvenlik için dosya adını kontrol et - path traversal saldırılarını önle
    if (filename.includes('../') || filename.includes('..\\')) {
      return res.status(400).json({ message: 'Geçersiz dosya adı' });
    }
    
    // Dosya yolu oluştur
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Dosyanın var olup olmadığını kontrol et
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Dosya bulunamadı' });
    }
    
    // MIME türünü dosya uzantısından belirle
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // Varsayılan
    
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    }
    
    // Dosyayı gönder
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 yıl önbellek
    
    // CORS headerlarını ekle
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // DEBUG için
    console.log(`[DEBUG] Public photo access: ${filename}, content-type: ${contentType}`);
    
    // Dosyayı akış olarak gönder
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Get public photo error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Dosya filtresi (sadece resim dosyaları)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece JPG, JPEG ve PNG formatındaki dosyalar kabul edilir.'), false);
  }
};

// Multer upload middleware - kullanımı bellek üzerinden çalışacak şekilde değiştirildi
const upload = multer({
  storage: multer.memoryStorage(), // Dosyaları disk yerine bellekte tut, sıkıştırma işlemi için
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

exports.uploadPhoto = [
  // Upload middleware - bellek üzerinde tutar
  upload.single('photo'),
  
  // Controller
  async (req, res) => {
    try {
      const reportId = req.params.reportId;
      
      // Rapor var mı kontrol et
      const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).json({ message: 'Rapor bulunamadı' });
      }
      
      // Rapor sahibi mi kontrol et
      const isOwner = report.created_by === req.user.id;
      if (!isOwner) {
        return res.status(403).json({ message: 'Bu rapora fotoğraf ekleme izniniz yok' });
      }
      
      // Dosya yüklendi mi kontrol et
      if (!req.file) {
        return res.status(400).json({ message: 'Fotoğraf yüklenemedi' });
      }
      
      // Etiketleri JSON parse et
      let tags = [];
      if (req.body.tags) {
        try {
          tags = JSON.parse(req.body.tags);
        } catch (err) {
          console.error('Tags parsing error:', err);
        }
      }
      
      // Benzersiz dosya adı oluştur
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = '.jpg'; // Sıkıştırma için hep jpg formatında kaydet
      const filename = uniqueSuffix + ext;
      const outputPath = path.join(__dirname, '../uploads', filename);
      
      // Uploads dizini yoksa oluştur
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Görüntüyü işle ve sıkıştır
      console.log('Rapor fotoğrafı sıkıştırılıyor...');
      await sharp(req.file.buffer)
        .resize(1200, null, { // En fazla 1200px genişlik, oranı koru
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 60, // %60 kalite - daha iyi sıkıştırma
          progressive: true // Progressive JPEG for better loading
        })
        .toFile(outputPath);
      
      console.log(`Görüntü sıkıştırıldı ve ${filename} olarak kaydedildi`);
      
      // Fotoğraf bilgilerini veritabanına kaydet
      const photoId = await Photo.create({
        report_id: reportId,
        room_id: req.body.room_id || null,
        property_id: req.body.property_id || null,
        file_path: filename,
        note: req.body.note || null,
        timestamp: new Date(),
        tags
      });
      
      // Fotoğraf bilgilerini getir
      const photo = await Photo.findById(photoId);
      
      // Fotoğraf URL'ini ekle - daha güvenilir bir yöntem kullanalım
      // Önce istek protokolü ve host bilgisini kontrol edelim
      let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      let host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5050';
      
      // Canlı ortamda sabit değerleri kullanmayı tercih edebiliriz
      if (process.env.NODE_ENV === 'production') {
        protocol = 'https';
        host = 'api.https://api.tenantli.ai';
      }
      
      const baseUrl = `${protocol}://${host}`;
      photo.url = `/uploads/${photo.file_path}`; // Sadece path döndürürken frontend tarafında baseUrl ile birleştirilecek
      
      res.status(201).json({
        message: 'Fotoğraf başarıyla yüklendi',
        photo
      });
    } catch (error) {
      console.error('Upload photo error:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
];

exports.getPhotosByReport = async (req, res) => {
  try {
    const reportId = req.params.reportId;
    
    // Rapor var mı kontrol et
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }
    
    // Rapora erişim izni var mı kontrol et
    const isOwner = report.created_by === req.user.id;
    const property = await Property.findById(report.property_id);
    const hasPropertyAccess = property && property.user_id === req.user.id;
    
    if (!isOwner && !hasPropertyAccess) {
      return res.status(403).json({ message: 'Bu raporun fotoğraflarına erişim izniniz yok' });
    }
    
    // Rapora ait fotoğrafları getir
    const photos = await Photo.findByReportId(reportId);
    
      // Debug için bağlantı bilgilerini yazdır
      console.log(`[Debug] Report ${reportId} için fotoğraf listesi döndürülüyor`);
      console.log(`[Debug] Protocol: ${req.protocol}, Host: ${req.get('host')}`);
      console.log(`[Debug] X-Forwarded headers:`, req.headers['x-forwarded-proto'], req.headers['x-forwarded-host']);
      
      // URL'den ziyade file_path + url alanı döndür - bu frontend'de daha esnek bir şekilde işlenebilir
      const photosWithPaths = photos.map(photo => {
        // Fotoğraf bilgilerini döndür
        return {
          ...photo,
          file_path: photo.file_path, // file_path'i açıkça döndür
          url: `/uploads/${photo.file_path}` // Göreceli URL döndür
        };
      });
      
      res.json(photosWithPaths);
  } catch (error) {
    console.error('Get photos by report error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getPhotoById = async (req, res) => {
  try {
    const photoId = req.params.id;
    
    // Fotoğraf bilgilerini getir
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }
    
    // Fotoğrafın ait olduğu raporu ve erişim izni kontrol et
    const report = await Report.findById(photo.report_id);
    const isReportOwner = report.created_by === req.user.id;
    const property = await Property.findById(report.property_id);
    const hasPropertyAccess = property && property.user_id === req.user.id;
    
    if (!isReportOwner && !hasPropertyAccess) {
      return res.status(403).json({ message: 'Bu fotoğrafa erişim izniniz yok' });
    }
    
    // Fotoğraf URL'i oluştur - daha güvenilir bir yöntem kullanalım
    // Önce istek protokolü ve host bilgisini kontrol edelim
    let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    let host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5050';
    
    // Canlı ortamda sabit değerleri kullanmayı tercih edebiliriz
    if (process.env.NODE_ENV === 'production') {
      protocol = 'https';
      host = 'api.https://api.tenantli.ai';
    }
    
    photo.url = `/uploads/${photo.file_path}`;  // Sadece path döndürürken frontend tarafında baseUrl ile birleştirilecek
    
    res.json(photo);
  } catch (error) {
    console.error('Get photo by id error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.updatePhotoNote = async (req, res) => {
  try {
    // Validasyon hataları kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const photoId = req.params.id;
    const { note } = req.body;
    
    // Fotoğraf bilgilerini getir
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }
    
    // Fotoğrafın ait olduğu raporu ve yetki kontrolü
    const report = await Report.findById(photo.report_id);
    const isReportOwner = report.created_by === req.user.id;
    
    if (!isReportOwner) {
      return res.status(403).json({ message: 'Bu fotoğrafı düzenleme izniniz yok' });
    }
    
    // Fotoğraf notunu güncelle
    const updated = await Photo.updateNote(photoId, note);
    
    if (!updated) {
      return res.status(400).json({ message: 'Fotoğraf notu güncellenemedi' });
    }
    
    // Güncellenmiş fotoğraf bilgilerini getir
    const updatedPhoto = await Photo.findById(photoId);
    
    // Fotoğraf URL'i oluştur - daha güvenilir bir yöntem kullanalım
    // Önce istek protokolü ve host bilgisini kontrol edelim
    let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    let host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5050';
    
    // Canlı ortamda sabit değerleri kullanmayı tercih edebiliriz
    if (process.env.NODE_ENV === 'production') {
      protocol = 'https';
      host = 'api.https://api.tenantli.ai';
    }
    
    updatedPhoto.url = `/uploads/${updatedPhoto.file_path}`;  // Sadece path döndürürken frontend tarafında baseUrl ile birleştirilecek
    
    res.json({
      message: 'Fotoğraf notu başarıyla güncellendi',
      photo: updatedPhoto
    });
  } catch (error) {
    console.error('Update photo note error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.addPhotoTag = async (req, res) => {
  try {
    // Validasyon hataları kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const photoId = req.params.id;
    const { tag } = req.body;
    
    // Fotoğraf bilgilerini getir
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }
    
    // Fotoğrafın ait olduğu raporu ve yetki kontrolü
    const report = await Report.findById(photo.report_id);
    const isReportOwner = report.created_by === req.user.id;
    
    if (!isReportOwner) {
      return res.status(403).json({ message: 'Bu fotoğrafa etiket ekleme izniniz yok' });
    }
    
    // Fotoğrafa etiket ekle
    await Photo.addTag(photoId, tag);
    
    // Güncellenmiş fotoğraf bilgilerini getir
    const updatedPhoto = await Photo.findById(photoId);
    
    // Fotoğraf URL'i oluştur
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    updatedPhoto.url = `${baseUrl}/uploads/${updatedPhoto.file_path}`;
    
    res.json({
      message: 'Etiket başarıyla eklendi',
      photo: updatedPhoto
    });
  } catch (error) {
    console.error('Add photo tag error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.removePhotoTag = async (req, res) => {
  try {
    const photoId = req.params.id;
    const tag = req.params.tag;
    
    // Fotoğraf bilgilerini getir
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }
    
    // Fotoğrafın ait olduğu raporu ve yetki kontrolü
    const report = await Report.findById(photo.report_id);
    const isReportOwner = report.created_by === req.user.id;
    
    if (!isReportOwner) {
      return res.status(403).json({ message: 'Bu fotoğraftan etiket silme izniniz yok' });
    }
    
    // Fotoğraftan etiket sil
    const removed = await Photo.removeTag(photoId, tag);
    
    if (!removed) {
      return res.status(400).json({ message: 'Etiket silinemedi veya bulunamadı' });
    }
    
    // Güncellenmiş fotoğraf bilgilerini getir
    const updatedPhoto = await Photo.findById(photoId);
    
    // Fotoğraf URL'i oluştur
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    updatedPhoto.url = `${baseUrl}/uploads/${updatedPhoto.file_path}`;
    
    res.json({
      message: 'Etiket başarıyla silindi',
      photo: updatedPhoto
    });
  } catch (error) {
    console.error('Remove photo tag error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Oda fotoğrafları yükleme controller
exports.uploadRoomPhoto = [
  // Upload middleware - bellek üzerinde tutar
  upload.single('photo'),

  // Controller
  async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId, 10);
      const roomId = req.params.roomId;

      // Mülk var mı kontrol et
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Mülk sahibi mi kontrol et
      const isOwner = property.user_id === req.user.id;
      if (!isOwner) {
        return res.status(403).json({ message: 'You do not have permission to upload photos to this property' });
      }

      // Dosya yüklendi mi kontrol et
      if (!req.file) {
        return res.status(400).json({ message: 'Photo upload failed' });
      }

      // Etiketleri JSON parse et
      let tags = [];
      if (req.body.tags) {
        try {
          tags = JSON.parse(req.body.tags);
        } catch (err) {
          console.error('Tags parsing error:', err);
        }
      }

      // Benzersiz dosya adı oluştur
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = uniqueSuffix + '.jpg'; // Sıkıştırma için hep jpg formatında kaydet
      const outputPath = path.join(__dirname, '../uploads', filename);
      
      // Uploads dizini yoksa oluştur
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Görüntüyü işle ve sıkıştır
      console.log('Oda fotoğrafı sıkıştırılıyor...');
      await sharp(req.file.buffer)
        .resize(1200, null, { // En fazla 1200px genişlik, oranı koru
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 60, // %60 kalite - daha iyi sıkıştırma
          progressive: true // Progressive JPEG for better loading
        })
        .toFile(outputPath);
      
      console.log(`Görüntü sıkıştırıldı ve ${filename} olarak kaydedildi`);

      // Fotoğraf bilgilerini veritabanına kaydet
      const photoId = await Photo.create({
        report_id: null, // odalar için report_id null
        room_id: roomId,
        property_id: propertyId,
        file_path: filename,
        note: req.body.note || null,
        timestamp: new Date(),
        tags
      });

      // Fotoğraf bilgilerini getir
      const photo = await Photo.findById(photoId);

      // Göreceli URL oluştur
      photo.url = `/uploads/${photo.file_path}`;

      res.status(201).json({
        message: 'Photo uploaded successfully',
        photo
      });
    } catch (error) {
      console.error('Upload room photo error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// Odaya ait fotoğrafları getirme
exports.getRoomPhotos = async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);
    const roomId = req.params.roomId;
    const moveOut = req.query.move_out === 'true';

    // Mülk var mı kontrol et
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Mülk sahibi mi kontrol et
    const isOwner = property.user_id === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to access this property' });
    }

    // Odaya ait fotoğrafları getir
    const photos = await Photo.findByRoomId(roomId, propertyId, moveOut);

    // Göreceli URL'leri ekle
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      url: `/uploads/${photo.file_path}`
    }));

    res.json(photosWithUrls);
  } catch (error) {
    console.error('Get room photos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mülke ait tüm fotoğrafları getirme
exports.getPropertyPhotos = async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);

    // Mülk var mı kontrol et
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Mülk sahibi mi kontrol et
    const isOwner = property.user_id === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to access this property' });
    }

    // Mülke ait tüm fotoğrafları getir
    const photos = await Photo.findByPropertyId(propertyId);

    // Göreceli URL'leri ekle
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      url: `/uploads/${photo.file_path}`
    }));

    // Fotoğrafları oda bazında gruplandır
    const photosByRoom = {};

    photosWithUrls.forEach(photo => {
      if (!photo.room_id) {
        return; // Skip photos without room_id
      }

      const roomId = photo.room_id;

      // Initialize room if it doesn't exist
      if (!photosByRoom[roomId]) {
        photosByRoom[roomId] = {
          photos: []
        };
      }

      // Add photo to room
      photosByRoom[roomId].photos.push(photo);
    });

    console.log(`Found ${photos.length} photos for property ${propertyId}`);
    console.log(`Organized into ${Object.keys(photosByRoom).length} rooms`);

    // Return both formats for maximum compatibility
    res.json({
      photos: photosWithUrls,
      photosByRoom: photosByRoom
    });
  } catch (error) {
    console.error('Get property photos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload photo for a room (move-in or move-out)
exports.uploadRoomPhoto = [
  // Upload middleware (bellekte tutar)
  upload.single('photo'),
  
  // Controller
  async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId, 10);
      const roomId = req.params.roomId;
      const moveOut = req.body.move_out === 'true';
      
      // Property kontrolü
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      // Yetki kontrolü
      const isOwner = property.user_id === req.user.id;
      if (!isOwner) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      // Dosya kontrolü
      if (!req.file) {
        return res.status(400).json({ message: 'No photo uploaded' });
      }
      
      // Tags'i parse et
      let tags = [];
      if (req.body.tags) {
        try {
          tags = JSON.parse(req.body.tags);
        } catch (err) {
          console.error('Tags parsing error:', err);
        }
      }
      
      // Benzersiz dosya adı oluştur
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = '.jpg'; // Sıkıştırma için hep jpg formatında kaydet
      const filename = uniqueSuffix + ext;
      const outputPath = path.join(__dirname, '../uploads', filename);
      
      // Uploads dizini yoksa oluştur
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Görüntüyü işle ve sıkıştır
      console.log('Oda fotoğrafı sıkıştırılıyor...');
      await sharp(req.file.buffer)
        .resize(800, null, { // En fazla 800px genişlik, oranı koru
          withoutEnlargement: true
        })
        .jpeg({ quality: 60 }) // %60 kalite ile daha agresif sıkıştır
        .toFile(outputPath);
      
      console.log(`Görüntü sıkıştırıldı ve ${filename} olarak kaydedildi`);
      
      // Fotoğrafı veritabanına kaydet
      const photoId = await Photo.create({
        report_id: null,
        room_id: roomId,
        property_id: propertyId,
        move_out: moveOut,
        file_path: filename,
        note: req.body.note || null,
        timestamp: new Date(),
        tags
      });
      
      // Fotoğraf bilgilerini getir
      const photo = await Photo.findById(photoId);
      photo.url = `/uploads/${photo.file_path}`;
      
      res.status(201).json({
        message: 'Photo uploaded successfully',
        photo
      });
    } catch (error) {
      console.error('Upload room photo error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

exports.deletePhoto = async (req, res) => {
  try {
    const photoId = req.params.id;
    
    // Fotoğraf bilgilerini getir
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }
    
    // Yetki kontrolü - property_id varsa property üzerinden, yoksa report üzerinden
    let isAuthorized = false;
    
    if (photo.property_id) {
      // Property fotoğrafı - property sahibi kontrolü
      const property = await Property.findById(photo.property_id);
      isAuthorized = property && property.user_id === req.user.id;
    } else if (photo.report_id) {
      // Rapor fotoğrafı - rapor sahibi kontrolü
      const report = await Report.findById(photo.report_id);
      isAuthorized = report && report.created_by === req.user.id;
    }
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Bu fotoğrafı silme izniniz yok' });
    }
    
    // Dosyayı diskten sil
    const filePath = path.join(__dirname, '../uploads', photo.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Fotoğrafı veritabanından sil
    const deleted = await Photo.delete(photoId);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Fotoğraf silinemedi' });
    }
    
    res.json({ message: 'Fotoğraf başarıyla silindi' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Fotoğrafı özel olarak bir rapor ile ilişkilendirme
exports.associateWithReport = async (req, res) => {
  try {
    const photoId = req.params.photoId;
    const reportId = req.params.reportId;
    const { roomId, roomName } = req.body;
    
    console.log(`[PHOTO] Associating photo ${photoId} with report ${reportId}, room ${roomId}, roomName: ${roomName}`);
    
    // Önce fotoğrafın var olduğunu kontrol et
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    // Hem room_id hem report_id güncellemesi yap
    const updated = await db.execute(
      'UPDATE photos SET report_id = ?, room_id = ?, note = COALESCE(note, ?) WHERE id = ?',
      [reportId, roomId, `Room: ${roomName || roomId}`, photoId]
    );
    
    // Ayrıca ilişkiyi ara tabloya da kaydet
    try {
      const checkAssociationTableExists = await db.execute(`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'photo_report_association'
      `);
      
      if (checkAssociationTableExists[0].length === 0) {
        // Association tablosu yoksa oluştur
        await db.execute(`
          CREATE TABLE IF NOT EXISTS photo_report_association (
            id INT AUTO_INCREMENT PRIMARY KEY,
            photo_id INT NOT NULL,
            report_id INT NOT NULL,
            room_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY (photo_id, report_id)
          )
        `);
        console.log(`[PHOTO] Created photo_report_association table`);
      }
      
      // İlişkiyi kaydet - try/catch ile daha güvenli hale getirildi
      try {
        await db.execute(`
          INSERT INTO photo_report_association (photo_id, report_id, room_id) 
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE room_id = ?
        `, [photoId, reportId, roomId, roomId]);
      } catch (err) {
        // Tablo yoksa veya başka bir sorun varsa hata ayıklama için log
        console.log(`[WARN] Association record failed: ${err.message}`);
      }
      
      console.log(`[PHOTO] Added association: photo ${photoId} with report ${reportId}, room ${roomId}`);
    } catch (assocError) {
      console.error('Association table error:', assocError);
      // Hata olsa bile devam et, ana güncelleme yapıldı
    }
    
    console.log(`[PHOTO] Update result: ${JSON.stringify(updated[0])}`);
    
    if (updated[0].affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to associate photo with report' });
    }
    
    res.json({ 
      message: 'Photo successfully associated with report',
      photoId,
      reportId,
      roomId,
      roomName
    });
  } catch (error) {
    console.error('Associate photo with report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};