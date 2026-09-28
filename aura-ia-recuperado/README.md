# AURA IA

Projeto acadêmico sobre um sistema integrado de IA para aceleração e validação na concepção de projetos.

Equipe: Guilherme Del Bosco, Kelvin, Enzo Pacheco, Kauan Felipe, MARCELO e João Vitor.

## Executar

1. Instale as dependências com `npm ci`.
2. Copie `.env.example` para `.env.local` e configure a chave do provedor somente no servidor.
3. Execute `npm run dev`.

A integração atual usa Grok/xAI, configurada por `XAI_API_KEY` e `XAI_MODEL`. Sem chave, a aplicação informa que a IA não está conectada. A demonstração pode ser ativada explicitamente com `AURA_DEMO_MODE=true`. Nunca envie `.env.local` ao GitHub.

## Verificar

- `npm run build`
- `node --test tests/grok.test.cjs`

O histórico é temporário, em memória, e separado por sessão de navegador. Não há persistência garantida entre instâncias da Vercel. Voz e leitura de anexos ainda não estão implementadas.

## Publicação

Site: https://aura-ia-recuperado.vercel.app

No GitHub, o aplicativo fica dentro de `aura-ia-recuperado/`. Ao importar o repositório na Vercel, selecione essa pasta como Root Directory. Configure as variáveis privadas na Vercel e faça um novo deploy após alterá-las.
