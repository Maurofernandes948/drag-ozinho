import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DRAGON_BG, DRAGON_MASCOT } from "../lib/assets";

export type Amulet = {
  id: string;
  emoji: string;
  name: string;
  blessing: string;
};

export const AMULETS: Amulet[] = [
  {
    id: "fogo",
    emoji: "🔥",
    name: "Chama do Dragão",
    blessing: "Ganhos de fogo — multiplicador sobe mais depressa",
  },
  {
    id: "jade",
    emoji: "🟢",
    name: "Jade Antigo",
    blessing: "Protecção — a sua sequência resiste às derrotas",
  },
  {
    id: "moeda",
    emoji: "🪙",
    name: "Moeda Imperial",
    blessing: "Riqueza — rodadas surpresa pagam mais",
  },
];

export default function RitualScreen({
  playerName,
  onDone,
}: {
  playerName: string;
  onDone: (amulet: Amulet) => void;
}) {
  const [selected, setSelected] = useState<Amulet | null>(null);
  const [revealed, setRevealed] = useState(false);

  const choose = (amulet: Amulet) => {
    if (selected) return;
    setSelected(amulet);
    setRevealed(true);
    setTimeout(() => onDone(amulet), 2600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0">
        <img
          src={DRAGON_BG}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.75)" }}
        />
      </div>

      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none z-10"
          style={{
            width: 3,
            height: 3,
            background: "#FFD34D",
            left: `${10 + Math.random() * 80}%`,
            top: `${20 + Math.random() * 70}%`,
            boxShadow: "0 0 10px #FF8A00",
          }}
          animate={{ y: [0, -60], opacity: [0, 1, 0] }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      <motion.div
        className="relative z-20 w-full max-w-[380px] rounded-2xl px-5 py-6 text-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(45,12,80,0.96), rgba(26,5,48,0.98))",
          border: "1px solid rgba(255,47,208,0.35)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.img
          src={DRAGON_MASCOT}
          alt="Fortune Dragon"
          width={360}
          height={360}
          decoding="async"
          className="w-24 h-24 object-contain mx-auto drop-shadow-2xl"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <h2
          className="text-lg font-bold mt-2 mb-1"
          style={{
            background: "linear-gradient(180deg, #FFF3B0, #FFC94D, #FF8A00)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Russo One', sans-serif",
          }}
        >
          Ritual da Sorte
        </h2>
        <p className="text-xs mb-5" style={{ color: "#C58BFF" }}>
          {playerName}, antes da primeira rodada escolhe o teu amuleto. Só se
          escolhe <strong style={{ color: "#FFD34D" }}>uma vez</strong>.
        </p>

        <div className="space-y-3">
          {AMULETS.map((amulet) => {
            const isSelected = selected?.id === amulet.id;
            return (
              <motion.button
                key={amulet.id}
                onClick={() => choose(amulet)}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-xl p-3 flex items-center gap-3 text-left"
                style={{
                  background: isSelected
                    ? "linear-gradient(90deg, rgba(255,47,208,0.4), rgba(122,27,201,0.4))"
                    : "rgba(52,16,90,0.9)",
                  border: `1px solid ${
                    isSelected ? "#FFD34D" : "rgba(179,107,255,0.35)"
                  }`,
                  opacity: selected && !isSelected ? 0.35 : 1,
                }}
              >
                <motion.span
                  className="text-2xl"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: Math.random(),
                  }}
                >
                  {amulet.emoji}
                </motion.span>
                <div>
                  <div className="text-sm font-bold text-white">
                    {amulet.name}
                  </div>
                  <div className="text-[10px]" style={{ color: "#9C86B4" }}>
                    {amulet.blessing}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {revealed && selected && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(8,0,18,0.92)" }}
          >
            <motion.div
              className="text-7xl"
              animate={{ scale: [0.6, 1.4, 1], rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.4 }}
            >
              {selected.emoji}
            </motion.div>
            <motion.p
              className="mt-5 text-lg font-bold text-center px-8"
              style={{
                color: "#FFD34D",
                fontFamily: "'Russo One', sans-serif",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              O Dragão aceitou o teu amuleto
            </motion.p>
            <motion.p
              className="mt-2 text-xs text-center px-10"
              style={{ color: "#C58BFF" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {selected.blessing}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}