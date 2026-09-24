"use client";
export function AlertDialog({open,children}:{open:boolean;children:React.ReactNode;onOpenChange?:(v:boolean)=>void}){return open?<>{children}</>:null}
export function AlertDialogContent({children}:{children:React.ReactNode}){return <div className="dialog-backdrop"><section className="aura-dialog">{children}</section></div>}
export function AlertDialogTitle({children}:{children:React.ReactNode}){return <h2>{children}</h2>}
export function AlertDialogDescription({children}:{children:React.ReactNode}){return <p>{children}</p>}
export function AlertDialogFooter({children}:{children:React.ReactNode}){return <footer>{children}</footer>}
export function AlertDialogCancel({children}:{children:React.ReactNode}){return <button>{children}</button>}
export function AlertDialogAction({children,onClick}:{children:React.ReactNode;onClick?:()=>void}){return <button onClick={onClick}>{children}</button>}
