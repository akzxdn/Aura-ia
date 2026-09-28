"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { PanelLeft } from "lucide-react";
import { Dialog, DialogContent } from "./dialog";
const Context = createContext({
  open: true,
  openMobile: false,
  toggleSidebar: () => {},
  isMobile: false,
  setOpenMobile: (_v: boolean) => {},
});
export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const query = matchMedia("(max-width: 800px)");
    const update = () => {
      setIsMobile(query.matches);
      setOpenMobile(false);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return (
    <Context.Provider
      value={{
        open,
        openMobile,
        isMobile,
        setOpenMobile,
        toggleSidebar: () =>
          isMobile ? setOpenMobile((v) => !v) : setOpen((v) => !v),
      }}
    >
      <div className="sidebar-wrapper">{children}</div>
    </Context.Provider>
  );
}
export const useSidebar = () => useContext(Context);
export function Sidebar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  collapsible?: string;
}) {
  const { open, openMobile, isMobile, setOpenMobile } = useSidebar();
  const content = (
    <aside
      id="aura-sidebar"
      aria-label="Menu de conversas"
      className={className}
    >
      {children}
    </aside>
  );
  return isMobile ? (
    <Dialog open={openMobile} onOpenChange={setOpenMobile}>
      <DialogContent
        className="aura-dialog mobile-sidebar"
        label="Menu de conversas"
      >
        {content}
      </DialogContent>
    </Dialog>
  ) : open ? (
    content
  ) : null;
}
export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="sidebar-header">{children}</div>;
}
export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="sidebar-content">{children}</div>;
}
export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return <div className="sidebar-footer">{children}</div>;
}
export function SidebarTrigger(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const { toggleSidebar, open, openMobile, isMobile } = useSidebar();
  return (
    <button
      {...props}
      className="icon-button"
      aria-expanded={isMobile ? openMobile : open}
      aria-controls="aura-sidebar"
      onClick={toggleSidebar}
    >
      <PanelLeft size={19} />
    </button>
  );
}
