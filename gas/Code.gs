/**
 * API del formulario "Microcentro Embrujado".
 * Guarda una fila por Padrino en la hoja `Respuestas` (se crea sola en la carpeta de Drive).
 *
 * Primera vez: ejecutar `setup` desde el editor (autoriza permisos y crea la hoja + la clave de administrador).
 */
var FOLDER_ID = '1XOBM5ubLhk7TmFr1-FX07-9QwS542XzT';
var SS_TITLE = 'Evaluación Microcentro - Padrinos';
var SHEET = 'Respuestas';
var FIXED = 3; // id, fecha, nombre

function props_() { return PropertiesService.getScriptProperties(); }

function setup() {
  var ss = getSS_();
  var p = props_();
  if (!p.getProperty('ADMIN_KEY')) p.setProperty('ADMIN_KEY', Utilities.getUuid().slice(0, 8));
  var acc = ss.getSheetByName('Acceso') || ss.insertSheet('Acceso');
  acc.getRange('A1:B1').setValues([['Clave de administrador', p.getProperty('ADMIN_KEY')]]);
  Logger.log(ss.getUrl());
}

function getSS_() {
  var id = props_().getProperty('SS_ID');
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.create(SS_TITLE);
  DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(FOLDER_ID));
  ss.getSheets()[0].setName(SHEET);
  props_().setProperty('SS_ID', ss.getId());
  return ss;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function slug_(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function clean_(s, max) { return String(s == null ? '' : s).trim().slice(0, max); }

function rows_() {
  var sh = getSS_().getSheetByName(SHEET);
  var last = sh.getLastRow();
  return last < 2 ? [] : sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues();
}

function doGet(e) {
  var a = e.parameter.action;
  if (a === 'names') {
    return json_({ ok: true, done: rows_().map(function (r) { return r[0]; }) });
  }
  if (a === 'admin') {
    if (!e.parameter.key || e.parameter.key !== props_().getProperty('ADMIN_KEY')) return json_({ ok: false, error: 'auth' });
    return json_({ ok: true, rows: rows_() });
  }
  return json_({ ok: false, error: 'action' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.action !== 'submit') return json_({ ok: false, error: 'action' });
    var name = clean_(d.name, 100);
    var ratings = (d.ratings || []).slice(0, 12).map(Number);
    var texts = (d.texts || []).slice(0, 4).map(function (t) { return clean_(t, 600); });
    var labels = (d.labels || []).slice(0, 16).map(function (l) { return clean_(l, 120); });
    var okRatings = ratings.every(function (n) { return n >= 1 && n <= 5 && n % 1 === 0; });
    if (!name || !ratings.length || !okRatings) return json_({ ok: false, error: 'datos' });

    var sh = getSS_().getSheetByName(SHEET);
    var row = [slug_(name), new Date().toISOString(), name].concat(ratings, texts);
    var cols = row.length;

    sh.getRange(1, 1, 1, cols).setValues([['id', 'Fecha', 'Nombre'].concat(labels).slice(0, cols)]).setFontWeight('bold');
    // Formato texto: nadie puede inyectar fórmulas desde el formulario.
    var target = 0, ids = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues() : [];
    for (var i = 0; i < ids.length; i++) if (ids[i][0] === row[0]) { target = i + 2; break; }
    if (!target) target = sh.getLastRow() + 1;
    sh.getRange(target, 2, 1, cols - 1).setNumberFormat('@');
    sh.getRange(target, 1, 1, cols).setValues([row]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}
