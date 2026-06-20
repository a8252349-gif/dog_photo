/**
 * 증멍사진 쿠폰·결과 서버
 * 기존 기억사진 쿠폰 시트 구조를 유지하면서 스마트스토어 발급, 예약, 실패 복구,
 * 사용 완료, 결과 보관 기능을 추가한 전체 교체본입니다.
 */
const COUPON_DEFAULT_SHEET = "쿠폰목록";
const RESULT_RETENTION_DAYS_DEFAULT = 7;
const PROCESSING_TIMEOUT_MINUTES = 60;

const COUPON_HEADERS = [
  "쿠폰 코드", "발급 여부", "상태", "스마트스토어 상품주문번호", "수신번호", "발급일시",
  "홈페이지 사용일시", "메모", "코드 출처", "스마트스토어 상품명", "스마트스토어 옵션", "상품 구성",
  "홈페이지 주문번호", "결과 안내번호", "예약일시", "배경색", "눈가 보정", "반려동물 이름",
  "결과 상태", "결과 토큰", "결과 파일 ID", "결과 파일명", "결과 MIME", "결과 설명", "결과 링크",
  "제작 완료일시", "결과 만료일시",
  "이용권 문자 발송일시", "이용권 문자 상태", "이용권 문자 메시지 ID",
  "결과 문자 발송일시", "결과 문자 상태", "결과 문자 메시지 ID"
];

const MESSAGE_LOG_SHEET = "발송로그";
const MESSAGE_LOG_HEADERS = [
  "기록일시", "구분", "쿠폰 코드", "상품주문번호", "홈페이지 주문번호", "수신번호",
  "상태", "발송사", "그룹 ID", "메시지 ID", "오류 내용"
];

function doGet() {
  return couponJson_({ ok: true, status: "ready", message: "증멍사진 쿠폰 서버가 정상 작동 중입니다." });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const expectedSecret = PropertiesService.getScriptProperties().getProperty("COUPON_API_SECRET");
    if (!expectedSecret || body.secret !== expectedSecret) {
      return couponJson_({ ok: false, status: "unauthorized", message: "인증에 실패했습니다." });
    }

    const action = String(body.action || "").trim();
    if (action === "issue") return issueCoupon_(body);
    if (action === "verify") return verifyCoupon_(normalCode_(body.code), normalPhone_(body.phone));
    if (action === "reserve") return reserveCoupon_(body);
    if (action === "release") return releaseCoupon_(body);
    if (action === "complete") return completeCoupon_(body);
    if (action === "save_result") return saveResult_(body);
    if (action === "get_result") return getResult_(String(body.resultToken || "").trim(), false);
    if (action === "get_result_file") return getResult_(String(body.resultToken || "").trim(), true);
    if (action === "mark_coupon_notified") return markCouponNotified_(body);
    if (action === "mark_result_notified") return markResultNotified_(body);
    return couponJson_({ ok: false, status: "invalid_action", message: "지원하지 않는 요청입니다." });
  } catch (error) {
    console.error(error);
    return couponJson_({ ok: false, status: "error", message: String(error && error.message || error) });
  }
}

function setupCouponServer() {
  const data = couponData_();
  const logSheet = messageLogSheet_();

  data.sheet.setFrozenRows(1);
  data.sheet.getRange(1, 1, 1, COUPON_HEADERS.length)
    .setFontWeight("bold")
    .setBackground("#2f4a3d")
    .setFontColor("#ffffff");
  data.sheet.autoResizeColumns(1, COUPON_HEADERS.length);

  logSheet.setFrozenRows(1);
  logSheet.getRange(1, 1, 1, MESSAGE_LOG_HEADERS.length)
    .setFontWeight("bold")
    .setBackground("#6b5b4b")
    .setFontColor("#ffffff");
  logSheet.autoResizeColumns(1, MESSAGE_LOG_HEADERS.length);

  return "쿠폰 서버와 발송로그 시트가 준비되었습니다.";
}

