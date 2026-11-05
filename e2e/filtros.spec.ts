import { test, expect } from "@playwright/test";
import { OrthographicCamera, Vector3 } from "three";
import { ESTANDES } from "../src/data/planta";
import { PISO, volume } from "../src/components/mapa3d/geometria";

test("3D: novo título, controles e seleção por clique ou toque",async({page,isMobile})=>{
 await page.goto('/mapa');
 await expect(page.getByRole('heading',{name:'Explore os espaços da feira.',exact:true})).toBeVisible();
 const canvas=page.locator('canvas').first();
 const reset=page.getByRole('button',{name:'Redefinir câmera para a visão geral do pavilhão'});
 await expect(reset).toBeEnabled({timeout:20000});
 await canvas.scrollIntoViewIfNeeded();
 await expect(canvas).toBeVisible();
 const bounds=await canvas.boundingBox();
 expect(bounds).not.toBeNull();
 const b=bounds!;
 const e=ESTANDES.filter(e=>e.serie==='principal').at(-1)!;
 const r = volume(e);
 const camera = new OrthographicCamera(-b.width / 2, b.width / 2, b.height / 2, -b.height / 2, 0.1, 2000);
 camera.position.set(150, 200, 48);
 camera.lookAt(0, 0, 0);
 camera.updateMatrixWorld();
 const corners = [-1, 1].flatMap(x => [-1, 1].flatMap(z => [-1.1, 3.6].map(y =>
   new Vector3(x * PISO.largura / 2, y, z * PISO.profundidade / 2).project(camera))));
 camera.zoom = 0.9 / Math.max(...corners.flatMap(p => [Math.abs(p.x), Math.abs(p.y)]));
 camera.updateProjectionMatrix();
 const pixel = new Vector3(r.x, 0.16, r.z).project(camera);
 const x=b.x+(pixel.x+1)*b.width/2,y=b.y+(1-pixel.y)*b.height/2;
 if(isMobile)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:'Fechar detalhes do estande'}).click();
 await page.getByRole('button',{name:'Visão superior',exact:true}).click();
 await page.getByRole('button',{name:'Isométrica',exact:true}).click();
 await reset.click();
 await expect(canvas).toBeVisible();
});
test("2D: filtros combinados, estado vazio e limpeza",async({page})=>{
 await page.goto('/mapa?vista=2d');
 await expect(page.getByRole('button',{name:'2d',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByLabel('Setor',{exact:true}).selectOption('Setor A');
 await expect(page.getByRole('status').filter({hasText:'70 espaços encontrados'})).toBeVisible();
 await page.getByLabel('Dimensão',{exact:true}).selectOption('2x2');
 await expect(page.getByRole('status').filter({hasText:'0 espaços encontrados'})).toBeVisible();
 await page.getByRole('button',{name:'Limpar filtros'}).click();
 await expect(page.getByRole('status').filter({hasText:'275 espaços encontrados'})).toBeVisible();
});
test("seleção persiste entre 2D e 3D e formulário mantém o ID",async({page})=>{
 await page.goto('/mapa?estande=A-12');
 await expect(page.getByRole('dialog')).toContainText('A12');
 await page.getByRole('button',{name:'3d',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('A12');
 await expect(page.getByRole('dialog').getByRole('link',{name:/Quero expor/})).toHaveAttribute('href','/expositor?estande=A-12');
 await page.getByRole('button',{name:'2d',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('A12');
});
test("filtro 3D usa mesma dimensão e estado da lista",async({page})=>{
 await page.goto('/mapa');
 await page.getByLabel('Setor',{exact:true}).selectOption('Setor B');
 await page.getByLabel('Disponibilidade',{exact:true}).selectOption('sem_informacao');
 await expect(page.getByRole('status').filter({hasText:'66 espaços encontrados'})).toBeVisible();
 await page.getByRole('button',{name:'Lista',exact:true}).click();
 await expect(page.getByRole('button',{name:'B01',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'A01',exact:true})).toHaveCount(0);
 await page.getByRole('button', { name: '2d', exact: true }).click();
 await expect(page.getByLabel('Setor', { exact: true })).toHaveValue('Setor B');
 await expect(page.getByRole('status').filter({hasText:'66 espaços encontrados'})).toBeVisible();
});

test("WebGL indisponível mantém o mapa 2D navegável", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value(this: HTMLCanvasElement, tipo: string, opcoes?: unknown) {
        return tipo.startsWith("webgl") ? null : Reflect.apply(original, this, [tipo, opcoes]);
      },
    });
  });
  await page.goto("/mapa");
  await page.getByRole("link", { name: /Abrir mapa 2D ilustrativo/ }).click();
  await expect(page.getByRole("button", { name: "2d", exact: true })).toHaveAttribute("aria-pressed", "true");
  const busca = page.getByRole("combobox", { name: /Buscar estande/ });
  await busca.fill("A12");
  await busca.press("Enter");
  await expect(page.getByRole("dialog")).toContainText("9 m²");
});