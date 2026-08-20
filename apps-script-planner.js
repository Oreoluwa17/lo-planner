/* ============================================================
   WEDDING PLANNER — GOOGLE APPS SCRIPT BACKEND
   ============================================================
   After updating this file:
   Deploy > Manage deployments > Edit (pencil) > New version > Deploy
   ============================================================ */

var SHEET_NAMES = {
  VENDORS:  'Vendors',
  TASKS:    'Tasks',
  BUDGET:   'Budget',
  ACTIVITY: 'Activity',
  REGISTRY: 'Registry',
};

var VENDOR_HEADERS   = ['id','name','cat','day','contact','phone','quote','currency','deposit','status','notes','createdBy','createdAt','updatedBy','updatedAt'];
var TASK_HEADERS     = ['id','text','cat','day','done','doneBy','doneAt','createdBy','createdAt'];
var BUDGET_HEADERS   = ['id','description','cat','day','amount','type','createdBy','createdAt'];
var ACTIVITY_HEADERS = ['timestamp','user','action','description'];
var REGISTRY_HEADERS = ['id','name','store','url','price','currency','category','imageUrl','status','notes','createdBy','createdAt'];

// ── ROUTING ────────────────────────────────────────────────
function doGet(e) {
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    var data;
    if      (action === 'vendors')  data = getRows(ss, SHEET_NAMES.VENDORS);
    else if (action === 'tasks')    data = getRows(ss, SHEET_NAMES.TASKS);
    else if (action === 'budget')   data = getRows(ss, SHEET_NAMES.BUDGET);
    else if (action === 'activity') data = getRows(ss, SHEET_NAMES.ACTIVITY).reverse().slice(0, 100);
    else if (action === 'registry') data = getRows(ss, SHEET_NAMES.REGISTRY);
    else data = { error: 'Unknown action: ' + action };
    return json({ success: true, data: data });
  } catch(err) {
    return json({ success: false, error: err.message });
  }
}

function doPost(e) {
  var body   = JSON.parse(e.postData.contents);
  var action = body.action;
  var data   = body.data || {};
  var user   = body.user || 'Unknown';
  var ss     = SpreadsheetApp.getActiveSpreadsheet();

  try {
    var result;
    if      (action === 'addVendor')      result = addVendor(ss, data, user);
    else if (action === 'updateVendor')   result = updateVendor(ss, data, user);
    else if (action === 'deleteVendor')   result = deleteRow(ss, SHEET_NAMES.VENDORS, data.id);
    else if (action === 'addTask')        result = addTask(ss, data, user);
    else if (action === 'toggleTask')     result = toggleTask(ss, data, user);
    else if (action === 'deleteTask')     result = deleteRow(ss, SHEET_NAMES.TASKS, data.id);
    else if (action === 'addBudget')      result = addBudget(ss, data, user);
    else if (action === 'deleteBudget')   result = deleteRow(ss, SHEET_NAMES.BUDGET, data.id);
    else if (action === 'addRegistry')    result = addRegistry(ss, data, user);
    else if (action === 'updateRegistry') result = updateRegistry(ss, data, user);
    else if (action === 'deleteRegistry') result = deleteRow(ss, SHEET_NAMES.REGISTRY, data.id);
    else result = { error: 'Unknown action: ' + action };

    logActivity(ss, user, action, data);
    return json({ success: true, result: result });
  } catch(err) {
    return json({ success: false, error: err.message });
  }
}

// ── VENDORS ───────────────────────────────────────────────
function addVendor(ss, data, user) {
  var ts = now();
  var row = {
    id: genId(), name: data.name || '', cat: data.cat || '',
    day: data.day || '', contact: data.contact || '', phone: data.phone || '',
    quote: data.quote || '', currency: data.currency || 'ZAR',
    deposit: data.deposit || '', status: data.status || 'Not Contacted',
    notes: data.notes || '', createdBy: user, createdAt: ts, updatedBy: user, updatedAt: ts,
  };
  appendRow(ss, SHEET_NAMES.VENDORS, VENDOR_HEADERS, row);
  return row;
}

function updateVendor(ss, data, user) {
  data.updatedBy = user;
  data.updatedAt = now();
  updateRowById(ss, SHEET_NAMES.VENDORS, VENDOR_HEADERS, data);
  return data;
}

// ── TASKS ─────────────────────────────────────────────────
function addTask(ss, data, user) {
  var row = {
    id: genId(), text: data.text || '', cat: data.cat || '',
    day: data.day || '', done: 'false', doneBy: '', doneAt: '',
    createdBy: user, createdAt: now(),
  };
  appendRow(ss, SHEET_NAMES.TASKS, TASK_HEADERS, row);
  return row;
}

