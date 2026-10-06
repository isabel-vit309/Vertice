import { useState } from "react";
import type { FormEvent } from "react";
import { FiChevronDown } from "react-icons/fi";
import SSidebar from "../../../components/SSidebar";

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
  onBack?: () => void;
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
const selectClass = `${inputClass} appearance-none pr-6`;
const textAreaClass =
  "block h-[144px] w-full resize-none rounded-[8px] border border-[#d5d5d5] bg-white px-2 py-1.5 text-[10px] leading-[13px] text-[#333333] outline-none transition placeholder:text-[#777777] focus:border-[#f05d4c] focus:ring-2 focus:ring-[#f05d4c]/15";

export default function Step2({ onBack, onNext }: Step2Props = {}) {
  const [values, setValues] = useState<StartupStep2Values>(initialValues);

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
      className="min-h-screen bg-[#f7fafc] px-[11px] pb-[31px] pt-[29px] text-[#111111]"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
        <SSidebar/>
      <div className="mx-auto w-full max-w-[1060px]">
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
                Conte mais sobre sua startup para conectamos com os parceiros certos
              </p>
            </div>
          </div>

          <div className="mt-[26px] grid grid-cols-1 gap-x-[23px] gap-y-[17px] min-[560px]:grid-cols-[1fr_1fr_1.1fr]">
            <div>
              <label htmlFor="startup-segment" className={labelClass}>
                Segmento
              </label>
              <div className="relative">
                <select
                  id="startup-segment"
                  value={values.segment}
                  onChange={(event) => updateValue("segment", event.currentTarget.value)}
                  className={selectClass}
                >
                  <option value="">Selecione o segmento da sua Startup</option>
                  <option value="tecnologia">Tecnologia</option>
                  <option value="saude">Saúde</option>
                  <option value="educacao">Educação</option>
                </select>
                <FiChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#666666]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="startup-stage" className={labelClass}>
                Estágio da startup
              </label>
              <div className="relative">
                <select
                  id="startup-stage"
                  value={values.stage}
                  onChange={(event) => updateValue("stage", event.currentTarget.value)}
                  className={selectClass}
                >
                  <option value="">Selecione o estágio da sua Startup</option>
                  <option value="ideacao">Ideação</option>
                  <option value="operacao">Operação</option>
                  <option value="escala">Escala</option>
                </select>
                <FiChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#666666]"
                />
              </div>
            </div>

            <div>
              <span className={labelClass}>Ticket médio buscado</span>
              <div className="grid grid-cols-2 gap-1">
                <input
                  aria-label="Ticket médio mínimo"
                  type="text"
                  inputMode="decimal"
                  placeholder="Valor mínimo"
                  value={values.minimumTicket}
                  onChange={(event) => updateValue("minimumTicket", event.currentTarget.value)}
                  className={inputClass}
                />
                <input
                  aria-label="Ticket médio máximo"
                  type="text"
                  inputMode="decimal"
                  placeholder="Valor máximo"
                  value={values.maximumTicket}
                  onChange={(event) => updateValue("maximumTicket", event.currentTarget.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="mt-[15px] grid gap-x-[15px] gap-y-[17px] min-[560px]:grid-cols-2">
            <div>
              <label htmlFor="startup-summary" className={labelClass}>
                Resumo da startup
              </label>
              <textarea
                id="startup-summary"
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
            onClick={onBack}
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