function generateCouponCodes(count) {
  const requested = Math.max(1, Math.min(Number(count || 500), 5000));
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const data = couponData_();
    const existing = {};
    for (let i = 1; i < data.values.length; i += 1) {
      const code = normalCode_(data.values[i][data.columns.code]);
      if (code) existing[code] = true;
    }

    const rows = [];
    while (rows.length < requested) {
      const raw = Utilities.getUuid().replace(/-/g, "").toUpperCase();
      const code = "PET-" + raw.slice(0, 4) + "-" + raw.slice(4, 8);
      if (existing[code]) continue;
      existing[code] = true;
      const row = new Array(COUPON_HEADERS.length).fill("");
      row[data.columns.code] = code;
      row[data.columns.issued] = false;
      row[data.columns.status] = "available";
      row[data.columns.source] = "generated";
      rows.push(row);
    }

    data.sheet.getRange(data.sheet.getLastRow() + 1, 1, rows.length, COUPON_HEADERS.length).setValues(rows);
    SpreadsheetApp.flush();
    return rows.length + "개의 쿠폰 코드를 생성했습니다.";
  } finally {
    lock.releaseLock();
  }
}

function issueCoupon_(body) {
  const productOrderId = String(body.productOrderId || "").trim();
  const phone = normalPhone_(body.phone);
  const productName = String(body.productName || "반려동물 증명사진").trim();
  const productOption = String(body.productOption || "디지털 파일").trim();
  const source = String(body.source || "smartstore").trim();
  const fulfillmentType = normalizeFulfillment_(body.fulfillmentType, productOption);
  if (!productOrderId || !phone) return couponJson_({ ok: false, status: "invalid", message: "상품주문번호와 수신번호가 필요합니다." });

  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const data = couponData_();
    const existing = findByValue_(data.values, data.columns.productOrderId, productOrderId);
    if (existing) {
      return couponJson_(issuedPayload_(existing.row, data.columns, true));
    }

    let available = null;
    for (let i = 1; i < data.values.length; i += 1) {
      const status = normalStatus_(data.values[i][data.columns.status]);
      const code = normalCode_(data.values[i][data.columns.code]);
      if (code && (status === "available" || status === "")) { available = { index: i, row: data.values[i] }; break; }
    }
    if (!available) return couponJson_({ ok: false, status: "sold_out", message: "발급 가능한 쿠폰이 없습니다." });

    const row = available.index + 1;
    set_(data.sheet, row, data.columns.issued, true);
    set_(data.sheet, row, data.columns.status, "issued");
    set_(data.sheet, row, data.columns.productOrderId, productOrderId);
    set_(data.sheet, row, data.columns.recipientPhone, phone);
    set_(data.sheet, row, data.columns.issuedAt, new Date());
    set_(data.sheet, row, data.columns.source, source);
    set_(data.sheet, row, data.columns.productName, productName);
    set_(data.sheet, row, data.columns.productOption, productOption);
    set_(data.sheet, row, data.columns.fulfillmentType, fulfillmentType);
    SpreadsheetApp.flush();

    const fresh = data.sheet.getRange(row, 1, 1, data.sheet.getLastColumn()).getValues()[0];
    return couponJson_(issuedPayload_(fresh, data.columns, false));
  } finally { lock.releaseLock(); }
}

function verifyCoupon_(code, phone) {
  if (!code || !phone) return couponJson_({ ok: false, status: "invalid", message: "이용권 코드와 휴대전화 번호를 확인해주세요." });
  const data = couponData_();
  const found = findCoupon_(data.values, data.columns.code, code);
  if (!found) return couponJson_({ ok: false, status: "invalid", message: "등록되지 않은 이용권 코드입니다." });
  resetStaleProcessing_(data, found);

  const status = normalStatus_(found.row[data.columns.status]);
  const savedPhone = normalPhone_(found.row[data.columns.recipientPhone]);
  if (savedPhone && savedPhone !== phone) return couponJson_({ ok: false, status: "phone_mismatch", message: "스마트스토어 주문 시 등록한 번호와 다릅니다." });
  if (status === "issued") {
    return couponJson_({
      ok: true, status: "issued", message: "이용권 코드가 확인되었습니다.", code: code,
      productOrderId: String(found.row[data.columns.productOrderId] || ""),
      productOption: String(found.row[data.columns.productOption] || "디지털 파일"),
      fulfillmentType: normalizeFulfillment_(found.row[data.columns.fulfillmentType], found.row[data.columns.productOption]),
      optionLocked: true
    });
  }
  if (status === "processing") return couponJson_({ ok: false, status: "processing", message: "이미 제작이 진행 중인 이용권입니다. 기존 제작 화면에서 완료해주세요." });
  if (status === "redeemed") return couponJson_({ ok: false, status: "redeemed", message: "이미 사용된 이용권 코드입니다." });
  return couponJson_({ ok: false, status: status || "unavailable", message: "아직 발급되지 않았거나 사용할 수 없는 이용권입니다." });
}

