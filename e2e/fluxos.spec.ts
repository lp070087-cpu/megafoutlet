/** Fluxos de interação: navegação, mapa 2D, canais oficiais (público) e formulários/admin (demo). */
import { expect, test } from "@playwright/test";

/** Padrão do site publicado: modo demonstração ativo. E2E_DEMO=0 testa um build com NEXT_PUBLIC_MODO_DEMO=0. */
const DEMO = process.env.E2E_DEMO !== "0";

async function abrirMapa2D(page: import("@playwright/test").Page, url = "/mapa") {
  await page.goto(url);
}

test("home: CTAs levam a expositor e visitante", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Quero ser expositor" }).first().click();
  await expect(page).toHaveURL(/\/expositor/);
  await page.goto("/");
  await page.getByRole("link", { name: "Sou visitante" }).first().click();
  await expect(page).toHaveURL(/\/visitante/);
});

test("menu: abre, lista seções e fecha ao escolher (mobile)", async ({ page, isMobile }) => {
  test.skip(!isMobile, "menu hambúrguer só no mobile");
  await page.goto("/");
  const botao = page.getByRole("button", { name: "Abrir menu" });
  await botao.click();
  const menu = page.locator("#menu-mobile");
  await expect(menu).toBeVisible();
  await expect(page.locator("main")).toHaveAttribute("inert", "");
  await menu.getByRole("link", { name: /FAQ/ }).click();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/#faq/);
});

test("FAQ: acordeão abre e fecha", async ({ page }) => {
  await page.goto("/#faq");
  const perguntas = page.locator("#faq button[aria-expanded]");
  await expect(perguntas.first()).toHaveAttribute("aria-expanded", "true");
  await perguntas.nth(2).click();
  await expect(perguntas.nth(2)).toHaveAttribute("aria-expanded", "true");
  await expect(perguntas.first()).toHaveAttribute("aria-expanded", "false");
});

test("contadores do hero chegam aos valores calculados", async ({ page }) => {
  await page.goto("/");
  const lista = page.locator("dl").first();
  await lista.scrollIntoViewIfNeeded(); // animam ao entrar na tela
  const visivel = lista.locator("dd [aria-hidden]");
  await expect(visivel.nth(0)).toHaveText("5");
  await expect(visivel.nth(1)).toHaveText("12h");
  await expect(visivel.nth(2)).toHaveText("300+");
  // valor final sempre disponível para leitores de tela
  await expect(lista.locator("dd .sr-only").nth(2)).toHaveText("300+");
});

test("mapa 2D: busca, seleção, detalhe e link de interesse", async ({ page }) => {
  await abrirMapa2D(page);
  const busca = page.getByRole("combobox", { name: /Buscar estande/ });
  await busca.fill("A12");
  await busca.press("Enter");
  const detalhe = page.getByRole("dialog");
  await expect(detalhe.getByRole("heading", { name: "Nº A12" })).toBeVisible();
  await expect(detalhe).toContainText("3 × 3 m");
  await expect(detalhe).toContainText("9 m²");
  await expect(detalhe).toContainText("Não confirmado");
  await expect(detalhe.getByRole("link", { name: /Tenho interesse/ })).toHaveAttribute("href", "/expositor?estande=A-12");
  await page.keyboard.press("Escape");
  await expect(detalhe).toBeHidden();
});

test("mapa 2D: indicadores somam 275 e filtros alteram a contagem", async ({ page }) => {
  await abrirMapa2D(page);
  const ind = page.getByRole("list", { name: "Indicadores de disponibilidade" });
  await expect(ind).toContainText("275");
  await page.getByLabel("Setor", { exact: true }).selectOption("Feirinha");
  await expect(page.getByText("20 espaços encontrados")).toBeVisible();
});

test("mapa 2D: deep link ?estande= abre o detalhe", async ({ page }) => {
  await page.goto("/mapa?estande=F-05");
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Nº F05" })).toBeVisible();
});

test.describe("build público (sem coleta de dados)", () => {
  test.skip(DEMO, "somente com E2E_DEMO=0 (build NEXT_PUBLIC_MODO_DEMO=0)");

  test("expositor: mostra canais oficiais com o estande escolhido na mensagem", async ({ page }) => {
    await page.goto("/expositor?estande=A-12");
    await expect(page.getByText("Espaço escolhido no mapa")).toBeVisible();
    const wa = page.getByRole("link", { name: /Falar no WhatsApp/ });
    const href = decodeURIComponent((await wa.getAttribute("href")) ?? "");
    expect(href).toContain("wa.me/5581999791317");
    expect(href).toContain("espaço A12");
    await expect(page.locator("form")).toHaveCount(0);
  });

  test("visitante: sem formulário de dados pessoais", async ({ page }) => {
    await page.goto("/visitante");
    await expect(page.getByRole("region", { name: /Informações para a sua visita/ })).toBeVisible();
    await expect(page.locator("form")).toHaveCount(0);
  });

  test("rodapé não expõe área administrativa", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer a[href='/admin']")).toHaveCount(0);
  });
});

