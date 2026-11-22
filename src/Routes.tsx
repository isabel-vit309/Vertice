import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdmPage from "./Adm/Pages";
import AdminLogin from "./Adm/Pages/AdminLogin";
import MetricsPage from "./Adm/Pages/Metrics";
import AuditPage from "./Adm/Pages/Audit";
import SPerfil from "./Startups/Pages/SPerfil";
import SMatching from "./Startups/Pages/SMatching";
import SMensagens from "./Startups/Pages/SMessagens";
import SMeetings from "./Startups/Pages/SMeetings";
import SConections from "./Startups/Pages/SConections";
import IPerfil from "./Investors/Pages/IPerfil";
import IMatching from "./Investors/Pages/IMatching";
import InvestorStartups from "./Investors/Pages/Startups";
import InvestorStartupProfile from "./Investors/Pages/StartupPerfil";
import IMensagens from "./Investors/Pages/IMessagens";
import IMeetings from "./Investors/Pages/IMeetings";
import IConections from "./Investors/Pages/IConections";
import {
  InvestorLoginRoute,
  InvestorRegisterRoute,
  InvestorStepRoute,
  StartupLoginRoute,
  StartupRegisterRoute,
  StartupStepRoute,
} from "./integration/AuthRoutes";
import LandingPage from "./LandingPage";

export default function AppRoutes() {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-enter">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="home" element={<LandingPage />} />

        <Route path="investors">
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<InvestorLoginRoute />} />
          <Route path="register" element={<InvestorRegisterRoute />} />
          <Route path="register-complet">
            <Route path="step1" element={<InvestorStepRoute step={1} />} />
            <Route path="step2" element={<InvestorStepRoute step={2} />} />
            <Route path="step3" element={<InvestorStepRoute step={3} />} />
          </Route>
          <Route path="perfil" element={<IPerfil />} />
          <Route path="matching" element={<IMatching />} />
          <Route path="startups" element={<InvestorStartups />} />
          <Route path="startups/:id" element={<InvestorStartupProfile />} />
          <Route path="mensagens" element={<IMensagens />} />
          <Route path="meetings" element={<IMeetings />} />
          <Route path="conections" element={<IConections />} />
        </Route>

        <Route path="startups">
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<StartupLoginRoute />} />
          <Route path="register" element={<StartupRegisterRoute />} />
          <Route path="register-complet">
            <Route path="step1" element={<StartupStepRoute step={1} />} />
            <Route path="step2" element={<StartupStepRoute step={2} />} />
            <Route path="step3" element={<StartupStepRoute step={3} />} />
            <Route path="step4" element={<StartupStepRoute step={4} />} />
          </Route>
          <Route path="perfil" element={<SPerfil />} />
          <Route path="matching" element={<SMatching />} />
          <Route path="mensagens" element={<SMensagens />} />
          <Route path="meetings" element={<SMeetings />} />
          <Route path="conections" element={<SConections />} />
        </Route>

        <Route path="adm">
          <Route index element={<AdmPage />} />
          <Route path="login" element={<AdminLogin />} />
          <Route path="metricas" element={<MetricsPage />} />
          <Route path="auditoria" element={<AuditPage />} />
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
    </div>
  );
}
