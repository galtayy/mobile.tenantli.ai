// Manual test for lease document update
const axios = require('axios');
require('dotenv').config();

async function testLeaseUpdate() {
  try {
    // You need to replace these with actual values from your system
    const API_URL = process.env.NODE_ENV === 'production' 
      ? 'https://api.tenantli.ai' 
      : 'http://localhost:5050';
    
    // Get a valid token by logging into the app and checking localStorage
    const TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Replace this
    const PROPERTY_ID = 73; // Use the latest property ID
    
    console.log('Testing lease document update...');
    console.log(`API URL: ${API_URL}`);
    console.log(`Property ID: ${PROPERTY_ID}`);
    
    // Test the dedicated endpoint
    try {
      const response = await axios.put(
        `${API_URL}/api/properties/${PROPERTY_ID}/lease-document`,
        {
          lease_document_url: '/uploads/test-lease-123.pdf',
          lease_document_name: 'Test Lease Document.pdf'
        },
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Update successful:', response.data);
      
    } catch (error) {
      if (error.response) {
        console.error('❌ Error response:', error.response.status, error.response.data);
      } else {
        console.error('❌ Error:', error.message);
      }
    }
    
    // Now test the regular update endpoint with partial flag
    try {
      const response2 = await axios.put(
        `${API_URL}/api/properties/${PROPERTY_ID}`,
        {
          _partial_update: true,
          _partial_fields: ['lease_document_url', 'lease_document_name'],
          lease_document_url: '/uploads/test-lease-456.pdf',
          lease_document_name: 'Test Lease 2.pdf'
        },
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Partial update successful:', response2.data);
      
    } catch (error) {
      if (error.response) {
        console.error('❌ Partial update error:', error.response.status, error.response.data);
      } else {
        console.error('❌ Partial update error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Instructions
console.log(`
To test the lease update:

1. Open your browser and log into the app
2. Open Developer Tools (F12)
3. Go to Application > Local Storage
4. Find the 'token' value
5. Replace YOUR_AUTH_TOKEN_HERE in this file with that value
6. Run: node manual-test-lease.js
`);

// Uncomment to run the test
// testLeaseUpdate();