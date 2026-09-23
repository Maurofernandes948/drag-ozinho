import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DRAGON_BG, DRAGON_MASCOT, CONVERTEAI_ACCOUNT, WELCOME_VIDEO_ID } from "../lib/assets";

function buildPlayerCode(videoId: string) {
  return `
      var s=document.createElement("script");
      s.src="https://scripts.converteai.net/${CONVERTEAI_ACCOUNT}/players/${videoId}/v4/player.js",
      s.async=!0,document.head.appendChild(s);
    `;
}

export default function WelcomeScreen({
  onStart,
}: {
  onStart: () => void;
}) {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = videoRef.current;
    if (!container) return;
    const player = document.createElement("vturb-smartplayer") as unknown as HTMLElement;
    player.id = `vid-${WELCOME_VIDEO_ID}`;
    player.style.cssText =
      "display:block;margin:0 auto;width:100%;max-width:400px;";
    container.appendChild(player);
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = buildPlayerCode(WELCOME_VIDEO_ID);
    container.appendChild(script);
    return () => {
      while (container.firstChild) container.removeChild(container.firstChild);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: "#0a0512" }}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={DRAGON_BG}
          alt=""
          width={1024}
          height={1024}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,5,18,0.75), rgba(26,5,48,0.85) 60%, rgba(10,5,18,0.95))",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[400px] mx-auto px-5 py-8 flex flex-col items-center min-h-screen">
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.img
            src={DRAGON_MASCOT}
            alt="Fortune Dragon"
            width={360}
            height={360}
            decoding="async"
            className="w-16 h-16 object-contain drop-shadow-2xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="text-left">
            <h1
              className="text-2xl leading-none"
              style={{
                background:
                  "linear-gradient(180deg, #FFF3B0, #FFC94D, #FF8A00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Russo One', sans-serif",
                textShadow: "none",
              }}
            >
              FORTUNE
              <br />
              DRAGON
            </h1>
            <span
              className="text-[10px] uppercase tracking-[0.25em]"
              style={{ color: "#C58BFF" }}
            >
              O jogo do momento
            </span>
          </div>
        </motion.div>

        <motion.div
          className="w-full rounded-2xl px-4 py-4 mb-5 text-center"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,47,208,0.18), rgba(122,27,201,0.28))",
            border: "1px solid rgba(255,47,208,0.45)",
            boxShadow: "0 0 30px rgba(255,47,208,0.25)",
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <p
            className="text-[11px] uppercase tracking-widest mb-1"
            style={{ color: "#C58BFF" }}
          >
            O Dragão escolheu-te
          </p>
          <p
            className="text-lg font-bold leading-tight text-white"
            style={{ fontFamily: "'Russo One', sans-serif" }}
          >
            10 rodadas grátis para ganhar até{" "}
            <span
              style={{
                background: "linear-gradient(180deg, #FFF3B0, #FFC94D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              125.000 Kz
            </span>
          </p>
          <p className="text-[11px] mt-1" style={{ color: "#7CFFB2" }}>
            ✅ Sem depósito • ✅ Sem cartão • ✅ Só jogar
          </p>
        </motion.div>

        <motion.div
          className="w-full rounded-2xl overflow-hidden mb-6"
          style={{
            border: "1px solid rgba(255,47,208,0.35)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          ref={videoRef}
        />

        <motion.button
          onClick={onStart}
          className="w-full py-4 rounded-xl text-lg font-bold"
          style={{
            background: "linear-gradient(135deg, #FFD34D, #FF8A00, #FF2FD0)",
            color: "#2A0B4D",
            fontFamily: "'Russo One', sans-serif",
            boxShadow: "0 0 30px rgba(255,47,208,0.5)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.97 }}
        >
          🐉 QUERO AS MINHAS 10 RODADAS
        </motion.button>

        <motion.p
          className="text-[10px] mt-3 text-center"
          style={{ color: "#9C86B4" }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⏳ Oferta de hoje — vagas limitadas por região
        </motion.p>
      </div>
    </div>
  );
}