"use client";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import AuraCore from "./AuraCore";
import AuraTransition from "./AuraTransition";

const chapters = [
  {
    label: "A proposta",
    title: ["Uma ideia.", "E agora?"],
    text: "A AURA existe para esse intervalo: entre imaginar algo e descobrir por onde começar.",
    note: "AURA / INTELIGÊNCIA EM CONSTRUÇÃO",
    signal: "01 — O PONTO DE PARTIDA",
  },
  {
    label: "O tema",
    title: ["Menos achismo.", "Mais direção."],
    text: "Nosso tema na faculdade: sistema integrado de IA para aceleração e validação na concepção de projetos.",
    detail:
      "Organizar o problema. Explorar caminhos. Definir o que precisa ser testado.",
    note: "DA HIPÓTESE AO PRIMEIRO TESTE",
    signal: "02 — O DESAFIO",
  },
  {
    label: "Nossa origem",
    title: ["Da pergunta", "à AURA."],
    text: "O trabalho da faculdade virou uma pergunta nossa: e se pudéssemos conversar com uma ideia antes de construir?",
    detail:
      "Criamos a AURA para dar forma a essa conversa. Um projeto que também está aprendendo a nascer.",
    note: "UM EXPERIMENTO FEITO POR NÓS",
    signal: "03 — NOSSA ORIGEM",
  },
  {
    label: "A equipe",
    title: ["Seis mentes.", "Um começo."],
    text: "Somos a equipe por trás deste experimento. Cada nome aqui faz parte da construção.",
    note: "QUEM DEU O PRIMEIRO PASSO",
    signal: "04 — OS DESENVOLVEDORES",
  },
  {
    label: "Conhecer Aura",
    title: ["Sua ideia", "entra agora."],
    text: "Traga um problema, uma hipótese ou aquele rascunho que ainda não saiu do papel.",
    detail: "Agora, vamos conhecer a AURA.",
    note: "O PRÓXIMO CAPÍTULO É SEU",
    signal: "05 — ENTRAR NO UNIVERSO AURA",
  },
];
const developers = [
  "Guilherme Del Bosco",
  "Kelvin",
  "Enzo Pacheco",
  "Kauan Felipe",
  "MARCELO",
  "João Vitor",
];

// Measure actual wrapped lines, so words on the same line enter together on every viewport.
function RevealLines({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className: string;
  delay?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let active = true;
    const measure = () => {
      if (!active) return;
      let top = -1,
        line = -1;
      el.querySelectorAll<HTMLElement>(".reveal-word").forEach((word) => {
        if (word.offsetTop !== top) {
          top = word.offsetTop;
          line++;
        }
        word.style.setProperty("--line-delay", `${delay + line * 150}ms`);
      });
      el.dataset.ready = "true";
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    void document.fonts.ready.then(measure);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [text, delay]);
  return (
    <p ref={ref} className={`${className} reveal-lines`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, i) => (
          <span key={i} className="reveal-word">
            {word}
            {"\u00a0"}
          </span>
        ))}
      </span>
    </p>
  );
}

