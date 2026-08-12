import sharp from "sharp";
import { readFileSync } from "node:fs";

const svg = readFileSync("app/icon.svg", "utf8");

// 1) base 1024 render
const base = await sharp(Buffer.from(svg)).resize(1024, 1024).png().toBuffer();

// 2) maskable 1024: dark square canvas + base scaled to 78% centered
const maskable = await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: { r: 15, g: 23, b: 42, alpha: 1 } },
})
  .composite([{ input: base, top: 0, left: 0 }])
  .resize(819, 819)
  .extend({ top: 102, bottom: 103, left: 103, right: 102, background: { r: 15, g: 23, b: 42, alpha: 1 } })
  .png()
  .toBuffer();

const targets = [
  ["public/icon-192.png", 192, base],
  ["public/icon-512.png", 512, base],
  ["public/icon-maskable-512.png", 512, maskable],
  ["public/apple-touch-icon.png", 180, base],
];

for (const [out, size, src] of targets) {
  await sharp(src).resize(size, size).png().toFile(out);
  console.log("wrote", out, size);
}