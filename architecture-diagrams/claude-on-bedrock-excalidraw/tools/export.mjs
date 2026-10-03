import { chromium } from "playwright-core";
import fs from "fs";
const outDir = process.argv[2];
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
page.on("console", m => { if (m.type()==="error") console.error("console:", m.text()); });
page.on("pageerror", e => console.error("pageerror:", e.message));
await page.goto("http://localhost:8765/index.html");
const scenes = await page.evaluate(() => window.buildAll());
for (const [name, scene] of Object.entries(scenes)) {
  fs.writeFileSync(`${outDir}/${name}.excalidraw`, JSON.stringify(scene, null, 1));
  const svg = await page.evaluate(s => window.doExport(s), scene);
  fs.writeFileSync(`${outDir}/${name}.excalidraw.svg`, svg);
  const p2 = await browser.newPage({ deviceScaleFactor: 2 });
  await p2.setContent(`<html><body style="margin:0;background:#fff">${svg}</body></html>`);
  await p2.waitForTimeout(400);
  await (await p2.$("svg")).screenshot({ path: `${outDir}/${name}.png` });
  await p2.close();
  console.log("wrote", name);
}
await browser.close();
