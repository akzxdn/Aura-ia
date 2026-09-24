import {apiKey,model} from "@/lib/server";
import type {Message} from "@/lib/aura-types";
export async function generate(messages:Message[],_owner:string,signal:AbortSignal){return fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${apiKey()}`,"Content-Type":"application/json"},body:JSON.stringify({model:model(),instructions:"Você é Aura, uma inteligência atenciosa, criativa e precisa. Responda em português e use Markdown.",input:messages,stream:true,store:false,max_output_tokens:4096}),signal})}
