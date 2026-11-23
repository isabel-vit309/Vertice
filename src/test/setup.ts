// Ambiente comum dos testes (Vitest + jsdom + Testing Library).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import { clearSession } from "../services/session";

// jsdom não implementa estes recursos usados pelas animações e pelos downloads.
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: query.includes("reduce") ? Boolean((window as { __reducedMotion?: boolean }).__reducedMotion) : false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}
if (!URL.createObjectURL) {
  URL.createObjectURL = () => "blob:teste";
  URL.revokeObjectURL = () => undefined;
}

beforeEach(() => {
  // Sai da conta pelo caminho normal: apagar o localStorage direto seria visto como "outra aba saiu".
  clearSession();
  localStorage.clear();
  (window as { __reducedMotion?: boolean }).__reducedMotion = false;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
