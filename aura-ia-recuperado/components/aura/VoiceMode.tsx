"use client";
import {Mic,X} from "lucide-react";
import AuraCore from "./AuraCore";
export default function VoiceMode({onClose}:{onClose:()=>void;onSend:(text:string)=>Promise<string>;onCancel:()=>void;mode:"demo"|"live"}){return <div className="voice-screen" role="dialog" aria-modal="true"><div className="voice-header"><span className="wordmark">AURA VOZ</span><button className="icon-button" onClick={onClose}><X/></button></div><div className="voice-main"><AuraCore state="IDLE"/><h2>Estou aqui com você.</h2><button className="voice-record"><Mic/></button><p>O modo de voz depende da configuração da API.</p></div></div>}
