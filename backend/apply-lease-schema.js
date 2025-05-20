// Script to apply lease document schema
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function applyLeaseSchema() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'depositshield_db',
      multipleStatements: true
    });
    
    console.log('Connected to database');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'config', 'alter_schema_lease_document.sql');
    const sqlContent = await fs.readFile(schemaPath, 'utf8');
    
    console.log('Applying lease document schema...');
    
    // Execute the SQL
    await connection.query(sqlContent);
    
    console.log('Lease document schema applied successfully');
    
    // Verify the columns exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'properties' 
      AND COLUMN_NAME IN ('lease_document_url', 'lease_document_name')
      AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'depositshield_db']);
    
    console.log('Columns verified:');
    columns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE}(${col.CHARACTER_MAXIMUM_LENGTH})`);
    });
    
  } catch (error) {
    console.error('Error applying schema:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
applyLeaseSchema();