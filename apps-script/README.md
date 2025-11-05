Apps Script for converting ranking.xls to JSON

Steps to use

1. Open Google Drive and upload your `ranking.xls` or `ranking.xlsx` file.
2. Copy the Drive file ID: open the file's preview or right-click -> Get link. The fileId is the long id in the URL.
   Example: https://drive.google.com/file/d/FILE_ID/view

3. Create a new Apps Script project (script.google.com) and paste the code from `fetch_ranking.gs`.

4. Enable the Advanced Drive service:
   - In the Apps Script editor: Extensions -> Advanced Google services -> enable "Drive API".
   - Then go to the Google Cloud Console for the project and enable the Drive API there as well.

5. Deploy the script as a Web App:
   - Click Deploy -> New deployment -> Select "Web app".
   - Execute as: Me
   - Who has access: Anyone (or Anyone with Google account) depending on your needs.
   - Deploy and copy the Web App URL.

6. Call the web app

Simple JSON fetch (no target spreadsheet):

```
https://script.google.com/macros/s/DEPLOY_ID/exec?id=DRIVE_FILE_ID
```

This returns a JSON object like:

```json
{ "objects": [ {"id":"...","name":"...", ... } ], "convertedSpreadsheetId": "..." }
```

Update / overwrite an existing Google Spreadsheet

If you'd like the converted Excel content to be written into an existing Google Spreadsheet (overwrite its first sheet), call the web app with the `targetId` parameter and optional `clean` flag:

```
https://script.google.com/macros/s/DEPLOY_ID/exec?id=DRIVE_FILE_ID&targetId=TARGET_SPREADSHEET_ID&clean=true
```

Response example:

```json
{
   "objects": [ {"id":"...","name":"..."} ],
   "convertedSpreadsheetId": "CONVERTED_TEMP_ID",
   "targetSpreadsheetId": "TARGET_SPREADSHEET_ID"
}
```

Security note: set `SCRIPT_SECRET` in `fetch_ranking.gs` to a non-empty string and call with `?secret=THE_VALUE` to restrict access.

Expected spreadsheet header columns (recommended):
id, name, area, type, programs, min_budget_lakh, max_budget_lakh, ranking

- `programs` may be a comma-separated string like: "CSE, EEE, Economics"; split client-side.
- `min_budget_lakh` and `max_budget_lakh` should be numeric if you want budget filtering to work.

Example fetch from your React frontend and normalize rows:

```js
const URL = 'https://script.google.com/macros/s/DEPLOY_ID/exec?id=DRIVE_FILE_ID';
const res = await fetch(URL);
const payload = await res.json();
const data = payload.objects || [];
const universities = data.map(r => ({
   id: String(r.id || r.ID || r.Id || (r.name+Math.random())).trim(),
   name: r.name || r.Name || '',
   area: r.area || r.Area || '',
   type: r.type || r.Type || '',
   programs: (r.programs || r.Programs || '').toString().split(',').map(s=>s.trim()).filter(Boolean),
   min_budget_lakh: r.min_budget_lakh ? Number(r.min_budget_lakh) : undefined,
   max_budget_lakh: r.max_budget_lakh ? Number(r.max_budget_lakh) : undefined,
   ranking: r.ranking ? Number(r.ranking) : undefined
}));

// Update your app state with `universities`
```

Notes & caveats
- The script uses the Drive API to convert Excel to Google Sheets; that requires enabling the Drive API and the Advanced Drive service in Apps Script.
- Deploying the web app with broad access may expose the data; secure it with `SCRIPT_SECRET` or restrict access.
- The script converts the first sheet only. If your ranking is on another sheet, modify the code to choose the correct sheet index or name.
- By default the converted spreadsheet is left in your Drive; using `clean=true` will attempt to remove the temporary converted spreadsheet (requires Drive API permissions).
