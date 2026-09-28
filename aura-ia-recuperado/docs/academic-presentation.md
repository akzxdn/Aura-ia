# Apresentação acadêmica da AURA

Esta versão substitui o fluxo de perguntas descrito em `interactive-introduction.md`.

A apresentação tem cinco capítulos acionados pelo scroll: proposta, tema da faculdade, origem, equipe e convite para conhecer a AURA. Não há respostas obrigatórias, bloqueio de capítulos ou envio automático de mensagens. Os textos entram de forma dinâmica ao mudar de capítulo, sem avanço automático da narrativa.

A equipe apresentada é Guilherme Del Bosco, Kelvin, Enzo Pacheco, Kauan Felipe, MARCELO e João Vitor.

O botão final inicia uma transição roxa de 6,4 segundos: travessia por um buraco de minhoca e formação da esfera da AURA. As frases aparecem nesta ordem:

1. Toda grande ideia começa com uma pergunta.
2. Um prompt abre novos caminhos.
3. Dê forma ao que você imagina.
4. Seja bem-vindo à AURA.

Ao terminar, o chat abre diretamente com o campo vazio. O botão de pular permite entrar antes do fim. A preferência de movimento reduzido abre o chat imediatamente. Os listeners, temporizadores e quadros de animação são removidos ao desmontar a transição.

## Validação local

- Compilação de produção e TypeScript.
- Cinco capítulos sem formulários em 1440 × 900, 768 × 1024, 360 × 800 e 360 × 600.
- Nomes da equipe, ausência de transbordamento horizontal e entrada com movimento reduzido.
- Observação das quatro frases e das duas fases da transição no navegador.
- Nenhuma chamada automática ao endpoint de chat; campo inicial vazio.
- Botão de pular acionado durante a transição.
- Resposta do chat em modo demonstrativo; conversa de teste removida.
- Nenhum erro de JavaScript registrado no teste da apresentação.

O script de lint existente usa `next lint`, comando indisponível nesta versão do Next.js; não foi considerado uma verificação aprovada. A validação da resposta utilizou o modo demonstrativo, sem testar um provedor de IA externo.
