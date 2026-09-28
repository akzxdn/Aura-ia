import { z } from "zod";
import { authorize, apiKey, failure } from "@/lib/server";
import { messageSchema } from "@/lib/validation";
import { generate, GrokError } from "@/services/grok";
export const runtime = "nodejs";
const headers = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  "X-Accel-Buffering": "no",
};
export async function POST(request: Request) {
  try {
    const owner = await authorize(request);
    const body = await request.text();
    if (body.length > 300000)
      return Response.json(
        { error: "Conversa muito longa. Comece uma nova." },
        { status: 413 },
      );
    let json: unknown;
    try {
      json = JSON.parse(body);
    } catch {
      return Response.json({ error: "Mensagem inválida." }, { status: 400 });
    }
    const parsed = z
      .object({ messages: z.array(messageSchema).min(1).max(80) })
      .safeParse(json);
    if (!parsed.success || parsed.data.messages.at(-1)?.role !== "user")
      return Response.json({ error: "Mensagem inválida." }, { status: 400 });
    if (!apiKey() && process.env.AURA_DEMO_MODE === "true") {
      const answer =
        "**Modo demonstração.**\n\nEste é um exemplo de resposta, sem geração por IA. Configure a conexão com a xAI para conversar sobre seu projeto.";
      const parts = answer.match(/[\s\S]{1,12}/g) || [];
      let i = 0,
        cancelled = false;
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async pull(controller) {
          await new Promise((resolve) => setTimeout(resolve, 28));
          if (cancelled) return;
          if (i < parts.length)
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "response.output_text.delta", delta: parts[i++] })}\n\n`,
              ),
            );
          else {
            controller.enqueue(
              encoder.encode('data: {"type":"response.completed"}\n\n'),
            );
            controller.close();
          }
        },
        cancel() {
          cancelled = true;
        },
      });
      return new Response(stream, { headers });
    }
    const response = await generate(
      parsed.data.messages,
      owner,
      request.signal,
    );
    return new Response(response.body, { headers });
  } catch (error) {
    if (error instanceof GrokError)
      return Response.json({ error: error.message }, { status: error.status });
    if (request.signal.aborted) return new Response(null, { status: 499 });
    return failure(error);
  }
}
