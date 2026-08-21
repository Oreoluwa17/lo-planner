/* ============================================================
   ADD TO YOUR WEDDING WEBSITE APPS SCRIPT (apps-script.js)
   ============================================================
   In your doGet() function, add this BEFORE the existing code:

   function doGet(e) {
     var params = e.parameter;
     var callback = params.callback || 'callback';

     // ADD THIS BLOCK AT THE TOP OF doGet:
     if (params.action === 'getGuests') {
       return getGuests();
     }

     // ... rest of your existing doGet code
   }

   Then add the getGuests function below.
   Redeploy as a new version after making changes.
   ============================================================ */

function getGuests() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data  = sheet.getDataRange().getValues();

  if (data.length < 2) {
    return ContentService.createTextOutput(JSON.stringify({ success:true, data:[] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Column order: timestamp, name, email, phone, attending, guests, message
  // (matches the order rows are appended in doPost/doGet RSVP handler)
  var guests = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[1]) continue; // skip empty rows
    guests.push({
      timestamp: row[0] ? new Date(row[0]).toISOString() : '',
      name:      row[1] || '',
      email:     row[2] || '',
      phone:     row[3] || '',
      attending: row[4] || '',
      guests:    row[5] || '',
      message:   row[6] || '',
    });
  }

  return ContentService.createTextOutput(JSON.stringify({ success:true, data:guests }))
    .setMimeType(ContentService.MimeType.JSON);
}
