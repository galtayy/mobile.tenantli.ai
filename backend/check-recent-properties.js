// Check recent properties in detail
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkRecentProperties() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'depositshield_db'
    });
    
    console.log('Checking recent properties...\n');
    
    // Get the 5 most recent properties
    const [properties] = await connection.query(`
      SELECT 
        id, 
        user_id,
        address, 
        unit_number,
        lease_document_url, 
        lease_document_name,
        contract_start_date,
        created_at,
        updated_at
      FROM properties
      ORDER BY id DESC
      LIMIT 5
    `);
    
    properties.forEach(prop => {
      console.log(`Property ID: ${prop.id}`);
      console.log(`  Address: ${prop.address}`);
      console.log(`  Unit: ${prop.unit_number || 'N/A'}`);
      console.log(`  Lease URL: ${prop.lease_document_url || 'NULL'}`);
      console.log(`  Lease Name: ${prop.lease_document_name || 'NULL'}`);
      console.log(`  Contract Start: ${prop.contract_start_date || 'NULL'}`);
      console.log(`  Created: ${prop.created_at}`);
      console.log(`  Updated: ${prop.updated_at}`);
      console.log('---');
    });
    
    // Check if any properties have been updated after creation
    const [updatedProperties] = await connection.query(`
      SELECT COUNT(*) as count
      FROM properties
      WHERE updated_at > created_at
    `);
    
    console.log(`\nProperties updated after creation: ${updatedProperties[0].count}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkRecentProperties();