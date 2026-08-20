/* ============================================================
   REGISTRY RESERVATION — ADD TO YOUR EXISTING APPS SCRIPT
   ============================================================
   1. Open your Google Apps Script project
   2. Add these functions to the BOTTOM of your existing code
   3. Update the doGet() routing to include 'reserveGift'
   4. Update CONFIG below
   5. Redeploy as new version
   ============================================================ */

// ── CONFIG ────────────────────────────────────────────────
var REGISTRY_CONFIG = {
  COUPLE_NAMES:   'Londiwe & Oreoluwa',
  WEDDING_DATE:   'Saturday, 23rd January 2027',
  NOTIFY_EMAILS:  ['oreoluwaadebayoifeoluwa@gmail.com', 'malondymalondy@gmail.com'],
  WEBSITE_URL:    'https://kateandore.vercel.app',
  COLOR_MAROON:   '#62191C',
  COLOR_RUST:     '#873632',
  COLOR_BLUSH:    '#CAAE9F',
  COLOR_BEIGE:    '#E0CFC2',
  COLOR_CREAM:    '#FBF6F2',
};

// ── ADD TO YOUR doGet() routing ───────────────────────────
// Inside your doGet() function, add this line before the final else:
//
//   else if (action === 'reserveGift') return reserveGift(e);
//
// ─────────────────────────────────────────────────────────

