import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock } from "react-icons/fi";

import { api } from "../../services/api";
import { clearSession, saveSession } from "../../services/session";
import { playLoginIntro } from "../../components/LoginIntro";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const session = await api.login(email.trim(), password);
      if (session.papel !== "ADMIN") {
        clearSession();
        setError("Acesso restrito a administradores.");
        return;
      }
      saveSession(session);
      await playLoginIntro();
      navigate("/adm", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F8FA] px-5 text-[#252525]">
      <section className="w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white p-7 shadow-[0_3px_8px_rgba(0,0,0,0.12)] sm:p-9">
          <h1 className="text-2xl font-semibold tracking-tight">
          Acesso administrativo
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6F6F6F]">
          Entre para moderar cadastros, acompanhar métricas e consultar a
          auditoria da plataforma.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="adm-email"
              className="mb-2 block text-sm font-medium"
            >
              E-mail
            </label>
            <input
              id="adm-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="admin@vertice.com"
              className="h-11 w-full rounded-lg border border-[#D8D8D8] px-3 text-sm outline-none focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/15"
            />
          </div>
          <div>
            <label
              htmlFor="adm-password"
              className="mb-2 block text-sm font-medium"
            >
              Senha
            </label>
            <div className="relative">
              <FiLock
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"
              />
              <input
                id="adm-password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                placeholder="Digite sua senha"
                className="h-11 w-full rounded-lg border border-[#D8D8D8] pl-10 pr-3 text-sm outline-none focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/15"
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full disabled:cursor-wait disabled:opacity-70 rounded-lg bg-[#EF5948] text-sm font-semibold text-white transition hover:bg-[#DA4939] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948]"
          >
            {submitting ? "Entrando..." : "Entrar no painel"}
          </button>
        </form>
      </section>
    </main>
  );
}
