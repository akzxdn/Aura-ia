"use client";
export function Switch({checked,onCheckedChange,...props}:{checked:boolean;onCheckedChange:(v:boolean)=>void;[k:string]:unknown}){return <button {...props} role="switch" aria-checked={checked} onClick={()=>onCheckedChange(!checked)}>{checked?"Ligado":"Desligado"}</button>}
