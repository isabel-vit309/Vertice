import { useState } from "react";
import type { FormEvent } from "react";
import SSidebar from "../../../components/SSidebar";

export type StartupStep4Values = {
  terms: boolean;
  privacy: boolean;
  dataProcessing: boolean;
};

type Step4Props = {
  onBack?: () => void;
  onNext?: (values: StartupStep4Values) => void | Promise<void>;
};

const initialValues: StartupStep4Values = {
  terms: true,
  privacy: true,
  dataProcessing: true,
};

function ProgressSteps() {
  return (
    <nav aria-label="Etapas do cadastro" className="flex items-center">
      {[1, 2, 3, 4].map((step, index) => (
        <div key={step} className="flex min-w-0 flex-1 items-center">
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#f05d4c] text-[13px] text-[#f05d4c]">
            {step}
          </span>

          {index < 3 && (
            <span
              aria-hidden="true"
              className="mx-[9px] h-px min-w-0 flex-1 bg-[#efb5ad]"
            />
          )}
        </div>
      ))}
    </nav>
  );
}

export default function Step4({ onBack, onNext }: Step4Props = {}) {
  const [values, setValues] = useState<StartupStep4Values>(initialValues);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!values.terms || !values.privacy || !values.dataProcessing) return;
    void onNext?.(values);
  }

  const allConsentsAccepted =
    values.terms && values.privacy && values.dataProcessing;

  return (
    <main
      className="min-h-screen bg-[#f7fafc] px-[11px] pb-[31px] pt-[29px] text-[#111111]"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <SSidebar />
      <div className="mx-auto w-full max-w-[1060px]">
        <header>
          <h1 className="text-[22px] font-bold leading-tight tracking-[-0.3px]">
            Cadastro da Startup
          </h1>
          <p className="mt-[7px] text-[13px] leading-none text-[#5d5d5d]">
            Complete as informações da sua startup para encontrar investidores e
            mentores compatíveis
          </p>
        </header>

        <div className="mt-[40px]">
          <ProgressSteps />
        </div>

        <form
          id="startup-step-four"
          onSubmit={handleSubmit}
          className="mt-[35px] rounded-lg border border-[#e9e9e9] bg-white px-[25px] pb-[38px] pt-[28px] shadow-[0_2px_3px_rgba(0,0,0,0.24)]"
        >
          <div className="flex items-start gap-[15px]">
            <span className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-full border border-[#f05d4c] text-[17px] text-[#f05d4c]">
              4
            </span>
            <div className="pt-[2px]">
              <h2 className="text-[17px] font-semibold leading-[20px]">
                Consentimento e privacidade
              </h2>
              <p className="mt-[2px] text-[13px] leading-[15px] text-[#5e5e5e]">
                Seus dados estão protegidos e utilizados conforme a LGPD
              </p>
            </div>
          </div>

          <div className="mt-[30px] space-y-[19px]">
            <label className="flex cursor-pointer items-center gap-[13px] text-[13px] leading-[20px]">
              <input
                id="startup-terms"
                type="checkbox"
                checked={values.terms}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  setValues((current) => ({ ...current, terms: checked }));
                }}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[2px] border border-[#ef5d4d] text-[16px] font-bold leading-none text-transparent transition peer-checked:bg-[#ef5d4d] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#ef5d4d]/30"
              >
                ✓
              </span>
              <span>
                Li e aceito os{" "}
                <a
                  href="/termos-de-uso"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  className="text-[#ef5d4d] underline underline-offset-2"
                >
                  Termos de Uso
                </a>
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-[13px] text-[13px] leading-[20px]">
              <input
                id="startup-privacy"
                type="checkbox"
                checked={values.privacy}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  setValues((current) => ({ ...current, privacy: checked }));
                }}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[2px] border border-[#ef5d4d] text-[16px] font-bold leading-none text-transparent transition peer-checked:bg-[#ef5d4d] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#ef5d4d]/30"
              >
                ✓
              </span>
              <span>
                Li e concordo com a{" "}
                <a
                  href="/politica-de-privacidade"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  className="text-[#ef5d4d] underline underline-offset-2"
                >
                  Política de Privacidade
                </a>
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-[13px] text-[13px] leading-[20px]">
              <input
                id="startup-data-processing"
                type="checkbox"
                checked={values.dataProcessing}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  setValues((current) => ({
                    ...current,
                    dataProcessing: checked,
                  }));
                }}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[2px] border border-[#ef5d4d] text-[16px] font-bold leading-none text-transparent transition peer-checked:bg-[#ef5d4d] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#ef5d4d]/30"
              >
                ✓
              </span>
              <span>
                Autorizo o tratamento de dados conforme a LGPD para fins de
                conexões com investidores e mentores
              </span>
            </label>
          </div>
        </form>

        <div className="mt-[50px] flex items-center justify-between gap-5">
          <button
            type="button"
            onClick={onBack}
            className="h-[39px] w-full max-w-[270px] rounded-lg border border-[#f05d4c] bg-transparent text-[18px] font-medium text-[#f05d4c] transition hover:bg-[#fff1ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f05d4c]"
          >
            Voltar
          </button>
          <button
            type="submit"
            form="startup-step-four"
            disabled={!allConsentsAccepted}
            className="h-[39px] w-full max-w-[270px] rounded-lg bg-[#ef5d4d] text-[18px] font-semibold text-white transition hover:bg-[#dc4e3e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef5d4d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      </div>
    </main>
  );
}
