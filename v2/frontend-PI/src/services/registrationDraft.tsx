// Rascunho do cadastro por etapas, mantido apenas em memória (inclui senha e
// arquivos, que não devem ir para o storage). Recarregar a página reinicia o fluxo.
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Draft = Record<string, unknown> & {
  email?: string;
  password?: string;
};

type DraftKind = "startup" | "investor";

type DraftContextValue = {
  get: (kind: DraftKind) => Draft;
  merge: (kind: DraftKind, values: Record<string, unknown>) => void;
  reset: (kind: DraftKind) => void;
};

const DraftContext = createContext<DraftContextValue | null>(null);

export function RegistrationDraftProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Record<DraftKind, Draft>>({
    startup: {},
    investor: {},
  });

  const get = useCallback((kind: DraftKind) => drafts[kind], [drafts]);

  const merge = useCallback((kind: DraftKind, values: Record<string, unknown>) => {
    setDrafts((current) => ({ ...current, [kind]: { ...current[kind], ...values } }));
  }, []);

  const reset = useCallback((kind: DraftKind) => {
    setDrafts((current) => ({ ...current, [kind]: {} }));
  }, []);

  const value = useMemo(() => ({ get, merge, reset }), [get, merge, reset]);

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useRegistrationDraft(kind: DraftKind) {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error("useRegistrationDraft precisa de RegistrationDraftProvider");
  }
  return {
    draft: context.get(kind),
    merge: (values: Record<string, unknown>) => context.merge(kind, values),
    reset: () => context.reset(kind),
  };
}
