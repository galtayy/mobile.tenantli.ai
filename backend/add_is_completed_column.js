const db = require('./config/database');

async function addIsCompletedColumn() {
  try {
    console.log('Starting to add is_completed column to property_rooms table...');
    
    // First check if the column already exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'property_rooms' 
      AND COLUMN_NAME = 'is_completed'
    `);
    
    if (columns.length > 0) {
      console.log('is_completed column already exists in property_rooms table.');
      return;
    }
    
    // Add the is_completed column
    await db.execute(`
      ALTER TABLE property_rooms 
      ADD COLUMN is_completed BOOLEAN DEFAULT FALSE
      AFTER photo_count
    `);
    
    console.log('Successfully added is_completed column to property_rooms table.');
    
    // Update existing rooms to set is_completed based on existing data
    await db.execute(`
      UPDATE property_rooms 
      SET is_completed = CASE 
        WHEN photo_count > 0 AND (room_quality = 'good' OR (room_quality = 'attention' AND room_issue_notes IS NOT NULL AND room_issue_notes != '[]'))
        THEN TRUE 
        ELSE FALSE 
      END
    `);
    
    console.log('Updated is_completed values for existing rooms based on current data.');
    
  } catch (error) {
    console.error('Error adding is_completed column:', error);
  } finally {
    process.exit();
  }
}

addIsCompletedColumn();