const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const authMiddleware = require('../middleware/auth.middleware');

// Configure multer for file uploads - use memory storage for compression
const storage = multer.memoryStorage();

// File filter to only accept certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, PNG, DOC, DOCX files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Upload file endpoint with compression
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadDir = path.join(__dirname, '..', 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalExtension = path.extname(req.file.originalname).toLowerCase();
    let fileName;
    let filePath;

    // Check if file is an image that should be compressed
    const isImage = /\.(jpg|jpeg|png)$/i.test(req.file.originalname);
    
    if (isImage) {
      // Compress image using sharp
      fileName = `file-${uniqueSuffix}.jpg`; // Always save as JPEG for compression
      filePath = path.join(uploadDir, fileName);
      
      console.log(`Compressing image: ${req.file.originalname}`);
      
      await sharp(req.file.buffer)
        .resize(1200, null, { // Max width 1200px, maintain aspect ratio
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 60, // 60% quality for better compression
          progressive: true // Progressive JPEG for better loading
        })
        .toFile(filePath);
        
      console.log(`Image compressed and saved as: ${fileName}`);
    } else {
      // For non-image files (PDF, DOC, etc.), save as-is
      fileName = `file-${uniqueSuffix}${originalExtension}`;
      filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, req.file.buffer);
      console.log(`Non-image file saved as: ${fileName}`);
    }

    // Get the actual file size after compression
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    // Construct file URL
    const fileUrl = `/uploads/${fileName}`;
    
    res.json({
      message: 'File uploaded successfully',
      fileName: fileName,
      originalName: req.file.originalname,
      fileUrl: fileUrl,
      size: fileSize,
      originalSize: req.file.size,
      compressionRatio: isImage ? ((1 - fileSize / req.file.size) * 100).toFixed(2) + '%' : 'N/A',
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Get file endpoint - this route might not be used since static files are served from /uploads
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '..', 'uploads', filename);
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ message: 'File not found' });
  }
  
  // Set appropriate headers for different file types
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') {
    res.setHeader('Content-Type', 'application/pdf');
  } else if (['.jpg', '.jpeg'].includes(ext)) {
    res.setHeader('Content-Type', 'image/jpeg');
  } else if (ext === '.png') {
    res.setHeader('Content-Type', 'image/png');
  }
  
  res.sendFile(filepath);
});

module.exports = router;