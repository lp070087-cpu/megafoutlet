import { test, expect } from "@playwright/test";
import { validarGeometria, type CaixaMapa } from "../src/lib/validar-geometria";
import { correspondeFiltro } from "../src/lib/filtros-mapa";
import { ESTANDES } from "../src/data/planta";
const limite={id:"limite",x:0,y:0,w:30,h:30};
const caixa: CaixaMapa={id:"a",numero:"12",x:2,y:2,w:3,h:4,larguraM:3,profundidadeM:4};
test("validação distingue contato de borda, sobreposição e números duplicados",()=>{
 expect(validarGeometria([caixa,{...caixa,id:"b",x:5}],limite).map(p=>p.tipo)).toEqual(["numero_duplicado"]);
 expect(validarGeometria([caixa,{...caixa,id:"b",numero:"13",x:4}],limite).map(p=>p.tipo)).toEqual(["sobreposicao"]);
});
test("validação encontra falta de dimensão, saída do limite e conflito com corredor",()=>{
 const tipos=validarGeometria([{...caixa,x:-1,larguraM:null}],limite,[{id:"rua",x:0,y:0,w:5,h:10}]).map(p=>p.tipo);
 expect(tipos).toEqual(["dimensoes_ausentes","fora_limite","conflito_corredor"]);
});
test("validação considera rotação e não aceita coordenada inválida",()=>{
 expect(validarGeometria([{...caixa,x:0,rotacao:45}],limite).some(p=>p.tipo==="fora_limite")).toBeTruthy();
 expect(validarGeometria([{...caixa,x:NaN}],limite).map(p=>p.tipo)).toEqual(["geometria_invalida"]);
});
test("filtros combinam setor, dimensão e estado administrativo exato",()=>{
 const e=ESTANDES[0],f={setor:e.setor,dimensao:e.dimensao,status:"reservado"};
 expect(correspondeFiltro(e,f,"reservado")).toBeTruthy();
 expect(correspondeFiltro(e,f,"em_negociacao")).toBeFalsy();
 expect(correspondeFiltro(e,{...f,setor:"inexistente"},"reservado")).toBeFalsy();
});
