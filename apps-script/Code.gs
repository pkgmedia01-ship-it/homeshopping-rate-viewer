/* Bound Apps Script template only. Complete readRelease_ and sheet layout mapping before deployment. */
function canonical_(value) {
  if (Array.isArray(value)) return value.map(canonical_);
  if (value && typeof value === 'object') return Object.keys(value).sort().reduce(function(out, key) { out[key] = canonical_(value[key]); return out; }, {});
  return value;
}
function hash_(value) { var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify(canonical_(value))); return bytes.map(function(b){ return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join(''); }
function prepareCandidate(month, rows) {
  var snapshot = JSON.parse(JSON.stringify(rows)); var hash = hash_({ month: month, rows: snapshot });
  return { id: 'candidate-' + month + '-' + hash.slice(0, 12), month: month, hash: hash, snapshot: snapshot, preparedBy: Session.getActiveUser().getEmail() };
}
function publishCandidate(spreadsheetId, candidate, currentRows) {
  var lock = LockService.getDocumentLock(); if (!lock.tryLock(30000)) throw new Error('publish lock required');
  try {
    var publisher = Session.getActiveUser().getEmail();
    var allowlist = JSON.parse(PropertiesService.getScriptProperties().getProperty('PUBLISHER_ALLOWLIST') || '[]');
    if (allowlist.indexOf(publisher) < 0) throw new Error('publisher not allowed');
    if (hash_({ month: candidate.month, rows: currentRows }) !== candidate.hash) throw new Error('stale candidate');
    var suffix = candidate.releaseSuffix ? '-' + candidate.releaseSuffix : '';
    var releaseId = 'release-' + candidate.month + '-' + candidate.hash.slice(0, 12) + suffix;
    var existing = readRelease_(spreadsheetId, releaseId); if (existing) { verifyReadback_(existing, candidate.hash); return existing; }
    var release = { id: releaseId, month: candidate.month, hash: candidate.hash, snapshot: candidate.snapshot, publishedBy: publisher, status: 'published' };
    if (candidate.rollbackOf) release.rollbackOf = candidate.rollbackOf;
    Sheets.Spreadsheets.batchUpdate({ requests: buildRequests_(release) }, spreadsheetId); // exactly one write request
    verifyReadback_(readRelease_(spreadsheetId, releaseId), candidate.hash); return release;
  } finally { lock.releaseLock(); }
}
function rollbackAsNewRelease(spreadsheetId, priorRelease) {
  var candidate = prepareCandidate(priorRelease.month, priorRelease.snapshot);
  candidate.releaseSuffix = 'rollback-' + Utilities.getUuid().slice(0, 8); candidate.rollbackOf = priorRelease.id;
  return publishCandidate(spreadsheetId, candidate, priorRelease.snapshot);
}
function buildRequests_(release) { return [{ addSheet: { properties: { title: 'release_' + release.id } } }, { appendCells: { sheetId: 0, rows: [{ values: [{ userEnteredValue: { stringValue: JSON.stringify(release) } }] }], fields: 'userEnteredValue' } }]; }
function verifyReadback_(release, hash) { if (!release || release.hash !== hash) throw new Error('readback verification failed'); }
function readRelease_(_spreadsheetId, _releaseId) { throw new Error('Configure sheet layout reader before deployment'); }
