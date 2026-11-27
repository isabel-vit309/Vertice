// Perfil de uma startup aprovada, visto pelo investidor (a partir da página "Startups"),
// com as abas Perfil e Crescimento (?aba=crescimento).
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ISidebar from "../../components/ISidebar";
import { Breadcrumb, PageShell, StatusMessage } from "../../components/ProfileUI";
import { StartupProfileView } from "../../components/StartupProfile";
import GrowthDashboard from "../../components/growth/GrowthDashboard";
import { ApiError, api } from "../../services/api";
import type { GrowthDashboard as Dashboard, StartupProfile } from "../../services/api";
import { getSession } from "../../services/session";

type Tab = "perfil" | "crescimento";

function GrowthTab({ startupId }: { startupId: string }) {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api.crescimento
      .daStartup(startupId)
      .then((found) => active && setData(found))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : "Não foi possível carregar o crescimento."));
    return () => {
      active = false;
    };
  }, [startupId]);
  if (error) return <StatusMessage error={error} />;
  if (!data) return <p role="status" className="text-sm text-[#777777]">Carregando crescimento...</p>;
  return <GrowthDashboard data={data} emptyText="Esta startup ainda não compartilhou atualizações de crescimento." />;
}

export default function StartupPerfil() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get("aba") === "crescimento" ? "crescimento" : "perfil";
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getSession()) {
      navigate("/investors/login", { replace: true });
      return;
    }
    let active = true;
    setProfile(null);
    setError("");
    api.perfil
      .startup(id)
      .then((data) => active && setProfile(data))
      .catch((e: unknown) => {
        if (!active) return;
        if (e instanceof ApiError && e.status === 401) {
          navigate("/investors/login", { replace: true });
          return;
        }
        setError(
          e instanceof ApiError && e.status === 404
            ? "Startup não encontrada ou não disponível."
            : e instanceof Error
              ? e.message
              : "Não foi possível carregar o perfil.",
        );
      });
    return () => {
      active = false;
    };
  }, [id, navigate]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "perfil", label: "Perfil" },
    { key: "crescimento", label: "Crescimento" },
  ];

  return (
    <PageShell sidebar={<ISidebar />}>
      <Breadcrumb parent="Startups" href="/investors/startups" current={profile?.name ?? (error ? "Perfil" : "Carregando...")} />
      <StatusMessage error={error} />
      {!profile && !error && (
        <p role="status" className="text-sm text-[#777777]">
          Carregando perfil...
        </p>
      )}
      {profile && (
        <>
          <div role="tablist" aria-label="Seções do perfil da startup" className="mb-5 flex gap-1 border-b border-[#E5E7EB]">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                id={`aba-${item.key}`}
                aria-selected={tab === item.key}
                aria-controls={`painel-${item.key}`}
                onClick={() => setParams(item.key === "perfil" ? {} : { aba: item.key }, { replace: true })}
                className={`-mb-px border-b-2 px-4 py-2.5 text-xs font-medium transition ${
                  tab === item.key ? "border-[#EF5948] text-[#EF5948]" : "border-transparent text-[#777777] hover:text-[#EF5948]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`painel-${tab}`} aria-labelledby={`aba-${tab}`}>
            {tab === "perfil" ? <StartupProfileView profile={profile} /> : <GrowthTab startupId={id} />}
          </div>
        </>
      )}
    </PageShell>
  );
}
