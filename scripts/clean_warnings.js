import fs from 'fs';

const paths = [
  'apps/mobile/android/app/src/main/java/com/samyukt/doit/overlay/BubbleService.kt',
  'apps/mobile/src/native/overlay/BubbleService.kt'
];

for (const p of paths) {
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace('val newAccessToken = dataObj.optString("accessToken", null)', 'val newAccessToken = if (dataObj.has("accessToken")) dataObj.getString("accessToken") else null');
  c = c.replace('val newRefreshToken = dataObj.optString("refreshToken", null)', 'val newRefreshToken = if (dataObj.has("refreshToken")) dataObj.getString("refreshToken") else null');
  fs.writeFileSync(p, c, 'utf8');
}
console.log('Cleaned up optString warnings!');

