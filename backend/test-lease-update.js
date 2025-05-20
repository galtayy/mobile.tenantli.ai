// Test script to check if the lease document update works
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5050'; // Change to production URL if needed
const TOKEN = 'YOUR_AUTH_TOKEN'; // Replace with a valid token
const PROPERTY_ID = 136; // Replace with an actual property ID

async function testLeaseDocumentUpdate() {
  try {
    console.log('Testing lease document update...');
    
    // Test data
    const updateData = {
      lease_document_url: '/uploads/test-lease.pdf',
      lease_document_name: 'Test Lease Document.pdf'
    };
    
    const response = await axios.put(
      `${API_URL}/api/properties/${PROPERTY_ID}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Update successful:', response.data);
    
    // Now get the property to verify the update
    const getResponse = await axios.get(
      `${API_URL}/api/properties/${PROPERTY_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    console.log('Property after update:');
    console.log('lease_document_url:', getResponse.data.lease_document_url);
    console.log('lease_document_name:', getResponse.data.lease_document_name);
    
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testLeaseDocumentUpdate();