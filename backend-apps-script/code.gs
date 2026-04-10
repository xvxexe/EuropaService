function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const PASSWORD = "1234";

  if (data.password !== PASSWORD) {
    return ContentService.createTextOutput(JSON.stringify({success:false}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet();

  const sites = sheet.getSheetByName("Cantieri").getDataRange().getValues();
  const expenses = sheet.getSheetByName("Spese").getDataRange().getValues();

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: {
      sites: sites.slice(1).map(r=>({
        siteId:r[0],
        siteName:r[1],
        city:r[3]
      })),
      expenses: expenses.slice(1).map(r=>({
        amount:r[10]
      }))
    }
  })).setMimeType(ContentService.MimeType.JSON);
}
