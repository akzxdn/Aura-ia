"use client";
import { useState, useEffect, lazy, Suspense } from "react";
import Landing from "@/components/aura/Landing";
const Chat = lazy(() => import("@/components/aura/Chat"));
export default function Home(){const [entered,setEntered]=useState(false);useEffect(()=>{if(new URLSearchParams(location.search).get("chat")==="1")setEntered(true)},[]);return entered?<Suspense fallback={<div className="loading-aura">AURA</div>}><Chat onHome={()=>{setEntered(false);window.history.replaceState(null,"","/");window.scrollTo(0,0)}}/></Suspense>:<Landing onEnter={()=>{window.scrollTo(0,0);window.history.replaceState(null,"","/?chat=1");setEntered(true)}}/>}
