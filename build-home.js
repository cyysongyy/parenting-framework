// 產生簡化首頁 index.html：node build-home.js
// 樣式與頁首沿用 full.html（完整內容頁），資料與產生器直接內嵌，單一檔案可離線開啟。
const fs = require('fs');
const full = fs.readFileSync('full.html', 'utf8');
const styles = [...full.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const masthead = (full.match(/<header class="masthead">[\s\S]*?<\/header>/) || [''])[0].replace('回簡易首頁', '完整內容').replace('href="index.html"', 'href="full.html"').replace('← ', '');
let html = fs.readFileSync('src/home.src.html', 'utf8');
const css = fs.readFileSync('src/home.css', 'utf8');
html = html.replace('/*STYLES*/', () => styles + '\n' + css)
  .replace('<!--MASTHEAD-->', () => masthead)
  .replace('/*FW*/', () => fs.readFileSync('framework.json', 'utf8'))
  .replace('/*GEN*/', () => fs.readFileSync('generator.js', 'utf8'));
fs.writeFileSync('index.html', html);
console.log('已產生 index.html（' + Math.round(html.length / 1024) + ' KB）');
