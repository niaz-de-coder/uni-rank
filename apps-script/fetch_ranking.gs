/**
 * Apps Script: Convert an uploaded Excel file (xls/xlsx) on Drive to a Google Sheet,
 * read the first sheet, convert rows to JSON and optionally return/save it.
 *
 * Requirements:
 * - Enable Advanced Drive Service in Apps Script (Resources -> Advanced Google services -> Drive API)
 * - Also enable the Drive API in the Google Cloud Console for the project
 *
 * Usage:
 * - Upload `ranking.xls` to Drive, copy the fileId from its URL
 * - Deploy this script as a Web App (Execute as: Me, Who has access: Anyone)
 * - Call the deployed URL with `?id=THE_DRIVE_FILE_ID`
 */

// Optional secret token to restrict who can call the web endpoint. Set to non-empty string
// in production and provide ?secret=THE_VALUE on the request.
var SCRIPT_SECRET = '';

/**
 * Convert an Excel file on Drive to a Google Spreadsheet and return the new spreadsheet id.
 * Uses Advanced Drive service: Drive.Files.copy with {convert: true}.
 */
function convertExcelToGoogleSheet(fileId) {
  var resource = { title: 'Converted-' + fileId };
  var converted = Drive.Files.copy(resource, fileId, { convert: true });
  return converted.id;
}

function readSheetAsObjects(spreadsheetId, sheetIndex) {
  sheetIndex = typeof sheetIndex === 'number' ? sheetIndex : 0;
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheet = ss.getSheets()[sheetIndex];
  var data = sheet.getDataRange().getValues();
  if (!data || data.length < 2) return [];
  var headers = data[0].map(function(h) { return String(h).trim(); });
  var rows = data.slice(1);
  return rows.map(function(row) {
    var obj = {};
    for (var i = 0; i < headers.length; i++) {
      obj[headers[i]] = row[i];
    }
    return obj;
  });
}

/**
 * Convert Excel and return JSON objects. Leaves converted spreadsheet in Drive unless clean flag is used by caller.
 */
function importExcelToJson(fileId) {
  var convId = convertExcelToGoogleSheet(fileId);
  var objects = readSheetAsObjects(convId, 0);
  return { objects: objects, convertedSpreadsheetId: convId };
}

/**
 * Convert Excel -> Google Sheet and copy into an existing target spreadsheet (overwrite first sheet).
 * If targetSpreadsheetId is not provided, this behaves like importExcelToJson.
 * Options: { clean: true } will remove the temporary converted spreadsheet.
 */
function importExcelToSheet(fileId, targetSpreadsheetId, options) {
  options = options || {};
  var convId = convertExcelToGoogleSheet(fileId);
  var convSs = SpreadsheetApp.openById(convId);
  var convSheet = convSs.getSheets()[0];
  var values = convSheet.getDataRange().getValues();

  if (!targetSpreadsheetId) {
    // just return JSON if no target provided
    var objects = readSheetAsObjects(convId, 0);
    if (options.clean) {
      try { Drive.Files.remove(convId); } catch (e) { /* ignore */ }
    }
    return { objects: objects, convertedSpreadsheetId: convId };
  }

  // Open target spreadsheet and overwrite its first sheet with the converted values
  var targetSs = SpreadsheetApp.openById(targetSpreadsheetId);
  var targetSheet = targetSs.getSheets()[0];
  // Clear then set values (preserve formatting not necessary)
  targetSheet.clearContents();
  if (values && values.length > 0 && values[0].length > 0) {
    targetSheet.getRange(1, 1, values.length, values[0].length).setValues(values);
  }

  // Optionally remove the temporary converted spreadsheet
  if (options.clean) {
    try { Drive.Files.remove(convId); } catch (e) { /* ignore */ }
  }

  // Return the imported JSON as well (reading from target ensures we return what was written)
  var objects = readSheetAsObjects(targetSpreadsheetId, 0);
  return { objects: objects, convertedSpreadsheetId: convId, targetSpreadsheetId: targetSpreadsheetId };
}

/**
 * Web endpoint to return JSON for a given Drive file id.
 * Example: https://script.google.com/macros/s/DEPLOY_ID/exec?id=DRIVE_FILE_ID
 */
function doGet(e) {
  var fileId = (e && e.parameter && e.parameter.id) || null;
  if (!fileId) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'missing id parameter' })).setMimeType(ContentService.MimeType.JSON);
  }
  try {
    var data = importExcelToJson(fileId);
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper to save JSON as a file in Drive (optional).
 */
function saveJsonToDrive(objects, filename) {
  var blob = Utilities.newBlob(JSON.stringify(objects, null, 2), 'application/json', filename);
  var file = DriveApp.createFile(blob);
  return file.getId();
}
