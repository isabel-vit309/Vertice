// Perfis abertos a partir da Timeline (foto ou nome de quem publicou/comentou):
// investidor visto por qualquer portal e startup vista por outra startup.
// (O investidor vê startups pela página que já existia, /investors/startups/:id.)
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ISidebar from "./ISidebar";
import SSidebar from "./SSidebar";
import { InvestorProfileView } from "./InvestorProfile";
import { Breadcrumb, PageShell, StatusMessage } from "./ProfileUI";
import { StartupProfileView } from "./StartupProfile";
import { ApiError, api } from "../services/api";
import type { InvestorProfile, StartupProfile } from "../services/api";
import type { Viewer } from "./timeline/profileLink";

function usePublicProfile<T>(load: () => Promise<T>, loginPath: string, deps: unknown[]) {
  const navigate = useNavigate();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    load()
      .then((found) => active && setData(found))
      .catch((e: unknown) => {
        if (!active) return;
        if (e instanceof ApiError && (e.status === 401 || (e.status === 403 && e.message === "Acesso não permitido"))) {
          navigate(loginPath, { replace: true });
          return;
        }
        setError(e instanceof ApiError && e.status === 404 ? "Perfil não encontrado ou não disponível." : e instanceof Error ? e.message : "Não foi possível carregar o perfil.");
      });
    return () => {
      active = false;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, error };
}

export function PublicInvestorPage({ viewer }: { viewer: Viewer }) {
  const { userId = "" } = useParams();
  const base = viewer === "investor" ? "/investors" : "/startups";
  const { data, error } = usePublicProfile<InvestorProfile>(() => api.perfil.investidor(userId), `${base}/login`, [userId]);
  return (
    <PageShell sidebar={viewer === "investor" ? <ISidebar /> : <SSidebar />}>
      <Breadcrumb parent="Timeline" href={`${base}/timeline`} current={data?.name ?? (error ? "Perfil" : "Carregando...")} />
      <StatusMessage error={error} />
      {!data && !error && <p role="status" className="text-sm text-[#777777]">Carregando perfil...</p>}
      {data && <InvestorProfileView profile={data} />}
    </PageShell>
  );
}

export function PublicStartupPage() {
  const { id = "" } = useParams();
  const { data, error } = usePublicProfile<StartupProfile>(() => api.perfil.startup(id), "/startups/login", [id]);
  return (
    <PageShell sidebar={<SSidebar />}>
      <Breadcrumb parent="Timeline" href="/startups/timeline" current={data?.name ?? (error ? "Perfil" : "Carregando...")} />
      <StatusMessage error={error} />
      {!data && !error && <p role="status" className="text-sm text-[#777777]">Carregando perfil...</p>}
      {data && <StartupProfileView profile={data} />}
    </PageShell>
  );
}
