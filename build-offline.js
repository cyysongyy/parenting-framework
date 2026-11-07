// 由 src/index.src.html（原始碼）產生單一檔案離線版 demo-offline.html：node build-offline.js
// 注意：根目錄的 index.html 是另外上傳的視覺改版版本，不會被這個指令覆蓋。
const fs = require('fs');
const fw = fs.readFileSync('framework.json', 'utf8');
const gen = fs.readFileSync('generator.js', 'utf8');
let html = fs.readFileSync('src/index.src.html', 'utf8');
html = html.replace('<script src="generator.js"></script>', '<script>window.FW_EMBED=' + fw + ';</script>\n<script>' + gen + '</script>');
html = html.replace("await fetch('framework.json').then(r=>r.json()).catch(()=>null)||window.FW_EMBED", 'window.FW_EMBED');
fs.writeFileSync('demo-offline.html', html);
console.log('已產生 demo-offline.html（' + Math.round(html.length / 1024) + ' KB）');
