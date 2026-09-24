"use client";
export function Dialog({open,children}:{open:boolean;children:React.ReactNode;onOpenChange?:(v:boolean)=>void}){return open?<>{children}</>:null}
export function DialogContent({children,className=""}:{children:React.ReactNode;className?:string}){return <div className="dialog-backdrop"><section className={className}>{children}</section></div>}
export function DialogTitle({children}:{children:React.ReactNode}){return <h2>{children}</h2>}
export function DialogDescription({children}:{children:React.ReactNode}){return <p>{children}</p>}
