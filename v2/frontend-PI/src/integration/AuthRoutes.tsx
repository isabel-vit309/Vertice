// Containers de rota: conectam as telas (que só expõem callbacks) ao backend.
import { useRef, useState } from "react";
import type { ComponentType } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { api } from "../services/api";
import { buildPayload } from "./payload";
import { homeFor, saveSession } from "../services/session";
import { useRegistrationDraft } from "../services/registrationDraft";
import { playLoginIntro } from "../components/LoginIntro";

import SLogin from "../Startups/Pages/SLogin";
import SRegister from "../Startups/Pages/SRegister";
import ILogin from "../Investors/Pages/ILogin";
import IRegister from "../Investors/Pages/IRegister";
import Step1 from "../Startups/Pages/RegisterComplet/Step1";
import Step2 from "../Startups/Pages/RegisterComplet/Step2";
import Step3 from "../Startups/Pages/RegisterComplet/Step3";
import Step4 from "../Startups/Pages/RegisterComplet/Step4";
import IStep1 from "../Investors/Pages/RegisterComplet/Step1";
import IStep2 from "../Investors/Pages/RegisterComplet/Step2";
import IStep3 from "../Investors/Pages/RegisterComplet/Step3";

type Credentials = { email: string; password: string };
type CredentialsPage = ComponentType<{
  onLogin?: (credentials: Credentials) => void | Promise<void>;
  notice?: string;
}>;

const PENDING_NOTICE =
  "Cadastro enviado! Sua conta está pendente de aprovação pela equipe Vértice. " +
  "Você poderá entrar assim que ela for aprovada.";

/* ------------------------------------------------------------------ Login */

function LoginRoute({ Page }: { Page: CredentialsPage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;

  async function handleLogin({ email, password }: Credentials) {
    const session = await api.login(email, password);
    saveSession(session);
    await playLoginIntro();
    navigate(homeFor(session.papel), { replace: true });
  }

  return <Page onLogin={handleLogin} notice={notice} />;
}

export const StartupLoginRoute = () => <LoginRoute Page={SLogin} />;
export const InvestorLoginRoute = () => <LoginRoute Page={ILogin} />;

/* ----------------------------------------------- Cadastro: tela inicial */

function RegisterRoute({
  Page,
  kind,
  firstStep,
}: {
  Page: CredentialsPage;
  kind: "startup" | "investor";
  firstStep: string;
}) {
  const navigate = useNavigate();
  const { merge, reset } = useRegistrationDraft(kind);

  // Não há criação de conta parcial no backend: as credenciais ficam no
  // rascunho em memória e são enviadas junto com as etapas no final.
  function handleStart({ email, password }: Credentials) {
    reset();
    merge({ email, password });
    navigate(firstStep);
  }

  return <Page onLogin={handleStart} />;
}

export const StartupRegisterRoute = () => (
  <RegisterRoute Page={SRegister} kind="startup" firstStep="/startups/register-complet/step1" />
);
export const InvestorRegisterRoute = () => (
  <RegisterRoute Page={IRegister} kind="investor" firstStep="/investors/register-complet/step1" />
);

/* ------------------------------------------------ Etapas: startup (1..4) */

const STARTUP_BASE = "/startups/register-complet";

export function StartupStepRoute({ step }: { step: 1 | 2 | 3 | 4 }) {
  const navigate = useNavigate();
  const { draft, merge, reset } = useRegistrationDraft("startup");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // navigate() do React Router v7 roda em transição; o reset() do rascunho
  // renderiza antes dele. Este marcador evita que o guard abaixo redirecione
  // para o início do cadastro após um envio bem-sucedido.
  const completed = useRef(false);

  if (!draft.email || !draft.password) {
    return completed.current ? null : <Navigate to="/startups/register" replace />;
  }

  const next = (values: object) => {
    merge(values as Record<string, unknown>);
    navigate(`${STARTUP_BASE}/step${step + 1}`);
  };
  const back = (values?: object) => {
    if (values) merge(values as Record<string, unknown>);
    navigate(`${STARTUP_BASE}/step${step - 1}`);
  };
  const defaults = draft as never;

  switch (step) {
    case 1:
      return (
        <Step1
          defaultValues={{ ...(draft as object), corporateEmail: draft.email }}
          onNext={next}
        />
      );
    case 2:
      return <Step2 defaultValues={defaults} onNext={next} onBack={back} />;
    case 3:
      return <Step3 defaultValues={defaults} onNext={next} onBack={back} />;
    case 4:
      return (
        <Step4
          defaultValues={defaults}
          onBack={back}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onNext={async (values) => {
            const full: Record<string, unknown> = { ...draft, ...values };
            merge(values);
            setSubmitError("");
            setIsSubmitting(true);
            try {
              await api.cadastrarStartup(buildPayload(full), {
                pitchDeck: (full.pitchDeck as File | null) ?? null,
                businessModelCanvas: (full.businessModelCanvas as File | null) ?? null,
                photo: (full.photo as File | null) ?? null,
              });
              completed.current = true;
              navigate("/startups/login", { replace: true, state: { notice: PENDING_NOTICE } });
              reset();
            } catch (error) {
              setSubmitError(
                error instanceof Error ? error.message : "Não foi possível concluir o cadastro.",
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      );
  }
}

/* ---------------------------------------------- Etapas: investidor (1..3) */

const INVESTOR_BASE = "/investors/register-complet";

export function InvestorStepRoute({ step }: { step: 1 | 2 | 3 }) {
  const navigate = useNavigate();
  const { draft, merge, reset } = useRegistrationDraft("investor");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // navigate() do React Router v7 roda em transição; o reset() do rascunho
  // renderiza antes dele. Este marcador evita que o guard abaixo redirecione
  // para o início do cadastro após um envio bem-sucedido.
  const completed = useRef(false);

  if (!draft.email || !draft.password) {
    return completed.current ? null : <Navigate to="/investors/register" replace />;
  }

  const next = (values: object) => {
    merge(values as Record<string, unknown>);
    navigate(`${INVESTOR_BASE}/step${step + 1}`);
  };
  const back = (values?: object) => {
    if (values) merge(values as Record<string, unknown>);
    navigate(`${INVESTOR_BASE}/step${step - 1}`);
  };
  const defaults = draft as never;

  switch (step) {
    case 1:
      return (
        <IStep1
          defaultValues={{ ...(draft as object), corporateEmail: draft.email }}
          onNext={next}
        />
      );
    case 2:
      return <IStep2 defaultValues={defaults} onNext={next} onBack={back} />;
    case 3:
      return (
        <IStep3
          defaultValues={defaults}
          onBack={back}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onNext={async (values) => {
            const full: Record<string, unknown> = { ...draft, ...values };
            merge(values);
            setSubmitError("");
            setIsSubmitting(true);
            try {
              await api.cadastrarInvestidor(buildPayload(full), (full.photo as File | null) ?? null);
              completed.current = true;
              navigate("/investors/login", { replace: true, state: { notice: PENDING_NOTICE } });
              reset();
            } catch (error) {
              setSubmitError(
                error instanceof Error ? error.message : "Não foi possível concluir o cadastro.",
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      );
  }
}