function reserveCoupon_(body) {
  const code = normalCode_(body.code), phone = normalPhone_(body.phone), orderId = String(body.orderId || "").trim();
  if (!code || !phone || !orderId) return couponJson_({ ok: false, status: "invalid", message: "제작 예약 정보를 확인해주세요." });
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const data = couponData_(); const found = findCoupon_(data.values, data.columns.code, code);
    if (!found) return couponJson_({ ok: false, status: "invalid", message: "이용권을 찾지 못했습니다." });
    resetStaleProcessing_(data, found);
    const status = normalStatus_(found.row[data.columns.status]);
    const savedPhone = normalPhone_(found.row[data.columns.recipientPhone]);
    const savedOrder = String(found.row[data.columns.homepageOrderId] || "").trim();
    if (savedPhone && savedPhone !== phone) return couponJson_({ ok: false, status: "phone_mismatch", message: "주문자 번호가 일치하지 않습니다." });
    if (status === "processing" && savedOrder === orderId) return couponJson_({ ok: true, status: "processing", message: "같은 제작 요청이 이미 예약되어 있습니다." });
    if (status !== "issued") return couponJson_({ ok: false, status: status, message: "현재 사용할 수 없는 이용권입니다." });

    const row = found.index + 1;
    set_(data.sheet, row, data.columns.status, "processing");
    set_(data.sheet, row, data.columns.homepageOrderId, orderId);
    set_(data.sheet, row, data.columns.resultNotifyPhone, phone);
    set_(data.sheet, row, data.columns.reservedAt, new Date());
    set_(data.sheet, row, data.columns.backgroundKey, String(body.backgroundKey || ""));
    set_(data.sheet, row, data.columns.tearOption, String(body.tearOption || ""));
    set_(data.sheet, row, data.columns.petName, String(body.petName || ""));
    if (body.fulfillmentType) set_(data.sheet, row, data.columns.fulfillmentType, normalizeFulfillment_(body.fulfillmentType, ""));
    SpreadsheetApp.flush();
    return couponJson_({ ok: true, status: "processing", message: "이용권이 제작 대기 상태로 예약되었습니다." });
  } finally { lock.releaseLock(); }
}

function releaseCoupon_(body) {
  const code = normalCode_(body.code), phone = normalPhone_(body.phone), orderId = String(body.orderId || "").trim();
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const data = couponData_(); const found = findCoupon_(data.values, data.columns.code, code);
    if (!found) return couponJson_({ ok: false, status: "invalid", message: "이용권을 찾지 못했습니다." });
    const status = normalStatus_(found.row[data.columns.status]);
    if (status === "issued") return couponJson_({ ok: true, status: "issued", message: "이미 다시 사용할 수 있는 상태입니다." });
    if (status !== "processing" || String(found.row[data.columns.homepageOrderId] || "") !== orderId || normalPhone_(found.row[data.columns.resultNotifyPhone]) !== phone) {
      return couponJson_({ ok: false, status: "mismatch", message: "취소할 제작 예약 정보가 일치하지 않습니다." });
    }
    clearReservation_(data.sheet, found.index + 1, data.columns, "issued"); SpreadsheetApp.flush();
    return couponJson_({ ok: true, status: "issued", message: "제작 예약을 취소했습니다. 이용권을 다시 사용할 수 있습니다." });
  } finally { lock.releaseLock(); }
}

