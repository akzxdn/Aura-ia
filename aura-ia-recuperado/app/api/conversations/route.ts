import { conversationSchema } from "@/lib/validation";
// Temporary academic-prototype history, isolated by browser session.
const memory = new Map<string, Map<string, unknown>>();
function session(request: Request) {
  const value = request.headers.get("cookie")?.split(";").map(x=>x.trim()).find(x=>x.startsWith("aura_session="))?.slice(13);
  const id = value && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : crypto.randomUUID();
  return { id, headers: { "Cache-Control":"no-store", "Set-Cookie":`aura_session=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${new URL(request.url).protocol === "https:" ? "; Secure" : ""}` } };
}
function allowed(request: Request) { const origin=request.headers.get("origin"); return !origin || origin===new URL(request.url).origin; }
export async function GET(request: Request) {
  const s=session(request);
  return Response.json({conversations:Array.from(memory.get(s.id)?.values() || [])},{headers:s.headers});
}
export async function PUT(request: Request) {
  if (!allowed(request)) return Response.json({error:"Origem não permitida."},{status:403});
  const s=session(request);
  const body=await request.text();
  if(body.length>300000) return Response.json({error:"Conversa muito longa."},{status:413});
  let data: unknown; try { data=JSON.parse(body); } catch { return Response.json({error:"Conversa inválida."},{status:400}); }
  const parsed=conversationSchema.safeParse(data);
  if(!parsed.success) return Response.json({error:"Conversa inválida."},{status:400});
  const conversations=memory.get(s.id)||new Map<string,unknown>();
  conversations.set(parsed.data.id,{...parsed.data,updated:Date.now()});
  if(conversations.size>50)conversations.delete(conversations.keys().next().value!);
  memory.set(s.id,conversations);
  if(memory.size>500)memory.delete(memory.keys().next().value!);
  return Response.json({updated:Date.now()},{headers:s.headers});
}
export async function DELETE(request: Request) {
  if (!allowed(request)) return Response.json({error:"Origem não permitida."},{status:403});
  const s=session(request);
  memory.get(s.id)?.delete(new URL(request.url).searchParams.get("id")||"");
  return Response.json({ok:true},{headers:s.headers});
}
