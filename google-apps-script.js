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
  const premiumSlotLimit = 100;

  return {
    ok: true,
    total_leads: totalRows,
    premium_slot_limit: premiumSlotLimit,
    premium_slots_remaining: Math.max(premiumSlotLimit - totalRows, 0),
  };
}

function parseLeadPayload_(e) {
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      // Fallback to form-style payload below.
    }
  }

  return {
    nombre: e.parameter.nombre || "",
    apellido: e.parameter.apellido || "",
    email: e.parameter.email || "",
    telefono: e.parameter.telefono || "",
    como_gestiona: e.parameter.como_gestiona || "",
    tipo_uso: e.parameter.tipo_uso || "",
  };
}

function getLeadLookupPayload_(sheet, email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: false, exists: false };
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { ok: true, exists: false };
  }

  const emailValues = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
  let position = null;

  for (let index = emailValues.length - 1; index >= 0; index -= 1) {
    const rowEmail = String(emailValues[index][0] || "").trim().toLowerCase();
    if (rowEmail === normalizedEmail) {
      position = index + 1;
      break;
    }
  }

  return {
    ok: true,
    exists: position !== null,
    position: position,
  };
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp
      .openById("1LtSmuuMAWRjZbtXj8_bD5RiemVXZfUO7bjpHOaSPXZ8")
      .getSheetByName("Leads");

    const data = parseLeadPayload_(e);
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

    const action = e.parameter.action || "stats";
    const stats = action === "lookup"
      ? getLeadLookupPayload_(sheet, e.parameter.email)
      : getStatsPayload_(sheet);
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
