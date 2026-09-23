import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BanknotesIcon,
  BoltIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  FaceFrownIcon,
  FireIcon,
  GiftIcon,
  PhoneIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import type { Amulet } from "./RitualScreen";
import {
  COIN_IMAGE,
  DRAGON_BG,
  DRAGON_MASCOT,
  MULTICAIXA_EXPRESS,
  SYMBOLS,
  CONVERTEAI_ACCOUNT,
  ACTIVATION_VIDEO_ID,
} from "../lib/assets";

type SymbolDef = { id: string; image: string; name: string };
type Grid = SymbolDef[][];
type DragonState = "idle" | "spinning" | "win" | "mega-win" | "lose";
type ScreenState = "playing" | "bonus-end" | "withdraw";
type WithdrawStage = "choose" | "form" | "processing" | "confirmed" | "activation";

const WIN_LINES = [
  {
    type: "horizontal-top",
    positions: [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
  },
  {
    type: "horizontal-mid",
    positions: [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
  {
    type: "horizontal-bot",
    positions: [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
  },
  {
    type: "diagonal-down",
    positions: [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
  },
  {
    type: "diagonal-up",
    positions: [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  },
];

const HIGH_VALUE = SYMBOLS.filter((s) =>
  ["wild", "ingot", "envelope", "gourd", "lantern"].includes(s.id),
);

const ROUNDS = [
  { round: 1, win: true, amount: 4000, label: "GRANDE GANHO" },
  { round: 2, win: true, amount: 9000, label: "GRANDE GANHO" },
  { round: 3, win: false, amount: 0, label: "" },
  { round: 4, win: true, amount: 12000, label: "GRANDE GANHO" },
  { round: 5, win: true, amount: 11000, label: "MEGA GANHO" },
  { round: 6, win: false, amount: 0, label: "" },
  { round: 7, win: true, amount: 17000, label: "MEGA GANHO" },
  { round: 8, win: true, amount: 22000, label: "MEGA GANHO" },
  { round: 9, win: false, amount: 0, label: "" },
  { round: 10, win: true, amount: 50000, label: "SUPER MEGA GANHO" },
];

const FUTURE_GAINS = ROUNDS.map((r) => (r.win ? r.amount : 0));

const SURPRISES = {
  3: {
    id: "dobrada",
    Icon: BoltIcon,
    title: "RODADA DOBRADA",
    subtitle: "O que ganhares aqui vale a DOBRAR",
    bonus: 2,
  },
  6: {
    id: "dourada",
    Icon: StarIcon,
    title: "RODADA DOURADA",
    subtitle: "O dragão liberta o baú imperial — x3",
    bonus: 3,
  },
  9: {
    id: "relampago",
    Icon: FireIcon,
    title: "DESAFIO RELÂMPAGO",
    subtitle: "Sopro do dragão: ganho x5 nesta rodada",
    bonus: 5,
  },
};

const SURPRISE_ROUNDS = Object.keys(SURPRISES).map(Number);
const BET_LEVELS = [500, 1000, 2000, 5000, 10000];

const randomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

const randomGrid = () =>
  Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => randomSymbol()),
  );

const winningGrid = () => {
  const symbol = HIGH_VALUE[Math.floor(Math.random() * HIGH_VALUE.length)];
  const line = WIN_LINES[Math.floor(Math.random() * WIN_LINES.length)];
  const grid = randomGrid();
  for (const [col, row] of line.positions) grid[col][row] = symbol;
  return { grid, winLine: line.type };
};

const losingGrid = () => {
  let grid: Grid;
  do {
    grid = randomGrid();
  } while (
    WIN_LINES.some((line) => {
      const ids = line.positions.map(([col, row]) => grid[col][row].id);
      return ids[0] === ids[1] && ids[1] === ids[2];
    })
  );
  return grid;
};

const formatAO = (value: number) =>
  new Intl.NumberFormat("pt-AO").format(value);

/* ------------------------------------------------------------------ */
/* DragonDisplay (ea)                                                  */
/* ------------------------------------------------------------------ */

function DragonDisplay({ state }: { state: DragonState }) {
  const isWin = state === "win" || state === "mega-win";
  return (
    <div
      className="relative flex justify-center h-[140px] sm:h-[180px]"
      style={{ marginBottom: "-8px", zIndex: 20 }}
    >
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          width: "150px",
          height: "150px",
          top: "-10px",
          background: isWin
            ? "radial-gradient(circle, rgba(255,0,200,0.65), rgba(140,60,255,0.3), transparent)"
            : "radial-gradient(circle, rgba(140,60,255,0.35), rgba(255,0,200,0.15), transparent)",
        }}
        animate={{ opacity: isWin ? [0.5, 1, 0.5] : [0.3, 0.55, 0.3], scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: isWin ? 0.5 : 3, repeat: Infinity }}
      />
      <motion.img
        src={DRAGON_MASCOT}
        alt="Fortune Dragon"
        width={360}
        height={360}
        decoding="async"
        className="relative z-10 object-contain w-[135px] h-[142px] sm:w-[170px] sm:h-[180px]"
        style={{
          filter: isWin
            ? "drop-shadow(0 0 22px rgba(255,0,200,0.8)) drop-shadow(0 8px 14px rgba(0,0,0,0.5))"
            : "drop-shadow(0 0 14px rgba(160,80,255,0.5)) drop-shadow(0 8px 14px rgba(0,0,0,0.5))",
        }}
        animate={
          state === "spinning"
            ? {
                y: [0, -6, 0],
                rotate: [0, -3, 3, 0],
                transition: { duration: 0.3, repeat: Infinity },
              }
            : state === "win"
              ? {
                  y: [0, -16, 0],
                  scale: [1, 1.12, 1],
                  transition: { duration: 0.5, repeat: 4 },
                }
              : state === "mega-win"
                ? {
                    y: [0, -22, 0],
                    scale: [1, 1.18, 1],
                    rotate: [0, -6, 6, 0],
                    transition: { duration: 0.4, repeat: 8 },
                  }
                : state === "lose"
                  ? { x: [0, -4, 4, 0], transition: { duration: 0.3 } }
                  : {
                      y: [0, -7, 0],
                      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                    }
        }
      />
      {state === "mega-win" && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 6,
                height: 6,
                left: "50%",
                top: "65%",
                background: i % 2 ? "#FF2FD0" : "#FFD34D",
                boxShadow: `0 0 10px ${i % 2 ? "#FF2FD0" : "#FFD34D"}`,
              }}
              animate={{
                x: [0, (i - 5) * 22],
                y: [0, -40 - Math.random() * 30],
                opacity: [1, 0],
                scale: [0.6, 1.6],
              }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.07 }}
            />
          ))}
        </div>
      )}
      {isWin && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${5 + Math.random() * 90}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.3, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                repeat: Infinity,
                repeatDelay: 0.2,
              }}
            >
              <SparklesIcon className="w-4 h-4" style={{ color: "#FFE680" }} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ReelColumn (fa)                                                     */
/* ------------------------------------------------------------------ */

const REEL_STRIP = [...SYMBOLS, ...SYMBOLS, ...SYMBOLS];

