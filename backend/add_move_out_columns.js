const db = require('./config/database');

async function addMoveOutColumns() {
  try {
    console.log('Starting to add move-out columns to property_rooms table...');
    
    // Check which columns already exist
    const [existingColumns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'property_rooms' 
      AND COLUMN_NAME IN ('move_out_notes', 'move_out_photo_count', 'move_out_completed', 'move_out_date')
    `);
    
    const existingColumnNames = existingColumns.map(col => col.COLUMN_NAME);
    
    // Add move_out_notes column if it doesn't exist
    if (!existingColumnNames.includes('move_out_notes')) {
      await db.execute(`
        ALTER TABLE property_rooms 
        ADD COLUMN move_out_notes TEXT NULL AFTER is_completed
      `);
      console.log('Added move_out_notes column');
    }
    
    // Add move_out_photo_count column if it doesn't exist
    if (!existingColumnNames.includes('move_out_photo_count')) {
      await db.execute(`
        ALTER TABLE property_rooms 
        ADD COLUMN move_out_photo_count INT DEFAULT 0 AFTER move_out_notes
      `);
      console.log('Added move_out_photo_count column');
    }
    
    // Add move_out_completed column if it doesn't exist
    if (!existingColumnNames.includes('move_out_completed')) {
      await db.execute(`
        ALTER TABLE property_rooms 
        ADD COLUMN move_out_completed BOOLEAN DEFAULT FALSE AFTER move_out_photo_count
      `);
      console.log('Added move_out_completed column');
    }
    
    // Add move_out_date column if it doesn't exist
    if (!existingColumnNames.includes('move_out_date')) {
      await db.execute(`
        ALTER TABLE property_rooms 
        ADD COLUMN move_out_date DATETIME NULL AFTER move_out_completed
      `);
      console.log('Added move_out_date column');
    }
    
    console.log('Successfully added move-out columns to property_rooms table');
    
    // Update existing rooms to set move_out_completed based on existing data if needed
    await db.execute(`
      UPDATE property_rooms 
      SET move_out_completed = CASE 
        WHEN move_out_photo_count > 0 OR (move_out_notes IS NOT NULL AND move_out_notes != '[]' AND move_out_notes != '')
        THEN TRUE 
        ELSE FALSE 
      END
    `);
    
    console.log('Updated move_out_completed values for existing rooms based on current data');
    
  } catch (error) {
    console.error('Error adding move-out columns:', error);
  } finally {
    process.exit();
  }
}

addMoveOutColumns();