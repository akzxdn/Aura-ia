"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";
export const AlertDialog = Dialog;
export function AlertDialogContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DialogContent role="alertdialog">{children}</DialogContent>;
}
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;
export function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  return <footer className="dialog-footer">{children}</footer>;
}
export function AlertDialogCancel({ children }: { children: React.ReactNode }) {
  return <DialogClose>{children}</DialogClose>;
}
export function AlertDialogAction({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <DialogClose className="danger-button" onClick={onClick}>
      {children}
    </DialogClose>
  );
}
