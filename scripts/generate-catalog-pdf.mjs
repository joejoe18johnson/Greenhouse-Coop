#!/usr/bin/env node
/**
 * Generates public/catalog/greenhouse-coop-catalog.pdf from the live catalog page.
 * Requires the dev server: npm run dev (in another terminal), then npm run generate:catalog
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "public/catalog/greenhouse-coop-catalog.pdf");
const url = process.env.CATALOG_URL || "http://localhost:3000/catalog/download";

async function waitForServer(maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Catalog page not reachable at ${url}. Start the dev server with npm run dev first.`);
}

async function main() {
  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    console.error("Install puppeteer first: npm install -D puppeteer");
    process.exit(1);
  }

  console.log(`Waiting for ${url} ...`);
  await waitForServer();

  console.log("Launching browser...");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
    await page.waitForSelector(".catalog-document", { timeout: 120000 });

    // Scroll the full catalog so every lazy image enters the viewport and loads
    await page.evaluate(async () => {
      const delay = (ms) => new Promise((r) => setTimeout(r, ms));
      const step = Math.max(window.innerHeight - 100, 400);
      let y = 0;
      const max = document.documentElement.scrollHeight;
      while (y < max) {
        window.scrollTo(0, y);
        await delay(80);
        y += step;
      }
      window.scrollTo(0, 0);
      await delay(300);
    });

    await page.waitForFunction(
      () => {
        const imgs = document.querySelectorAll(".catalog-document img");
        if (!imgs.length) return false;
        return [...imgs].every((img) => img.complete);
      },
      { timeout: 120000 }
    );

    const imageStats = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll(".catalog-document img")];
      const loaded = imgs.filter((img) => img.complete && img.naturalWidth > 0).length;
      return { total: imgs.length, loaded };
    });
    console.log(`Catalog images loaded: ${imageStats.loaded}/${imageStats.total}`);

    await page.emulateMediaType("print");

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await page.pdf({
      path: outPath,
      format: "Letter",
      printBackground: true,
      margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
      preferCSSPageSize: true,
    });

    const stats = fs.statSync(outPath);
    console.log(`Wrote ${outPath} (${(stats.size / 1024).toFixed(0)} KB)`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
