const fs = require('fs');
const xml = fs.readFileSync('C:/Users/karan/.gemini/antigravity/brain/85f48d90-313b-40d1-b202-6857dc27da6f/uidump_bugs.xml', 'utf8');
const tags = xml.split('><');
for (const tag of tags) {
  const boundsMatch = tag.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
  const textMatch = tag.match(/text="([^"]*)"/);
  const classMatch = tag.match(/class="([^"]*)"/);
  if (boundsMatch) {
    const [, x1, y1, x2, y2] = boundsMatch.map(Number);
    const h = y2 - y1;
    const txt = textMatch ? textMatch[1] : '';
    const cls = classMatch ? classMatch[1] : '';
    if (h > 40 || txt) {
      console.log(`[${x1},${y1}]-[${x2},${y2}] h=${h} ${cls} text="${txt}"`);
    }
  }
}

