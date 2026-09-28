"use client";
import { Mic } from "lucide-react";
import AuraCore from "./AuraCore";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export default function VoiceMode({
  onClose,
}: {
  onClose: () => void;
  onSend: (text: string) => Promise<string>;
  onCancel: () => void;
  mode: "demo" | "live" | "unconfigured";
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <div className="voice-main">
          <p className="eyebrow">AURA / VOZ</p>
          <AuraCore state="IDLE" />
          <DialogTitle>Um espaço para sua voz.</DialogTitle>
          <DialogDescription>
            A conversa por voz ainda não está disponível nesta versão. Por
            enquanto, continue pelo campo de mensagem.
          </DialogDescription>
          <button
            className="voice-record"
            disabled
            aria-label="Microfone indisponível"
          >
            <Mic />
          </button>
          <div>
            <button className="text-button" onClick={onClose}>
              Voltar à conversa
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
