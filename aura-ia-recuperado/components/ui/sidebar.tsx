"use client";
import {createContext,useContext,useState} from "react";
const C=createContext({toggleSidebar:()=>{},isMobile:false,setOpenMobile:(_v:boolean)=>{}});
export function SidebarProvider({children}:{children:React.ReactNode;defaultOpen?:boolean}){const [open,setOpen]=useState(true);return <C.Provider value={{toggleSidebar:()=>setOpen(v=>!v),isMobile:false,setOpenMobile:()=>{}}}><div data-open={open} className="sidebar-wrapper">{children}</div></C.Provider>}
export const useSidebar=()=>useContext(C);
export function Sidebar({children,className=""}:{children:React.ReactNode;className?:string;collapsible?:string}){return <aside className={className}>{children}</aside>}
export function SidebarHeader({children}:{children:React.ReactNode}){return <div>{children}</div>}
export function SidebarContent({children}:{children:React.ReactNode}){return <div>{children}</div>}
export function SidebarFooter({children}:{children:React.ReactNode}){return <div>{children}</div>}
export function SidebarTrigger(props:React.ButtonHTMLAttributes<HTMLButtonElement>){return <button {...props}>☰</button>}
