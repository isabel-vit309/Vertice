import { useState } from "react";
import type { FormEvent } from "react";
import SSidebar from "../../../components/SSidebar";
import Combobox from "../../../components/Combobox";
import TicketRangeFields from "../../../components/TicketRangeFields";
import { ESTAGIOS, SEGMENTOS, toOptions } from "../../../data/options";
import { maskCurrency } from "../../../utils/forms";

export type StartupStep2Values = {
  segment: string;
  stage: string;
  minimumTicket: string;
  maximumTicket: string;
  summary: string;
  problem: string;
  competitiveAdvantages: string;
};

type Step2Props = {
  defaultValues?: Partial<StartupStep2Values>;
  /** Recebe os valores atuais para que "Voltar" não descarte o que foi digitado. */
  onBack?: (values: StartupStep2Values) => void;
  onNext?: (values: StartupStep2Values) => void | Promise<void>;
};

const initialValues: StartupStep2Values = {
  segment: "",
  stage: "",
  minimumTicket: "",
  maximumTicket: "",
  summary: "",
  problem: "",
  competitiveAdvantages: "",
};

function ProgressSteps() {
  return (
    <nav aria-label="Etapas do cadastro" className="flex items-center">
      {[1, 2, 3, 4].map((step, index) => (
        <div key={step} className="flex min-w-0 flex-1 items-center">
          <span
            className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border text-[13px] ${
              step <= 2
                ? "border-[#f05d4c] text-[#f05d4c]"
                : "border-[#7f8589] text-[#555b5f]"
            }`}
          >
            {step}
          </span>

          {index < 3 && (
            <span
              aria-hidden="true"
              className="mx-[9px] h-px min-w-0 flex-1 bg-[#989da1]"
            />
          )}
        </div>
      ))}
    </nav>
  );
}

const labelClass = "mb-[5px] block text-[13px] font-medium leading-[15px]";
const inputClass =
  "h-[29px] w-full rounded-[8px] border border-[#d5d5d5] bg-white px-2 text-[10px] text-[#333333] outline-none transition placeholder:text-[#777777] focus:border-[#f05d4c] focus:ring-2 focus:ring-[#f05d4c]/15";
const textAreaClass =
  "block h-[144px] w-full resize-none rounded-[8px] border border-[#d5d5d5] bg-white px-2 py-1.5 text-[10px] leading-[13px] text-[#333333] outline-none transition placeholder:text-[#777777] focus:border-[#f05d4c] focus:ring-2 focus:ring-[#f05d4c]/15";

export default function Step2({ onBack, onNext, defaultValues }: Step2Props = {}) {
  const [values, setValues] = useState<StartupStep2Values>(() => {
    const merged = { ...initialValues, ...defaultValues };
    // Valores vindos do rascunho são reapresentados já formatados.
    return {
      ...merged,
      minimumTicket: maskCurrency(merged.minimumTicket),
      maximumTicket: maskCurrency(merged.maximumTicket),
    };
  });

  function updateValue(
    name: keyof StartupStep2Values,
    value: string,
  ): void {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void onNext?.(values);
  }

  return (
    <main
      className="min-h-screen bg-[#f7fafc] pb-[31px] text-[#111111] md:pl-48"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
        <SSidebar/>
      <div className="mx-auto w-full max-w-[1060px] px-4 pt-6 sm:px-6 md:pt-[29px]">
        <header>
          <h1 className="text-[22px] font-bold leading-tight tracking-[-0.3px]">
            Cadastro da Startup
          </h1>
          <p className="mt-[7px] text-[13px] leading-none text-[#5d5d5d]">
            Complete as informações da sua startup para encontrar investidores e mentores compatíveis
          </p>
        </header>

        <div className="mt-[40px]">
          <ProgressSteps />
        </div>

        <form
          id="startup-step-two"
          onSubmit={handleSubmit}
          className="mt-[35px] rounded-lg border border-[#e9e9e9] bg-white px-[25px] pb-[38px] pt-[28px] shadow-[0_2px_3px_rgba(0,0,0,0.22)]"
        >
          <div className="flex items-start gap-[15px]">
            <span className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-full border border-[#f05d4c] text-[17px] text-[#f05d4c]">
              2
            </span>
            <div className="pt-[2px]">
              <h2 className="text-[17px] font-semibold leading-[20px]">
                Perfil e necessidades
              </h2>
              <p className="mt-[2px] text-[13px] leading-[15px] text-[#5e5e5e]">
                Conte mais sobre sua startup para conectarmos com os parceiros certos · todos os campos são obrigatórios
              </p>
            </div>
          </div>

          <div className="mt-[26px] grid grid-cols-1 gap-x-[23px] gap-y-[17px] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.1fr]">
            <div>
              <label htmlFor="startup-segment" className={labelClass}>
                Segmento
              </label>
              <Combobox
                id="startup-segment"
                required
                value={values.segment}
                options={toOptions(SEGMENTOS)}
                placeholder="Digite ou selecione o segmento"
                onChange={(value) => updateValue("segment", value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="startup-stage" className={labelClass}>
                Estágio da startup
              </label>
              <Combobox
                id="startup-stage"
                required
                value={values.stage}
                options={toOptions(ESTAGIOS)}
                placeholder="Digite ou selecione o estágio"
                onChange={(value) => updateValue("stage", value)}
                className={inputClass}
              />
            </div>

            <TicketRangeFields
              idPrefix="startup"
              label="Ticket médio buscado"
              minimum={values.minimumTicket}
              maximum={values.maximumTicket}
              labelClass={labelClass}
              inputClass={inputClass}
              onChange={({ minimum, maximum }) =>
                setValues((current) => ({ ...current, minimumTicket: minimum, maximumTicket: maximum }))
              }
            />
          </div>

          <div className="mt-[15px] grid gap-x-[15px] gap-y-[17px] min-[560px]:grid-cols-2">
            <div>
              <label htmlFor="startup-summary" className={labelClass}>
                Resumo da startup
              </label>
              <textarea
                id="startup-summary"
                required
                placeholder="Dê um breve resumo da sua startup"
                value={values.summary}
                onChange={(event) => updateValue("summary", event.currentTarget.value)}
                className={textAreaClass}
              />
            </div>

            <div>
              <label htmlFor="startup-problem" className={labelClass}>
                Problema que resolve
              </label>
              <textarea
                id="startup-problem"
                required
                placeholder="Dê um breve resumo do problema que sua startup resolve"
                value={values.problem}
                onChange={(event) => updateValue("problem", event.currentTarget.value)}
                className={textAreaClass}
              />
            </div>
          </div>

          <div className="mt-[19px]">
            <label
              htmlFor="startup-competitive-advantages"
              className={labelClass}
            >
              Diferenciais competitivos
            </label>
            <textarea
              id="startup-competitive-advantages"
              required
              placeholder="Dê um breve resumo do diferencial competitivo da sua startup"
              value={values.competitiveAdvantages}
              onChange={(event) =>
                updateValue("competitiveAdvantages", event.currentTarget.value)
              }
              className="block h-[59px] w-full resize-none rounded-[8px] border border-[#d5d5d5] bg-white px-2 py-1.5 text-[10px] leading-[13px] text-[#333333] outline-none transition placeholder:text-[#777777] focus:border-[#f05d4c] focus:ring-2 focus:ring-[#f05d4c]/15"
            />
          </div>
        </form>

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
            form="startup-step-two"
            className="h-[39px] w-full max-w-[270px] rounded-lg bg-[#ef5d4d] text-[18px] font-semibold text-white transition hover:bg-[#dc4e3e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef5d4d]"
          >
            Próximo
          </button>
        </div>
      </div>
    </main>
  );
}
