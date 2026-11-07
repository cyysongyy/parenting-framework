// 檢查整個架構的一致性：node validate.js
const fw = require('./framework.json');
const G = require('./generator.js');
const r = G.checkCoherence(fw);
r.warns.forEach(w => console.log('注意：', w));
r.errors.forEach(e => console.log('錯誤：', e));
console.log(r.errors.length ? '有 ' + r.errors.length + ' 個問題，請修正' : '全部通過（' + fw.situations.length + ' 個情境 × 3 個年段）');
process.exit(r.errors.length ? 1 : 0);
