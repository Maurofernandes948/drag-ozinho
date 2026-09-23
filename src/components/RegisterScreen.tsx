import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DRAGON_BG, DRAGON_MASCOT } from "../lib/assets";

export default function RegisterScreen({
  onComplete,
}: {
  onComplete: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showModal, setShowModal] = useState(false);

  const valid = name.trim().length > 1 && phone.trim().length >= 9;
  const submit = () => {
    if (valid) setShowModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
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
          style={{
            background:
              "linear-gradient(180deg, rgba(10,5,18,0.8), rgba(26,5,48,0.9))",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-[380px] rounded-2xl px-6 py-7"
        style={{
          background:
            "linear-gradient(180deg, rgba(45,12,80,0.96), rgba(26,5,48,0.98))",
          border: "1px solid rgba(255,47,208,0.4)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="flex justify-center mb-2"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src={DRAGON_MASCOT}
            alt="Fortune Dragon"
            width={360}
            height={360}
            decoding="async"
            className="w-20 h-20 object-contain drop-shadow-2xl"
          />
        </motion.div>

        <h2
          className="text-xl font-bold text-center mb-1"
          style={{
            background: "linear-gradient(180deg, #FFF3B0, #FFC94D, #FF8A00)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Russo One', sans-serif",
          }}
        >
          Falta só 1 passo
        </h2>

        <p className="text-xs text-center mb-6" style={{ color: "#C58BFF" }}>
          Diz ao Dragão quem és e recebe as tuas{" "}
          <strong style={{ color: "#7CFFB2" }}>10 rodadas grátis</strong>
        </p>

        <div className="space-y-4">
          <div>
            <label
              className="text-[10px] mb-1.5 block uppercase tracking-wider"
              style={{ color: "#9C86B4" }}
            >
              O teu nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Manuel Domingos"
              className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none"
              style={{
                background: "rgba(60,20,100,0.9)",
                border: "1px solid rgba(179,107,255,0.4)",
              }}
            />
          </div>

          <div>
            <label
              className="text-[10px] mb-1.5 block uppercase tracking-wider"
              style={{ color: "#9C86B4" }}
            >
              Número de telefone (WhatsApp)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
              }
              placeholder="9XX XXX XXX"
              className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none"
              style={{
                background: "rgba(60,20,100,0.9)",
                border: "1px solid rgba(179,107,255,0.4)",
              }}
            />
            <p className="text-[9px] mt-1.5" style={{ color: "#666" }}>
              🔒 Usado apenas para confirmar os teus ganhos
            </p>
          </div>
        </div>

        <motion.button
          onClick={submit}
          className="w-full py-4 rounded-xl text-base font-bold mt-5"
          style={{
            background: valid
              ? "linear-gradient(135deg, #FFD34D, #FF8A00, #FF2FD0)"
              : "rgba(100,100,100,0.35)",
            color: valid ? "#2A0B4D" : "#777",
            fontFamily: "'Russo One', sans-serif",
            boxShadow: valid ? "0 0 25px rgba(255,47,208,0.4)" : "none",
          }}
          whileTap={valid ? { scale: 0.97 } : {}}
        >
          🐉 Receber as minhas rodadas
        </motion.button>

        <p className="text-[9px] text-center mt-3" style={{ color: "#555" }}>
          Ao continuar, aceitas os termos e condições
        </p>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70" />
            <motion.div
              className="relative z-10 w-full max-w-[340px] mx-4 rounded-2xl p-6 text-center"
              style={{
                background:
                  "linear-gradient(180deg, rgba(45,12,80,0.98), rgba(26,5,48,0.99))",
                border: "1px solid rgba(255,211,77,0.4)",
                boxShadow: "0 0 40px rgba(255,47,208,0.25)",
              }}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="text-5xl mb-3"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
              >
                🐉
              </motion.div>
              <h3
                className="text-lg font-bold mb-2"
                style={{
                  background: "linear-gradient(180deg, #FFF3B0, #FFC94D)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "'Russo One', sans-serif",
                }}
              >
                Bem-vindo, {name.trim().split(" ")[0]}!
              </h3>
              <p className="text-xs mb-4" style={{ color: "#C58BFF" }}>
                O Dragão libertou as tuas rodadas grátis
              </p>
              <motion.p
                className="text-2xl font-bold mb-5"
                style={{
                  background: "linear-gradient(180deg, #FFF3B0, #FFC94D)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "'Orbitron', sans-serif",
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🎰 10 RODADAS GRÁTIS
              </motion.p>
              <motion.button
                onClick={() => onComplete(name.trim())}
                className="w-full py-3.5 rounded-xl text-base font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #FFD34D, #FF8A00, #FF2FD0)",
                  color: "#2A0B4D",
                  fontFamily: "'Russo One', sans-serif",
                  boxShadow: "0 0 25px rgba(255,47,208,0.4)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                🔥 Entrar no Templo
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}