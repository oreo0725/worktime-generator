function pad(n) {
  return String(n).padStart(2, '0');
}
function formatDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatDateTime(d) {
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function addDays(d, n) {
  const t = new Date(d.getTime());
  t.setDate(t.getDate() + n);
  return t;
}
function minutesBetween(startHour, startMin, endHour, endMin) {
  const arr = [];
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;
  for (let m = start; m <= end; m++) arr.push(m);
  return arr;
}
export function buildCandidateSlots(startDate, endDate, holidayMap = {}) {
  const candidates = [];
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const minutes = minutesBetween(8, 30, 16, 30);
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    const key = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    if (holidayMap && holidayMap[key]) continue;
    for (const m of minutes) {
      const hour = Math.floor(m / 60);
      const min = m % 60;
      const slot = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, min, 0, 0);
      candidates.push(formatDateTime(slot));
    }
  }
  return candidates;
}