import { Link, Navigate, Route, Routes } from "react-router-dom";
import InvestorsPage from "./Investors/Pages/ILogin";
import AdmPage from "./Adm/Pages";
import SLogin from "./Startups/Pages/SLogin";
import SRegister from "./Startups/Pages/SRegister";
import SCompletRegister from "./Startups/Pages/SCompletRegister";
import SPerfil from "./Startups/Pages/SPerfil";
import SMatching from "./Startups/Pages/SMatching";
import SMensagens from "./Startups/Pages/SMessagens";
import SMeetings from "./Startups/Pages/SMeetings";
import SConections from "./Startups/Pages/SConections";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/investors" replace />} />

      <Route path="investors">
        <Route index element={<InvestorsPage />} />
      </Route>

      <Route path="startups">
        <Route path="login" element={<SLogin />} />
        <Route path="register" element={<SRegister />} />
        <Route path="complet-register" element={<SCompletRegister />} />
        <Route path="perfil" element={<SPerfil />} />
        <Route path="matching" element={<SMatching />} />
        <Route path="mensagens" element={<SMensagens />} />
        <Route path="meetings" element={<SMeetings />} />
        <Route path="conections" element={<SConections />} />
      </Route>

      <Route path="adm">
        <Route index element={<AdmPage />} />
      </Route>

      <Route
        path="*"
        element={
          <section>
            <h1 className="text-3xl font-bold">Página não encontrada</h1>
            <Link
              to="/"
              className="mt-4 inline-block text-indigo-700 underline"
            >
              Voltar ao início
            </Link>
          </section>
        }
      />
    </Routes>
  );
}
