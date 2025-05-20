const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Your API URL
const API_URL = 'http://localhost:5050';

// Your test user credentials
const credentials = {
  email: 'your-email@example.com', // Replace with a real user email
  password: 'your-password' // Replace with the real password
};

// Path to a test image
const testImagePath = path.join(__dirname, 'assets/images/logo.png');

async function testPhotoCompression() {
  try {
    // Login to get a token
    console.log('🔑 Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, credentials);
    const token = loginResponse.data.token;
    
    if (!token) {
      console.error('❌ Login failed. Please check your credentials.');
      return;
    }
    
    console.log('✅ Login successful. Token received.');
    
    // Set auth headers for subsequent requests
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    // First, get a property to upload to
    console.log('🏠 Fetching properties...');
    const propertiesResponse = await axios.get(`${API_URL}/api/properties`, config);
    
    if (!propertiesResponse.data || propertiesResponse.data.length === 0) {
      console.error('❌ No properties found. Please create a property first.');
      return;
    }
    
    const propertyId = propertiesResponse.data[0].id;
    console.log(`✅ Using property ID: ${propertyId}`);
    
    // Check if a room exists or create one
    console.log('🚪 Checking for rooms...');
    const roomsResponse = await axios.get(`${API_URL}/api/properties/${propertyId}/rooms`, config);
    
    let roomId;
    
    if (roomsResponse.data && roomsResponse.data.length > 0) {
      roomId = roomsResponse.data[0].id;
      console.log(`✅ Using existing room ID: ${roomId}`);
    } else {
      console.log('⚠️ No rooms found. Creating a test room...');
      
      // Create a test room
      const roomData = {
        rooms: [
          {
            id: 'test-room-' + Date.now(),
            name: 'Test Room',
            type: 'bedroom'
          }
        ]
      };
      
      const createRoomResponse = await axios.post(
        `${API_URL}/api/properties/${propertyId}/rooms`,
        roomData,
        config
      );
      
      if (createRoomResponse.data && createRoomResponse.data.success) {
        roomId = roomData.rooms[0].id;
        console.log(`✅ Created new test room ID: ${roomId}`);
      } else {
        console.error('❌ Failed to create a test room.');
        return;
      }
    }
    
    // Upload a photo to the room
    console.log('📷 Uploading photo to room...');
    
    // Check if test image exists
    if (!fs.existsSync(testImagePath)) {
      console.error(`❌ Test image not found at ${testImagePath}`);
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('photo', fs.createReadStream(testImagePath));
    formData.append('note', 'Test photo with compression');
    
    // Set headers with token and form data
    const uploadConfig = {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    };
    
    // Upload the photo
    const uploadResponse = await axios.post(
      `${API_URL}/api/photos/upload-room/${propertyId}/${roomId}`,
      formData,
      uploadConfig
    );
    
    if (uploadResponse.data && uploadResponse.data.photo) {
      console.log('✅ Photo uploaded successfully!');
      console.log('📝 Photo details:');
      console.log(`- ID: ${uploadResponse.data.photo.id}`);
      console.log(`- Path: ${uploadResponse.data.photo.file_path}`);
      console.log(`- URL: ${uploadResponse.data.photo.url}`);
      
      // Get the full path to the uploaded file
      const uploadedFilePath = path.join(__dirname, 'uploads', uploadResponse.data.photo.file_path);
      
      // Check if the file exists and get its size
      if (fs.existsSync(uploadedFilePath)) {
        const originalSize = fs.statSync(testImagePath).size;
        const compressedSize = fs.statSync(uploadedFilePath).size;
        
        console.log('\n📊 Compression Results:');
        console.log(`- Original size: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`- Compressed size: ${(compressedSize / 1024).toFixed(2)} KB`);
        console.log(`- Reduction: ${((1 - compressedSize / originalSize) * 100).toFixed(2)}%`);
      } else {
        console.warn(`⚠️ Uploaded file not found at ${uploadedFilePath}`);
      }
    } else {
      console.error('❌ Photo upload failed.');
    }
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testPhotoCompression();