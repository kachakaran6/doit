import fs from 'fs';
const xml = fs.readFileSync('screenshots/now.xml', 'utf8');
const matches = [...xml.matchAll(/text="([^"]+)"/g)].map(m => m[1]);
console.log('Visible text:', matches.slice(0, 20));

