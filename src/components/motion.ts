// Utilitários de animação compartilhados (todos respeitam "reduzir movimento" do sistema).
import { useEffect, useState } from "react";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

/** Desaceleração suave usada nas contagens e barras. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Conta de 0 até `target` em `duration` ms quando `target` fica disponível.
 * Devolve o valor atual (inteiro, ou com `decimals` casas).
 */
export function useCountUp(target: number | null | undefined, duration = 1100, delay = 0, decimals = 0): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target == null) {
      setValue(0);
      return;
    }
    if (prefersReducedMotion() || target === 0) {
      setValue(target);
      return;
    }
    let frame = 0;
    let start: number | null = null;
    const factor = Math.pow(10, decimals);
    const tick = (now: number) => {
      start ??= now + delay;
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(Math.round(target * easeOutCubic(t) * factor) / factor);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, delay, decimals]);

  return value;
}
