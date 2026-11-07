// 產生單一檔案、雙擊即可開啟的離線版：node build-offline.js
const fs = require('fs');
const fw = fs.readFileSync('framework.json', 'utf8');
const gen = fs.readFileSync('generator.js', 'utf8');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<script src="generator.js"></script>', '<script>window.FW_EMBED=' + fw + ';</script>\n<script>' + gen + '</script>');
html = html.replace("await fetch('framework.json').then(r=>r.json()).catch(()=>null)||window.FW_EMBED", 'window.FW_EMBED');
fs.writeFileSync('demo-offline.html', html);
console.log('已產生 demo-offline.html（' + Math.round(html.length / 1024) + ' KB）');