function toggleTask(ss, data, user) {
  var sheet = ss.getSheetByName(SHEET_NAMES.TASKS);
  if (!sheet) return;
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idIdx     = headers.indexOf('id');
  var doneIdx   = headers.indexOf('done');
  var doneByIdx = headers.indexOf('doneBy');
  var doneAtIdx = headers.indexOf('doneAt');
  for (var i = 1; i < values.length; i++) {
    if (values[i][idIdx] === data.id) {
      var isDone = data.done === true || data.done === 'true';
      sheet.getRange(i+1, doneIdx+1).setValue(isDone ? 'true' : 'false');
      if (doneByIdx > -1) sheet.getRange(i+1, doneByIdx+1).setValue(isDone ? user : '');
      if (doneAtIdx > -1) sheet.getRange(i+1, doneAtIdx+1).setValue(isDone ? now() : '');
      break;
    }
  }
}

// ── BUDGET ────────────────────────────────────────────────
function addBudget(ss, data, user) {
  var row = {
    id: genId(), description: data.description || '', cat: data.cat || '',
    day: data.day || '', amount: data.amount || 0, type: data.type || 'expense',
    createdBy: user, createdAt: now(),
  };
  appendRow(ss, SHEET_NAMES.BUDGET, BUDGET_HEADERS, row);
  return row;
}

// ── REGISTRY ──────────────────────────────────────────────
function addRegistry(ss, data, user) {
  var row = {
    id: genId(), name: data.name || '', store: data.store || '',
    url: data.url || '', price: data.price || '', currency: data.currency || 'ZAR',
    category: data.category || '', imageUrl: data.imageUrl || '',
    status: data.status || 'Available', notes: data.notes || '',
    createdBy: user, createdAt: now(),
  };
  appendRow(ss, SHEET_NAMES.REGISTRY, REGISTRY_HEADERS, row);
  return row;
}

function updateRegistry(ss, data, user) {
  updateRowById(ss, SHEET_NAMES.REGISTRY, REGISTRY_HEADERS, data);
  return data;
}

// ── GENERIC HELPERS ───────────────────────────────────────
function getRows(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function appendRow(ss, sheetName, headers, data) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  var row = headers.map(function(h) { return data[h] !== undefined ? data[h] : ''; });
  sheet.appendRow(row);
}

function updateRowById(ss, sheetName, headers, data) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  var values = sheet.getDataRange().getValues();
  var heads  = values[0];
  var idIdx  = heads.indexOf('id');
  for (var i = 1; i < values.length; i++) {
    if (values[i][idIdx] === data.id) {
      heads.forEach(function(h, j) {
        if (data[h] !== undefined) sheet.getRange(i+1, j+1).setValue(data[h]);
      });
      break;
    }
  }
}

function deleteRow(ss, sheetName, id) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  var values = sheet.getDataRange().getValues();
  var idIdx  = values[0].indexOf('id');
  for (var i = values.length - 1; i >= 1; i--) {
    if (values[i][idIdx] === id) { sheet.deleteRow(i + 1); break; }
  }
}

function logActivity(ss, user, action, data) {
  var sheet = ss.getSheetByName(SHEET_NAMES.ACTIVITY);
  if (!sheet) return;
  var name = data.name || data.text || data.description || '';
  var desc = actionDescription(action, name);
  sheet.appendRow([now(), user, action, desc]);
}

function actionDescription(action, name) {
  var map = {
    addVendor:      'Added vendor: '        + name,
    updateVendor:   'Updated vendor: '      + name,
    deleteVendor:   'Deleted vendor: '      + name,
    addTask:        'Added task: '          + name,
    toggleTask:     'Toggled task: '        + name,
    deleteTask:     'Deleted task: '        + name,
    addBudget:      'Added budget item: '   + name,
    deleteBudget:   'Deleted budget item: ' + name,
    addRegistry:    'Added gift to registry: '    + name,
    updateRegistry: 'Updated registry item: '     + name,
    deleteRegistry: 'Removed from registry: '     + name,
  };
  return map[action] || action + (name ? ': ' + name : '');
}

