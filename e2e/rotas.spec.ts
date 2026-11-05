/** Rotas públicas: carregamento, erros de execução, links, overflow e acessibilidade (axe). */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const DEMO = process.env.E2E_DEMO !== "0";
const ROTAS = ["/", "/mapa", "/expositor", "/expositor?estande=A-12", "/visitante", "/admin"];

function capturarErros(page: Page) {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource.*(google|gstatic)/i.test(m.text())) erros.push(`console: ${m.text()}`);
  });
  return erros;
}

for (const rota of ROTAS) {
  test(`rota ${rota}: carrega sem erros, com h1 e sem rolagem horizontal`, async ({ page }) => {
    const erros = capturarErros(page);
    const resp = await page.goto(rota, { waitUntil: "load" });
    expect(resp?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForTimeout(800);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "rolagem horizontal").toBeLessThanOrEqual(1);
    expect(erros).toEqual([]);
  });

  test(`rota ${rota}: sem violações de acessibilidade graves (axe)`, async ({ page }) => {
    await page.goto(rota, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const r = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).exclude("iframe").exclude("canvas").analyze();
    const graves = r.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(graves.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
  });
}

test("links internos da home respondem 200", async ({ page, request }) => {
  await page.goto("/");
  const hrefs = await page.$$eval("a[href^='/']", (as) => [...new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!.split("#")[0] || "/"))]);
  expect(hrefs.length).toBeGreaterThan(3);
  for (const h of hrefs) {
    if (!DEMO && h.startsWith("/admin")) continue;
    const r = await request.get(h);
    expect(r.status(), h).toBe(200);
  }
});

test("/admin: disponível só no modo demonstração", async ({ request }) => {
  for (const r of ["/admin", "/admin/lojistas", "/admin/visitantes", "/admin/estandes"]) {
    const resp = await request.get(r);
    expect(resp.status(), r).toBe(DEMO ? 200 : 404);
  }
});

test("rota inexistente responde 404", async ({ request }) => {
  expect((await request.get("/nao-existe-xyz")).status()).toBe(404);
});
