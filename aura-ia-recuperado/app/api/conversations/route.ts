const memory=new Map<string,unknown>();
export async function GET(){return Response.json({conversations:Array.from(memory.values())})}
export async function PUT(request:Request){const c=await request.json();memory.set(c.id,c);return Response.json({updated:Date.now()})}
export async function DELETE(request:Request){memory.delete(new URL(request.url).searchParams.get("id")||"");return Response.json({ok:true})}