function genId()  { return Utilities.getUuid().replace(/-/g,'').substr(0,12); }
function now()    { return new Date().toISOString(); }
function json(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

// ── INIT — run this ONCE ─────────────────────────────────
function initSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  function createSheet(name, headers) {
    var s = ss.getSheetByName(name);
    if (!s) s = ss.insertSheet(name);
    s.clearContents();
    s.appendRow(headers);
    s.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#62191C').setFontColor('#FFFFFF');
    return s;
  }

  createSheet(SHEET_NAMES.VENDORS,  VENDOR_HEADERS);
  createSheet(SHEET_NAMES.BUDGET,   BUDGET_HEADERS);
  createSheet(SHEET_NAMES.ACTIVITY, ACTIVITY_HEADERS);
  createSheet(SHEET_NAMES.REGISTRY, REGISTRY_HEADERS);

  var taskSheet = createSheet(SHEET_NAMES.TASKS, TASK_HEADERS);

  var ts = now();
  var defaultTasks = [
    [genId(),'Book tent / marquee hire','Venue & Setup','traditional','false','','','system',ts],
    [genId(),'Arrange chairs and tables hire','Venue & Setup','traditional','false','','','system',ts],
    [genId(),'Book generator hire','Venue & Setup','traditional','false','','','system',ts],
    [genId(),'Book caterer for traditional food','Food & Drinks','traditional','false','','','system',ts],
    [genId(),'Arrange drinks (soft drinks, water, alcohol)','Food & Drinks','traditional','false','','','system',ts],
    [genId(),'Source traditional décor fabrics','Décor','traditional','false','','','system',ts],
    [genId(),'Order flowers for traditional day','Décor','traditional','false','','','system',ts],
    [genId(),"Londiwe's traditional outfit(s)",'Attire','traditional','false','','','system',ts],
    [genId(),"Oreoluwa's traditional outfit(s)",'Attire','traditional','false','','','system',ts],
    [genId(),'Order family aso-ebi / matching fabrics','Attire','traditional','false','','','system',ts],
    [genId(),'Book traditional musicians / DJ','Entertainment','traditional','false','','','system',ts],
    [genId(),'Book MC for traditional day','Entertainment','traditional','false','','','system',ts],
    [genId(),'Print invitations for traditional day','Stationery','traditional','false','','','system',ts],
    [genId(),'Confirm church booking and fee','Venue','church','false','','','system',ts],
    [genId(),'Book reception venue','Venue','church','false','','','system',ts],
    [genId(),'Arrange bridal suite / changing room','Venue','church','false','','','system',ts],
    [genId(),'Book caterer for reception','Catering','church','false','','','system',ts],
    [genId(),'Order wedding cake','Catering','church','false','','','system',ts],
    [genId(),'Arrange drinks package / bar','Catering','church','false','','','system',ts],
    [genId(),'Book floral arrangements (ceremony + reception)','Flowers','church','false','','','system',ts],
    [genId(),'Order bridal bouquet','Flowers','church','false','','','system',ts],
    [genId(),'Order bridesmaids bouquets','Flowers','church','false','','','system',ts],
    [genId(),'Order buttonholes / boutonnieres','Flowers','church','false','','','system',ts],
    [genId(),'Order table centrepieces','Décor','church','false','','','system',ts],
    [genId(),'Book backdrop / floral arch','Décor','church','false','','','system',ts],
    [genId(),'Order signage (seating chart, welcome sign, table numbers)','Décor','church','false','','','system',ts],
    [genId(),'Buy wedding dress + arrange alterations','Attire','church','false','','','system',ts],
    [genId(),"Book groom's suit / agbada",'Attire','church','false','','','system',ts],
    [genId(),'Order bridesmaids dresses','Attire','church','false','','','system',ts],
    [genId(),'Order groomsmen outfits','Attire','church','false','','','system',ts],
    [genId(),'Order flower girl and page boy outfits','Attire','church','false','','','system',ts],
    [genId(),'Book photographer','Photography & Film','church','false','','','system',ts],
    [genId(),'Book videographer','Photography & Film','church','false','','','system',ts],
    [genId(),'Book drone footage','Photography & Film','church','false','','','system',ts],
    [genId(),'Book photo booth','Photography & Film','church','false','','','system',ts],
    [genId(),'Book DJ / live band for reception','Entertainment','church','false','','','system',ts],
    [genId(),'Book MC for reception','Entertainment','church','false','','','system',ts],
    [genId(),'Book bridal hair and makeup','Beauty','church','false','','','system',ts],
    [genId(),'Book bridal party hair and makeup','Beauty','church','false','','','system',ts],
    [genId(),'Design and print wedding invitations','Stationery','church','false','','','system',ts],
    [genId(),'Print order of service / programme','Stationery','church','false','','','system',ts],
    [genId(),'Print menus, place cards, table numbers','Stationery','church','false','','','system',ts],
    [genId(),'Book bridal car','Transport','church','false','','','system',ts],
    [genId(),'Arrange guest shuttle service','Transport','church','false','','','system',ts],
    [genId(),'Buy wedding bands (x2)','Rings','church','false','','','system',ts],
    [genId(),'Get marriage licence / registration','Legal','church','false','','','system',ts],
    [genId(),'Book honeymoon flights','Honeymoon','church','false','','','system',ts],
    [genId(),'Book honeymoon accommodation','Honeymoon','church','false','','','system',ts],
    [genId(),'Book wedding planner / coordinator','Coordination','general','false','','','system',ts],
    [genId(),'Book day-of coordinator','Coordination','general','false','','','system',ts],
    [genId(),'Order guest favours','Gifts & Favours','general','false','','','system',ts],
    [genId(),'Buy bridal party gifts','Gifts & Favours','general','false','','','system',ts],
    [genId(),'Buy parent gifts','Gifts & Favours','general','false','','','system',ts],
    [genId(),'Arrange accommodation for international guests','Accommodation','general','false','','','system',ts],
    [genId(),'Book bridal party accommodation night before','Accommodation','general','false','','','system',ts],
    [genId(),'Launch wedding website','Website & Comms','general','true','system',ts,'system',ts],
    [genId(),'Send digital invitations','Website & Comms','general','false','','','system',ts],
    [genId(),'Set up gift registry page','Website & Comms','general','false','','','system',ts],
    [genId(),'Set aside 10% contingency budget','Budget','general','false','','','system',ts],
  ];

  defaultTasks.forEach(function(row) { taskSheet.appendRow(row); });
  Logger.log('Sheets initialized successfully!');
}