test.describe("modo demonstração (formulários e admin)", () => {
  test.skip(!DEMO, "somente no modo demonstração");

  test("expositor: valida, envia e confirma sem reserva", async ({ page }) => {
    await abrirMapa2D(page);
    const busca = page.getByRole("combobox", { name: /Buscar estande/ });
    await busca.fill("A12");
    await busca.press("Enter");
    const detalhe = page.getByRole("dialog");
    await expect(detalhe).toContainText("9 m²");
    await detalhe.getByRole("link", { name: /Tenho interesse/ }).click();
    await expect(page).toHaveURL(/\/expositor\?estande=A-12/);
    await page.getByRole("button", { name: /Enviar meu interesse/ }).click();
    await expect(page.locator("[aria-invalid=true]").first()).toBeFocused();
    await page.locator("[name=responsavel]").fill("Teste Automatizado");
    await page.locator("[name=marca]").fill("Loja Exemplo E2E");
    await page.locator("[name=whatsapp]").fill("81999990000");
    await page.locator("[name=email]").fill("e2e@demo.local");
    await page.locator("[name=categoria]").selectOption("Calçados");
    await page.locator("[name=cidade]").fill("Olinda");
    await page.locator("[name=uf]").selectOption("PE");
    await page.locator("[name=consentimento]").check();
    await expect(page.locator("[name=whatsapp]")).toHaveValue("(81) 99999-0000");
    await expect(page.locator("[name=dimensao]")).toHaveValue("3x3");
    await page.getByRole("button", { name: /Enviar meu interesse/ }).click();
    await expect(page.getByRole("status")).toContainText(/NÃO garante reserva/i);
    const salvo = await page.evaluate(() => JSON.parse(localStorage.getItem("mfo.demo.lojistas.v1") ?? "[]"));
    expect(salvo[0]).toMatchObject({ marca: "Loja Exemplo E2E", estandeInteresse: "A-12", status: "novo" });
  });

  test("visitante: confirma e bloqueia duplicidade", async ({ page }) => {
    await page.goto("/visitante");
    await page.locator("[name=nome]").fill("Visitante E2E");
    await page.locator("[name=contato]").fill("E2E.Visita@Demo.local");
    await page.locator("[name=consentimento]").check();
    await page.getByRole("button", { name: /Confirmar/ }).click();
    await expect(page.getByRole("status")).toContainText(/Não é ingresso/i);
    await page.goto("/visitante");
    await page.locator("[name=nome]").fill("Visitante E2E");
    await page.locator("[name=contato]").fill(" e2e.visita@demo.local ");
    await page.locator("[name=consentimento]").check();
    await page.getByRole("button", { name: /Confirmar/ }).click();
    await expect(page.getByRole("status")).toContainText(/já confirmou/i);
  });

  test("admin: entra, carrega dados fictícios e status reflete no mapa", async ({ page }) => {
    test.skip(process.env.E2E_ADMIN_DEMO === "0", "painel restrito no deploy público");
    await page.goto("/admin");
    await page.getByRole("button", { name: "Entrar no modo demonstração" }).click();
    await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
    await page.getByRole("button", { name: /Carregar dados fictícios/ }).click();
    await expect(page.getByRole("status").filter({ hasText: /25 lojistas e 60 visitantes adicionados/ })).toBeVisible();
    const nav = page.getByRole("navigation", { name: /^Administração/ });
    await nav.getByRole("link", { name: "Lojistas", exact: true }).click();
    await page.locator("#lojista-busca").fill("loja inexistente e2e");
    await expect(page.getByRole("heading", { name: "Nenhuma solicitação com esses filtros" })).toBeVisible();
    await nav.getByRole("link", { name: "Visitantes", exact: true }).click();
    await page.locator("#visitante-busca").fill("visitante inexistente e2e");
    await expect(page.getByText(/Nenhum visitante/).first()).toBeVisible();
    await nav.getByRole("link", { name: "Estandes", exact: true }).click();
    await page.getByLabel("Código do espaço").fill("A-12");
    await page.getByLabel("Status administrativo local").selectOption("vendido");
    await page.getByRole("button", { name: "Confirmar alteração local" }).click();
    await expect(page.getByRole("status").filter({ hasText: /Histórico registrado/ })).toBeVisible();
    await abrirMapa2D(page);
    const ind = page.getByRole("list", { name: "Indicadores de disponibilidade" });
    await expect(ind).toContainText(/1\s*Ocupado/);
    await expect(ind).toContainText(/274\s*Não confirmado/);
  });
});
