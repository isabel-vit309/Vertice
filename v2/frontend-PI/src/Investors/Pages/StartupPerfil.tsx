// Perfil de uma startup aprovada, visto pelo investidor (a partir da página "Startups").
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ISidebar from "../../components/ISidebar";
import { Breadcrumb, PageShell, StatusMessage } from "../../components/ProfileUI";
import { StartupProfileView } from "../../components/StartupProfile";
import { ApiError, api } from "../../services/api";
import type { StartupProfile } from "../../services/api";
import { getSession } from "../../services/session";

export default function StartupPerfil() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
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

  return (
    <PageShell sidebar={<ISidebar />}>
      <Breadcrumb parent="Startups" href="/investors/startups" current={profile?.name ?? (error ? "Perfil" : "Carregando...")} />
      <StatusMessage error={error} />
      {!profile && !error && (
        <p role="status" className="text-sm text-[#777777]">
          Carregando perfil...
        </p>
      )}
      {profile && <StartupProfileView profile={profile} />}
    </PageShell>
  );
}
