// Test saving notes with proper date format
const db = require('./config/database');

async function testNotesSave() {
  try {
    const propertyId = 81;
    const roomId = 'room_1747499500006_325';
    const notes = ['Test note 1', 'Test note 2'];
    const moveOutDate = new Date().toISOString();
    
    console.log('Testing with:');
    console.log('Notes:', notes);
    console.log('Original date:', moveOutDate);
    console.log('Formatted date:', moveOutDate.slice(0, 19).replace('T', ' '));
    
    // Test the update
    const [result] = await db.execute(`
      UPDATE property_rooms 
      SET move_out_notes = ?, 
          move_out_date = ?,
          move_out_completed = ?
      WHERE property_id = ? AND room_id = ?
    `, [
      JSON.stringify(notes),
      moveOutDate.slice(0, 19).replace('T', ' '),
      true,
      propertyId,
      roomId
    ]);
    
    console.log('Update result:', result);
    
    // Read back the data
    const [rows] = await db.execute(`
      SELECT move_out_notes, move_out_date, move_out_completed
      FROM property_rooms
      WHERE property_id = ? AND room_id = ?
    `, [propertyId, roomId]);
    
    console.log('Data after update:');
    console.log('Raw notes:', rows[0].move_out_notes);
    console.log('Parsed notes:', JSON.parse(rows[0].move_out_notes));
    console.log('Date:', rows[0].move_out_date);
    console.log('Completed:', rows[0].move_out_completed);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testNotesSave();