import { Link, Navigate, Route, Routes } from "react-router-dom";
import AdmPage from "./Adm/Pages";
import AdminLogin from "./Adm/Pages/AdminLogin";
import MetricsPage from "./Adm/Pages/Metrics";
import AuditPage from "./Adm/Pages/Audit";
import SLogin from "./Startups/Pages/SLogin";
import SRegister from "./Startups/Pages/SRegister";
import SPerfil from "./Startups/Pages/SPerfil";
import SMatching from "./Startups/Pages/SMatching";
import SMensagens from "./Startups/Pages/SMessagens";
import SMeetings from "./Startups/Pages/SMeetings";
import SConections from "./Startups/Pages/SConections";
import ILogin from "./Investors/Pages/ILogin";
import IRegister from "./Investors/Pages/IRegister";
import Step1 from "./Startups/Pages/RegisterComplet/Step1";
import Step2 from "./Startups/Pages/RegisterComplet/Step2";
import Step3 from "./Startups/Pages/RegisterComplet/Step3";
import Step4 from "./Startups/Pages/RegisterComplet/Step4";
import IStep1 from "./Investors/Pages/RegisterComplet/Step1";
import IStep2 from "./Investors/Pages/RegisterComplet/Step2";
import IStep3 from "./Investors/Pages/RegisterComplet/Step3";
import IPerfil from "./Investors/Pages/IPerfil";
import IMatching from "./Investors/Pages/IMatching";
import InvestorStartups from "./Investors/Pages/Startups";
import IMensagens from "./Investors/Pages/IMessagens";
import IMeetings from "./Investors/Pages/IMeetings";
import IConections from "./Investors/Pages/IConections";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/investors" replace />} />

      <Route path="investors">
        <Route path="login" element={<ILogin />} />
        <Route path="register" element={<IRegister />} />
        <Route path="register-complet">
          <Route path="step1" element={<IStep1 />} />
          <Route path="step2" element={<IStep2 />} />
          <Route path="step3" element={<IStep3 />} />
        </Route>
        <Route path="perfil" element={<IPerfil />} />
        <Route path="matching" element={<IMatching />} />
        <Route path="startups" element={<InvestorStartups />} />
        <Route path="mensagens" element={<IMensagens />} />
        <Route path="meetings" element={<IMeetings />} />
        <Route path="conections" element={<IConections />} />
      </Route>

      <Route path="startups">
        <Route path="login" element={<SLogin />} />
        <Route path="register" element={<SRegister />} />
        <Route path="register-complet">
          <Route path="step1" element={<Step1 />} />
          <Route path="step2" element={<Step2 />} />
          <Route path="step3" element={<Step3 />} />
          <Route path="step4" element={<Step4 />} />
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
  );
}
