import fs from 'fs';
const xml = fs.readFileSync('C:/Users/karan/.gemini/antigravity/brain/85f48d90-313b-40d1-b202-6857dc27da6f/uidump_tabs.xml', 'utf8');
const regex = /<node[^>]*text="([^"]*)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"[^>]*>/g;
let m;
while ((m = regex.exec(xml)) !== null) {
  if (m[1]) {
    console.log(`text="${m[1]}" at [${m[2]},${m[3]}][${m[4]},${m[5]}]`);
  }
}