function ReelColumn({
  symbols,
  spinning,
  delay,
}: {
  symbols: SymbolDef[];
  spinning: boolean;
  delay: number;
}) {
  return (
    <div
      className="flex-1 flex flex-col overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, #2A0B4D, #1B0533, #2A0B4D)",
      }}
    >
      <div
        className="absolute inset-y-0 left-0 w-[1px] z-10"
        style={{
          background: "rgba(255,47,208,0.45)",
          boxShadow: "0 0 6px rgba(255,47,208,0.6)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-[1px] z-10"
        style={{
          background: "rgba(255,47,208,0.45)",
          boxShadow: "0 0 6px rgba(255,47,208,0.6)",
        }}
      />
      {spinning ? (
        <motion.div
          className="flex flex-col"
          animate={{ y: [0, -900] }}
          transition={{
            duration: 0.08,
            repeat: Infinity,
            ease: "linear",
            delay: delay * 0.015,
          }}
        >
          {REEL_STRIP.map((sym, i) => (
            <div
              key={i}
              className="h-[60px] sm:h-[90px] flex items-center justify-center p-1"
              style={{ filter: "blur(2px)" }}
            >
              <img
                src={sym.image}
                alt=""
                decoding="async"
                className="w-[48px] h-[48px] sm:w-[70px] sm:h-[70px] object-contain"
              />
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col">
          {symbols.map((sym, i) => (
            <motion.div
              key={`${sym.id}-${i}`}
              className="h-[60px] sm:h-[90px] flex items-center justify-center p-1"
              initial={{ y: -30, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 18,
                delay: delay + i * 0.05,
              }}
            >
              <img
                src={sym.image}
                alt={sym.name}
                decoding="async"
                className="w-[48px] h-[48px] sm:w-[70px] sm:h-[70px] object-contain"
                style={{
                  filter:
                    "drop-shadow(0 4px 6px rgba(0,0,0,0.5)) drop-shadow(0 0 10px rgba(255,47,208,0.35))",
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WinModal (pa)                                                       */
/* ------------------------------------------------------------------ */

function WinModal({
  show,
  label,
  amount,
  isMega,
}: {
  show: boolean;
  label: string;
  amount: number;
  isMega: boolean;
}) {
  const formatted = formatAO(amount);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
          {isMega && (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,47,208,0.28), transparent 70%)",
              }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.5, repeat: 4 }}
            />
          )}
          <motion.div
            className="absolute w-[420px] h-[420px] pointer-events-none"
            style={{
              background:
                "repeating-conic-gradient(rgba(255,47,208,0.20) 0deg 8deg, transparent 8deg 16deg)",
              borderRadius: "50%",
              maskImage: "radial-gradient(circle, black 20%, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(circle, black 20%, transparent 70%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="relative z-10 text-center px-6 py-6 rounded-2xl mx-8"
            style={{
              background:
                "linear-gradient(180deg, rgba(72,18,120,0.97), rgba(30,6,58,0.97))",
              border: "2px solid #FF2FD0",
              boxShadow:
                "0 0 45px rgba(255,47,208,0.55), inset 0 0 25px rgba(160,80,255,0.35)",
              maxWidth: "310px",
            }}
            initial={{ scale: 0, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 15 }}
          >
            <motion.div
              className={`font-bold mb-2 ${isMega ? "text-2xl" : "text-xl"}`}
              style={{
                background:
                  "linear-gradient(180deg, #FFF3B0, #FFC94D, #FF8A00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Russo One', sans-serif",
                filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.45)) drop-shadow(0 0 4px rgba(255,200,80,0.45))",
              }}
              animate={isMega ? { scale: [1, 1.09, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <FireIcon className="inline-block w-6 h-6 align-[-2px]" style={{ color: "#FF8A00" }} />{" "}
              {label}{" "}
              <FireIcon className="inline-block w-6 h-6 align-[-2px]" style={{ color: "#FF8A00" }} />
            </motion.div>
            <motion.div
              className="font-bold text-3xl"
              style={{
                color: "#7CFFB2",
                fontFamily: "'Orbitron', sans-serif",
                textShadow: "0 2px 0 rgba(0,0,0,0.45), 0 0 6px rgba(124,255,178,0.45)",
              }}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              +{formatted} Kz
            </motion.div>
            <motion.img
              src={DRAGON_MASCOT}
              alt=""
              loading="lazy"
              width={360}
              height={360}
              className="mx-auto mt-3 w-16 h-16 object-contain"
              style={{ filter: "drop-shadow(0 0 14px rgba(255,47,208,0.8))" }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.25, 1], rotate: [0, 8, -8, 0] }}
              transition={{ delay: 0.35, duration: 0.5 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* CoinRain (ga)                                                       */
/* ------------------------------------------------------------------ */

function CoinRain({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {[...Array(25)].map((_, i) => {
        const size = 20 + Math.random() * 20;
        return (
          <motion.img
            key={i}
            src={COIN_IMAGE}
            alt=""
            decoding="async"
            className="absolute"
            style={{ width: size, height: size }}
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400),
              y: -60,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              y:
                (typeof window !== "undefined" ? window.innerHeight : 800) + 60,
              rotate: 720,
              opacity: [1, 1, 0.5],
            }}
            transition={{
              duration: 1.8 + Math.random() * 1.2,
              delay: Math.random() * 0.8,
              ease: "easeIn",
            }}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MegaFlash (ya)                                                      */
/* ------------------------------------------------------------------ */

function MegaFlash({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <>
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background:
                "radial-gradient(circle at 50% 80%, rgba(255,47,208,0.3), transparent 60%)",
            }}
          />
          {[...Array(12)].map((_, i) => {
            const angle = ((i / 12) * 360 * Math.PI) / 180;
            const radius = 80 + Math.random() * 60;
            return (
              <motion.div
                key={i}
                className="fixed z-50 pointer-events-none"
                style={{
                  left: "50%",
                  bottom: "120px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: i % 2 === 0 ? "#FFD34D" : "#FF6B35",
                  boxShadow: `0 0 8px ${i % 2 === 0 ? "#FFD34D" : "#FF6B35"}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * radius,
                  y: Math.sin(angle) * radius - 40,
                  opacity: 0,
                  scale: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.02,
                  ease: "easeOut",
                }}
              />
            );
          })}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`streak-${i}`}
              className="fixed z-50 pointer-events-none"
              style={{
                left: `${20 + i * 12}%`,
                bottom: "100px",
                width: "2px",
                height: "40px",
                background: "linear-gradient(to top, #FFD34D, transparent)",
                borderRadius: "2px",
              }}
              initial={{ y: 0, opacity: 0.8, scaleY: 0 }}
              animate={{ y: -80, opacity: 0, scaleY: 1 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* WinLine (ba)                                                        */
/* ------------------------------------------------------------------ */

function WinLine({ type, visible }: { type: string; visible: boolean }) {
  if (!visible) return null;
  const coords = {
    "horizontal-top": { x1: "0%", y1: "16.7%", x2: "100%", y2: "16.7%" },
    "horizontal-mid": { x1: "0%", y1: "50%", x2: "100%", y2: "50%" },
    "horizontal-bot": { x1: "0%", y1: "83.3%", x2: "100%", y2: "83.3%" },
    "diagonal-down": { x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
    "diagonal-up": { x1: "0%", y1: "100%", x2: "100%", y2: "0%" },
  } as Record<string, { x1: string; y1: string; x2: string; y2: string }>;
  const s = coords[type] || coords["horizontal-mid"];
  return (
    <motion.svg
      className="absolute inset-0 z-30 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.line
        x1={s.x1}
        y1={s.y1}
        x2={s.x2}
        y2={s.y2}
        stroke="rgba(255,47,208,0.5)"
        strokeWidth="10"
        strokeLinecap="round"
        filter="url(#glow)"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
      <motion.line
        x1={s.x1}
        y1={s.y1}
        x2={s.x2}
        y2={s.y2}
        stroke="#FFE27A"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4 }}
      />
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </motion.svg>
  );
}

/* ------------------------------------------------------------------ */
/* MultiplierChips (_a)                                                */
/* ------------------------------------------------------------------ */

const MULTIPLIERS = [2, 5, 10];

function MultiplierChips({
  active,
  charging,
}: {
  active: number | null;
  charging: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-2 my-0.5 sm:my-1.5">
      {MULTIPLIERS.map((mult, i) => {
        const isActive = active === mult;
        return (
          <motion.div
            key={mult}
            className="relative flex items-center justify-center rounded-full w-10 h-10 sm:w-11 sm:h-11"
            style={{
              background: isActive
                ? "radial-gradient(circle at 35% 30%, #FFE27A, #FF2FD0 60%, #7A1BC9)"
                : "radial-gradient(circle at 35% 30%, rgba(190,140,255,0.35), rgba(60,20,110,0.9))",
              border: `2px solid ${
                isActive ? "#FFE27A" : "rgba(190,140,255,0.5)"
              }`,
              boxShadow: isActive
                ? "0 0 22px rgba(255,47,208,0.9), inset 0 0 12px rgba(255,255,255,0.5)"
                : "0 0 8px rgba(120,60,200,0.5)",
            }}
            animate={
              isActive
                ? { scale: [1, 1.22, 1] }
                : charging
                  ? { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }
                  : { scale: 1, opacity: 0.85 }
            }
            transition={{
              duration: charging && !isActive ? 0.5 : 0.45,
              repeat: Infinity,
              delay: i * 0.12,
            }}
          >
            <span
              className="font-bold text-xs sm:text-sm"
              style={{
                color: isActive ? "#3A0060" : "#E6CCFF",
                fontFamily: "'Orbitron', sans-serif",
                textShadow: isActive
                  ? "none"
                  : "0 0 4px rgba(190,120,255,0.6)",
              }}
            >
              x{mult}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EarningsTicker (wa)                                                 */
/* ------------------------------------------------------------------ */

const TICKER_NAMES = [
  "Joana M.",
  "Carlos D.",
  "Nzinga A.",
  "Paulo S.",
  "Edna K.",
  "Miguel T.",
  "Domingas F.",
  "Ruben C.",
  "Ivete L.",
  "Adão P.",
  "Sónia B.",
  "Kiala N.",
];
const TICKER_CITIES = ["Luanda", "Benguela", "Huambo", "Lubango", "Cabinda", "Malanje"];

const newTicker = () => ({
  id: Math.random().toString(36).slice(2),
  name: TICKER_NAMES[Math.floor(Math.random() * TICKER_NAMES.length)],
  city: TICKER_CITIES[Math.floor(Math.random() * TICKER_CITIES.length)],
  amount: (Math.floor(Math.random() * 48) + 8) * 2500,
});

function EarningsTicker() {
  const [winner, setWinner] = useState(newTicker);
  useEffect(() => {
    const interval = setInterval(() => setWinner(newTicker()), 4500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div
      className="mx-4 mt-1 h-7 sm:mt-2 sm:h-9 relative overflow-hidden rounded-lg"
      style={{
        background:
          "linear-gradient(90deg, rgba(60,12,105,0.9), rgba(120,20,140,0.85), rgba(60,12,105,0.9))",
        border: "1px solid rgba(255,47,208,0.45)",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={winner.id}
          className="absolute inset-0 flex items-center justify-center gap-2 px-3"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              background: "#7CFFB2",
              boxShadow: "0 0 8px #7CFFB2",
            }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-[10px] truncate" style={{ color: "#F0D9FF" }}>
            <strong style={{ color: "#FFD34D" }}>{winner.name}</strong> de{" "}
            {winner.city} acabou de ganhar
          </span>
          <span
            className="text-[11px] font-bold flex-shrink-0"
            style={{
              color: "#7CFFB2",
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            {formatAO(winner.amount)} Kz
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BonusEndScreen (ja)                                                 */
/* ------------------------------------------------------------------ */

function BonusEndScreen({
  totalWin,
  onContinue,
}: {
  totalWin: number;
  onContinue: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundImage: `url(${DRAGON_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(10,10,20,0.75)" }}
      />
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none z-10"
          style={{
            width: 3 + Math.random() * 4,
            height: 3 + Math.random() * 4,
            background: "#FFD34D",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: "0 0 6px #FFD34D",
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
      <motion.div
        className="relative z-10 w-full max-w-[340px] mx-4 rounded-2xl p-6 text-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,30,40,0.97), rgba(15,15,25,0.98))",
          border: "1px solid rgba(179,107,255,0.3)",
          boxShadow: "0 0 40px rgba(255,47,208,0.1)",
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(60,50,30,0.6)" }}
        >
          <SparklesIcon className="w-7 h-7" style={{ color: "#FFD34D" }} />
        </div>
        <h2
          className="text-lg font-bold text-white mb-1"
          style={{ fontFamily: "'Russo One', sans-serif" }}
        >
          As tuas jogadas bónus terminaram
        </h2>
        <p className="text-xs mb-5" style={{ color: "#888" }}>
          Os ganhos obtidos estão agora disponíveis para levantamento.
        </p>
        <div
          className="h-px mb-3"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(179,107,255,0.3), transparent)",
          }}
        />
        <p className="text-xs mb-1" style={{ color: "#999" }}>
          Total ganho
        </p>
        <motion.p
          className="text-3xl font-bold mb-5"
          style={{
            background: "linear-gradient(180deg, #7CFFB2, #16a34a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Orbitron', sans-serif",
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {formatAO(totalWin)} Kz
        </motion.p>
        <div
          className="h-px mb-5"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(179,107,255,0.3), transparent)",
          }}
        />
        <motion.button
          onClick={onContinue}
          className="w-full py-3.5 rounded-xl text-base font-bold"
          style={{
            background: "linear-gradient(135deg, #FFD34D, #FF8A00, #FF2FD0)",
            color: "#2A0B4D",
            fontFamily: "'Russo One', sans-serif",
          }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="inline-flex items-center justify-center gap-2"><BanknotesIcon className="w-5 h-5" />Sacar</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Validation helpers (zod-equivalent)                                 */
/* ------------------------------------------------------------------ */

const validateExpressNumber = (raw: string): string | null => {
  const normalized = raw.replace(/\D/g, "");
  if (!/^9\d{8}$/.test(normalized)) {
    return "Digite um número angolano válido com 9 dígitos.";
  }
  return null;
};

const validateIBANForm = (data: {
  name: string;
  phone: string;
  iban: string;
}) => {
  const errors: Record<string, string> = {};
  const name = data.name.trim();
  if (name.length < 3) errors.name = "Digite o nome completo do titular.";
  else if (name.length > 100) errors.name = "O nome é demasiado longo.";
  const phoneError = validateExpressNumber(data.phone);
  if (phoneError) errors.phone = phoneError;
  const iban = data.iban.replace(/\s/g, "").toUpperCase();
  if (!/^AO\d{23}$/.test(iban))
    errors.iban = "Digite um IBAN angolano válido iniciado por AO.";
  return errors;
};

/* ------------------------------------------------------------------ */
/* ActivationScreen (Ya)                                               */
/* ------------------------------------------------------------------ */

const ACTIVATION_NAMES = [
  "Sofia R.",
  "Carlos M.",
  "Ana T.",
  "Pedro L.",
  "Maria J.",
  "João S.",
  "Rita F.",
  "Bruno A.",
  "Luísa C.",
  "André P.",
  "Helena D.",
  "Miguel N.",
  "Teresa B.",
  "Rui G.",
  "Inês V.",
];

function ActivationScreen({ totalWin }: { totalWin: number }) {
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => {
      const name = ACTIVATION_NAMES[Math.floor(Math.random() * ACTIVATION_NAMES.length)];
      const amount = Math.floor(Math.random() * 42001) + 95000;
      setWinnerName(name);
      setTimeout(() => setWinnerName(null), 4000);
      void amount;
    };
    tick();
    const interval = setInterval(tick, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = videoRef.current;
    if (!container) return;
    const player = document.createElement("vturb-smartplayer") as unknown as HTMLElement;
    player.id = `vid-${ACTIVATION_VIDEO_ID}`;
    player.style.cssText =
      "display:block;margin:0 auto;width:100%;max-width:400px;";
    const placeholder = document.createElement("div");
    placeholder.className = "vturb-player-placeholder";
    placeholder.style.cssText =
      "position:relative;width:100%;padding:178.21782178217822% 0 0;z-index:0;background-color:black;";
    player.appendChild(placeholder);
    container.appendChild(player);
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = `
      var s=document.createElement("script");
      s.src="https://scripts.converteai.net/${CONVERTEAI_ACCOUNT}/players/${ACTIVATION_VIDEO_ID}/v4/player.js",
      s.async=!0,document.head.appendChild(s);
    `;
    container.appendChild(script);
    return () => {
      while (container.firstChild) container.removeChild(container.firstChild);
    };
  }, []);

  const formatted = formatAO(totalWin);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#0a0a0a" }}>
      <div className="relative z-10 w-full max-w-[400px] mx-auto px-5 py-10 flex flex-col items-center min-h-screen">
        <h2
          className="text-xl font-bold text-center mb-6 leading-tight"
          style={{ color: "#FFC106", fontFamily: "'Russo One', sans-serif" }}
        >
          ASSISTA O VÍDEO ABAIXO PARA VER COMO RECEBER O SEU DINHEIRO AGORA
          MESMO
        </h2>
        <div className="w-full rounded-2xl overflow-hidden" ref={videoRef} />
      </div>
      <AnimatePresence>
        {winnerName && (
          <motion.div
            className="fixed bottom-6 left-4 right-4 z-[60] flex items-center gap-3 rounded-xl px-4 py-3 mx-auto max-w-[380px]"
            style={{
              background: "rgba(30,32,40,0.95)",
              border: "1px solid rgba(179,107,255,0.4)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <CheckCircleIcon className="w-5 h-5 shrink-0" style={{ color: "#22C55E" }} />
            <p className="text-xs text-white">
              <strong>{winnerName}</strong>{" "}
              <span style={{ color: "#888" }}>levantou</span>{" "}
              <strong style={{ color: "#7CFFB2" }}>
                {formatAO(Math.floor(Math.random() * 42001) + 95000)} Kz
              </strong>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="sr-only">{formatted}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WithdrawScreen (es)                                                 */
/* ------------------------------------------------------------------ */

function WithdrawScreen({ totalWin }: { totalWin: number }) {
  const [method, setMethod] = useState<string>("none");
  const [stage, setStage] = useState<WithdrawStage>("choose");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [iban, setIban] = useState("");
  const [expressNumber, setExpressNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bgStyle = {
    backgroundImage: `url(${DRAGON_BG})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const submitForm = () => {
    if (method === "express") {
      const err = validateExpressNumber(expressNumber);
      if (err) {
        setErrors({ expressNumber: err });
        return;
      }
    } else {
      const formErrors = validateIBANForm({ name, phone, iban });
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
      }
    }
    setErrors({});
    setStage("processing");
  };

  useEffect(() => {
    if (stage === "processing") {
      const timer = setTimeout(() => setStage("confirmed"), 3000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const goActivation = () => setStage("activation");

  if (stage === "activation")
    return <ActivationScreen totalWin={totalWin} />;

  if (stage === "processing")
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "#0d0d12" }}
      >
        <motion.div
          className="text-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full mx-auto mb-6"
            style={{
              border: "3px solid rgba(255,255,255,0.1)",
              borderTopColor: "rgba(255,255,255,0.7)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2
            className="text-xl font-bold text-white mb-2"
            style={{ fontFamily: "'Russo One', sans-serif" }}
          >
            Verificando seus dados
          </h2>
          <p className="text-sm mb-6" style={{ color: "#666" }}>
            Por favor aguarde...
          </p>
          <div
            className="w-64 h-1 rounded-full mx-auto overflow-hidden"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "rgba(255,255,255,0.4)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>
    );

  if (stage === "confirmed")
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={bgStyle}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.55)" }}
        />
        <motion.div
          className="relative z-10 w-[calc(100%-40px)] max-w-[380px] mx-auto rounded-2xl p-6 text-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(45,12,80,0.95), rgba(26,5,48,0.97))",
            border: "1px solid rgba(255,47,208,0.35)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(34,197,94,0.15)" }}
          >
            <CheckCircleIcon className="w-8 h-8" style={{ color: "#22C55E" }} />
          </div>
          <h2
            className="text-lg font-bold mb-1"
            style={{ color: "#7CFFB2", fontFamily: "'Russo One', sans-serif" }}
          >
            Dados verificados com sucesso
          </h2>
          <p className="text-xs mb-4" style={{ color: "#888" }}>
            Os seus dados foram validados
          </p>
          <div
            className="h-px mb-3"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(179,107,255,0.4), transparent)",
            }}
          />
          <p className="text-xs mb-1" style={{ color: "#999" }}>
            Total disponível para levantamento
          </p>
          <motion.p
            className="text-3xl font-bold mb-4"
            style={{
              background: "linear-gradient(180deg, #7CFFB2, #16a34a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "'Orbitron', sans-serif",
            }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {formatAO(totalWin)} Kz
          </motion.p>
          <div
            className="h-px mb-4"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(179,107,255,0.4), transparent)",
            }}
          />
          <div className="text-left space-y-2.5 mb-5">
            {method === "express" ? (
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: "#ccc" }}
              >
                <img src={MULTICAIXA_EXPRESS} alt="Multicaixa Express" className="w-5 h-5 rounded object-contain" />
                <span>
                  Express: <strong className="text-white">{expressNumber}</strong>
                </span>
              </div>
            ) : (
              <>
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "#ccc" }}
                >
                  <UserIcon className="w-4 h-4 shrink-0" />
                  <span>{name}</span>
                </div>
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "#ccc" }}
                >
                  <PhoneIcon className="w-4 h-4 shrink-0" />
                  <span>{phone}</span>
                </div>
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "#ccc" }}
                >
                  <BuildingLibraryIcon className="w-4 h-4 shrink-0" />
                  <span>IBAN: {iban}</span>
                </div>
              </>
            )}
          </div>
          <motion.button
            onClick={goActivation}
            className="w-full py-3.5 rounded-xl text-base font-bold"
            style={{
              background: "linear-gradient(135deg, #FFD34D, #FF8A00, #FF2FD0)",
              color: "#2A0B4D",
              fontFamily: "'Russo One', sans-serif",
            }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="inline-flex items-center justify-center gap-2"><BanknotesIcon className="w-5 h-5" />Levantar meus ganhos agora</span>
          </motion.button>
        </motion.div>
      </div>
    );

  if (method === "none" || stage === "choose") {
    const methods = [
      {
        id: "express",
        icon: (
          <img
            src={MULTICAIXA_EXPRESS}
            alt="Multicaixa Express"
            className="w-12 h-12 rounded-lg object-contain"
          />
        ),
        title: "Multicaixa Express",
        reveal: "Receba pelo seu número Express",
        detail: "Taxa de processamento de 2%",
        fields: "Preencha o número associado ao Express",
        glow: "#FF2FD0",
      },
      {
        id: "iban",
        icon: (
          <BuildingLibraryIcon className="w-10 h-10" style={{ color: "#FFD34D" }} />
        ),
        title: "Transferência por IBAN",
        reveal: "Receba diretamente na sua conta bancária",
        detail: "Processamento em até 24 horas",
        fields: "Preencha nome, telefone e IBAN",
        glow: "#FFD34D",
      },
    ];
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-6"
        style={bgStyle}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.6)" }}
        />
        <motion.div
          className="relative z-10 w-[calc(100%-32px)] max-w-[390px] mx-auto rounded-2xl px-5 py-7"
          style={{
            background:
              "linear-gradient(180deg, rgba(45,12,80,0.95), rgba(26,5,48,0.97))",
            border: "1px solid rgba(255,47,208,0.35)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2
            className="text-lg font-bold text-center mb-1"
            style={{
              background: "linear-gradient(180deg, #FFF3B0, #FFC94D, #FF8A00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "'Russo One', sans-serif",
            }}
          >
            Como deseja receber o seu saque?
          </h2>
          <p className="text-[11px] text-center mb-3" style={{ color: "#C58BFF" }}>
            Escolha Express ou IBAN e preencha os seus dados.
          </p>
          <p
            className="text-xl font-bold text-center"
            style={{
              background: "linear-gradient(180deg, #7CFFB2, #16a34a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            {formatAO(totalWin)} Kz
          </p>
          <p className="text-[10px] text-center mb-5" style={{ color: "#666" }}>
            no seu cofre do dragão
          </p>
          <div className="grid grid-cols-2 gap-3">
            {methods.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => {
                  setMethod(m.id);
                  setErrors({});
                  setStage("form");
                }}
                whileTap={{ scale: 0.96 }}
                className="rounded-xl p-3 text-center min-h-[188px] flex flex-col items-center justify-center"
                style={{
                  background:
                    "linear-gradient(170deg, rgba(60,18,105,0.95), rgba(26,5,48,0.98))",
                  border: `1px solid ${m.glow}`,
                  boxShadow: `0 0 16px ${m.glow}33`,
                }}
              >
                <div className="mb-2 flex justify-center">{m.icon}</div>
                <div
                  className="text-[12px] font-bold"
                  style={{ color: "#FFD34D" }}
                >
                  {m.title}
                </div>
                <div className="text-[10px] text-white mt-2 leading-tight">
                  {m.reveal}
                </div>
                <div className="text-[9px] mt-1" style={{ color: "#9C86B4" }}>
                  {m.detail}
                </div>
                <div
                  className="text-[9px] mt-3 px-2 py-1.5 rounded-full inline-block"
                  style={{
                    background: "linear-gradient(135deg, #FFD34D, #FF2FD0)",
                    color: "#2A0B4D",
                    fontWeight: 700,
                  }}
                >
                  {m.fields}
                </div>
              </motion.button>
            ))}
          </div>
          <p className="text-[10px] text-center mt-4" style={{ color: "#888" }}>
            Poderá voltar e escolher outro método antes de confirmar.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={bgStyle}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.55)" }}
      />
      <motion.div
        className="relative z-10 w-[calc(100%-40px)] max-w-[380px] mx-auto rounded-2xl px-6 py-8"
        style={{
          background:
            "linear-gradient(180deg, rgba(45,12,80,0.95), rgba(26,5,48,0.97))",
          border: "1px solid rgba(255,47,208,0.35)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => {
            setMethod("none");
            setErrors({});
            setStage("choose");
          }}
          className="text-xs mb-3"
          style={{ color: "#888" }}
        >
          <span className="inline-flex items-center gap-1">
            <ArrowLeftIcon className="w-3 h-3" /> Voltar
          </span>
        </button>
        <h2
          className="text-lg font-bold text-white mb-5"
          style={{ fontFamily: "'Russo One', sans-serif" }}
        >
          {method === "express" ? (
            <span className="flex items-center gap-2">
              <img
                src={MULTICAIXA_EXPRESS}
                alt=""
                className="w-8 h-8 rounded-md object-contain"
              />
              Multicaixa Express
            </span>
          ) : (
            "Registrar IBAN"
          )}
        </h2>
        {method === "express" ? (
          <div className="space-y-3">
            <div>
              <label
                className="text-[10px] mb-1 block"
                style={{ color: "#888" }}
              >
                Número Express
              </label>
              <input
                type="tel"
                value={expressNumber}
                onChange={(e) => {
                  setExpressNumber(e.target.value.slice(0, 15));
                  setErrors({});
                }}
                placeholder="9XX XXX XXX"
                maxLength={15}
                autoComplete="tel"
                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
                style={{
                  background: "rgba(52,16,90,0.9)",
                  border: "1px solid rgba(179,107,255,0.4)",
                }}
              />
              {errors.expressNumber && (
                <p className="text-[10px] mt-1 text-red-300">
                  {errors.expressNumber}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label
                className="text-[10px] mb-1 block"
                style={{ color: "#888" }}
              >
                Nome completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value.slice(0, 100));
                  setErrors({});
                }}
                placeholder="Nome do titular"
                maxLength={100}
                autoComplete="name"
                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
                style={{
                  background: "rgba(52,16,90,0.9)",
                  border: "1px solid rgba(179,107,255,0.4)",
                }}
              />
              {errors.name && (
                <p className="text-[10px] mt-1 text-red-300">{errors.name}</p>
              )}
            </div>
            <div>
              <label
                className="text-[10px] mb-1 block"
                style={{ color: "#888" }}
              >
                Número de telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.slice(0, 15));
                  setErrors({});
                }}
                placeholder="9XX XXX XXX"
                maxLength={15}
                autoComplete="tel"
                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
                style={{
                  background: "rgba(52,16,90,0.9)",
                  border: "1px solid rgba(179,107,255,0.4)",
                }}
              />
              {errors.phone && (
                <p className="text-[10px] mt-1 text-red-300">{errors.phone}</p>
              )}
            </div>
            <div>
              <label
                className="text-[10px] mb-1 block"
                style={{ color: "#888" }}
              >
                IBAN
              </label>
              <input
                type="text"
                value={iban}
                onChange={(e) => {
                  setIban(e.target.value.slice(0, 30).toUpperCase());
                  setErrors({});
                }}
                placeholder="AO06 XXXX XXXX XXXX XXXX XXXX X"
                maxLength={30}
                autoComplete="off"
                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
                style={{
                  background: "rgba(52,16,90,0.9)",
                  border: "1px solid rgba(179,107,255,0.4)",
                }}
              />
              {errors.iban && (
                <p className="text-[10px] mt-1 text-red-300">{errors.iban}</p>
              )}
            </div>
          </div>
        )}
        <motion.button
          onClick={submitForm}
          className="w-full py-3.5 rounded-xl text-base font-bold mt-6"
          style={{
            background: "linear-gradient(135deg, #FFD34D, #FF8A00, #FF2FD0)",
            color: "#2A0B4D",
            fontFamily: "'Russo One', sans-serif",
          }}
          whileTap={{ scale: 0.97 }}
        >
          Confirmar Levantamento
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StreakBar (ts)                                                      */
/* ------------------------------------------------------------------ */

function StreakBar({
  streak,
  multiplier,
  round,
  surpriseRounds,
}: {
  streak: number;
  multiplier: number;
  round: number;
  surpriseRounds: number[];
}) {
  const flames = [0, 1, 2, 3, 4];
  return (
    <div
      className="mx-4 mt-1 rounded-lg px-3 py-1 sm:mt-2 sm:py-2"
      style={{
        background:
          "linear-gradient(90deg, rgba(60,12,105,0.92), rgba(35,8,64,0.92))",
        border: "1px solid rgba(255,47,208,0.4)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] uppercase tracking-wider" style={{ color: "#C58BFF" }}>
            Sequência
          </span>
          <div className="flex gap-0.5">
            {flames.map((i) => (
              <motion.span
                key={i}
                className="flex"
                style={{
                  filter: i < streak ? "none" : "grayscale(1)",
                  opacity: i < streak ? 1 : 0.25,
                }}
                animate={i < streak ? { scale: [1, 1.25, 1] } : {}}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: i * 0.12,
                }}
              >
                <FireIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: "#FF8A00" }} />
              </motion.span>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={multiplier}
            className="px-2 py-0.5 rounded-full text-[11px] font-bold"
            style={{
              background:
                multiplier > 1
                  ? "linear-gradient(135deg, #FF2FD0, #FFD34D)"
                  : "rgba(80,40,120,0.7)",
              color: multiplier > 1 ? "#2A0B4D" : "#9C86B4",
              fontFamily: "'Orbitron', sans-serif",
              boxShadow:
                multiplier > 1 ? "0 0 14px rgba(255,47,208,0.7)" : "none",
            }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
          >
            x{multiplier.toFixed(1)}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-1 mt-1 sm:mt-2">
        {[...Array(10)].map((_, i) => {
          const done = i < round;
          const surprise = surpriseRounds.includes(i);
          return (
            <motion.div
              key={i}
              className="flex-1 h-1.5 rounded-full relative"
              style={{
                background: done
                  ? "linear-gradient(90deg, #FFD34D, #FF2FD0)"
                  : surprise
                    ? "rgba(255,211,77,0.35)"
                    : "rgba(255,255,255,0.12)",
              }}
              animate={!done && surprise ? { opacity: [0.4, 1, 0.4] } : {}}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              {surprise && !done && (
                <GiftIcon
                  className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-2.5 h-2.5"
                  style={{ color: "#FFD34D" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SurpriseOverlay (as)                                                */
/* ------------------------------------------------------------------ */

function SurpriseOverlay({ surprise }: { surprise: typeof SURPRISES[3] | null }) {
  return (
    <AnimatePresence>
      {surprise && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "rgba(8,0,18,0.72)" }}
        >
          <motion.div
            className="text-center px-8"
            initial={{ scale: 0.5, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
          >
            <motion.div
              className="mb-3 flex justify-center"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <surprise.Icon className="w-16 h-16" style={{ color: "#FFD34D" }} />
            </motion.div>
            <motion.h3
              className="text-2xl font-bold"
              style={{
                background: "linear-gradient(180deg, #FFF3B0, #FFC94D, #FF2FD0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Russo One', sans-serif",
              }}
              animate={{
                filter: [
                  "drop-shadow(0 0 8px #FF2FD0)",
                  "drop-shadow(0 0 24px #FF2FD0)",
                  "drop-shadow(0 0 8px #FF2FD0)",
                ],
              }}
              transition={{ duration: 1.1, repeat: Infinity }}
            >
              {surprise.title}
            </motion.h3>
            <p className="text-sm mt-2" style={{ color: "#FFD34D" }}>
              {surprise.subtitle}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* WinToast (rs)                                                       */
/* ------------------------------------------------------------------ */

const TOAST_NAMES = [
  "Joana M.",
  "Carlos D.",
  "Nzinga A.",
  "Paulo S.",
  "Edna K.",
  "Miguel T.",
  "Domingas F.",
  "Ruben C.",
  "Ivete L.",
  "Adão P.",
  "Sónia B.",
  "Kiala N.",
];
const TOAST_CITIES = [
  "Luanda",
  "Benguela",
  "Huambo",
  "Lubango",
  "Cabinda",
  "Malanje",
  "Uíge",
  "Namibe",
];
const TOAST_AVATARS = [TrophyIcon, SparklesIcon, BanknotesIcon, StarIcon];

const newToast = () => ({
  id: Math.random().toString(36).slice(2),
  name: TOAST_NAMES[Math.floor(Math.random() * TOAST_NAMES.length)],
  city: TOAST_CITIES[Math.floor(Math.random() * TOAST_CITIES.length)],
  avatar: TOAST_AVATARS[Math.floor(Math.random() * TOAST_AVATARS.length)],
  amount: (Math.floor(Math.random() * 60) + 6) * 2500,
});

function WinToast() {
  const [winner, setWinner] = useState<ReturnType<typeof newToast> | null>(null);

  useEffect(() => {
    let timeoutId: number | undefined;
    const show = () => {
      setWinner(newToast());
      timeoutId = window.setTimeout(() => {
        setWinner(null);
        timeoutId = window.setTimeout(show, 4000 + Math.random() * 5000);
      }, 4000);
    };
    timeoutId = window.setTimeout(show, 3500);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="fixed left-2 bottom-3 z-[55] pointer-events-none max-w-[230px]">
      <AnimatePresence>
        {winner && (
          <motion.div
            key={winner.id}
            className="rounded-xl px-3 py-2 flex items-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, rgba(60,12,105,0.96), rgba(120,20,140,0.92))",
              border: "1px solid rgba(255,47,208,0.6)",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.5), 0 0 16px rgba(255,47,208,0.35)",
            }}
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
            <winner.avatar className="w-5 h-5 shrink-0" style={{ color: "#FFD34D" }} />
            <div className="leading-tight">
              <div className="text-[9px]" style={{ color: "#E6CCFF" }}>
                <strong style={{ color: "#FFD34D" }}>{winner.name}</strong> ·{" "}
                {winner.city}
              </div>
              <div
                className="text-[11px] font-bold"
                style={{
                  color: "#7CFFB2",
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                +{formatAO(winner.amount)} Kz
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GameSounds (is)                                                     */
/* ------------------------------------------------------------------ */

function useGameSounds() {
  const ctxRef = useRef<AudioContext | null>(null);
  const activeRef = useRef<Array<OscillatorNode | AudioBufferSourceNode>>([]);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume().catch(() => {});
    return ctxRef.current;
  }, []);

  const playSpinClick = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }, [getCtx]);

  const playReelSpin = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(18, ctx.currentTime);
      lfoGain.gain.setValueAtTime(40, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(ctx.currentTime);
      const bufferLength = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferLength, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferLength; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.03, ctx.currentTime);
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(ctx.currentTime);
      osc.start(ctx.currentTime);
      activeRef.current = [osc, lfo, noise];
    } catch {}
  }, [getCtx]);

  const stopReelSpin = useCallback(() => {
    try {
      activeRef.current.forEach((node) => node.stop());
      activeRef.current = [];
    } catch {}
  }, []);

  const playWinSound = useCallback(() => {
    try {
      const ctx = getCtx();
      [523, 659, 784, 1047, 1319].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + i * 0.08 + 0.15,
        );
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.15);
      });
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(2000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }, 300);
    } catch {}
  }, [getCtx]);

  const playLoseSound = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, [getCtx]);

  useEffect(
    () => () => {
      activeRef.current.forEach((node) => {
        try {
          node.stop();
        } catch {}
      });
      activeRef.current = [];
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    },
    [],
  );

  return {
    playSpinClick,
    playReelSpin,
    stopReelSpin,
    playWinSound,
    playLoseSound,
  };
}

/* ------------------------------------------------------------------ */
/* SlotMachine (us)                                                    */
/* ------------------------------------------------------------------ */

export default function SlotMachine({
  playerName = "Jogador",
  amulet = null,
  setMusicIntensity,
  onGameFinished,
}: {
  playerName?: string;
  amulet?: Amulet | null;
  setMusicIntensity: (value: number) => void;
  onGameFinished: () => void;
}) {
  const [totalWin, setTotalWin] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [lastWin, setLastWin] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [grid, setGrid] = useState<Grid>(randomGrid);
  const [dragonState, setDragonState] = useState<DragonState>("idle");
  const [showWinModal, setShowWinModal] = useState(false);
  const [coinRain, setCoinRain] = useState(false);
  const [winData, setWinData] = useState<{ label: string; amount: number; isMega: boolean }>({
    label: "",
    amount: 0,
    isMega: false,
  });
  const [auto, setAuto] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [betIndex, setBetIndex] = useState(0);
  const [glowGold, setGlowGold] = useState(false);
  const [megaFlash, setMegaFlash] = useState(false);
  const [winLine, setWinLine] = useState<string | null>(null);
  const [activeMultiplier, setActiveMultiplier] = useState<number | null>(null);
  const [screen, setScreen] = useState<ScreenState>("playing");
  const [streak, setStreak] = useState(0);
  const [surprise, setSurprise] = useState<typeof SURPRISES[3] | null>(null);
  const [showLose, setShowLose] = useState(false);
  const totalWinRef = useRef(0);

  useEffect(() => {
    totalWinRef.current = totalWin;
  }, [totalWin]);

  const jadeProtection =
    amulet?.id === "jade";
  const multiplierValue = 1 + streak * 0.5;
  const autoRef = useRef(false);

  const {
    playSpinClick,
    playReelSpin,
    stopReelSpin,
    playWinSound,
    playLoseSound,
  } = useGameSounds();

  const bet = BET_LEVELS[betIndex];
  const spinDuration = turbo ? 800 : 1500;
  const remainingSpins = 10 - roundsPlayed;

  const sparkles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        size: 2 + Math.random() * 3,
        left: `${5 + Math.random() * 90}%`,
        top: `${10 + Math.random() * 80}%`,
        glow: 5 + Math.random() * 7,
        duration: 3 + Math.random() * 3,
        delay: Math.random() * 5,
      })),
    [],
  );

  useEffect(() => {
    if (displayBalance === totalWin) return;
    const diff = totalWin - displayBalance;
    const steps = 25;
    const increment = diff / steps;
    let current = displayBalance;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      current += increment;
      if (count >= steps) {
        setDisplayBalance(totalWin);
        clearInterval(interval);
      } else {
        setDisplayBalance(Math.round(current));
      }
    }, 30);
    return () => clearInterval(interval);
  }, [totalWin]);

  const setMegaFlashState = (value: boolean) => {
    setMegaFlash(value);
    setGlowGold(false);
  };

  const spin = useCallback(() => {
    if (spinning || roundsPlayed >= 10) return;
    const w = roundsPlayed % 10;
    const roundData = ROUNDS[w];
    const surpriseData = SURPRISES[w as keyof typeof SURPRISES] ?? null;
    const surpriseBonus = surpriseData ? surpriseData.bonus : 1;
    const streakMultiplier = 1 + streak * 0.5;

    setSpinning(true);
    setDragonState("spinning");
    setShowWinModal(false);
    setCoinRain(false);
    setShowLose(false);
    setMegaFlash(false);
    setLastWin(0);
    setWinLine(null);
    setActiveMultiplier(null);
    setMegaFlashState(false);
    playSpinClick();
    playReelSpin();
    setMusicIntensity(1.1);
    setTimeout(() => setMegaFlash(false), 600);
    setGrid(randomGrid());
    if (surpriseData) {
      setSurprise(surpriseData);
      setTimeout(() => setSurprise(null), 1800);
    }
    setTimeout(
      () => {
        let finalGrid: Grid;
        let line: string | null = null;
        if (roundData.win) {
          const result = winningGrid();
          finalGrid = result.grid;
          line = result.winLine;
        } else {
          finalGrid = losingGrid();
        }
        setGrid(finalGrid);
        setSpinning(false);
        stopReelSpin();
        if (roundData.win) {
          const isMega = roundData.label === "SUPER MEGA GANHO";
          const maxTarget = 125000;
          const futureGains = FUTURE_GAINS.slice(w + 1).reduce(
            (acc, x) => acc + x,
            0,
          );
          const rawWin = Math.round(roundData.amount * surpriseBonus * streakMultiplier);
          const diff = maxTarget - totalWinRef.current;
          const winAmount =
            w === 9
              ? Math.max(0, diff)
              : Math.min(rawWin, Math.max(0, diff - futureGains));

          setDragonState(isMega ? "mega-win" : "win");
          setWinData({
            label: surpriseData ? surpriseData.title : roundData.label,
            amount: winAmount,
            isMega,
          });
          setCoinRain(true);
          setMegaFlashState(true);
          setLastWin(winAmount);
          setWinLine(line);
          setActiveMultiplier(isMega ? 10 : roundData.label === "MEGA GANHO" ? 5 : 2);
          setStreak((s) => Math.min(5, s + 1));
          playWinSound();
          setMusicIntensity(isMega ? 1.3 : 1.15);
          setTimeout(() => setShowWinModal(true), 300);
          setTimeout(
            () => setTotalWin((prev) => Math.min(125000, prev + winAmount)),
            600,
          );
          const clearDelay = isMega ? 4000 : 2500;
          setTimeout(
            () => {
              setShowWinModal(false);
              setCoinRain(false);
              setMegaFlashState(false);
              setWinLine(null);
              setActiveMultiplier(null);
              setDragonState("idle");
              setMusicIntensity(0.7);
              if (w === 9) {
                setTimeout(() => {
                  onGameFinished();
                  setScreen("bonus-end");
                }, 500);
              }
            },
            clearDelay,
          );
        } else {
          setDragonState("lose");
          setStreak(jadeProtection ? 1 : 0);
          playLoseSound();
          setMusicIntensity(0.5);
          setShowLose(true);
          setTimeout(() => {
            setShowLose(false);
            setDragonState("idle");
            setMusicIntensity(0.7);
          }, 1400);
        }
        setRoundsPlayed((count) => count + 1);
      },
      spinDuration + (surpriseData ? 1200 : 0),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, roundsPlayed, spinDuration, streak, jadeProtection, playSpinClick, playReelSpin, stopReelSpin, playWinSound, playLoseSound, setMusicIntensity, onGameFinished]);

  useEffect(() => {
    autoRef.current = auto;
  }, [auto]);

  useEffect(() => {
    if (!auto || spinning || roundsPlayed >= 10) return;
    const timer = setTimeout(
      () => {
        if (autoRef.current) spin();
      },
      turbo ? 1500 : 3000,
    );
    return () => clearTimeout(timer);
  }, [auto, spinning, spin, turbo, roundsPlayed]);

  const format = (value: number) => new Intl.NumberFormat("pt-AO").format(value);

  if (screen === "withdraw") return <WithdrawScreen totalWin={totalWin} />;
  if (screen === "bonus-end")
    return (
      <BonusEndScreen
        totalWin={totalWin}
        onContinue={() => setScreen("withdraw")}
      />
    );

  const headerBg = "linear-gradient(180deg, #4B0F80, #24063F)";
  const headerBorder = "1px solid rgba(255,47,208,0.6)";

  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={DRAGON_BG}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(80,0,140,0.15) 30%, rgba(10,0,25,0.75) 100%)",
        }}
      />
      {sparkles.map((sp) => (
        <motion.div
          key={`sparkle-${sp.id}`}
          className="absolute rounded-full pointer-events-none z-20"
          style={{
            width: sp.size,
            height: sp.size,
            background:
              sp.id % 3 === 0 ? "#FFD34D" : sp.id % 3 === 1 ? "#FF2FD0" : "#B36BFF",
            left: sp.left,
            top: sp.top,
            boxShadow: `0 0 ${sp.glow}px ${sp.id % 3 === 0 ? "#FFD34D" : "#FF2FD0"}`,
          }}
          animate={{ opacity: [0, 0.9, 0], y: [0, -20, -45] }}
          transition={{
            duration: sp.duration,
            repeat: Infinity,
            delay: sp.delay,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-[420px] h-[100dvh] mx-auto flex flex-col pt-1 px-2 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-1 gap-1">
          <div
            className="rounded-lg px-2 py-1 flex flex-col items-center min-w-0 flex-shrink-0"
            style={{
              background: headerBg,
              border: headerBorder,
              boxShadow: "0 0 12px rgba(255,47,208,0.25)",
            }}
          >
            <span
              className="text-[7px] uppercase tracking-wider whitespace-nowrap"
              style={{ color: "#FFD34D" }}
            >
              Giros Grátis
            </span>
            <span
              className="font-bold text-xs"
              style={{ color: "#7CFFB2", fontFamily: "'Orbitron', sans-serif" }}
            >
              {roundsPlayed}/10
            </span>
          </div>

          <div className="flex flex-col items-center flex-shrink min-w-0">
            <motion.span
              className="font-bold text-sm sm:text-lg whitespace-nowrap"
              style={{
                background: "linear-gradient(180deg, #FFF3B0, #FFC94D, #FF8A00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Russo One', sans-serif",
              }}
              animate={{
                filter: [
                  "drop-shadow(0 0 6px rgba(255,47,208,0.6))",
                  "drop-shadow(0 0 16px rgba(255,47,208,0.95))",
                  "drop-shadow(0 0 6px rgba(255,47,208,0.6))",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              FORTUNE DRAGON
            </motion.span>
            <span
              className="text-[8px] tracking-widest"
              style={{ color: "#C58BFF" }}
            >
              PG SOFT
            </span>
          </div>

          <div
            className="rounded-lg px-2 py-1 flex flex-col items-center min-w-0 flex-shrink-0"
            style={{
              background: headerBg,
              border: headerBorder,
              boxShadow: "0 0 12px rgba(255,47,208,0.25)",
            }}
          >
            <span
              className="text-[7px] uppercase tracking-wider"
              style={{ color: "#FFD34D" }}
            >
              Saldo
            </span>
            <span
              className={`font-bold text-xs whitespace-nowrap ${
                glowGold ? "glow-gold" : ""
              }`}
              style={{ color: "#7CFFB2", fontFamily: "'Orbitron', sans-serif" }}
            >
              {format(displayBalance)} Kz
            </span>
          </div>
        </div>

        <DragonDisplay state={dragonState} />
        <MultiplierChips active={activeMultiplier} charging={spinning} />
        <StreakBar
          streak={streak}
          multiplier={multiplierValue}
          round={roundsPlayed}
          surpriseRounds={SURPRISE_ROUNDS}
        />

        {/* Reel frame */}
        <div className="mx-4 relative">
          <div
            className="absolute -inset-[3px] rounded-xl z-0"
            style={{
              background:
                "linear-gradient(180deg, #FF2FD0 0%, #A03BFF 25%, #FFD34D 50%, #A03BFF 75%, #FF2FD0 100%)",
              boxShadow:
                "0 0 26px rgba(255,47,208,0.6), inset 0 0 12px rgba(255,211,77,0.35)",
            }}
          />
          <div
            className="absolute -left-3 top-0 bottom-0 w-5 z-30 rounded-l"
            style={{
              background:
                "linear-gradient(90deg, #2A0B4D, #7A1BC9, #C24BFF, #FF2FD0, #C24BFF, #7A1BC9, #2A0B4D)",
              boxShadow: "2px 0 10px rgba(0,0,0,0.5)",
            }}
          />
          <div
            className="absolute -right-3 top-0 bottom-0 w-5 z-30 rounded-r"
            style={{
              background:
                "linear-gradient(90deg, #2A0B4D, #7A1BC9, #C24BFF, #FF2FD0, #C24BFF, #7A1BC9, #2A0B4D)",
              boxShadow: "-2px 0 10px rgba(0,0,0,0.5)",
            }}
          />
          <div className="absolute -left-7 top-0 bottom-0 flex flex-col justify-around z-40 py-1">
            {["1", "2", "3"].map((label) => (
              <div
                key={label}
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: "linear-gradient(135deg, #FF2FD0, #FFD34D)",
                  color: "#2A0B4D",
                  boxShadow: "0 0 8px rgba(255,47,208,0.7)",
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="absolute -right-7 top-0 bottom-0 flex flex-col justify-around z-40 py-1">
            {["5", "2", "4"].map((label) => (
              <div
                key={label}
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: "linear-gradient(135deg, #FF2FD0, #FFD34D)",
                  color: "#2A0B4D",
                  boxShadow: "0 0 8px rgba(255,47,208,0.7)",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="relative z-10 rounded-lg overflow-hidden" style={{ background: "#12042A" }}>
            <div className="flex h-[225px] sm:h-[270px]">
              {grid.map((column, colIndex) => (
                <ReelColumn
                  key={colIndex}
                  symbols={column}
                  spinning={spinning}
                  delay={colIndex * 0.12}
                />
              ))}
            </div>
            <WinLine type={winLine || "horizontal-mid"} visible={!!winLine} />
          </div>
        </div>

        {/* Marquee */}
        <div
          className="mx-4 mt-0 relative overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #6A11A8, #330959)",
            border: "2px solid #FF2FD0",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            padding: "3px 12px",
          }}
        >
          <motion.div
            className="text-xs whitespace-nowrap font-bold"
            style={{ color: "#FFD34D" }}
            animate={{ x: [350, -640] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            Fortune Dragon • O dragão está a pagar hoje! • Multiplicadores até 2500x
          </motion.div>
        </div>

        <EarningsTicker />

        {/* Stats */}
        <div className="mx-4 mt-1">
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ background: headerBg, border: headerBorder }}
          >
            <div
              className="flex-1 text-center py-1 flex items-center justify-center gap-1"
              style={{ borderRight: "1px solid rgba(255,47,208,0.35)" }}
            >
              <BanknotesIcon className="w-4 h-4" style={{ color: "#FFD34D" }} />
              <div>
                <div
                  className="text-[8px] uppercase tracking-wider"
                  style={{ color: "#C58BFF" }}
                >
                  Saldo
                </div>
                <div
                  className="font-bold text-[11px]"
                  style={{ color: "#FFD34D", fontFamily: "'Orbitron', sans-serif" }}
                >
                  {format(displayBalance)} Kz
                </div>
              </div>
            </div>
            <div
              className="flex-1 text-center py-1 flex items-center justify-center gap-1"
              style={{ borderRight: "1px solid rgba(255,47,208,0.35)" }}
            >
              <CurrencyDollarIcon className="w-4 h-4" style={{ color: "#FFD34D" }} />
              <div>
                <div
                  className="text-[8px] uppercase tracking-wider"
                  style={{ color: "#C58BFF" }}
                >
                  Aposta Grátis
                </div>
                <div
                  className="font-bold text-[11px]"
                  style={{ color: "#FFD34D", fontFamily: "'Orbitron', sans-serif" }}
                >
                  {format(bet)} Kz
                </div>
              </div>
            </div>
            <div className="flex-1 text-center py-1 flex items-center justify-center gap-1">
              <TrophyIcon className="w-4 h-4" style={{ color: "#FFD34D" }} />
              <div>
                <div
                  className="text-[8px] uppercase tracking-wider"
                  style={{ color: "#C58BFF" }}
                >
                  Ganho
                </div>
                <div
                  className={`font-bold text-[11px] ${lastWin > 0 ? "glow-gold" : ""}`}
                  style={{ color: "#7CFFB2", fontFamily: "'Orbitron', sans-serif" }}
                >
                  {format(lastWin)} Kz
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spins left message */}
        <div className="mx-4 mt-1.5 text-center">
          <motion.span
            className="text-[10px] font-bold"
            style={{ color: remainingSpins <= 3 ? "#FF6B9D" : "#C58BFF" }}
            animate={remainingSpins <= 3 ? { opacity: [1, 0.45, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {remainingSpins > 0
              ? `Restam ${remainingSpins} giro${remainingSpins > 1 ? "s" : ""} grátis — não deixes o dragão esfriar!`
              : "Giros terminados! Levanta os teus ganhos agora."}
          </motion.span>
        </div>

        {/* Controls */}
        <div className="mx-4 mt-1.5 flex items-center justify-center gap-3">
          <motion.button
            onClick={() => setTurbo((v) => !v)}
            className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all"
            style={{
              background: turbo
                ? "linear-gradient(135deg, #FF2FD0, #FFD34D)"
                : "linear-gradient(135deg, #3B0A66, #1B0533)",
              border: `2px solid ${turbo ? "#FFD34D" : "#B36BFF"}`,
              boxShadow: turbo
                ? "0 0 18px rgba(255,47,208,0.8)"
                : "0 0 6px rgba(0,0,0,0.4)",
            }}
          >
            <BoltIcon className="w-5 h-5" style={{ color: turbo ? "#2A0B4D" : "#FFD34D" }} />
            <span
              className="text-[7px] font-bold"
              style={{ color: turbo ? "#2A0B4D" : "#C58BFF" }}
            >
              TURBO
            </span>
          </motion.button>

          <button
            onClick={() => setBetIndex(Math.max(0, betIndex - 1))}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all active:scale-90"
            style={{
              background: "linear-gradient(135deg, #3B0A66, #1B0533)",
              border: "2px solid #B36BFF",
              color: "#FFD34D",
            }}
          >
            −
          </button>

          <motion.button
            onClick={spin}
            disabled={spinning || roundsPlayed >= 10}
            className="relative w-[70px] h-[70px] sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center font-bold text-base"
            style={{
              background: spinning
                ? "linear-gradient(135deg, #4A3560, #2A1A3A)"
                : "linear-gradient(135deg, #FF2FD0, #C21BB0, #7A1BC9)",
              border: "4px solid #FFD34D",
              color: spinning ? "#9C86B4" : "#FFF",
              fontFamily: "'Russo One', sans-serif",
              boxShadow: spinning
                ? "inset 0 2px 8px rgba(0,0,0,0.6)"
                : "0 0 28px rgba(255,47,208,0.7), inset 0 -3px 8px rgba(0,0,0,0.35)",
            }}
            whileTap={spinning ? {} : { scale: 0.88 }}
            animate={
              spinning
                ? {}
                : {
                    boxShadow: [
                      "0 0 20px rgba(255,47,208,0.5)",
                      "0 0 45px rgba(255,47,208,0.95)",
                      "0 0 20px rgba(255,47,208,0.5)",
                    ],
                  }
            }
            transition={spinning ? {} : { duration: 1.2, repeat: Infinity }}
          >
            {spinning ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              >
                ⏳
              </motion.span>
            ) : (
              "GIRAR"
            )}
          </motion.button>

          <button
            onClick={() => setBetIndex(Math.min(BET_LEVELS.length - 1, betIndex + 1))}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all active:scale-90"
            style={{
              background: "linear-gradient(135deg, #3B0A66, #1B0533)",
              border: "2px solid #B36BFF",
              color: "#FFD34D",
            }}
          >
            +
          </button>

          <motion.button
            onClick={() => setAuto((v) => !v)}
            className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all"
            style={{
              background: auto
                ? "linear-gradient(135deg, #FF2FD0, #FFD34D)"
                : "linear-gradient(135deg, #3B0A66, #1B0533)",
              border: `2px solid ${auto ? "#FFD34D" : "#B36BFF"}`,
              boxShadow: auto
                ? "0 0 18px rgba(255,47,208,0.8)"
                : "0 0 6px rgba(0,0,0,0.4)",
            }}
          >
            <ArrowPathIcon className="w-5 h-5" style={{ color: auto ? "#2A0B4D" : "#FFD34D" }} />
            <span
              className="text-[7px] font-bold"
              style={{ color: auto ? "#2A0B4D" : "#C58BFF" }}
            >
              AUTO
            </span>
          </motion.button>
        </div>

        {/* Withdraw */}
        <div className="mx-4 mt-1.5 mb-1 flex justify-center">
          <motion.button
            onClick={() => {
              if (roundsPlayed >= 10) setScreen("bonus-end");
            }}
            disabled={roundsPlayed < 10}
            className="px-8 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
            style={{
              background:
                roundsPlayed >= 10
                  ? "linear-gradient(135deg, #FFD34D, #FF8A00, #FF2FD0)"
                  : "rgba(70,50,95,0.7)",
              color: roundsPlayed >= 10 ? "#2A0B4D" : "#9C86B4",
              fontFamily: "'Russo One', sans-serif",
              border:
                roundsPlayed >= 10
                  ? "1px solid rgba(255,211,77,0.7)"
                  : "1px solid rgba(150,120,190,0.3)",
              boxShadow: roundsPlayed >= 10 ? "0 0 25px rgba(255,47,208,0.5)" : "none",
              cursor: roundsPlayed >= 10 ? "pointer" : "not-allowed",
            }}
            animate={roundsPlayed >= 10 ? { scale: [1, 1.04, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
            whileTap={roundsPlayed >= 10 ? { scale: 0.97 } : {}}
          >
            <span className="inline-flex items-center justify-center gap-2"><BanknotesIcon className="w-5 h-5" />LEVANTAR</span>
          </motion.button>
        </div>
      </div>

      <MegaFlash active={megaFlash} />
      <CoinRain active={coinRain} />
      <WinModal
        show={showWinModal}
        label={winData.label}
        amount={winData.amount}
        isMega={winData.isMega}
      />
      <SurpriseOverlay surprise={surprise} />

      {showLose && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="px-8 py-5 rounded-2xl text-center"
            style={{
              background:
                "linear-gradient(180deg, rgba(30,4,55,0.92), rgba(12,0,28,0.95))",
              border: "2px solid rgba(255,60,60,0.75)",
              boxShadow: "0 0 35px rgba(255,40,40,0.5)",
            }}
            initial={{ scale: 0.6, rotate: -4 }}
            animate={{ scale: [0.6, 1.15, 1], rotate: [-4, 2, 0] }}
            transition={{ duration: 0.45, times: [0, 0.6, 1] }}
          >
            <motion.span
              className="block font-bold text-3xl sm:text-4xl tracking-wider"
              style={{
                background: "linear-gradient(180deg, #FF8A8A, #FF2E2E)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Russo One', sans-serif",
                filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.5)) drop-shadow(0 0 4px rgba(255,40,40,0.5))",
              }}
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            >
              <FaceFrownIcon className="inline-block w-8 h-8 mr-1 align-[-4px]" style={{ color: "#FF4D4D" }} />
              VOCÊ PERDEU
            </motion.span>
            <span
              className="block mt-1 text-[11px] font-bold"
              style={{ color: "#FF9AA9" }}
            >
              O dragão guardou a sorte… tenta outra vez!
            </span>
          </motion.div>
        </motion.div>
      )}

      <WinToast />
    </div>
  );
}