# Apresentação interativa da Aura — 27/09/2026

Evolução da reformulação visual anterior: a identidade agora é roxa e a apresentação é uma conversa guiada, com respostas reais.

## Fluxo implementado

1. Objetivo: escolher uma das quatro opções.
2. Ideia: escrever de 10 a 1200 caracteres, desconsiderando espaços nas pontas para validar o mínimo.
3. Ritmo: escolher o estilo de resposta.
4. Revisar as respostas e clicar em **Conhecer Aura**.
5. O núcleo se aproxima e se expande pela tela durante 1,7 segundo; aparecem seis funcionalidades existentes.
6. Uma funcionalidade, ou **Abrir minha conversa**, abre o chat com as três respostas em um rascunho editável. O usuário decide quando enviar.

Scroll e navegação por etapas compartilham o mesmo limite: não avançam além da primeira resposta não confirmada. É possível voltar, preservar o texto e revisar. Alterar uma resposta anterior exige confirmar novamente as etapas seguintes. Erros de preenchimento são anunciados e direcionam o foco para o campo.

A preferência de movimento reduzido abre as funcionalidades diretamente, sem a expansão. O timeout da transição evita que o fluxo fique preso se a animação CSS não executar. Em telas pequenas, a área das perguntas tem rolagem própria para manter campos e botões acessíveis.

As respostas ficam em memória nesta apresentação e são perdidas ao recarregar. Só são enviadas pelo fluxo existente do chat, quando o usuário pressiona Enviar. O acesso direto já existente por `?chat=1` permanece disponível; a sequência é uma regra da apresentação, não um mecanismo de autenticação.

## Validação

Build de produção e TypeScript aprovados. Teste no Chrome real em 1440 × 900, 768 × 900 e 360 × 800:

- Tentativa de pular etapas por scroll e navegação bloqueada.
- Campos vazios/espaços rejeitados.
- Edição de resposta anterior bloqueia novamente as etapas seguintes.
- Texto já preenchido preservado ao voltar.
- Expansão do canvas medida durante a animação real.
- Funcionalidades aparecem apenas após a conclusão.
- Modo de movimento reduzido chega à mesma tela sem animação.
- Objetivo, ideia, estilo e funcionalidade escolhida chegam ao compositor.
- Nenhum envio automático; envio explícito validado com streaming de demonstração existente.
- Sem overflow horizontal e sem erros de console/JavaScript.

[Resultados estruturados](interface/interactive/results.json). O script executado está em `.audit/journey.cjs`, junto das capturas adicionais. Não foram adicionadas bibliotecas nem alteradas APIs, autenticação ou persistência.

## Capturas

[Perguntas no desktop](interface/interactive/questions-desktop.png) · [Perguntas no celular](interface/interactive/questions-mobile.png) · [Funcionalidades](interface/interactive/features.png)
