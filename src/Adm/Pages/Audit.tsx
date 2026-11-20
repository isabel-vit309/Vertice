import { useEffect, useState } from "react";
import { FiActivity } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import AdminShell from "./AdminShell";
import { ApiError, api, formatarData } from "../../services/api";
import type { AuditoriaAdmin } from "../../services/api";

export default function AuditPage() {
  const navigate = useNavigate();
  const [auditRecords, setAuditRecords] = useState<AuditoriaAdmin[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.admin
      .auditoria()
      .then(setAuditRecords)
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          navigate("/adm/login", { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : "Não foi possível carregar a auditoria.");
      });
  }, [navigate]);

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-7 lg:px-9">
        <header className="mb-7">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#EF5948]">
            Painel administrativo
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Log de auditoria
          </h1>
          <p className="mt-2 text-sm text-[#6F6F6F]">
            Consulte o histórico das ações realizadas pelos administradores.
          </p>
        </header>

        <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_3px_rgba(0,0,0,0.08)] sm:p-6">
          <div className="flex items-center justify-between border-b border-[#ECECEC] pb-4">
            <div>
              <h2 className="font-semibold">Atividades registradas</h2>
              <p className="mt-1 text-xs text-[#808080]">
                Cada ação de moderação fica registrada para consulta.
              </p>
            </div>
            <FiActivity className="text-[#EF5948]" />
          </div>
          <div className="mt-5 space-y-4">
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            {!auditRecords && !error && (
              <p role="status" className="text-sm text-[#777777]">Carregando...</p>
            )}
            {auditRecords?.length === 0 && (
              <p className="text-sm text-[#777777]">Nenhuma ação registrada ainda.</p>
            )}
            {auditRecords?.map((item) => (
              <div key={item.id} className="flex gap-3 border-b border-[#F0F0F0] pb-4 last:border-0 last:pb-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF1EE] text-[#EF5948]">
                  <FiActivity size={15} />
                </span>
                <div>
                  <p className="text-sm font-medium">{item.acao} · {item.alvo}</p>
                  <p className="mt-1 text-xs text-[#888888]">{item.ator} · {formatarData(item.data)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
