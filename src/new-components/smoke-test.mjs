// Smoke test: serves the production build, scrolls through all eight stages at
// desktop and phone sizes, fails on any console/page error, and saves screenshots.
//   npm run check                       (builds first, then runs this)
//   SMOKE_URL=http://localhost:5173 node scripts/smoke-test.mjs   (test a running dev server)
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const HOLDS = [0.06, 0.165, 0.405, 0.48, 0.59, 0.74, 0.87, 0.975];
const NAMES = ['01-frame', '02-handover', '03-assembly', '04-ready', '05-quality', '06-transport', '07-dealer', '08-ride'];
const OUT = process.env.SMOKE_OUT || 'smoke-screenshots';
const EXPECT_3D = process.env.SMOKE_NO_WEBGL_CHECK !== '1';
mkdirSync(OUT, { recursive: true });

let server;
let url = process.env.SMOKE_URL;
if (!url) {
  url = 'http://localhost:4173/';
  server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'pipe', shell: process.platform === 'win32' });
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('vite preview did not start')), 20000);
    server.stdout.on('data', (d) => { if (String(d).includes('4173')) { clearTimeout(t); resolve(); } });
    server.on('exit', (c) => reject(new Error('vite preview exited ' + c)));
  });
}

const errors = [];
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
});

async function run(label, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => errors.push(`[${label}] pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`[${label}] console: ${m.text()}`); });
  page.on('requestfailed', (r) => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) errors.push(`[${label}] request failed: ${r.url()}`); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__journey !== undefined, null, { timeout: 30000 });

  for (let i = 0; i < HOLDS.length; i++) {
    const y = await page.evaluate((h) => {
      const t = document.getElementById('journey');
      const s = document.getElementById('stage');
      const top = t.getBoundingClientRect().top + window.scrollY;
      return top + h * (t.offsetHeight - s.clientHeight);
    }, HOLDS[i]);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForFunction((h) => Math.abs(window.__journey.p - h) < 0.002, HOLDS[i], { timeout: 15000 });
    await page.waitForTimeout(150);
    const info = await page.evaluate(() => {
      const r = window.__journey.renderer.info.render;
      const vis = [...document.querySelectorAll('.hblock')].map((b) => Number(getComputedStyle(b).opacity));
      return { triangles: r.triangles, calls: r.calls, active: vis.findIndex((o) => o > 0.9), rail: document.querySelector('.ri.on .rn')?.textContent };
    });
    if (info.active !== i) errors.push(`[${label}] stage ${i + 1}: expected headline ${i + 1} visible, got ${info.active + 1}`);
    if (info.rail !== String(i + 1).padStart(2, '0')) errors.push(`[${label}] stage ${i + 1}: rail shows ${info.rail}`);
    if (EXPECT_3D && info.triangles < 2000) errors.push(`[${label}] stage ${i + 1}: only ${info.triangles} triangles rendered`);
    await page.screenshot({ path: `${OUT}/${label}-${NAMES[i]}.png` });
    console.log(`${label} ${NAMES[i]}  p=${HOLDS[i]}  draw calls=${info.calls}  triangles=${info.triangles}`);
  }
  await page.close();
}

try {
  await run('desktop', { width: 1440, height: 900 });
  await run('mobile', { width: 390, height: 844 });
} finally {
  await browser.close();
  if (server) server.kill();
}

if (errors.length) {
  console.error('\nSMOKE TEST FAILED\n' + errors.join('\n'));
  process.exit(1);
}
console.log(`\nSmoke test passed. Screenshots in ./${OUT}`);
