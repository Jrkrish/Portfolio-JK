// Draws the Buy Me a Coffee QR code on the desktop widget, as a static SVG:
//
//   node tools/make_qr.mjs
//
// Black on white whatever the theme, with a four-module quiet zone, so a
// phone camera can read it off the wallpaper. Re-run if person.coffee changes.

import { writeFileSync } from "node:fs";
import QRCode from "qrcode";
import { person } from "../src/fs.js";

const svg = await QRCode.toString(person.coffee, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 4,
  color: { dark: "#000000", light: "#ffffff" },
});

const out = new URL("../public/coffee-qr.svg", import.meta.url);
writeFileSync(out, svg);
const size = svg.match(/viewBox="0 0 (\d+) \d+"/)[1];
console.log(`public/coffee-qr.svg: ${person.coffee}, ${size} modules square including the quiet zone`);
