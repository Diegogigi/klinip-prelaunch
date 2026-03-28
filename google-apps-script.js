function appendLeadRow_(sheet, data) {
  sheet.appendRow([
    new Date(),
    data.nombre || "",
    data.apellido || "",
    data.email || "",
    data.telefono || "",
    data.como_gestiona || "",
    data.tipo_uso || "",
  ]);
}

function getStatsPayload_(sheet) {
  const totalRows = Math.max(sheet.getLastRow() - 1, 0);
  const premiumSlotLimit = 300;

  return {
    ok: true,
    total_leads: totalRows,
    premium_slot_limit: premiumSlotLimit,
    premium_slots_remaining: Math.max(premiumSlotLimit - totalRows, 0),
  };
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp
      .openById("1LtSmuuMAWRjZbtXj8_bD5RiemVXZfUO7bjpHOaSPXZ8")
      .getSheetByName("Leads");

    const data = JSON.parse(e.postData.contents);
    appendLeadRow_(sheet, data);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp
      .openById("1LtSmuuMAWRjZbtXj8_bD5RiemVXZfUO7bjpHOaSPXZ8")
      .getSheetByName("Leads");

    const stats = getStatsPayload_(sheet);
    const callback = e.parameter.callback;

    if (callback) {
      return ContentService
        .createTextOutput(`${callback}(${JSON.stringify(stats)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(JSON.stringify(stats))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    const callback = e.parameter.callback;
    const payload = { ok: false, error: String(error) };

    if (callback) {
      return ContentService
        .createTextOutput(`${callback}(${JSON.stringify(payload)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
