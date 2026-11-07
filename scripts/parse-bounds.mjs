import fs from 'fs';
const xml = fs.readFileSync('screenshots/view.xml', 'utf8');
const regex = /<node [^>]*text="([^"]+)"[^>]*bounds="(\[[0-9]+,[0-9]+\]\[[0-9]+,[0-9]+\])"/g;
let m;
while ((m = regex.exec(xml)) !== null) {
  if (['Project context', 'Quick capture', 'AI provider', 'How it works', 'Shake to capture', 'Team & Members', 'APPEARANCE', 'Test shake'].some(k => m[1].includes(k))) {
    console.log(m[1], '-->', m[2]);
  }
}

