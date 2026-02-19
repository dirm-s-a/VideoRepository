import { chromium } from "playwright";
import { join } from "path";

const BASE = "http://localhost:3000";
const OUT = join(import.meta.dirname, "public", "manualLlamador");

async function main() {
  const browser = await chromium.launch({ headless: true });

  // ── Main kiosk screenshots ──
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.waitForTimeout(3000);

  // Check if activation screen is showing
  const activateBtn = page.locator('button:has-text("Iniciar Llamador")');
  if (await activateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await page.screenshot({ path: join(OUT, "llamador-activacion.png"), fullPage: false });
    console.log("llamador-activacion.png");
    await activateBtn.click();
    await page.waitForTimeout(3000);
  } else {
    console.log("Skipping activation (kiosk mode)");
  }

  // Wait for mock mode to cycle through several patients (8s interval x 6 = ~48s)
  console.log("Waiting 50s for mock mode to populate cards...");
  await page.waitForTimeout(50000);

  // Wait for the calling overlay to disappear (IDLE or SHOW_CARD state)
  // The calling overlay has a centered card; wait until no overlay is visible
  console.log("Waiting for IDLE state...");
  for (let i = 0; i < 20; i++) {
    const overlay = page.locator('[class*="calling-overlay"], [class*="animate-"]').first();
    const isOverlayVisible = await overlay.isVisible({ timeout: 500 }).catch(() => false);
    if (!isOverlayVisible) break;
    await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(2000);

  // Main screen with cards populated
  await page.screenshot({ path: join(OUT, "PantallaPrincipalLlamador.png"), fullPage: false });
  console.log("PantallaPrincipalLlamador.png");
  await page.screenshot({ path: join(OUT, "llamador-general.png"), fullPage: false });
  console.log("llamador-general.png");
  await page.screenshot({ path: join(OUT, "llamador-horizontal.png"), fullPage: false });
  console.log("llamador-horizontal.png");

  // Weather/date-time bar - clip top
  await page.screenshot({
    path: join(OUT, "llamador-clima-fechahora.png"),
    clip: { x: 0, y: 0, width: 1920, height: 120 },
  });
  console.log("llamador-clima-fechahora.png");

  // Patient cards area - right 30% of the screen (porcentajeAncho: 30)
  await page.screenshot({
    path: join(OUT, "llamador-tarjetas.png"),
    clip: { x: 1344, y: 60, width: 576, height: 900 },
  });
  console.log("llamador-tarjetas.png");

  // ── Config panel - use evaluate to avoid overlay interception ──
  await page.evaluate(() => {
    const btn = document.querySelector('button[title="Configuración"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2500);

  // Check if config panel is open (it's a full-screen overlay)
  const configPanel = page.locator('text=Configuración').first();
  if (await configPanel.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.screenshot({ path: join(OUT, "llamador-config.png"), fullPage: false });
    console.log("llamador-config.png");

    // Export/Import bar
    const exportBtn = page.locator('button:has-text("Exportar")');
    if (await exportBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.screenshot({
        path: join(OUT, "llamador-export-import.png"),
        clip: { x: 0, y: 0, width: 1920, height: 55 },
      });
      console.log("llamador-export-import.png");
    }

    // Close config panel
    await page.evaluate(() => {
      const btn = document.querySelector('button svg.lucide-x')?.closest('button');
      if (btn) btn.click();
    });
    await page.waitForTimeout(500);
  } else {
    console.log("Config panel did not open");
  }

  await ctx.close();
  await browser.close();
  console.log("Done! All Llamador screenshots saved to", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
