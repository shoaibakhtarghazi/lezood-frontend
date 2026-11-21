// Usage:  node scripts/extract.mjs path/to/Lezood-Website-Redesign.html
// Pulls the CSS, fonts and the 3 project screenshots out of the original single-file design,
// so the React version uses exactly the same styles and assets.
import fs from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('Usage: node scripts/extract.mjs <original.html>'); process.exit(1); }
const html = fs.readFileSync(file, 'utf8');

// 1) CSS (+ fonts -> public/fonts)
let css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
css = css.replace(/@font-face\s*\{[\s\S]*?\}/g, (block) => {
  const family = block.match(/font-family:\s*'([^']+)'/)[1].replace(/\s+/g, '');
  const weight = block.match(/font-weight:\s*([^;]+);/)[1].trim().replace(/\s+/g, '-');
  const b64 = block.match(/base64,([A-Za-z0-9+/=]+)\)/)[1];
  const name = `${family}-${weight}.woff2`;
  fs.mkdirSync('public/fonts', { recursive: true });
  fs.writeFileSync(`public/fonts/${name}`, Buffer.from(b64, 'base64'));
  return block.replace(/src:\s*url\(data:[^)]+\)[^;]*;/, `src: url('/fonts/${name}') format('woff2');`);
});
fs.mkdirSync('src/styles', { recursive: true });
fs.writeFileSync('src/styles/global.css', css.trim() + '\n');

// 2) The three project screenshots
fs.mkdirSync('src/assets', { recursive: true });
const imgs = [...html.matchAll(/<img src="data:image\/jpeg;base64,([A-Za-z0-9+/=]+)"/g)];
imgs.forEach((m, i) => fs.writeFileSync(`src/assets/work-${i + 1}.jpg`, Buffer.from(m[1], 'base64')));

console.log(`CSS ${(css.length / 1024).toFixed(0)} KB · fonts → public/fonts · ${imgs.length} images → src/assets`);