import { apiKey, model } from "@/lib/server";
import type { Message } from "@/lib/aura-types";

export class GrokError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}
const instructions = `Você é AURA, uma assistente criada em um projeto de faculdade sobre um sistema integrado de IA para aceleração e validação na concepção de projetos.
Ajude a transformar ideias em propostas que possam ser testadas: entenda o problema, identifique o público, compare alternativas, explicite hipóteses e proponha um próximo passo concreto.
Converse em português do Brasil, com clareza e naturalidade. Faça perguntas quando faltarem informações essenciais, sem impor um questionário ou uma estrutura fixa a toda resposta. Adapte o nível de detalhe ao pedido e use Markdown quando ajudar.
Não confunda sugestão com validação: não diga que uma ideia foi comprovada sem evidências. Não invente fontes, resultados, pesquisas realizadas ou acesso a ferramentas. Você recebe apenas o texto desta conversa e não navega na internet. Também pode ajudar com escrita, estudo e programação.
A equipe criadora informada é Guilherme Del Bosco, Kelvin, Enzo Pacheco, Kauan Felipe, MARCELO e João Vitor.`;

export async function generate(
  messages: Message[],
  _owner: string,
  signal: AbortSignal,
) {
  const key = apiKey().trim();
  if (!key)
    throw new GrokError(
      "A conexão com a xAI ainda não foi configurada. Configure XAI_API_KEY nas variáveis de ambiente do servidor e publique novamente.",
      503,
    );
  if (messages.some((m) => m.attachments?.length))
    throw new GrokError(
      "A leitura de anexos ainda não está conectada. Cole o conteúdo do arquivo na mensagem para analisarmos juntos.",
      422,
    );
  let response: Response;
  try {
    response = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model(),
        input: [{ role: "system", content: instructions }, ...messages.map(({ role, content }) => ({ role, content }))],
        stream: true,
        store: false,
        max_output_tokens: 4096,
      }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(90000)]),
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new GrokError(
      error instanceof Error && error.name === "TimeoutError"
        ? "A xAI demorou a responder. Tente novamente."
        : "Não foi possível alcançar a xAI. Verifique a conexão e tente novamente.",
      504,
    );
  }
  if (!response.ok) {
    // Do not send provider bodies or credentials to the browser or logs.
    await response.body?.cancel();
    if (response.status === 401)
      throw new GrokError(
        "A chave da xAI não foi aceita. Confira XAI_API_KEY no servidor.",
        503,
      );
    if (response.status === 429)
      throw new GrokError(
        "A xAI atingiu um limite de uso. Confira os créditos e limites do projeto ou tente novamente em instantes.",
        429,
      );
    if (response.status === 403 || response.status === 404)
      throw new GrokError(
        "O projeto da xAI não tem acesso ao modelo configurado. Confira XAI_MODEL e as permissões da chave.",
        503,
      );
    throw new GrokError(
      "A xAI não conseguiu processar esta conversa. Tente uma nova mensagem.",
    );
  }
  if (
    !response.body ||
    !response.headers.get("content-type")?.includes("text/event-stream")
  ) {
    await response.body?.cancel();
    throw new GrokError(
      "A xAI retornou uma resposta inesperada. Tente novamente.",
    );
  }
  return response;
}