type Phase = "story" | "entering";
export default function Landing({ onEnter }: { onEnter: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("story");
  const phaseRef = useRef<Phase>("story");
  const distance = () =>
    Math.max(
      1,
      (document.documentElement.scrollHeight - innerHeight) /
        (chapters.length - 1),
    );
  const go = (index: number) =>
    window.scrollTo({
      top: Math.max(0, Math.min(index, chapters.length - 1)) * distance(),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  useEffect(() => {
    document.documentElement.dataset.auraStory = "true";
    return () => {
      delete document.documentElement.dataset.auraStory;
    };
  }, []);
  useEffect(() => {
    if (phase !== "story") return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const value = Math.max(
          0,
          Math.min(chapters.length - 1, window.scrollY / distance()),
        );
        setProgress(value / (chapters.length - 1));
        setStep(Math.min(chapters.length - 1, Math.round(value)));
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [phase]);
  useEffect(() => {
    if (phase !== "entering") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);
  const reveal = () => {
    if (phaseRef.current !== "story") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onEnter();
      return;
    }
    phaseRef.current = "entering";
    setPhase("entering");
  };
  const chapter = chapters[step];
  return (
    <main
      className={`landing academic-story ${phase === "entering" ? "academic-entering" : ""}`}
    >
      <div className="story-markers" aria-hidden="true">
        {chapters.map((c) => (
          <div className="story-marker" key={c.label} />
        ))}
      </div>
      <div className="story-stage academic-stage" data-step={step}>
        <div className="academic-interface" inert={phase === "entering"}>
          <header className="landing-header">
            <button
              className="wordmark"
              aria-label="Aura, início"
              onClick={() => go(0)}
            >
              <span className="brand-glyph">◌</span>AURA
              <span className="brand-ia">IA</span>
            </button>
            <span className="academic-header-note">
              IDEIAS EM ESTADO DE POSSIBILIDADE
            </span>
            <button className="header-enter" onClick={() => go(3)}>
              Nossa equipe <ArrowUpRight size={15} />
            </button>
          </header>
          <div className="ambient-grid" aria-hidden="true" />
          <div className="academic-copy">
            <section
              className="academic-chapter"
              key={step}
              aria-labelledby="academic-title"
            >
              <p className="eyebrow">{chapter.note}</p>
              <h1 id="academic-title">
                {chapter.title.map((line, index) => (
                  <span className={`title-line title-line-${index}`} key={line}>
                    <span
                      style={
                        { "--line-delay": `${index * 140}ms` } as CSSProperties
                      }
                    >
                      {line}
                    </span>
                  </span>
                ))}
              </h1>
              <RevealLines
                text={chapter.text}
                className="academic-description"
                delay={280}
              />
              {chapter.detail && (
                <RevealLines
                  text={chapter.detail}
                  className="academic-detail"
                  delay={780}
                />
              )}
              {step === 3 && (
                <ul
                  className="developer-list"
                  aria-label="Desenvolvedores da AURA"
                >
                  {developers.map((name, index) => (
                    <li
                      key={name}
                      style={{
                        animationDelay: `${520 + Math.floor(index / 2) * 150}ms`,
                      }}
                    >
                      <span>0{index + 1}</span>
                      {name}
                    </li>
                  ))}
                </ul>
              )}
              {step === 4 ? (
                <button
                  className="primary-button academic-cta"
                  onClick={reveal}
                >
                  Conhecer Aura <ArrowUpRight size={18} />
                </button>
              ) : (
                <button
                  className="text-button academic-next"
                  onClick={() => go(step + 1)}
                >
                  {step === 0 ? "Como tudo começou" : "Próximo capítulo"}
                  <ArrowDown size={16} />
                </button>
              )}
            </section>
          </div>
          <footer className="landing-footer">
            <button
              className="scroll-cue"
              onClick={() => go(Math.min(step + 1, 4))}
            >
              <span className="scroll-line" />
              <span>
                {step === 4
                  ? "SUA IDEIA É O PRÓXIMO PASSO"
                  : "ROLE. UM CAPÍTULO DE CADA VEZ."}
              </span>
            </button>
            <nav
              className="academic-steps"
              aria-label="Capítulos da apresentação"
            >
              {chapters.map((item, index) => (
                <button
                  key={item.label}
                  aria-label={`Ir para ${item.label}`}
                  aria-current={step === index ? "step" : undefined}
                  onClick={() => go(index)}
                >
                  <span />
                </button>
              ))}
              <span>0{step + 1} / 05</span>
            </nav>
            <span className="footer-note">
              Feita de perguntas. Por pessoas.
            </span>
          </footer>
        </div>
        <div
          className={`academic-core academic-core-${step}`}
          aria-hidden="true"
        >
          <AuraCore state={phase === "entering" ? "PROCESSING" : "IDLE"} />
          <div className="core-caption">
            A U R A<span>{chapter.signal}</span>
          </div>
        </div>
        <div
          className="story-progress"
          style={{ transform: `scaleX(${progress})` }}
        />
        <p className="sr-only" role="status">
          Capítulo {step + 1}: {chapter.label}
        </p>
      </div>
      {phase === "entering" && <AuraTransition onComplete={onEnter} />}
    </main>
  );
}
