export type Attachment={id:string;name:string;type:string;size:number};
export type Message={id:string;role:"user"|"assistant";content:string;attachments?:Attachment[]};
export type Conversation={id:string;title:string;messages:Message[];updated:number};
