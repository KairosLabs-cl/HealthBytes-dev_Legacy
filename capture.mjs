import { chromium } from 'playwright';
import fs from 'fs';

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
const outDir = '/Users/benja/Proyects/Code/work/HealthBytes-dev/healthbytes-ui-extraction/screenshots';
const baseUrl = 'http://localhost:8081';

const results = [];
const bugs = [];

(async () => {
  const browser = await chromium.launch();
  
  for (const route of routes) {
    for (const vp of viewports) {
      for (const theme of themes) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme
        });
        const page = await context.newPage();
        
        try {
          const res = await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle', timeout: 15000 });
          // wait a bit for any client-side rendering
          await page.waitForTimeout(2000);
          
          const filename = `${route.name}.png`;
          const savePath = `${outDir}/${vp.name}/${theme}/${filename}`;
          
          await page.screenshot({ path: savePath, fullPage: true });
          
          let sourceFile = 'frontend/app' + (route.path === '/' ? '/index.tsx' : route.path + '.tsx');
          // Fix known paths
          if (route.path === '/orders/1') sourceFile = 'frontend/app/orders/[id].tsx';
          if (route.path === '/product/1') sourceFile = 'frontend/app/product/[id].tsx';
          if (route.path === '/login') sourceFile = 'frontend/app/(auth)/login.tsx';

          results.push({
            id: `${route.name}-${vp.name}-${theme}`,
            screenName: route.name,
            route: route.path,
            viewport: `${vp.width}x${vp.height}`,
            theme: theme,
            screenshot: `screenshots/${vp.name}/${theme}/${filename}`,
            sourceFiles: [sourceFile],
            state: "default",
            notes: "Captured successfully"
          });
          
          console.log(`Captured ${route.path} - ${vp.name} - ${theme}`);
        } catch (e) {
          console.error(`Failed ${route.path} - ${vp.name} - ${theme}:`, e.message);
          bugs.push(`- Route \`${route.path}\` failed to load/capture in ${vp.name}/${theme}. Error: ${e.message}`);
        } finally {
          await context.close();
        }
      }
    }
  }
  
  await browser.close();
  
  fs.writeFileSync('/Users/benja/Proyects/Code/work/HealthBytes-dev/healthbytes-ui-extraction/metadata/screens.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('/Users/benja/Proyects/Code/work/HealthBytes-dev/healthbytes-ui-extraction/metadata/script-bugs.json', JSON.stringify(bugs, null, 2));
  
  console.log("Extraction complete!");
})();
