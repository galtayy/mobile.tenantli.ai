// Test script to verify the lease document flow
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testLeaseDocumentFlow() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'depositshield_db'
    });
    
    console.log('Connected to database');
    
    // 1. Check if lease document columns exist
    console.log('\n1. Checking lease document columns...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'properties' 
      AND COLUMN_NAME IN ('lease_document_url', 'lease_document_name')
      AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'depositshield_db']);
    
    if (columns.length === 0) {
      console.log('❌ Lease document columns are missing! Need to apply schema.');
    } else {
      console.log('✅ Lease document columns exist:');
      columns.forEach(col => {
        console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE}(${col.CHARACTER_MAXIMUM_LENGTH || 'n/a'}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }
    
    // 2. Check a sample property
    console.log('\n2. Checking sample property...');
    const [properties] = await connection.query(`
      SELECT id, address, lease_document_url, lease_document_name, created_at, updated_at
      FROM properties
      ORDER BY id DESC
      LIMIT 1
    `);
    
    if (properties.length > 0) {
      const prop = properties[0];
      console.log(`Property ID ${prop.id}:`);
      console.log(`- Address: ${prop.address}`);
      console.log(`- Lease URL: ${prop.lease_document_url || 'NULL'}`);
      console.log(`- Lease Name: ${prop.lease_document_name || 'NULL'}`);
      console.log(`- Created: ${prop.created_at}`);
      console.log(`- Updated: ${prop.updated_at}`);
    } else {
      console.log('No properties found in database');
    }
    
    // 3. Check if there are any orphaned lease documents
    console.log('\n3. Checking for orphaned lease documents...');
    const [leaseProperties] = await connection.query(`
      SELECT COUNT(*) as count
      FROM properties
      WHERE lease_document_url IS NOT NULL
      OR lease_document_name IS NOT NULL
    `);
    
    console.log(`Properties with lease documents: ${leaseProperties[0].count}`);
    
    // 4. List uploaded files
    console.log('\n4. Checking uploads directory...');
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'uploads');
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const pdfFiles = files.filter(f => f.endsWith('.pdf'));
      console.log(`Found ${pdfFiles.length} PDF files in uploads directory`);
      if (pdfFiles.length > 0) {
        console.log('Recent PDFs:');
        pdfFiles.slice(-5).forEach(file => {
          console.log(`- ${file}`);
        });
      }
    } else {
      console.log('Uploads directory not found');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testLeaseDocumentFlow();