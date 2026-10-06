import { useState } from "react";
import { FiActivity } from "react-icons/fi";

import AdminShell from "./AdminShell";
import { getAuditRecords } from "./adminData";

export default function AuditPage() {
  const [auditRecords] = useState(getAuditRecords);

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
            {auditRecords.map((item) => (
              <div key={item.id} className="flex gap-3 border-b border-[#F0F0F0] pb-4 last:border-0 last:pb-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF1EE] text-[#EF5948]">
                  <FiActivity size={15} />
                </span>
                <div>
                  <p className="text-sm font-medium">{item.action} · {item.target}</p>
                  <p className="mt-1 text-xs text-[#888888]">{item.actor} · {item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