function completeCoupon_(body) {
  const code = normalCode_(body.code), phone = normalPhone_(body.phone), orderId = String(body.orderId || "").trim();
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const data = couponData_(); const found = findCoupon_(data.values, data.columns.code, code);
    if (!found) return couponJson_({ ok: false, status: "invalid", message: "이용권을 찾지 못했습니다." });
    const savedOrder = String(found.row[data.columns.homepageOrderId] || "").trim();
    const savedPhone = normalPhone_(found.row[data.columns.resultNotifyPhone]);
    const status = normalStatus_(found.row[data.columns.status]);
    if (savedOrder !== orderId || savedPhone !== phone) return couponJson_({ ok: false, status: "mismatch", message: "제작 완료 정보가 일치하지 않습니다." });
    if (status === "redeemed") return couponJson_({ ok: true, status: "redeemed", message: "이미 사용 완료 처리되었습니다." });
    if (status !== "processing") return couponJson_({ ok: false, status: status, message: "완료 처리할 수 없는 상태입니다." });
    const row = found.index + 1; set_(data.sheet, row, data.columns.status, "redeemed"); set_(data.sheet, row, data.columns.usedAt, new Date()); SpreadsheetApp.flush();
    return couponJson_({ ok: true, status: "redeemed", message: "이용권 사용이 완료되었습니다." });
  } finally { lock.releaseLock(); }
}

function saveResult_(body) {
  const code = normalCode_(body.code), orderId = String(body.orderId || "").trim(), phone = normalPhone_(body.phone);
  const imageDataUrl = String(body.imageDataUrl || ""), label = String(body.label || "완성사진").trim().slice(0, 100);
  const siteOrigin = String(body.siteOrigin || "").trim().replace(/\/$/, "");
  if (!code || !orderId || !phone || !imageDataUrl || !siteOrigin) return couponJson_({ ok: false, status: "invalid", message: "완성사진 저장 정보를 확인해주세요." });

  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const data = couponData_(); const found = findCoupon_(data.values, data.columns.code, code);
    if (!found) return couponJson_({ ok: false, status: "invalid", message: "이용권을 찾지 못했습니다." });
    const status = normalStatus_(found.row[data.columns.status]);
    if (["processing", "redeemed"].indexOf(status) === -1 || String(found.row[data.columns.homepageOrderId] || "") !== orderId || normalPhone_(found.row[data.columns.resultNotifyPhone]) !== phone) {
      return couponJson_({ ok: false, status: "order_mismatch", message: "이용권과 홈페이지 주문 정보가 일치하지 않습니다." });
    }

    const existingToken = String(found.row[data.columns.resultToken] || "").trim();
    const existingFileId = String(found.row[data.columns.resultFileId] || "").trim();
    if (existingToken && existingFileId) return couponJson_(resultPayload_(found.row, data.columns, "이미 저장된 완성사진 링크입니다."));

    const parsed = parseImageDataUrl_(imageDataUrl);
    if (!parsed) return couponJson_({ ok: false, status: "invalid_image", message: "완성사진 형식을 확인해주세요." });
    if (parsed.bytes.length > 9 * 1024 * 1024) return couponJson_({ ok: false, status: "image_too_large", message: "완성사진 용량이 너무 큽니다." });

    const props = PropertiesService.getScriptProperties(); const folderId = props.getProperty("RESULT_FOLDER_ID");
    if (!folderId) throw new Error("스크립트 속성 RESULT_FOLDER_ID가 설정되지 않았습니다.");
    const extension = mimeExtension_(parsed.mimeType); const fileName = `pet-id-photo-${orderId}.${extension}`;
    const file = DriveApp.getFolderById(folderId).createFile(Utilities.newBlob(parsed.bytes, parsed.mimeType, fileName));
    const completedAt = new Date();
    const days = Number(props.getProperty("RESULT_RETENTION_DAYS") || RESULT_RETENTION_DAYS_DEFAULT) || RESULT_RETENTION_DAYS_DEFAULT;
    const expiresAt = new Date(completedAt.getTime() + days * 86400000);
    const token = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
    const resultUrl = siteOrigin + "/r/" + token; const row = found.index + 1;
    set_(data.sheet, row, data.columns.resultStatus, "ready"); set_(data.sheet, row, data.columns.resultToken, token);
    set_(data.sheet, row, data.columns.resultFileId, file.getId()); set_(data.sheet, row, data.columns.resultFileName, fileName);
    set_(data.sheet, row, data.columns.resultMime, parsed.mimeType); set_(data.sheet, row, data.columns.resultLabel, label);
    set_(data.sheet, row, data.columns.resultUrl, resultUrl); set_(data.sheet, row, data.columns.resultCompletedAt, completedAt);
    set_(data.sheet, row, data.columns.resultExpiresAt, expiresAt); SpreadsheetApp.flush();
    const fresh = data.sheet.getRange(row, 1, 1, data.sheet.getLastColumn()).getValues()[0];
    return couponJson_(resultPayload_(fresh, data.columns, "완성사진이 저장되었습니다."));
  } finally { lock.releaseLock(); }
}

