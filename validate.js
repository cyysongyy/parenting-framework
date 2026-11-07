// 檢查每個情境是否結構一致：node validate.js
const fw = require('./framework.json');
const REQ = ['id','domain','title','example','triggerForParent','parentIceberg','childIceberg','lecturerExperience','wedoScript','selFocus'];
const SEL = new Set(fw.core.sel.map(x=>x.id));
let ok = true;
const ids = new Set();
for (const s of fw.situations) {
  if (ids.has(s.id)) { console.log('重複 id:', s.id); ok = false; }
  ids.add(s.id);
  for (const k of REQ) if (s[k] === undefined) { console.log(s.id, '缺少欄位', k); ok = false; }
  for (const k of fw.core.fourFOrder) if (!s.wedoScript || !s.wedoScript[k]) { console.log(s.id, '4F 缺', k); ok = false; }
  for (const id of s.selFocus || []) if (!SEL.has(id)) { console.log(s.id, '未知 SEL 核心', id); ok = false; }
  if (!['emotion','behavior','interpersonal'].includes(s.domain)) { console.log(s.id, 'domain 不合法', s.domain); ok = false; }
}
console.log(ok ? '全部通過' : '有問題，請修正');
process.exit(ok ? 0 : 1);
