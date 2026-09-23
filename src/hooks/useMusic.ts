import { useCallback, useEffect, useRef, useState } from "react";

const STEP_DURATION = 60 / 124 / 4;
const MELODY_FREQUENCIES = [
  261.63, 311.13, 349.23, 392, 466.16, 523.25, 622.25, 698.46,
];
const MELODY_NOTES = [0, 2, 4, 5, 4, 2, 3, 1, 0, 2, 5, 7, 5, 4, 2, 1];
const BASS_NOTES = [65.41, 65.41, 0, 65.41, 0, 87.31, 0, 77.78];

export function useMusic() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const stepCountRef = useRef(0);
  const nextTimeRef = useRef(0);
  const intensityRef = useRef(0.6);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  const playStep = useCallback((time: number, step: number) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const intensity = intensityRef.current;
    const beat = step % 16;

    if (beat % 4 === 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
      gain.gain.setValueAtTime(0.55 * intensity, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      osc.connect(gain);
      gain.connect(master);
      osc.start(time);
      osc.stop(time + 0.22);
    }

    if (beat % 2 === 1) {
      const buffer = ctx.createBuffer(1, 1024, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < 1024; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 7000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1 * intensity, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start(time);
      source.stop(time + 0.06);
    }

    const bass = BASS_NOTES[beat % 8];
    if (bass && beat % 2 === 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320 + intensity * 500, time);
      osc.frequency.setValueAtTime(bass, time);
      gain.gain.setValueAtTime(1e-4, time);
      gain.gain.linearRampToValueAtTime(0.22 * intensity, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + STEP_DURATION * 1.8);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(time);
      osc.stop(time + STEP_DURATION * 2);
    }

    const melodyFreq = MELODY_FREQUENCIES[MELODY_NOTES[beat]];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(melodyFreq * 2, time);
    gain.gain.setValueAtTime(1e-4, time);
    gain.gain.linearRampToValueAtTime(0.09 * intensity, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + STEP_DURATION * 1.4);
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + STEP_DURATION * 1.5);

    if (beat === 0 || beat === 10) {
      const sparkle = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      sparkle.type = "sine";
      sparkle.frequency.setValueAtTime(MELODY_FREQUENCIES[5] * 2, time);
      sparkleGain.gain.setValueAtTime(0.14 * intensity, time);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
      sparkle.connect(sparkleGain);
      sparkleGain.connect(master);
      sparkle.start(time);
      sparkle.stop(time + 0.85);
    }
  }, []);

  const schedule = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    for (; nextTimeRef.current < ctx.currentTime + 0.2; ) {
      playStep(nextTimeRef.current, stepCountRef.current);
      stepCountRef.current = (stepCountRef.current + 1) % 64;
      nextTimeRef.current += STEP_DURATION;
    }
  }, [playStep]);

  const start = useCallback(() => {
    if (ctxRef.current) {
      ctxRef.current.resume().catch(() => {});
      return;
    }
    try {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 2);
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
      nextTimeRef.current = ctx.currentTime + 0.1;
      intervalRef.current = window.setInterval(schedule, 50);
      setStarted(true);
    } catch {}
  }, [schedule]);

  const toggleMute = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) {
      start();
      return;
    }
    setMuted((prev) => {
      const next = !prev;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(
        next ? 1e-4 : 0.35,
        ctx.currentTime + 0.4,
      );
      return next;
    });
  }, [start]);

  const pause = useCallback(() => {
    const ctx = ctxRef.current;
    ctx && ctx.suspend().catch(() => {});
  }, []);

  const setIntensity = useCallback((value: number) => {
    intensityRef.current = Math.max(0.2, Math.min(1.3, value));
  }, []);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    },
    [],
  );

  return { start, pause, toggleMute, setIntensity, muted, started };
}