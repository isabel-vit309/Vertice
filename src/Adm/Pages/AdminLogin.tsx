import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock } from "react-icons/fi";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sessionStorage.setItem("adm-authenticated", "true");
    navigate("/adm");
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
          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-[#EF5948] text-sm font-semibold text-white transition hover:bg-[#DA4939] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948]"
          >
            Entrar no painel
          </button>
        </form>
      </section>
    </main>
  );
}
