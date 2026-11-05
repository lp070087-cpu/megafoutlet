# Mapa público e revisão privada

A aplicação continua usando exclusivamente os dados ilustrativos em `src/data/planta.ts`.
O mapa da home, de /mapa e do painel demonstrativo consulta a mesma base ilustrativa.

## Melhorias

- Filtros combinados de setor, dimensão e estado administrativo exato no mapa 2D.
- Planta 2D estática e inteira no card. Tela cheia com zoom e deslocamento manual.
- A imagem oficial fica no visualizador privado e continua fora do build público.
- Reservado separado de Em análise nos indicadores; chaves antigas de dados preservadas.
- Validador genérico de números duplicados, dimensões ausentes, sobreposições, rotação,
  limites e conflitos com corredores. Testes incluem casos negativos.

## Limites de segurança

O build falha se houver `src/data/oficial`, `public/planta` ou tentativa de ativar
`NEXT_PUBLIC_PLANTA_DETALHADA=1`. Foram removidos os aliases da planta oficial.
O painel de demonstração responde 404 em builds Vercel. Localmente, funciona como
simulador com dados fictícios no navegador, sem autenticação real ou compartilhamento.
Nenhum backend, reserva, pagamento ou controle administrativo real foi criado.
Sem modo demonstração, dados locais não são usados como disponibilidade oficial.

PDF, extração fiel, imagem da planta, sobreposição e relatório de revisão devem ficar
fora desta pasta e de qualquer repositório/deploy público. Não copiar a pasta privada
para `public`, `src`, documentação pública ou artefatos de publicação.

## Validação

`npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`.
Os testes de interface existentes e `e2e/filtros.spec.ts` verificam desktop e mobile.
As fontes Manrope e Bodoni Moda são carregadas localmente, com as respectivas
licenças em `src/app/fonts`. Execute `npm run build -- --webpack` se o ambiente
Windows impedir o Turbopack de iniciar seus processos auxiliares.

O mapeamento oficial herdado exige revisão humana da escala, cotas, corredores,
emergência e numeração duplicada. Evidência textual e caixas herdadas não certificam
correspondência geométrica integral nem disponibilidade.
