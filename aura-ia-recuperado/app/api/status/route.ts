import {apiKey} from "@/lib/server";
export function GET(){return Response.json({mode:apiKey()?"live":"demo"},{headers:{"Cache-Control":"no-store"}})}
