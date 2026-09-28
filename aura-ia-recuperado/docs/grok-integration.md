# Grok na AURA

O provedor de texto é a xAI, usando `https://api.x.ai/v1/responses` com streaming. O modelo padrão é `grok-4.7`; `XAI_MODEL` permite configurar outro modelo disponível na conta.

Configure `XAI_API_KEY` como variável privada do servidor. Na Vercel, selecione o ambiente Production e faça um novo deploy após salvar a chave. Para desenvolvimento local, configure a variável em `.env.local` e reinicie o servidor. Não use o prefixo `NEXT_PUBLIC_`.

O comando `irm https://x.ai/cli/install.ps1 | iex` instala a CLI da xAI. Ele não fornece credenciais para a API e não é necessário para esta integração.

A aplicação envia apenas os papéis e textos da conversa, junto às instruções da AURA. Mantém `store: false`, tratamento de falhas e cancelamento. Anexos e voz continuam indisponíveis. Sem chave, a interface informa que a IA não está conectada; não há fallback silencioso para outro provedor.

Validação automatizada: `node --test tests/grok.test.cjs`. Os testes usam respostas controladas; uma resposta real depende de chave válida, créditos e acesso ao modelo na xAI.

Referências oficiais:
- https://docs.x.ai/developers/rest-api-reference/inference/responses
- https://docs.x.ai/developers/model-capabilities/text/streaming
