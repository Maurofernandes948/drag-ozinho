import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import WelcomeScreen from "./components/WelcomeScreen";
import type { Amulet } from "./components/RitualScreen";
import { useMusic } from "./hooks/useMusic";

const RegisterScreen = lazy(() => import("./components/RegisterScreen"));
const RitualScreen = lazy(
  () => import("./components/RitualScreen"),
);
const SlotMachine = lazy(() => import("./components/SlotMachine"));

function FortuneDragonApp() {
  const [screen, setScreen] = useState("welcome");
  const [amulet, setAmulet] = useState<Amulet | null>(null);
  const [playerName, setPlayerName] = useState("Jogador");
  const [inGame, setInGame] = useState(false);
  const {
    start,
    pause,
    toggleMute,
    setIntensity,
    muted,
    started,
  } = useMusic();

  const musicButton = () =>
    started && inGame ? (
      <button
        onClick={toggleMute}
        aria-label={muted ? "Ligar música" : "Desligar música"}
        className="fixed top-14 right-3 z-[100] w-10 h-10 rounded-full flex items-center justify-center text-base"
        style={{
          background: "rgba(20,6,36,0.75)",
          border: "1px solid rgba(255,47,208,0.5)",
          boxShadow: "0 0 14px rgba(255,47,208,0.35)",
        }}
      >
        {muted ? "🔇" : "🔊"}
      </button>
    ) : null;

  const renderScreen = () =>
    screen === "welcome" ? (
      <WelcomeScreen onStart={() => setScreen("register")} />
    ) : screen === "register" ? (
      <RegisterScreen
        onComplete={(name) => {
          setPlayerName(name);
          setScreen("ritual");
        }}
      />
    ) : screen === "ritual" ? (
      <RitualScreen
        playerName={playerName}
        onDone={(selected) => {
          setAmulet(selected);
          setScreen("game");
          setInGame(true);
          start();
        }}
      />
    ) : (
      <SlotMachine
        playerName={playerName}
        amulet={amulet}
        setMusicIntensity={setIntensity}
        onGameFinished={() => {
          setInGame(false);
          pause();
        }}
      />
    );

  return (
    <>
      <Suspense fallback={<div className="fixed inset-0 bg-background" />}>
        {renderScreen()}
      </Suspense>
      {musicButton()}
    </>
  );
}

function NotFound() {
  const location = useLocation();
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FortuneDragonApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;