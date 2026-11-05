import { test, expect } from "@playwright/test";

for (const [nome, url] of [["landing", "/"], ["pagina", "/mapa"]] as const) {
  test(`maquete arquitetônica: ${nome}, câmera e seleção`, async ({ page }, info) => {
    const erros: string[] = [];
    page.on("pageerror", e => erros.push(e.message));
    page.on("console", m => { if (m.type() === "error" && /webgl|shader|three|framebuffer/i.test(m.text())) erros.push(m.text()); });
    await page.goto(url);
    const card = page.getByRole("article").filter({ hasText: "Explore os espaços da feira." });
    await card.scrollIntoViewIfNeeded();
    const canvas = card.locator("canvas").first();
    await expect(canvas).toHaveAttribute("data-map-version", "arquitetura-v2", { timeout: 30_000 });
    await expect(card).toContainText("Não confirmado: 275");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForTimeout(1200);
    const antes = await canvas.screenshot({ path: `test-results/maquete-${nome}-${info.project.name}.png`, scale: "css" });
    await card.getByRole("button", { name: "Ampliar mapa 3D", exact: true }).click();
    await page.waitForTimeout(700);
    expect((await canvas.screenshot({ scale: "css" })).equals(antes)).toBe(false);
    await card.getByRole("button", { name: "Isométrica", exact: true }).click();
    await card.getByRole("searchbox", { name: /Buscar espaço/ }).fill("A12");
    await card.getByRole("searchbox", { name: /Buscar espaço/ }).press("Enter");
    const detalhe = card.getByRole("dialog");
    await expect(detalhe).toContainText("A12");
    await expect(detalhe).toContainText("9 m²");
    await expect(detalhe.getByRole("link", { name: /Quero expor/ })).toHaveAttribute("href", "/expositor?estande=A-12");

    expect(erros).toEqual([]);
  });
}
