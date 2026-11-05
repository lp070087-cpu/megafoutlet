import { expect, test } from "@playwright/test";

for (const rota of ["/", "/mapa"]) {
  test(`mapa 2D em ${rota}: enquadramento estático e tela cheia`, async ({ page }) => {
    await page.goto(rota);
    const card = page.locator('[data-planta="card"]');
    await expect(card).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    const quadro = await card.getAttribute("viewBox");
    await page.getByRole("button", { name: "Ver mapa em tela cheia" }).click();
    const dialogo = page.getByRole("dialog", { name: "Mapa em tela cheia" });
    const planta = dialogo.locator('[data-planta="ampliada"]');
    await expect(planta).toHaveAttribute("viewBox", quadro!);
    const largura = (await planta.boundingBox())!.width;
    await dialogo.getByRole("button", { name: "Ampliar mapa" }).click();
    await expect.poll(async () => (await planta.boundingBox())!.width).toBeGreaterThan(largura);
    await planta.locator('[data-estande="A-12"]').click();
    await expect(dialogo.getByRole("heading", { name: "Nº A12" })).toBeVisible();
    await dialogo.getByRole("button", { name: "Fechar tela cheia" }).click();
    await expect(dialogo).toBeHidden();
    await expect(card).toHaveAttribute("viewBox", quadro!);
  });
}

test("layout responsivo: larguras alvo sem overflow nem sobreposição dos filtros", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "matriz cobre todas as larguras em um navegador");
  test.setTimeout(180_000);
  for (const width of [320, 375, 390, 414, 430, 768, 1024]) {
    await page.setViewportSize({ width, height: 850 });
    for (const rota of ["/", "/mapa", "/expositor", "/visitante"]) {
      await page.goto(rota);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${rota} em ${width}px`).toBeLessThanOrEqual(width);
      if (rota !== "/" && rota !== "/mapa") continue;
      const caixas = await page.locator('[aria-label="Filtros do mapa"] select').evaluateAll(els => els.map(el => {
        const {left, right, top, bottom} = el.getBoundingClientRect();
        return {left, right, top, bottom};
      }));
      expect(caixas).toHaveLength(3);
      for (const [i, a] of caixas.entries()) {
        expect(a.right - a.left).toBeGreaterThanOrEqual(120);
        for (const b of caixas.slice(i + 1)) {
          expect(a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top).toBe(false);
        }
      }
    }
  }
});
