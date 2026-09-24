import {getChatGPTUser} from "@/app/chatgpt-auth";
const runtimeEnv={} as Record<string,any>;
export function database(){if(!runtimeEnv.DB)throw new Error("Histórico indisponível. Tente novamente.");return runtimeEnv.DB}
export function bucket(){if(!runtimeEnv.BUCKET)throw new Error("Anexos indisponíveis. Tente novamente.");return runtimeEnv.BUCKET}
export async function authorize(request:Request){const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)throw new Response("Origem não permitida",{status:403});const user=await getChatGPTUser();if(!user)throw new Response("Entre para salvar suas conversas.",{status:401});return user.userId}
export function apiKey(){return process.env.OPENAI_API_KEY||""}
export function model(){return process.env.OPENAI_MODEL||"gpt-5.2"}
export function failure(error:unknown){if(error instanceof Response)return error;console.error("Aura request failed",error instanceof Error?error.message:"Unknown error");return Response.json({error:"Não foi possível concluir. Tente novamente."},{status:500})}