function reserveGift(e) {
  var params    = e.parameter;
  var callback  = params.callback || 'callback';
  var itemId    = params.itemId;
  var itemName  = params.itemName || 'a gift';
  var guestName = params.guestName || '';
  var guestEmail= params.guestEmail || '';

  if (!itemId || !guestName || !guestEmail) {
    return jsonpOut(callback, { success: false, error: 'Missing required fields.' });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1 — Update the Registry sheet
  var sheet = ss.getSheetByName('Registry');
  if (!sheet) return jsonpOut(callback, { success: false, error: 'Registry sheet not found.' });

  var data    = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx   = headers.indexOf('id');
  var statusIdx = headers.indexOf('status');

  var found = false;
  for (var i = 1; i < data.length; i++) {
    if (data[i][idIdx] === itemId) {
      // Check it's still available
      if (data[i][statusIdx] === 'Purchased' || data[i][statusIdx] === 'Reserved') {
        return jsonpOut(callback, { success: false, error: 'Sorry, this gift has already been reserved by someone else.' });
      }
      sheet.getRange(i + 1, statusIdx + 1).setValue('Reserved');

      // Also log who reserved it if columns exist
      var reservedByIdx = headers.indexOf('reservedBy');
      var reservedEmailIdx = headers.indexOf('reservedEmail');
      var reservedAtIdx = headers.indexOf('reservedAt');
      if (reservedByIdx > -1)    sheet.getRange(i + 1, reservedByIdx + 1).setValue(guestName);
      if (reservedEmailIdx > -1) sheet.getRange(i + 1, reservedEmailIdx + 1).setValue(guestEmail);
      if (reservedAtIdx > -1)    sheet.getRange(i + 1, reservedAtIdx + 1).setValue(new Date().toISOString());
      found = true;
      break;
    }
  }

  if (!found) return jsonpOut(callback, { success: false, error: 'Gift not found.' });

  // 2 — Log to activity
  var actSheet = ss.getSheetByName('Activity');
  if (actSheet) {
    actSheet.appendRow([new Date().toISOString(), guestName, 'reserveGift', 'Reserved gift: ' + itemName + ' (by ' + guestName + ')']);
  }

  // 3 — Email the couple
  sendCoupleNotification(itemName, guestName, guestEmail);

  // 4 — Email the guest
  sendGuestConfirmation(guestName, guestEmail, itemName);

  return jsonpOut(callback, { success: true });
}

// ── EMAIL TO COUPLE ───────────────────────────────────────
function sendCoupleNotification(itemName, guestName, guestEmail) {
  var subject = '🎁 ' + guestName + ' has reserved a gift!';
  var html = emailWrapper(
    '<p style="font-size:15px;line-height:1.8;margin:0 0 12px;">Someone has reserved a gift from your registry!</p>'
    + '<div style="border:1px solid ' + REGISTRY_CONFIG.COLOR_BLUSH + ';padding:16px 20px;margin:16px 0;background:' + REGISTRY_CONFIG.COLOR_CREAM + ';">'
    + '  <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:' + REGISTRY_CONFIG.COLOR_RUST + ';margin-bottom:4px;">Gift Reserved</div>'
    + '  <div style="font-size:18px;color:' + REGISTRY_CONFIG.COLOR_MAROON + ';font-weight:500;">' + itemName + '</div>'
    + '</div>'
    + '<p style="font-size:15px;line-height:1.8;margin:0 0 8px;"><strong>Guest:</strong> ' + guestName + '</p>'
    + '<p style="font-size:15px;line-height:1.8;margin:0 0 16px;"><strong>Email:</strong> ' + guestEmail + '</p>'
    + '<p style="font-size:13px;color:rgba(98,25,28,0.6);line-height:1.7;">You can view and manage all registry items in your <a href="https://lo-planner.vercel.app/registry" style="color:' + REGISTRY_CONFIG.COLOR_RUST + ';">wedding planner</a>.</p>'
  );

  REGISTRY_CONFIG.NOTIFY_EMAILS.forEach(function(email) {
    MailApp.sendEmail({ to: email, subject: subject, htmlBody: html });
  });
}

// ── EMAIL TO GUEST ────────────────────────────────────────
function sendGuestConfirmation(guestName, guestEmail, itemName) {
  var subject = 'Thank you for reserving a gift — ' + REGISTRY_CONFIG.COUPLE_NAMES;
  var html = emailWrapper(
    '<p style="font-size:16px;line-height:1.7;margin:0 0 16px;">Dear ' + guestName + ',</p>'
    + '<p style="font-size:15px;line-height:1.8;margin:0 0 16px;">Thank you so much — we\'re incredibly touched that you\'ve chosen to give us a gift.</p>'
    + '<div style="border:1px solid ' + REGISTRY_CONFIG.COLOR_BLUSH + ';padding:16px 20px;margin:20px 0;text-align:center;">'
    + '  <p style="margin:0 0 4px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:' + REGISTRY_CONFIG.COLOR_RUST + ';">You\'ve reserved</p>'
    + '  <p style="margin:0;font-size:18px;color:' + REGISTRY_CONFIG.COLOR_MAROON + ';font-weight:500;">' + itemName + '</p>'
    + '</div>'
    + '<p style="font-size:15px;line-height:1.8;margin:0 0 16px;">We\'ve marked this item as reserved on our registry so nobody else picks the same thing. If for any reason your plans change, please let us know and we\'ll make it available again.</p>'
    + '<p style="font-size:15px;line-height:1.8;margin:0 0 16px;">We can\'t wait to celebrate with you on <strong>' + REGISTRY_CONFIG.WEDDING_DATE + '</strong>.</p>'
    + '<p style="font-size:16px;font-style:italic;margin:24px 0 0;color:' + REGISTRY_CONFIG.COLOR_RUST + ';">With love,<br>' + REGISTRY_CONFIG.COUPLE_NAMES + '</p>'
  );

  MailApp.sendEmail({ to: guestEmail, subject: subject, htmlBody: html });
}

// ── SHARED EMAIL WRAPPER ──────────────────────────────────
function emailWrapper(inner) {
  return '<div style="background:' + REGISTRY_CONFIG.COLOR_CREAM + ';padding:32px 16px;font-family:Georgia,serif;">'
    + '<div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid ' + REGISTRY_CONFIG.COLOR_BLUSH + ';">'
    + '<div style="background:' + REGISTRY_CONFIG.COLOR_MAROON + ';padding:28px 24px;text-align:center;">'
    + '  <p style="margin:0;color:' + REGISTRY_CONFIG.COLOR_BEIGE + ';font-size:11px;letter-spacing:4px;text-transform:uppercase;">Gift Registry</p>'
    + '  <h1 style="margin:8px 0 0;color:#fff;font-weight:normal;font-size:28px;letter-spacing:2px;">' + REGISTRY_CONFIG.COUPLE_NAMES + '</h1>'
    + '  <p style="margin:6px 0 0;color:' + REGISTRY_CONFIG.COLOR_BEIGE + ';font-size:11px;letter-spacing:2px;">' + REGISTRY_CONFIG.WEDDING_DATE + '</p>'
    + '</div>'
    + '<div style="padding:32px 28px;color:' + REGISTRY_CONFIG.COLOR_MAROON + ';">' + inner + '</div>'
    + '<div style="background:' + REGISTRY_CONFIG.COLOR_BEIGE + ';padding:16px 24px;text-align:center;">'
    + '  <a href="' + REGISTRY_CONFIG.WEBSITE_URL + '/registry.html" style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:' + REGISTRY_CONFIG.COLOR_RUST + ';text-decoration:none;">View full registry</a>'
    + '</div>'
    + '</div></div>';
}

// ── JSONP output helper ───────────────────────────────────
function jsonpOut(callback, obj) {
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(obj) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
