"use client";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Sparkles,
  Code2,
  PenLine,
  Lightbulb,
  Search,
  BookOpen,
  ChartNoAxesCombined,
  Trash2,
} from "lucide-react";
import AuraCore from "./AuraCore";
import AuraSidebar from "./AuraSidebar";
import Composer from "./Composer";
import Message from "./Message";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useAuraChat } from "@/hooks/use-aura-chat";
const VoiceMode = lazy(() => import("./VoiceMode"));
const ideas = [
  {
    icon: PenLine,
    name: "Escrever",
    prompt:
      "Me ajude a escrever um texto. Vamos começar pelo objetivo e pelo público.",
  },
  {
    icon: Code2,
    name: "Programar",
    prompt:
      "Quero criar um projeto de programação. Me ajude a definir um primeiro passo.",
  },
  {
    icon: Lightbulb,
    name: "Criar ideias",
    prompt: "Vamos pensar em ideias criativas para um novo projeto.",
  },
  {
    icon: BookOpen,
    name: "Explicar",
    prompt:
      "Me explique um assunto difícil de um jeito simples. Por onde podemos começar?",
  },
  {
    icon: Search,
    name: "Pesquisar",
    prompt:
      "Me ajude a estruturar uma pesquisa e identificar boas fontes. Não preciso de resultados em tempo real.",
  },
  {
    icon: ChartNoAxesCombined,
    name: "Analisar",
    prompt:
      "Me ajude a analisar um problema, comparar alternativas e tomar uma decisão.",
  },
];
export default function Chat({ onHome }: { onHome: () => void }) {
  const chat = useAuraChat();
  const [draft, setDraft] = useState("");
  const [dialog, setDialog] = useState<"explore" | "settings" | null>(null);
  const [voice, setVoice] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [motion, setMotion] = useState(true);
  const [away, setAway] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const focus = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    focus.current?.focus();
    try {
      setMotion(localStorage.getItem("aura-motion") !== "off");
    } catch {}
  }, []);
  useEffect(() => {
    if (nearBottom.current && feed.current)
      feed.current.scrollTop = feed.current.scrollHeight;
  }, [chat.current?.messages, chat.current?.id]);
  useEffect(() => {
    const context = (
      document as unknown as {
        modelContext?: {
          registerTool: (tool: unknown, options: unknown) => void;
        };
      }
    ).modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    try {
      context.registerTool(
        {
          name: "stage_aura_message",
          title: "Preparar mensagem para a Aura",
          description:
            "Preenche o campo de mensagem para revisão. Não envia a mensagem.",
          inputSchema: {
            type: "object",
            properties: { text: { type: "string", maxLength: 24000 } },
            required: ["text"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute: (input: unknown) => {
            const v = input as { text?: unknown };
            if (!v || typeof v.text !== "string" || v.text.length > 24000)
              throw new Error("Texto inválido");
            setDraft(v.text);
            return { status: "staged", sent: false };
          },
        },
        { signal: lifecycle.signal },
      );
    } catch {}
    return () => lifecycle.abort();
  }, []);
  const pick = (text: string) => {
    setDraft(text);
    setDialog(null);
    setTimeout(
      () => document.querySelector<HTMLTextAreaElement>("textarea")?.focus(),
      0,
    );
  };
  return (
    <div className={`chat-app ${motion ? "" : "motion-paused"}`}>
      <SidebarProvider defaultOpen>
        <AuraSidebar
          conversations={chat.conversations}
          currentId={chat.current?.id}
          onNew={() => {
            chat.newConversation();
            setDraft("");
            nearBottom.current = true;
          }}
          onSelect={(c) => {
            chat.select(c);
            nearBottom.current = true;
          }}
          onExplore={() => setDialog("explore")}
          onSettings={() => setDialog("settings")}
          onHome={() => {
            if (!chat.busy) onHome();
          }}
          busy={chat.busy}
        />
        <main className="chat-main">
          <header className="chat-header">
            <div>
              <SidebarTrigger aria-label="Abrir ou recolher menu" />
              <span>
                Aura <span className="dim">/</span>{" "}
                <span className="chat-title">
                  {chat.current?.title || "Nova conversa"}
                </span>
              </span>
            </div>
            <div>
              <span className={`mode-badge ${chat.mode}`}>
                {chat.mode === "demo"
                  ? "Modo demonstração"
                  : chat.mode === "live"
                    ? "Grok configurado"
                    : "IA não conectada"}
              </span>
              {chat.current && (
                <button
                  className="icon-button"
                  aria-label="Excluir conversa"
                  disabled={chat.busy}
                  onClick={() => setDeleting(true)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </header>
          {!chat.current?.messages.length ? (
            <div className="chat-welcome">
              <AuraCore motion={motion} state={draft ? "PROCESSING" : "IDLE"} />
              <div className="welcome-copy">
                <p className="eyebrow">SEU ESPAÇO PARA PENSAR JUNTO</p>
                <h1 ref={focus} tabIndex={-1}>
                  Olá. Eu sou a Aura.
                </h1>
                <p>
                  Uma pergunta, um rascunho ou uma ideia. Por onde começamos?
                </p>
              </div>
              <div className="welcome-composer">
                <Composer
                  value={draft}
                  onChange={setDraft}
                  onSend={(s, a) => void chat.send(s, a)}
                  busy={chat.busy}
                  onStop={chat.stop}
                  onVoice={() => setVoice(true)}
                  onError={chat.setError}
                  disabled={!chat.signedIn}
                />
              </div>
              <div className="suggestions">
                {ideas.slice(0, 3).map((i) => (
                  <button key={i.name} onClick={() => pick(i.prompt)}>
                    <i.icon size={15} />
                    {i.name}
                    <ArrowUpRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div
                className="message-feed"
                aria-label="Mensagens da conversa"
                ref={feed}
                onScroll={() => {
                  if (!feed.current) return;
                  const el = feed.current;
                  nearBottom.current =
                    el.scrollHeight - el.scrollTop - el.clientHeight < 100;
                  setAway(!nearBottom.current);
                }}
              >
                <div className="messages">
                  {chat.current.messages.map((m, i) => (
                    <Message
                      key={m.id}
                      message={m}
                      streaming={
                        chat.busy &&
                        i === chat.current!.messages.length - 1 &&
                        m.role === "assistant"
                      }
                    />
                  ))}
                </div>
              </div>
              {away && (
                <button
                  className="scroll-latest"
                  aria-label="Ir para a última mensagem"
                  onClick={() => {
                    nearBottom.current = true;
                    feed.current?.scrollTo({
                      top: feed.current.scrollHeight,
                      behavior: matchMedia("(prefers-reduced-motion: reduce)")
                        .matches
                        ? "instant"
                        : "smooth",
                    });
                  }}
                >
                  <ArrowDown size={18} />
                </button>
              )}
              <div className="chat-composer">
                <Composer
                  value={draft}
                  onChange={setDraft}
                  onSend={(s, a) => {
                    nearBottom.current = true;
                    void chat.send(s, a);
                  }}
                  busy={chat.busy}
                  onStop={chat.stop}
                  onVoice={() => setVoice(true)}
                  onError={chat.setError}
                />
              </div>
            </>
          )}
          {chat.loading && (
            <div className="chat-notice" role="status">
              Abrindo seu espaço...
            </div>
          )}
          {!chat.signedIn && (
            <div className="chat-notice">
              Entre para manter suas conversas salvas.
              <a href="/signin-with-chatgpt?return_to=/%3Fchat%3D1">
                Entrar com ChatGPT <ArrowUpRight size={14} />
              </a>
            </div>
          )}
          {chat.error && (
            <div className="chat-error" role="alert">
              {chat.error}
              <div>
                {chat.error.includes("salva") && (
                  <button onClick={() => void chat.retrySave()}>
                    Salvar novamente
                  </button>
                )}
                <button onClick={() => chat.setError("")}>Fechar aviso</button>
              </div>
            </div>
          )}
        </main>
      </SidebarProvider>
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent className="aura-dialog">
          <DialogTitle>
            {dialog === "explore"
              ? "Siga sua curiosidade."
              : "Seu espaço, seu ritmo."}
          </DialogTitle>
          <DialogDescription>
            {dialog === "explore"
              ? "Escolha um ponto de partida. A próxima ideia é sua."
              : "Ajuste a experiência da Aura."}
          </DialogDescription>
          {dialog === "explore" ? (
            <div className="explore-list">
              {ideas.map((i) => (
                <button key={i.name} onClick={() => pick(i.prompt)}>
                  <i.icon size={22} />
                  <div>
                    <strong>{i.name}</strong>
                    <span>{i.prompt}</span>
                  </div>
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
          ) : (
            <div className="settings-list">
              <label>
                <div>
                  <strong>Movimento ambiente</strong>
                  <span>Movimento do núcleo na conversa</span>
                </div>
                <Switch
                  checked={motion}
                  onCheckedChange={(v) => {
                    setMotion(v);
                    try {
                      localStorage.setItem("aura-motion", v ? "on" : "off");
                    } catch {}
                  }}
                  aria-label="Movimento ambiente"
                />
              </label>
              <section>
                <strong>Conexão</strong>
                <p>
                  {chat.mode === "unconfigured"
                    ? "A conexão com a xAI ainda precisa ser configurada no servidor. Nenhuma resposta de IA será simulada."
                    : chat.mode === "demo"
                      ? "Você está explorando uma demonstração. As respostas são exemplos. A geração de texto real depende da conexão com a xAI; a voz ainda não está implementada."
                      : "A AURA usa o Grok, da xAI, para gerar respostas a partir das suas mensagens. A leitura de anexos e a conversa por voz ainda não estão disponíveis."}
                </p>
              </section>
              <section>
                <strong>Seu histórico</strong>
                <p>
                  Nesta versão recuperada, o histórico fica na memória do
                  servidor e pode ser perdido ao reiniciar. Anexos registram
                  apenas nome e tipo; seu conteúdo ainda não é armazenado nem
                  analisado. Você pode excluir uma conversa pelo ícone da
                  lixeira.
                </p>
              </section>
              <section>
                <strong>Acessibilidade</strong>
                <p>
                  A preferência de movimento reduzido do seu dispositivo é
                  respeitada automaticamente.
                </p>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent>
          <AlertDialogTitle>Excluir esta conversa?</AlertDialogTitle>
          <AlertDialogDescription>
            As mensagens serão removidas do seu histórico. Esta ação não pode
            ser desfeita.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter conversa</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (chat.current) void chat.remove(chat.current.id);
              }}
            >
              Excluir conversa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {voice && (
        <Suspense fallback={<div className="loading-aura">AURA</div>}>
          <VoiceMode
            onClose={() => setVoice(false)}
            onSend={(s) => chat.send(s)}
            onCancel={chat.stop}
            mode={chat.mode}
          />
        </Suspense>
      )}
    </div>
  );
}
