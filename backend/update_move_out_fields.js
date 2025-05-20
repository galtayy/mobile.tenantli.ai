const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDatabase() {
  let connection;
  
  try {
    // Create MySQL connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'retako',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to database');

    // Check if columns already exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'property_rooms' 
      AND COLUMN_NAME IN ('move_out_notes', 'move_out_photo_count', 'move_out_completed', 'move_out_date')
    `, [process.env.DB_NAME || 'retako']);

    if (columns.length === 4) {
      console.log('Move-out columns already exist in property_rooms table');
      return;
    }

    console.log('Adding move-out columns to property_rooms table...');

    // Add move-out specific columns if they don't exist
    const alterQueries = [];
    
    if (!columns.some(col => col.COLUMN_NAME === 'move_out_notes')) {
      alterQueries.push('ADD COLUMN move_out_notes TEXT NULL');
    }
    
    if (!columns.some(col => col.COLUMN_NAME === 'move_out_photo_count')) {
      alterQueries.push('ADD COLUMN move_out_photo_count INT DEFAULT 0');
    }
    
    if (!columns.some(col => col.COLUMN_NAME === 'move_out_completed')) {
      alterQueries.push('ADD COLUMN move_out_completed BOOLEAN DEFAULT FALSE');
    }
    
    if (!columns.some(col => col.COLUMN_NAME === 'move_out_date')) {
      alterQueries.push('ADD COLUMN move_out_date DATETIME NULL');
    }

    if (alterQueries.length > 0) {
      const alterQuery = `ALTER TABLE property_rooms ${alterQueries.join(', ')}`;
      await connection.execute(alterQuery);
      console.log('Move-out columns added successfully');
    }

    // Show current table structure
    const [tableInfo] = await connection.execute('DESCRIBE property_rooms');
    console.log('\nCurrent property_rooms table structure:');
    tableInfo.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
    });

  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

updateDatabase();