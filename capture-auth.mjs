import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function prompt(q) { return new Promise(r => rl.question(q, r)); }

// --- Configuration ---
const routes = [
  { path: '/', name: 'home' },
  { path: '/login', name: 'login' },
  { path: '/addresses', name: 'addresses' },
  { path: '/all-products', name: 'all-products' },
  { path: '/cart', name: 'cart' },
  { path: '/checkout-v2', name: 'checkout-v2' },
  { path: '/dietary-preferences', name: 'dietary-preferences' },
  { path: '/messages', name: 'messages' },
  { path: '/recently-viewed', name: 'recently-viewed' },
  { path: '/search', name: 'search' },
  { path: '/security', name: 'security' },
  { path: '/support', name: 'support' },
  { path: '/wishlist', name: 'wishlist' },
  { path: '/profile', name: 'profile' },
  { path: '/profile-settings', name: 'profile-settings' },
  { path: '/orders', name: 'orders' },
  { path: '/orders/1', name: 'order-detail' },
  { path: '/payment/failure', name: 'payment-failure' },
  { path: '/payment/pending', name: 'payment-pending' },
  { path: '/payment/success', name: 'payment-success' },
  { path: '/product/1', name: 'product-detail' }
];

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

const themes = ['light', 'dark'];
const baseUrl = 'http://localhost:8081';
const outDir = path.resolve('healthbytes-ui-extraction/screenshots');
const metaDir = path.resolve('healthbytes-ui-extraction/metadata');
const authStateFile = path.resolve('.auth/healthbytes-auth.json');

const results = [];
const bugs = [];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getSourceFile(routePath) {
  if (routePath === '/') return 'frontend/app/index.tsx';
  if (routePath === '/login') return 'frontend/app/(auth)/login.tsx';
  if (routePath === '/orders/1') return 'frontend/app/orders/[id].tsx';
  if (routePath === '/product/1') return 'frontend/app/product/[id].tsx';
  return 'frontend/app' + routePath + '.tsx';
}

// --- Phase 1: Interactive Login ---
async function loginAndSaveState() {
  console.log('\n=== Authenticated UI Extraction ===\n');
  console.log('--- PHASE 1: LOGIN ---');
  console.log('Opening browser. Please log in via Google.\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const url = page.url();
  const isAlreadyAuthed = url.includes('localhost:8081') && !url.includes('/login');
  
  if (isAlreadyAuthed) {
    console.log('Already logged in! Saving session...\n');
  } else {
    console.log('Not logged in. Redirecting to login page...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log('Browser is open on the login page.');
    console.log('Please sign in with Google, wait for the app to load, then press ENTER.\n');
    await prompt('Press ENTER when you are logged in and see the app: ');
  }
  
  // Save storage state (cookies + localStorage)
  ensureDir(path.dirname(authStateFile));
  const storageState = await page.context().storageState();
  fs.writeFileSync(authStateFile, JSON.stringify(storageState, null, 2));
  console.log(`\nSession saved to: ${authStateFile}`);
  
  await browser.close();
  console.log('Login phase complete.\n');
}

// --- Phase 2: Screenshots ---
async function captureWithAuth() {
  console.log('--- PHASE 2: EXTRACTION ---\n');
  
  const storageState = JSON.parse(fs.readFileSync(authStateFile, 'utf-8'));
  const browser = await chromium.launch({ headless: false });
  
  let total = 0;
  const totalExpected = routes.length * viewports.length * themes.length;
  
  for (const route of routes) {
    for (const vp of viewports) {
      for (const theme of themes) {
        total++;
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
          storageState: authStateFile,
        });
        const page = await context.newPage();
        
        try {
          console.log(`[${total}/${totalExpected}] Capturing ${route.path} (${vp.name}, ${theme})...`);
          await page.goto(`${baseUrl}${route.path}`, { 
            waitUntil: 'networkidle', 
            timeout: 15000 
          });
          await page.waitForTimeout(2000);
          
          const themeDir = path.join(outDir, vp.name, theme, 'authenticated');
          ensureDir(themeDir);
          
          const filename = `${route.name}.png`;
          const savePath = path.join(themeDir, filename);
          
          await page.screenshot({ path: savePath, fullPage: true });
          
          results.push({
            id: `${route.name}-${vp.name}-${theme}-authenticated`,
            screenName: route.name,
            route: route.path,
            viewport: `${vp.width}x${vp.height}`,
            theme: theme,
            screenshot: `screenshots/${vp.name}/${theme}/authenticated/${filename}`,
            sourceFiles: [getSourceFile(route.path)],
            state: "authenticated",
            notes: "Captured with saved session"
          });
          
          console.log(`  ✓ Done`);
        } catch (e) {
          console.error(`  ✗ Failed: ${e.message}`);
          bugs.push(`- Route \`${route.path}\` failed in ${vp.name}/${theme} (authenticated). Error: ${e.message}`);
        } finally {
          await context.close();
        }
      }
    }
  }
  
  await browser.close();
  
  // Save metadata
  ensureDir(metaDir);
  fs.writeFileSync(
    path.join(metaDir, 'screens-authenticated.json'), 
    JSON.stringify(results, null, 2)
  );
  fs.writeFileSync(
    path.join(metaDir, 'script-bugs-authenticated.json'), 
    JSON.stringify(bugs, null, 2)
  );
  
  console.log('\n=== Extraction Complete ===');
  console.log(`Screenshots: ${results.length}`);
  console.log(`Errors: ${bugs.length}`);
  console.log(`Metadata: healthbytes-ui-extraction/metadata/screens-authenticated.json`);
}

// --- Main ---
async function main() {
  // If auth state doesn't exist, do login first
  if (!fs.existsSync(authStateFile)) {
    await loginAndSaveState();
  } else {
    console.log('\n=== Authenticated UI Extraction ===\n');
    console.log(`Found saved session: ${authStateFile}`);
    const reuse = await prompt('Reuse saved session? (y/n): ');
    if (reuse.trim().toLowerCase() === 'n') {
      await loginAndSaveState();
    } else {
      console.log('Using saved session.\n');
    }
  }
  
  await captureWithAuth();
  rl.close();
}

main().catch(e => {
  console.error('Fatal error:', e);
  rl.close();
  process.exit(1);
});
