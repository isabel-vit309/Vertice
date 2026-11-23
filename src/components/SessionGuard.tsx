// Aviso quando outra aba do navegador entra com outra conta ou sai.
// A aba atual para de enviar requisições (ver services/session.ts) e pede para ser atualizada,
// assim ninguém edita um perfil ou vê matches com a sessão de outra pessoa.
import { useEffect, useState } from "react";

import { MENSAGEM_OUTRA_ABA } from "../services/api";
import { observarSessaoEntreAbas, sessaoTrocadaEmOutraAba } from "../services/session";

export default function SessionGuard() {
  const [trocada, setTrocada] = useState(sessaoTrocadaEmOutraAba);

  useEffect(() => observarSessaoEntreAbas(() => setTrocada(true)), []);

  if (!trocada) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="sessao-trocada-titulo"
        aria-describedby="sessao-trocada-texto"
        className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl"
      >
        <h2 id="sessao-trocada-titulo" className="text-base font-semibold text-[#252525]">
          Sessão alterada em outra aba
        </h2>
        <p id="sessao-trocada-texto" className="mt-2 text-sm leading-relaxed text-[#666666]">
          {MENSAGEM_OUTRA_ABA}
        </p>
        <button
          type="button"
          autoFocus
          onClick={() => window.location.reload()}
          className="mt-5 w-full rounded-md bg-[#EF5948] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#dc4b3b]"
        >
          Atualizar esta aba
        </button>
      </div>
    </div>
  );
}
