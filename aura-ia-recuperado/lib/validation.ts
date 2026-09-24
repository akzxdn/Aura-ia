import {z} from "zod";
export const attachmentSchema=z.object({id:z.string().uuid(),name:z.string().max(180),type:z.string().max(100),size:z.number().nonnegative().max(5*1024*1024)});
export const messageSchema=z.object({id:z.string().uuid(),role:z.enum(["user","assistant"]),content:z.string().max(24000),attachments:z.array(attachmentSchema).max(3).optional()});
export const conversationSchema=z.object({id:z.string().uuid(),title:z.string().trim().min(1).max(100),messages:z.array(messageSchema).max(100)});
