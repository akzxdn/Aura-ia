import type { Conversation, Message } from "@/lib/aura-types";
export async function checked(response: Response) {
  if (!response.ok) {
    if (response.status === 401)
      throw new Error(
        "Entre com sua conta para conversar e salvar o histórico.",
      );
    let message = "Não foi possível concluir. Tente novamente.";
    try {
      message = (await response.json()).error || message;
    } catch {}
    throw new Error(message);
  }
  return response;
}
export async function saveConversation(c: Conversation) {
  return checked(
    await fetch("/api/conversations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    }),
  );
}
export async function readResponseStream(
  response: Response,
  signal: AbortSignal,
  onDelta: (value: string) => void,
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Resposta indisponível.");
  const decoder = new TextDecoder();
  let pending = "",
    complete = false;
  const consume = (event: string) => {
    const raw = event
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!raw) return;
    if (raw === "[DONE]") {
      complete = true;
      return;
    }
    const data = JSON.parse(raw);
    if (
      (data.type === "response.output_text.delta" ||
        data.type === "response.refusal.delta") &&
      typeof data.delta === "string"
    )
      onDelta(data.delta);
    if (data.type === "response.completed") complete = true;
    if (data.type === "error" || data.type === "response.failed")
      throw new Error("A xAI interrompeu a resposta. Tente novamente.");
    if (data.type === "response.incomplete")
      throw new Error(
        "A resposta atingiu um limite antes de terminar. Peça para continuar a partir do último trecho.",
      );
  };
  try {
    while (!complete) {
      const { value, done } = await reader.read();
      if (done) {
        pending += decoder.decode();
        if (pending.trim()) consume(pending);
        break;
      }
      pending += decoder.decode(value, { stream: true });
      const events = pending.split(/\r?\n\r?\n/);
      pending = events.pop() || "";
      for (const event of events) consume(event);
    }
    if (!complete && !signal.aborted)
      throw new Error(
        "A conexão foi interrompida antes de concluir a resposta.",
      );
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
export async function streamReply(
  messages: Message[],
  signal: AbortSignal,
  onDelta: (value: string) => void,
) {
  const response = await checked(
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal,
    }),
  );
  await readResponseStream(response, signal, onDelta);
}
