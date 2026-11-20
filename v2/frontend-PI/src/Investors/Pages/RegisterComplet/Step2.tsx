import { useState } from "react";
import type { FormEvent } from "react";
import ISidebar from "../../../components/ISidebar";
import MultiCombobox from "../../../components/MultiCombobox";
import TicketRangeFields from "../../../components/TicketRangeFields";
import { ESTAGIOS, SEGMENTOS, toOptions } from "../../../data/options";
import { maskCurrency } from "../../../utils/forms";

export type InvestorStep2Values = {
  /** Vários segmentos e estágios: o matching mostra startups que batem em qualquer um deles. */
  segments: string[];
  stages: string[];
  minimumTicket: string;
  maximumTicket: string;
  aboutInvestor: string;
  career: string;
  lookingFor: string;
};

type Step2Props = {
  defaultValues?: Partial<InvestorStep2Values>;
  /** Recebe os valores atuais para que "Voltar" não descarte o que foi digitado. */
  onBack?: (values: InvestorStep2Values) => void;
  onNext?: (values: InvestorStep2Values) => void | Promise<void>;
};

const initialValues: InvestorStep2Values = {
  segments: [],
  stages: [],
  minimumTicket: "",
  maximumTicket: "",
  aboutInvestor: "",
  career: "",
  lookingFor: "",
};

function ProgressSteps() {
  return (
    <nav aria-label="Etapas do cadastro" className="flex items-center">
      {[1, 2, 3].map((step, index) => (
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

const labelClass = "mb-[5px] block text-[13px] font-medium leading-[15px]";
const inputClass =
  "h-[29px] w-full rounded-[8px] border border-[#d5d5d5] bg-white px-2 text-[10px] text-[#333333] outline-none transition placeholder:text-[#777777] focus:border-[#f05d4c] focus:ring-2 focus:ring-[#f05d4c]/15";
const textAreaClass =
  "block h-[144px] w-full resize-none rounded-[8px] border border-[#d5d5d5] bg-white px-2 py-1.5 text-[10px] leading-[13px] text-[#333333] outline-none transition placeholder:text-[#777777] focus:border-[#f05d4c] focus:ring-2 focus:ring-[#f05d4c]/15";

function MultiSelectField({
  id,
  label,
  values,
  placeholder,
  options,
  onChange,
}: {
  id: string;
  label: string;
  values: string[];
  placeholder: string;
  options: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <MultiCombobox
        id={id}
        required
        values={values}
        options={toOptions(options)}
        placeholder={placeholder}
        onChange={onChange}
        className={inputClass}
      />
    </div>
  );
}

export default function Step2({ onBack, onNext, defaultValues }: Step2Props = {}) {
  const [values, setValues] = useState<InvestorStep2Values>(() => {
    const merged = { ...initialValues, ...defaultValues };
    return {
      ...merged,
      minimumTicket: maskCurrency(merged.minimumTicket),
      maximumTicket: maskCurrency(merged.maximumTicket),
    };
  });

  function updateValue(name: keyof InvestorStep2Values, value: string): void {
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
        <ISidebar/>
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
          id="investor-step-two"
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
                Conte mais sobre você para conectarmos com os parceiros certos · todos os campos são obrigatórios
              </p>
            </div>
          </div>

          <div className="mt-[26px] grid grid-cols-1 gap-x-[23px] gap-y-[17px] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.1fr]">
            <MultiSelectField
              id="investor-segment"
              label="Segmentos de interesse"
              values={values.segments}
              placeholder="Digite ou selecione um ou mais"
              options={SEGMENTOS}
              onChange={(segments) => setValues((current) => ({ ...current, segments }))}
            />
            <MultiSelectField
              id="investor-stage"
              label="Estágios de interesse"
              values={values.stages}
              placeholder="Digite ou selecione um ou mais"
              options={ESTAGIOS}
              onChange={(stages) => setValues((current) => ({ ...current, stages }))}
            />
            <TicketRangeFields
              idPrefix="investor"
              label="Ticket médio de investimento"
              minimum={values.minimumTicket}
              maximum={values.maximumTicket}
              labelClass={labelClass}
              inputClass={inputClass}
              onChange={({ minimum, maximum }) =>
                setValues((current) => ({ ...current, minimumTicket: minimum, maximumTicket: maximum }))
              }
            />
          </div>

          <div className="mt-[17px] grid gap-x-[23px] gap-y-[17px] min-[560px]:grid-cols-2">
            <div>
              <label htmlFor="investor-about" className={labelClass}>
                Sobre o investidor
              </label>
              <textarea
                id="investor-about"
                required
                placeholder="Dê um breve resumo sobre você"
                value={values.aboutInvestor}
                onChange={(event) =>
                  updateValue("aboutInvestor", event.currentTarget.value)
                }
                className={textAreaClass}
              />
            </div>
            <div>
              <label htmlFor="investor-career" className={labelClass}>
                Carreira
              </label>
              <textarea
                id="investor-career"
                required
                placeholder="Dê um breve resumo sobre a sua carreira na área de investimentos"
                value={values.career}
                onChange={(event) => updateValue("career", event.currentTarget.value)}
                className={textAreaClass}
              />
            </div>
          </div>

          <div className="mt-[19px]">
            <label htmlFor="investor-looking-for" className={labelClass}>
              O que está buscando?
            </label>
            <textarea
              id="investor-looking-for"
              required
              placeholder="Dê um breve resumo do que está buscando"
              value={values.lookingFor}
              onChange={(event) =>
                updateValue("lookingFor", event.currentTarget.value)
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
            form="investor-step-two"
            className="h-[39px] w-full max-w-[270px] rounded-lg bg-[#ef5d4d] text-[18px] font-semibold text-white transition hover:bg-[#dc4e3e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef5d4d]"
          >
            Próximo
          </button>
        </div>
      </div>
    </main>
  );
}