function getResult_(token, includeFile) {
  if (!token) return couponJson_({ ok: false, status: "invalid", message: "결과 링크가 올바르지 않습니다." });
  const data = couponData_(); const found = findByValue_(data.values, data.columns.resultToken, token);
  if (!found) return couponJson_({ ok: false, status: "not_found", message: "완성사진을 찾지 못했습니다." });
  const expiresAt = asDate_(found.row[data.columns.resultExpiresAt]);
  if (normalStatus_(found.row[data.columns.resultStatus]) !== "ready" || !expiresAt || expiresAt.getTime() <= Date.now()) return couponJson_({ ok: false, status: "expired", message: "결과 링크의 보관 기간이 끝났습니다." });
  const payload = resultPayload_(found.row, data.columns, "완성사진을 불러왔습니다.");
  if (!includeFile) return couponJson_(payload);
  try {
    const blob = DriveApp.getFileById(String(found.row[data.columns.resultFileId] || "")).getBlob();
    payload.base64 = Utilities.base64Encode(blob.getBytes()); payload.mimeType = blob.getContentType() || payload.mimeType; payload.fileName = blob.getName() || payload.fileName;
    return couponJson_(payload);
  } catch (error) { return couponJson_({ ok: false, status: "file_missing", message: "완성사진 파일을 불러오지 못했습니다." }); }
}

function markCouponNotified_(body) {
  const code = normalCode_(body.code);
  const productOrderId = String(body.productOrderId || "").trim();
  const data = couponData_();
  const found = findCoupon_(data.values, data.columns.code, code);

  if (!found || String(found.row[data.columns.productOrderId] || "").trim() !== productOrderId) {
    return couponJson_({ ok: false, status: "mismatch", message: "이용권 문자 발송 정보가 일치하지 않습니다." });
  }

  const status = String(body.status || "unknown").trim();
  const messageId = String(body.messageId || "").trim();
  const groupId = String(body.groupId || "").trim();
  const provider = String(body.provider || "solapi").trim();
  const error = String(body.error || "").trim();
  const sentAt = status === "sent" ? new Date() : "";

  set_(data.sheet, found.index + 1, data.columns.couponNotifiedAt, sentAt);
  set_(data.sheet, found.index + 1, data.columns.couponNotificationStatus, status + ":" + provider + (error ? ":" + error : ""));
  set_(data.sheet, found.index + 1, data.columns.couponNotificationMessageId, messageId || groupId);
  appendMessageLog_({
    type: "coupon",
    code: code,
    productOrderId: productOrderId,
    homepageOrderId: "",
    phone: normalPhone_(found.row[data.columns.recipientPhone]),
    status: status,
    provider: provider,
    groupId: groupId,
    messageId: messageId,
    error: error
  });
  SpreadsheetApp.flush();
  return couponJson_({ ok: true, status: "logged", message: "이용권 문자 발송 기록을 저장했습니다." });
}

function markResultNotified_(body) {
  const code = normalCode_(body.code);
  const orderId = String(body.orderId || "").trim();
  const token = String(body.resultToken || "").trim();
  const data = couponData_();
  const found = findCoupon_(data.values, data.columns.code, code);

  if (!found || String(found.row[data.columns.homepageOrderId] || "") !== orderId || String(found.row[data.columns.resultToken] || "") !== token) {
    return couponJson_({ ok: false, status: "mismatch", message: "결과 문자 발송 정보가 일치하지 않습니다." });
  }

  const status = String(body.status || "unknown").trim();
  const messageId = String(body.messageId || "").trim();
  const groupId = String(body.groupId || "").trim();
  const provider = String(body.provider || "solapi").trim();
  const error = String(body.error || "").trim();
  const sentAt = status === "sent" ? new Date() : "";

  set_(data.sheet, found.index + 1, data.columns.resultNotifiedAt, sentAt);
  set_(data.sheet, found.index + 1, data.columns.resultNotificationStatus, status + ":" + provider + (error ? ":" + error : ""));
  set_(data.sheet, found.index + 1, data.columns.resultNotificationMessageId, messageId || groupId);
  appendMessageLog_({
    type: "result",
    code: code,
    productOrderId: String(found.row[data.columns.productOrderId] || ""),
    homepageOrderId: orderId,
    phone: normalPhone_(found.row[data.columns.resultNotifyPhone]),
    status: status,
    provider: provider,
    groupId: groupId,
    messageId: messageId,
    error: error
  });
  SpreadsheetApp.flush();
  return couponJson_({ ok: true, status: "logged", message: "결과 문자 발송 기록을 저장했습니다." });
}

