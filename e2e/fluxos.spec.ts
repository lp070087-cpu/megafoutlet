/** Fluxos de interação: navegação, mapa 2D, mapa 3D, canais oficiais (público) e formulários/admin (demo). */
import { expect, test } from "@playwright/test";

/** Padrão do site publicado: modo demonstração ativo. E2E_DEMO=0 testa um build com NEXT_PUBLIC_MODO_DEMO=0. */
const DEMO = process.env.E2E_DEMO !== "0";

async function abrirMapa2D(page: import("@playwright/test").Page, url = "/mapa") {
  await page.goto(url);
  const botao2d = page.getByRole("group", { name: "Alternar entre mapa 2D e 3D" }).getByRole("button", { name: "2d" });
  if ((await botao2d.getAttribute("aria-pressed")) !== "true") await botao2d.click();
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
  await page.getByRole("button", { name: "Feirinha" }).click();
  await expect(page.getByText(/20\s*espaços exibidos/)).toBeVisible();
});

test("mapa 2D: zoom por botão altera a escala", async ({ page }) => {
  await abrirMapa2D(page);
  const palco = page.locator("[role=application] > div").first();
  const antes = await palco.evaluate((el) => (el as HTMLElement).style.transform);
  await page.getByRole("button", { name: "Ampliar" }).click();
  await page.waitForTimeout(800);
  const depois = await palco.evaluate((el) => (el as HTMLElement).style.transform);
  expect(depois).not.toBe(antes);
});

test("mapa 2D: deep link ?estande= abre o detalhe", async ({ page }) => {
  await page.goto("/mapa?estande=F-05");
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Nº F05" })).toBeVisible();
});

test("mapa 3D: carrega cena (ou alternativa 2D) com indicadores calculados", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("article").filter({ hasText: "Explore o pavilhão." });
  await card.scrollIntoViewIfNeeded();
  await expect(card).toBeVisible();
  await expect(card.locator("canvas").or(card.getByRole("link", { name: /mapa 2D/i }).first())).toBeVisible({ timeout: 30_000 });
  await expect(card).toContainText("Demonstração ilustrativa · não oficial");
  const contagem = card.getByRole("list", { name: "Contagem de espaços por status" });
  await expect(contagem).toContainText("Não confirmado: 275");
});

test("mapa 3D: busca, setores, lista acessível e redefinir câmera", async ({ page }) => {
  await page.goto("/mapa");
  const card = page.getByRole("article").filter({ hasText: "Explore o pavilhão." });
  const temCanvas = await card.locator("canvas").waitFor({ timeout: 30_000 }).then(() => true, () => false);
  const setores = card.getByRole("group", { name: "Navegar por setor" });
  await setores.getByRole("button", { name: "Setor B" }).click();
  await expect(setores.getByRole("button", { name: "Setor B" })).toHaveAttribute("aria-pressed", "true");
  await card.getByRole("button", { name: "Lista" }).click();
  await expect(card.getByRole("region", { name: "Setor B" })).toBeVisible();
  await card.getByRole("region", { name: "Setor B" }).getByRole("button", { name: "B07" }).click();
  if (temCanvas) await expect(card.getByRole("dialog").getByRole("heading", { name: "Espaço B07" })).toBeVisible();
  const busca = card.getByRole("searchbox", { name: /Buscar espaço/ });
  await busca.fill("C03");
  await busca.press("Enter");
  if (temCanvas) {
    await expect(card.getByRole("dialog").getByRole("heading", { name: "Espaço C03" })).toBeVisible();
    await expect(card.getByRole("dialog").getByRole("link", { name: /Quero expor/ })).toHaveAttribute("href", "/expositor?estande=C-03");
  }
  await card.getByRole("button", { name: /Redefinir câmera/ }).click({ trial: !temCanvas });
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
    await page.goto("/expositor?estande=A-12");
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
    await page.goto("/admin");
    await page.getByRole("button", { name: "Entrar no modo demonstração" }).click();
    await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
    await page.getByRole("button", { name: /Carregar dados fictícios/ }).click();
    await expect(page.getByRole("status").filter({ hasText: /25 lojistas e 60 visitantes adicionados/ })).toBeVisible();
    await page.evaluate(() => {
      localStorage.setItem("mfo.demo.estandes.v1", JSON.stringify({ "A-12": "vendido", "A-11": "disponivel" }));
    });
    await abrirMapa2D(page);
    const ind = page.getByRole("list", { name: "Indicadores de disponibilidade" });
    await expect(ind).toContainText(/1\s*Ocupado/);
    await expect(ind).toContainText(/1\s*Disponível/);
    await expect(ind).toContainText(/273\s*Não confirmado/);
  });
});
