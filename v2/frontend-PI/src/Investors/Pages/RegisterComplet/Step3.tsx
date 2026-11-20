import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import ISidebar from "../../../components/ISidebar";

export type InvestorStep3Values = {
  terms: boolean;
  privacy: boolean;
  dataProcessing: boolean;
};

type Step3Props = {
  submitError?: string;
  isSubmitting?: boolean;
  defaultValues?: Partial<InvestorStep3Values>;
  /** Recebe os valores atuais para que "Voltar" não descarte o que foi digitado. */
  onBack?: (values: InvestorStep3Values) => void;
  onNext?: (values: InvestorStep3Values) => void | Promise<void>;
};

const initialValues: InvestorStep3Values = {
  terms: true,
  privacy: true,
  dataProcessing: true,
};

function ProgressSteps() {
  return (
    <nav aria-label="Etapas do cadastro" className="flex items-center">
      {[1, 2, 3].map((step, index) => (
        <div key={step} className="flex min-w-0 flex-1 items-center">
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#f05d4c] text-[13px] text-[#f05d4c]">
            {step}
          </span>
          {index < 2 && (
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

function ConsentCheckbox({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-[13px] text-[13px] leading-[20px]">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          const nextChecked = event.currentTarget.checked;
          onChange(nextChecked);
        }}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[2px] border border-[#ef5d4d] text-[16px] font-bold leading-none text-transparent transition peer-checked:bg-[#ef5d4d] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#ef5d4d]/30"
      >
        ✓
      </span>
      <span>{children}</span>
    </label>
  );
}

export default function Step3({ onBack, onNext, defaultValues, submitError, isSubmitting = false }: Step3Props = {}) {
  const [values, setValues] = useState<InvestorStep3Values>({ ...initialValues, ...defaultValues });
  const allConsentsAccepted =
    values.terms && values.privacy && values.dataProcessing;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isSubmitting || !(allConsentsAccepted)) return;
    void onNext?.(values);
  }

  return (
    <main
      className="min-h-screen bg-[#f7fafc] pb-[31px] text-[#111111] md:pl-48"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <ISidebar />
      <div className="mx-auto w-full max-w-[1060px] px-4 pt-6 sm:px-6 md:pt-[29px]">
        <header>
          <h1 className="text-[22px] font-bold leading-tight tracking-[-0.3px]">
            Cadastro do Investidor
          </h1>
          <p className="mt-[7px] text-[13px] leading-none text-[#5d5d5d]">
            Complete suas informações para encontrar startups compatíveis
          </p>
        </header>

        <div className="mt-[40px]">
          <ProgressSteps />
        </div>

        <form
          id="investor-step-three"
          onSubmit={handleSubmit}
          className="mt-[35px] rounded-lg border border-[#e9e9e9] bg-white px-[25px] pb-[38px] pt-[28px] shadow-[0_2px_3px_rgba(0,0,0,0.22)]"
        >
          <div className="flex items-start gap-[15px]">
            <span className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-full border border-[#f05d4c] text-[17px] text-[#f05d4c]">
              3
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
            <ConsentCheckbox
              id="investor-terms"
              checked={values.terms}
              onChange={(terms) =>
                setValues((current) => ({ ...current, terms }))
              }
            >
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
            </ConsentCheckbox>

            <ConsentCheckbox
              id="investor-privacy"
              checked={values.privacy}
              onChange={(privacy) =>
                setValues((current) => ({ ...current, privacy }))
              }
            >
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
            </ConsentCheckbox>

            <ConsentCheckbox
              id="investor-data-processing"
              checked={values.dataProcessing}
              onChange={(dataProcessing) =>
                setValues((current) => ({ ...current, dataProcessing }))
              }
            >
              Autorizo o tratamento de dados conforme a LGPD para fins de
              conexões com investidores e mentores
            </ConsentCheckbox>
          </div>
        </form>

        {submitError && (
          <p
            role="alert"
            className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-[13px] leading-relaxed text-red-700"
          >
            {submitError}
          </p>
        )}

        <div className="mt-[50px] flex items-center justify-between gap-5">
          <button
            type="button"
            onClick={() => onBack?.(values)}
            className="h-[39px] w-full max-w-[270px] rounded-lg border border-[#f05d4c] bg-transparent text-[18px] font-medium text-[#f05d4c] transition hover:bg-[#fff1ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f05d4c]"
          >
            Voltar
          </button>
          <button
            type="submit"
            form="investor-step-three"
            disabled={!allConsentsAccepted || isSubmitting}
            className="h-[39px] w-full max-w-[270px] rounded-lg bg-[#ef5d4d] text-[18px] font-semibold text-white transition hover:bg-[#dc4e3e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef5d4d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Enviando..." : "Finalizar cadastro"}
          </button>
        </div>
      </div>
    </main>
  );
}
