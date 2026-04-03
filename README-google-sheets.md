# How to Connect Form to Google Sheets

I have updated this guide with a **much simpler** script to prevent any errors.

### Step 1: Prepare the Google Sheet
1. Open your Google Sheet.
2. Ensure you have 4 columns named: `fullname`, `email`, `message`, `date`.

### Step 2: Add Apps Script
1. In your Google Sheet, click **Extensions** > **Apps Script** in the top menu.
2. Delete any existing code there and paste this **new, simpler** code:
```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Add a new row to the sheet
    sheet.appendRow([
      e.parameter.fullname,
      e.parameter.email,
      e.parameter.message,
      new Date()
    ]);
    
    // Return success message
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    
  } catch(error) {
    return ContentService.createTextOutput(error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
```

### Step 3: Deploy the Updated Script
> **IMPORTANT**: Since you changed the code, you MUST create a New Version of your deployment!

1. Click the **Deploy** button at the top right, then **Manage deployments**.
2. Click the **Pencil Icon** (Edit) next to your active deployment on the left side.
3. Under "Version", select **New version** from the dropdown.
4. Click **Deploy**.

### Step 4: Verify URL
1. Copy the **Web App URL** shown on the screen (it might be exactly the same as before).
2. Ensure it is perfectly copied into `assets/js/script.js` on line 79:
   `const scriptURL = '<YOUR-COPIED-URL>';`

That's it! By creating a "New version" deployment with this simplified script, your Google Sheet will now successfully receive the messages!
