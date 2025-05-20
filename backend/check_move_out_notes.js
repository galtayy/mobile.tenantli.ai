// Check move-out notes in database
const db = require('./config/database');

async function checkMoveOutNotes() {
  try {
    // Check if move_out_notes column exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'property_rooms' 
      AND COLUMN_NAME = 'move_out_notes'
    `);
    
    console.log('Column info for move_out_notes:', columns);
    
    // Get all rooms with move-out notes
    const [rooms] = await db.execute(`
      SELECT property_id, room_id, room_name, move_out_notes, move_out_completed, move_out_date 
      FROM property_rooms 
      WHERE move_out_notes IS NOT NULL
    `);
    
    console.log(`Found ${rooms.length} rooms with move-out notes`);
    
    rooms.forEach(room => {
      console.log('\n---');
      console.log(`Property: ${room.property_id}, Room: ${room.room_id} (${room.room_name})`);
      console.log(`Move-out completed: ${room.move_out_completed}`);
      console.log(`Move-out date: ${room.move_out_date}`);
      console.log(`Raw notes: ${room.move_out_notes}`);
      
      try {
        const parsed = JSON.parse(room.move_out_notes);
        console.log(`Parsed notes (${parsed.length} items):`, parsed);
      } catch (e) {
        console.log('Failed to parse as JSON:', e.message);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

checkMoveOutNotes();