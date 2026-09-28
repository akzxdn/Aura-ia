const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const swc = require("next/dist/build/swc");
const { test, after } = require("node:test");
const assert = require("node:assert/strict");
// Compile application TypeScript in memory; no test-only endpoint or provider URL.
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, parent, ...rest) {
  return resolve.call(
    this,
    id.startsWith("@/") ? path.join(__dirname, "..", id.slice(2)) : id,
    parent,
    ...rest,
  );
};
require.extensions[".ts"] = (module, filename) =>
  module._compile(
    swc.transformSync(fs.readFileSync(filename, "utf8"), {
      filename,
      jsc: { parser: { syntax: "typescript" }, target: "es2022" },
      module: { type: "commonjs" },
    }).code,
    filename,
  );
const { POST } = require("../app/api/chat/route.ts");
const { GET } = require("../app/api/status/route.ts");
const { readResponseStream } = require("../services/chat.ts");
const originalFetch = global.fetch,
  originalKey = process.env.XAI_API_KEY,
  originalDemo = process.env.AURA_DEMO_MODE;
after(() => {
  global.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.XAI_API_KEY;
  else process.env.XAI_API_KEY = originalKey;
  if (originalDemo === undefined) delete process.env.AURA_DEMO_MODE;
  else process.env.AURA_DEMO_MODE = originalDemo;
});
const messages = [
  {
    id: "8ec7e898-2b4e-423e-b2f2-ea5fe62f43b8",
    role: "user",
    content: "Como testar uma ideia?",
  },
];
const request = (value = { messages }) =>
  new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "Content-Type": "application/json",
    },
    body: typeof value === "string" ? value : JSON.stringify(value),
  });
const sse =
  'data: {"type":"response.output_text.delta","delta":"Olá, hipótese!"}\n\ndata: {"type":"response.completed"}\n\n';
const stream = () =>
  new Response(sse, { headers: { "content-type": "text/event-stream" } });
test("missing key is explicit, never a fabricated AI answer", async () => {
  delete process.env.XAI_API_KEY;
  process.env.AURA_DEMO_MODE = "false";
  const r = await POST(request());
  assert.equal(r.status, 503);
  assert.match((await r.json()).error, /XAI_API_KEY/);
  assert.equal((await GET().json()).mode, "unconfigured");
});
test("demo requires explicit opt-in", async () => {
  delete process.env.XAI_API_KEY;
  process.env.AURA_DEMO_MODE = "true";
  const r = await POST(request());
  assert.equal(r.status, 200);
  let answer = "";
  await readResponseStream(
    r,
    new AbortController().signal,
    (x) => (answer += x),
  );
  assert.match(answer, /demonstração/);
  process.env.AURA_DEMO_MODE = "false";
});
test("real provider request strips local IDs and sends conversation roles", async () => {
  process.env.XAI_API_KEY = "test-placeholder-not-a-real-key";
  let sent;
  global.fetch = async (url, opts) => {
    sent = { url, opts };
    return stream();
  };
  const r = await POST(request());
  assert.equal(r.status, 200);
  const body = JSON.parse(sent.opts.body);
  assert.equal(sent.url, "https://api.x.ai/v1/responses");
  assert.deepEqual(body.input.slice(1), [
    { role: "user", content: messages[0].content },
  ]);
  assert.equal(body.store, false);
  assert.equal(body.stream, true);
  assert.match(body.input[0].content, /concepção de projetos/);
  assert.equal(await r.text(), sse);
});
test("authentication and quota failures preserve actionable errors", async () => {
  for (const [status, expected, pattern] of [
    [401, 503, /chave/],
    [429, 429, /créditos/],
    [404, 503, /modelo/],
    [500, 502, /xAI/],
  ]) {
    global.fetch = async () =>
      new Response('{"secret":"must-not-leak"}', { status });
    const r = await POST(request());
    assert.equal(r.status, expected);
    const body = await r.json();
    assert.match(body.error, pattern);
    assert(!JSON.stringify(body).includes("must-not-leak"));
  }
});
test("network failure is actionable", async () => {
  global.fetch = async () => {
    throw new Error("private network details");
  };
  const r = await POST(request());
  assert.equal(r.status, 504);
  assert(!JSON.stringify(await r.json()).includes("private network details"));
});
test("malformed JSON is 400, cross-origin is 403", async () => {
  assert.equal((await POST(request("{broken"))).status, 400);
  const r = request();
  r.headers.set("origin", "https://untrusted.example");
  assert.equal((await POST(r)).status, 403);
});
test("attachment metadata is not mistaken for file content", async () => {
  const r = await POST(
    request({
      messages: [
        {
          ...messages[0],
          attachments: [
            {
              id: messages[0].id,
              name: "file.txt",
              type: "text/plain",
              size: 12,
            },
          ],
        },
      ],
    }),
  );
  assert.equal(r.status, 422);
  assert.match((await r.json()).error, /Cole o conteúdo/);
});
test("SSE supports fragmented UTF-8 and event boundaries", async () => {
  const bytes = new TextEncoder().encode(sse);
  let i = 0;
  const response = new Response(
    new ReadableStream({
      pull(c) {
        if (i < bytes.length) c.enqueue(bytes.slice(i, (i += 3)));
        else c.close();
      },
    }),
  );
  let text = "";
  await readResponseStream(
    response,
    new AbortController().signal,
    (x) => (text += x),
  );
  assert.equal(text, "Olá, hipótese!");
});
test("failed and truncated streams are not reported as complete", async () => {
  for (const body of [
    'data: {"type":"response.failed"}\n\n',
    'data: {"type":"response.output_text.delta","delta":"Partial"}\n\n',
  ])
    await assert.rejects(
      readResponseStream(
        new Response(body),
        new AbortController().signal,
        () => {},
      ),
      /interromp/,
    );
});
test("refusals render and reader is cancelled after completion", async () => {
  let cancelled = false;
  let text = "";
  const body = new ReadableStream({
    start(c) {
      c.enqueue(
        new TextEncoder().encode(
          'data: {"type":"response.refusal.delta","delta":"Não posso ajudar."}\n\ndata: {"type":"response.completed"}\n\n',
        ),
      );
    },
    cancel() {
      cancelled = true;
    },
  });
  await readResponseStream(
    new Response(body),
    new AbortController().signal,
    (x) => (text += x),
  );
  assert.equal(text, "Não posso ajudar.");
  assert(cancelled);
});

test('public history is isolated between browser sessions', async () => {
  const history = require('../app/api/conversations/route.ts');
  const url='https://aura.example/api/conversations';
  const first=await history.GET(new Request(url));
  const cookie=first.headers.get('set-cookie').split(';')[0];
  const conversation={id:messages[0].id,title:'Isolation test',messages};
  const saved=await history.PUT(new Request(url,{method:'PUT',headers:{cookie,origin:'https://aura.example'},body:JSON.stringify(conversation)}));
  assert.equal(saved.status,200);
  assert.equal((await(await history.GET(new Request(url,{headers:{cookie}}))).json()).conversations.length,1);
  assert.equal((await(await history.GET(new Request(url))).json()).conversations.length,0);
  await history.DELETE(new Request(url+'?id='+conversation.id,{method:'DELETE'}));
  assert.equal((await(await history.GET(new Request(url,{headers:{cookie}}))).json()).conversations.length,1);
  await history.DELETE(new Request(url+'?id='+conversation.id,{method:'DELETE',headers:{cookie}}));
});
