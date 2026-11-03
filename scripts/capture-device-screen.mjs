import { execSync } from 'child_process';
import fs from 'fs';

const targetPath = process.argv[2] || 'C:/Users/karan/.gemini/antigravity/brain/85f48d90-313b-40d1-b202-6857dc27da6f/device_screen.png';
const buffer = execSync('adb -s 3086027538000H5 exec-out screencap -p');
fs.writeFileSync(targetPath, buffer);
console.log(`Saved screenshot (${buffer.length} bytes) to ${targetPath}`);