function deleteExpiredResults() {
  const lock = LockService.getScriptLock(); lock.waitLock(30000); let deleted = 0;
  try {
    const data = couponData_();
    for (let i = 1; i < data.values.length; i += 1) {
      const expiresAt = asDate_(data.values[i][data.columns.resultExpiresAt]); const status = normalStatus_(data.values[i][data.columns.resultStatus]);
      if (status !== "ready" || !expiresAt || expiresAt.getTime() > Date.now()) continue;
      const fileId = String(data.values[i][data.columns.resultFileId] || ""); if (fileId) try { DriveApp.getFileById(fileId).setTrashed(true); } catch (e) { console.warn(e); }
      set_(data.sheet, i + 1, data.columns.resultStatus, "expired"); set_(data.sheet, i + 1, data.columns.resultFileId, ""); deleted += 1;
    }
    SpreadsheetApp.flush(); return deleted;
  } finally { lock.releaseLock(); }
}

function couponData_() {
  const props = PropertiesService.getScriptProperties(); const id = props.getProperty("COUPON_SPREADSHEET_ID");
  const spreadsheet = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("스프레드시트를 찾지 못했습니다.");
  const name = props.getProperty("COUPON_SHEET_NAME") || COUPON_DEFAULT_SHEET;
  let sheet = spreadsheet.getSheetByName(name); if (!sheet) sheet = spreadsheet.insertSheet(name);
  ensureCouponHeaders_(sheet);
  const values = sheet.getDataRange().getValues(); const headers = values[0].map(function(v) { return String(v).trim(); }); const columns = {};
  const keys = {
    code:"쿠폰 코드", issued:"발급 여부", status:"상태", productOrderId:"스마트스토어 상품주문번호", recipientPhone:"수신번호", issuedAt:"발급일시", usedAt:"홈페이지 사용일시", memo:"메모", source:"코드 출처", productName:"스마트스토어 상품명", productOption:"스마트스토어 옵션", fulfillmentType:"상품 구성", homepageOrderId:"홈페이지 주문번호", resultNotifyPhone:"결과 안내번호", reservedAt:"예약일시", backgroundKey:"배경색", tearOption:"눈가 보정", petName:"반려동물 이름", resultStatus:"결과 상태", resultToken:"결과 토큰", resultFileId:"결과 파일 ID", resultFileName:"결과 파일명", resultMime:"결과 MIME", resultLabel:"결과 설명", resultUrl:"결과 링크", resultCompletedAt:"제작 완료일시", resultExpiresAt:"결과 만료일시", couponNotifiedAt:"이용권 문자 발송일시", couponNotificationStatus:"이용권 문자 상태", couponNotificationMessageId:"이용권 문자 메시지 ID", resultNotifiedAt:"결과 문자 발송일시", resultNotificationStatus:"결과 문자 상태", resultNotificationMessageId:"결과 문자 메시지 ID"
  };
  Object.keys(keys).forEach(function(key) { columns[key] = headers.indexOf(keys[key]); if (columns[key] < 0) throw new Error("필수 열 누락: " + keys[key]); });
  return { sheet: sheet, values: values, columns: columns };
}

function messageLogSheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("COUPON_SPREADSHEET_ID");
  const spreadsheet = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(MESSAGE_LOG_SHEET);
  if (!sheet) sheet = spreadsheet.insertSheet(MESSAGE_LOG_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, MESSAGE_LOG_HEADERS.length).setValues([MESSAGE_LOG_HEADERS]);
  }
  return sheet;
}

function appendMessageLog_(input) {
  const sheet = messageLogSheet_();
  sheet.appendRow([
    new Date(),
    String(input.type || ""),
    String(input.code || ""),
    String(input.productOrderId || ""),
    String(input.homepageOrderId || ""),
    String(input.phone || ""),
    String(input.status || ""),
    String(input.provider || ""),
    String(input.groupId || ""),
    String(input.messageId || ""),
    String(input.error || "")
  ]);
}

