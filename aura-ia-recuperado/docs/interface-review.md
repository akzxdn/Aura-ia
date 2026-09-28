# Revisão da interface AURA IA

Implementação sobre o projeto recuperado, na branch local `codex/aura-interface-refinement`.

## Investigação e evidências

O repositório `akzxdn/Aura-ia` tinha somente `main`, com dois commits: `7919947` (apenas README) e `53bdf14` (upload do projeto recuperado). Os 34 arquivos em comum eram idênticos ao snapshot local inicial, por SHA de blob Git. Não há versão anterior da interface, componentes adicionais ou assets visuais recuperáveis nesse histórico. O único asset original é o favicon; o núcleo é desenhado em canvas.

Problemas comprovados no código inicial:

- `body { min-height: 500vh }` estendia o scroll da landing ao chat.
- Ausência de `.sr-only` expunha o texto auxiliar do canvas e o input nativo de arquivo.
- Título e núcleo usavam posicionamento absoluto sem limites de composição; havia sobreposição.
- Sidebar ignorava `defaultOpen`, mantinha `isMobile: false`, não ligava o trigger ao toggle e era simplesmente escondida por CSS em telas pequenas.
- Diálogos ignoravam `onOpenChange`; cancelar exclusão não executava ação. Faltavam fechamento, semântica modal e gestão de foco.
- A preferência de animação só mudava uma classe sem efeito no canvas.
- Mensagens, Markdown, anexos, configurações, exploração, estados e rodapé da sidebar tinham estilos ausentes ou incompletos.

## Direção e implementação

Grafite com superfícies de tom oliva, marfim para leitura e âmbar como único destaque principal. Títulos editoriais em serifas do sistema, composição com mais espaço e botões consistentes. Sem fontes externas, bibliotecas de animação adicionais ou imagens inventadas.

A landing mantém o núcleo procedural e os cinco capítulos controlados por scroll, com indicador de progresso, navegação direta e transição para a conversa. O cálculo passa a usar a distância real rolável e responde ao resize. O chat preserva envio, streaming, cancelamento, cópia, histórico, exclusão, anexos e sugestões, com compositor fixo na conversa, coluna de leitura e overflow local para código/tabelas.

A sidebar mobile abre como modal nativo, com fechamento e foco restaurado. Explorar, configurações, confirmação de exclusão e voz usam diálogos com Escape, ciclo de Tab e fundo inerte. A preferência local e `prefers-reduced-motion` pausam o desenho animado; a interface permanece visível. Rotas, serviços, autenticação e persistência não foram alterados.

## Validação executada

- Instalação com `npm ci`, respeitando `package-lock.json`; nenhuma atualização de dependências.
- `next build`: aprovado, incluindo TypeScript e geração de páginas.
- `tsc --noEmit`: aprovado.
- `next lint`: comando preexistente inválido no Next 16.3.5; não há configuração ESLint no projeto. Não foi registrado como aprovado.
- Chrome real: landing e cinco capítulos em 360, 768 e 1440 px; sem overflow horizontal.
- Composição adicional em 1440 × 768, sem interseção entre descrição e CTA.
- Menu, explorar, configurações, voz, Escape e ciclo de foco nas três larguras.
- Envio pelo endpoint real local, resposta de demonstração via SSE e renderização Markdown.
- Cancelamento de geração, cópia para clipboard, histórico reaberto após reload.
- Cancelamento e confirmação de exclusão de conversa de teste.
- Upload e remoção de anexo pelo endpoint existente.
- Fixture de teste identificada: texto longo, listas, tabela e bloco de código largo; scroll interno nas três larguras. A fixture foi removida depois da verificação.
- Animação ativa produz quadros diferentes; preferência do sistema e preferência local produzem imagem estática.
- Fechamento de configurações no celular devolve foco ao botão do menu.
- Sessão limpa: zero erros de JavaScript e console. O aviso de HMR durante edição não se reproduziu após recarregar.

Resultados estruturados: [verificação](interface/verification.json) e [interações](interface/interactions.json). Os scripts de execução e capturas adicionais estão em `.audit/`, ignorados pelo Git; utilizam o Playwright já disponível no ambiente. A primeira inspeção foi feita também por agent-browser.

## Capturas

As capturas iniciais foram feitas em 1262 × 624; as novas capturas desktop em 1440 × 900 e mobile em 360 × 800. São estados reais no navegador, sem imagens de interface simuladas.

| Estado | Antes | Depois |
| --- | --- | --- |
| Landing | [Antes](interface/before-landing.png) | [Depois](interface/after-landing.png) |
| Chat | [Antes](interface/before-chat.png) | [Depois](interface/after-chat.png) |
| Celular | — | [Landing](interface/after-mobile-landing.png) · [Chat](interface/after-mobile-chat.png) |

## Limitações preexistentes preservadas

- Histórico em `Map` de memória do servidor: não é persistente entre reinicializações nem armazenamento privado por usuário.
- Autenticação retorna um usuário local fixo; não é login real.
- Anexos retornam metadados, mas não armazenam nem enviam seu conteúdo ao modelo.
- Voz é um componente sem captura/transcrição e o endpoint retorna 503. A interface agora informa que está em desenvolvimento e não apresenta o microfone como operacional.
- Sem chave OpenAI, apenas o streaming de demonstração existente foi validado. Geração real externa não foi exercitada.
- A verificação de origem existente aceita `http://localhost:3000`, mas rejeita `http://127.0.0.1:3000`; usar localhost no teste local. Essa regra não foi alterada.

## Publicação

A integração GitHub permitiu leitura, mas recusou criar a branch com HTTP 403 (`Resource not accessible by integration`). Portanto, nenhum PR foi criado ou merge realizado. O trabalho e as evidências estão preservados localmente; a descrição de PR está em `docs/pull-request.md`.
