import { useState } from "react";
import type { FormEvent } from "react";
import { FiChevronDown } from "react-icons/fi";
import ISidebar from "../../../components/ISidebar";

export type InvestorStep2Values = {
  segment: string;
  stage: string;
  minimumTicket: string;
  maximumTicket: string;
  aboutInvestor: string;
  career: string;
  lookingFor: string;
};

type Step2Props = {
  onBack?: () => void;
  onNext?: (values: InvestorStep2Values) => void | Promise<void>;
};

const initialValues: InvestorStep2Values = {
  segment: "",
  stage: "",
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

function SelectField({
  id,
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          className={`${inputClass} appearance-none pr-7`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <FiChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#666666]"
        />
      </div>
    </div>
  );
}

export default function Step2({ onBack, onNext }: Step2Props = {}) {
  const [values, setValues] = useState<InvestorStep2Values>(initialValues);

  function updateValue(name: keyof InvestorStep2Values, value: string): void {
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
        <ISidebar/>
      <div className="mx-auto w-full max-w-[1060px]">
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
                Conte mais sobre você para conectamos com os parceiros certos
              </p>
            </div>
          </div>

          <div className="mt-[26px] grid grid-cols-1 gap-x-[23px] gap-y-[17px] min-[560px]:grid-cols-[1fr_1fr_1.1fr]">
            <SelectField
              id="investor-segment"
              label="Segmento"
              value={values.segment}
              placeholder="Selecione o segmento da sua Startup"
              options={["Tecnologia", "Saúde", "Educação"]}
              onChange={(value) => updateValue("segment", value)}
            />
            <SelectField
              id="investor-stage"
              label="Estágio da startup"
              value={values.stage}
              placeholder="Selecione o estágio da sua Startup"
              options={["Ideação", "Operação", "Escala"]}
              onChange={(value) => updateValue("stage", value)}
            />
            <div>
              <span className={labelClass}>Ticket médio buscado</span>
              <div className="grid grid-cols-2 gap-1">
                <input
                  aria-label="Ticket médio mínimo"
                  type="text"
                  inputMode="decimal"
                  placeholder="Valor mínimo"
                  value={values.minimumTicket}
                  onChange={(event) =>
                    updateValue("minimumTicket", event.currentTarget.value)
                  }
                  className={inputClass}
                />
                <input
                  aria-label="Ticket médio máximo"
                  type="text"
                  inputMode="decimal"
                  placeholder="Valor máximo"
                  value={values.maximumTicket}
                  onChange={(event) =>
                    updateValue("maximumTicket", event.currentTarget.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="mt-[17px] grid gap-x-[23px] gap-y-[17px] min-[560px]:grid-cols-2">
            <div>
              <label htmlFor="investor-about" className={labelClass}>
                Sobre o investidor
              </label>
              <textarea
                id="investor-about"
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
            onClick={onBack}
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
