import { expect, test } from "@playwright/test";

test("2D: filtros combinados, estado vazio e limpeza", async ({ page }) => {
  await page.goto("/mapa?vista=2d");
  await page.getByLabel("Setor", { exact: true }).selectOption("Setor A");
  await expect(page.getByRole("status")).toHaveText("70 espaços encontrados");
  await page.getByLabel("Dimensão", { exact: true }).selectOption("2x2");
  await expect(page.getByRole("status")).toHaveText("0 espaços encontrados");
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page.getByRole("status")).toHaveText("275 espaços encontrados");
});

test("2D: disponibilidade, seleção por toque/clique e link de interesse", async ({ page, isMobile }) => {
  await page.goto("/mapa");
  await page.getByLabel("Setor", { exact: true }).selectOption("Setor B");
  await page.getByLabel("Disponibilidade", { exact: true }).selectOption("sem_informacao");
  await expect(page.getByRole("status")).toHaveText("66 espaços encontrados");
  const estande = page.locator('[data-planta="card"] [data-estande="B-01"]');
  if (isMobile) await estande.tap();
  else await estande.click();
  const detalhe = page.getByRole("dialog");
  await expect(detalhe.getByRole("heading", { name: "Nº B01" })).toBeVisible();
  await expect(detalhe).toContainText("4 m²");
  await expect(detalhe.getByRole("link", { name: /Tenho interesse/ })).toHaveAttribute("href", "/expositor?estande=B-01");
});