function ensureCouponHeaders_(sheet) {
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, COUPON_HEADERS.length).setValues([COUPON_HEADERS]);
  const count = Math.max(sheet.getLastColumn(), 1); const headers = sheet.getRange(1, 1, 1, count).getValues()[0].map(function(v) { return String(v).trim(); });
  const missing = COUPON_HEADERS.filter(function(h) { return headers.indexOf(h) === -1; });
  if (missing.length) sheet.getRange(1, count + 1, 1, missing.length).setValues([missing]); SpreadsheetApp.flush();
}

function issuedPayload_(row, c, alreadyIssued) { return { ok:true, status:"issued", code:normalCode_(row[c.code]), productOrderId:String(row[c.productOrderId]||""), phone:normalPhone_(row[c.recipientPhone]), productOption:String(row[c.productOption]||"디지털 파일"), fulfillmentType:normalizeFulfillment_(row[c.fulfillmentType], row[c.productOption]), optionLocked:true, alreadyIssued:alreadyIssued, message:alreadyIssued?"이미 발급된 쿠폰입니다.":"쿠폰이 발급되었습니다." }; }
function resultPayload_(row, c, message) { return { ok:true, status:"ready", resultToken:String(row[c.resultToken]||""), resultUrl:String(row[c.resultUrl]||""), orderId:String(row[c.homepageOrderId]||""), couponCode:normalCode_(row[c.code]), label:String(row[c.resultLabel]||"완성사진"), completedAt:asIso_(row[c.resultCompletedAt]), expiresAt:asIso_(row[c.resultExpiresAt]), fileName:String(row[c.resultFileName]||"pet-id-photo.jpg"), mimeType:String(row[c.resultMime]||"image/jpeg"), message:message }; }
function normalizeFulfillment_(value, option) { const direct=String(value||"").toLowerCase(); if (["digital","print","frame"].indexOf(direct)>=0) return direct; const text=String(option||"").toLowerCase(); if (text.indexOf("액자")>=0 || text.indexOf("frame")>=0) return "frame"; if (text.indexOf("인화")>=0 || text.indexOf("print")>=0) return "print"; return "digital"; }
function resetStaleProcessing_(data, found) { if (normalStatus_(found.row[data.columns.status]) !== "processing") return; const at=asDate_(found.row[data.columns.reservedAt]); if (at && Date.now()-at.getTime() > PROCESSING_TIMEOUT_MINUTES*60000) { clearReservation_(data.sheet, found.index+1, data.columns, "issued"); SpreadsheetApp.flush(); found.row[data.columns.status]="issued"; found.row[data.columns.homepageOrderId]=""; } }
function clearReservation_(sheet, row, c, status) { set_(sheet,row,c.status,status); [c.homepageOrderId,c.resultNotifyPhone,c.reservedAt,c.backgroundKey,c.tearOption,c.petName].forEach(function(col){set_(sheet,row,col,"");}); }
function findCoupon_(values, col, code) { for (let i=1;i<values.length;i+=1) if (normalCode_(values[i][col])===code) return { index:i,row:values[i] }; return null; }
function findByValue_(values, col, value) { for (let i=1;i<values.length;i+=1) if (String(values[i][col]||"").trim()===String(value).trim()) return { index:i,row:values[i] }; return null; }
function set_(sheet,row,col,value){sheet.getRange(row,col+1).setValue(value);}
function parseImageDataUrl_(value){const match=String(value||"").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);if(!match)return null;try{return{mimeType:match[1],bytes:Utilities.base64Decode(match[2])};}catch(e){return null;}}
function mimeExtension_(mime){if(mime==="image/png")return"png";if(mime==="image/webp")return"webp";return"jpg";}
function normalCode_(v){return String(v||"").trim().toUpperCase().replace(/\s+/g,"");}
function normalPhone_(v){return String(v||"").replace(/\D/g,"");}
function normalStatus_(v){return String(v||"").trim().toLowerCase();}
function asDate_(v){if(v instanceof Date&&!isNaN(v.getTime()))return v;const d=new Date(v);return isNaN(d.getTime())?null:d;}
function asIso_(v){const d=asDate_(v);return d?d.toISOString():"";}
function couponJson_(payload){return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);}
