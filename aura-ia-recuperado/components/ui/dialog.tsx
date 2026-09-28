"use client";
import { createContext, useContext, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
const Context = createContext({ close: () => {}, title: "", description: "" });
export function Dialog({
  open,
  children,
  onOpenChange,
}: {
  open: boolean;
  children: React.ReactNode;
  onOpenChange?: (v: boolean) => void;
}) {
  const id = useId();
  return open ? (
    <Context.Provider
      value={{
        close: () => onOpenChange?.(false),
        title: `${id}-title`,
        description: `${id}-description`,
      }}
    >
      {children}
    </Context.Provider>
  ) : null;
}
export function DialogContent({
  children,
  className = "aura-dialog",
  role = "dialog",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  role?: "dialog" | "alertdialog";
  label?: string;
}) {
  const { close, title, description } = useContext(Context);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    el?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      el?.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
      else
        document
          .querySelector<HTMLButtonElement>('[aria-controls="aura-sidebar"]')
          ?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      className={className}
      role={role}
      aria-label={label}
      aria-labelledby={label ? undefined : title}
      aria-describedby={label ? undefined : description}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const items = Array.from(
          e.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
          ),
        ).filter((el) => el.getClientRects().length > 0);
        const first = items[0],
          last = items[items.length - 1];
        if (!first) {
          e.preventDefault();
          e.currentTarget.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            close();
        }
      }}
    >
      <button
        className="icon-button dialog-close"
        aria-label="Fechar diálogo"
        onClick={close}
      >
        <X size={18} />
      </button>
      {children}
    </dialog>
  );
}
export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 id={useContext(Context).title}>{children}</h2>;
}
export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p id={useContext(Context).description}>{children}</p>;
}
export function DialogClose({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { close } = useContext(Context);
  return (
    <button
      className={className}
      onClick={() => {
        onClick?.();
        close();
      }}
    >
      {children}
    </button>
  );
}
