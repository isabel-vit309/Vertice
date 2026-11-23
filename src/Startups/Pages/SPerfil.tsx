// Perfil da própria startup: dados reais, edição, foto e materiais (pitch deck e canvas).
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { esquecerPerfilProprio } from "../../components/MatchCelebration";

import SSidebar from "../../components/SSidebar";
import { Breadcrumb, PageShell, StatusMessage } from "../../components/ProfileUI";
import { StartupEditDialog, StartupProfileView } from "../../components/StartupProfile";
import { ApiError, api } from "../../services/api";
import type { StartupProfile } from "../../services/api";
import { getSession } from "../../services/session";

export default function SPerfil() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (getSession()?.papel !== "STARTUP") {
      navigate("/startups/login", { replace: true });
      return;
    }
    let active = true;
    api.perfil
      .proprio()
      .then((data) => active && setProfile(data.startup))
      .catch((e: unknown) => {
        if (!active) return;
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          navigate("/startups/login", { replace: true });
          return;
        }
        setError(e instanceof Error ? e.message : "Não foi possível carregar o perfil.");
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <PageShell sidebar={<SSidebar />}>
      <Breadcrumb parent="Perfil" href="/startups/perfil" current={profile?.name ?? "Carregando..."} />
      <StatusMessage error={error} success={saved} />
      {!profile && !error && (
        <p role="status" className="text-sm text-[#777777]">
          Carregando perfil...
        </p>
      )}
      {profile && (
        <div className={saved ? "mt-4" : ""}>
          <StartupProfileView
            profile={profile}
            owner
            onEdit={() => {
              setSaved("");
              setEditing(true);
            }}
            onProfileChange={setProfile}
          />
        </div>
      )}
      {profile && editing && (
        <StartupEditDialog
          profile={profile}
          onClose={() => setEditing(false)}
          onSaved={(next) => {
            esquecerPerfilProprio();
            setProfile(next);
            setSaved("Perfil atualizado.");
          }}
        />
      )}
    </PageShell>
  );
}
