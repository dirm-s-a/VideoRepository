import { chromium } from "playwright";
import { join } from "path";

const BASE = "http://localhost:3002";
const OUT = join(import.meta.dirname, "public", "manual");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Login
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="username"], input[type="text"]', "admin");
  await page.fill('input[type="password"]', "admin");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/", { timeout: 10000 });
  console.log("Logged in");

  // 1. Dashboard
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, "dashboard.png"), fullPage: false });
  console.log("dashboard.png");

  // 2. Videos
  await page.goto(`${BASE}/videos`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, "videos.png"), fullPage: false });
  console.log("videos.png");

  // 3. Playlists
  await page.goto(`${BASE}/playlists`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, "playlists.png"), fullPage: false });
  console.log("playlists.png");

  // 3b. Playlist editor - click first playlist
  const firstPlaylist = page.locator('a[href*="/playlists/"], tr:has(td) >> nth=0').first();
  if (await firstPlaylist.isVisible()) {
    await firstPlaylist.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(OUT, "playlist-editor.png"), fullPage: false });
    console.log("playlist-editor.png");
  } else {
    console.log("No playlist found to click, skipping playlist-editor");
  }

  // 4. Llamadores
  await page.goto(`${BASE}/llamadores`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, "llamadores.png"), fullPage: false });
  console.log("llamadores.png");

  // 5. Llamador config modal - click llamadorPB settings (last row)
  const settingsBtns = page.locator('button:has(svg.lucide-settings)');
  const count = await settingsBtns.count();
  // Click the last one which is llamadorPB (sorted alphabetically, PB is last)
  if (count > 0) {
    await settingsBtns.nth(count - 1).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(OUT, "llamador-config.png"), fullPage: false });
    console.log("llamador-config.png");

    // 5b. Expand "Configuración Central" accordion
    const configAccordion = page.locator('button:has-text("Configuración Central")');
    if (await configAccordion.isVisible()) {
      await configAccordion.scrollIntoViewIfNeeded();
      await configAccordion.click();
      await page.waitForTimeout(2000);

      // Scroll modal so the tab bar + content fills the viewport
      // Find the modal's scrollable container and scroll to show the tab area
      await page.evaluate(() => {
        // The modal overlay with overflow-y-auto
        const scrollable = document.querySelector('[class*="fixed"][class*="overflow-y-auto"]')
          || document.querySelector('[class*="overflow-y-auto"]');
        if (scrollable) {
          // Scroll to bottom so config editor tabs are visible
          scrollable.scrollTop = scrollable.scrollHeight;
        }
      });
      await page.waitForTimeout(1000);

      // Marquesina tab screenshot (default active tab)
      await page.screenshot({ path: join(OUT, "llamador-config-tabs.png"), fullPage: false });
      console.log("llamador-config-tabs.png");

      // 5c. Click "Clima" tab
      const climaTab = page.locator('button:has-text("Clima")');
      if (await climaTab.isVisible()) {
        await climaTab.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: join(OUT, "llamador-config-clima.png"), fullPage: false });
        console.log("llamador-config-clima.png");
      }

      // 5d. Click "Voz" tab
      const vozTab = page.locator('button:has-text("Voz")');
      if (await vozTab.isVisible()) {
        await vozTab.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: join(OUT, "llamador-config-voz.png"), fullPage: false });
        console.log("llamador-config-voz.png");
      }
    } else {
      console.log("Config accordion not found");
    }

    // Close modal
    const closeBtn = page.locator('button:has-text("Cancelar")').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
    await page.waitForTimeout(500);
  } else {
    console.log("No settings buttons found");
  }

  // 6. Ubicaciones
  await page.goto(`${BASE}/ubicaciones`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, "ubicaciones.png"), fullPage: false });
  console.log("ubicaciones.png");

  // 7. Estadisticas
  await page.goto(`${BASE}/estadisticas`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, "estadisticas.png"), fullPage: false });
  console.log("estadisticas.png");

  // 8. Usuarios (now with roles)
  await page.goto(`${BASE}/usuarios`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, "usuarios.png"), fullPage: false });
  console.log("usuarios.png");

  // 9. Database (now with scheduled backups)
  await page.goto(`${BASE}/database`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, "database.png"), fullPage: false });
  console.log("database.png");

  // 10. Login page
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(OUT, "login.png"), fullPage: false });
  console.log("login.png");

  await browser.close();
  console.log("Done! All screenshots saved to", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
