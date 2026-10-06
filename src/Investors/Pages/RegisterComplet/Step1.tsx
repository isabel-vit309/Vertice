import { useState } from "react";
import type { FormEvent } from "react";
import ISidebar from "../../../components/ISidebar";

export type InvestorStep1Values = {
  name: string;
  cpf: string;
  linkedin: string;
  city: string;
  state: string;
  corporateEmail: string;
};

type Step1Props = {
  onNext?: (values: InvestorStep1Values) => void | Promise<void>;
};

const initialValues: InvestorStep1Values = {
  name: "",
  cpf: "",
  linkedin: "",
  city: "",
  state: "",
  corporateEmail: "",
};

const fields: Array<{
  id: keyof InvestorStep1Values;
  label: string;
  placeholder: string;
  type?: string;
}> = [
  { id: "name", label: "Nome", placeholder: "Informe o seu nome" },
  { id: "cpf", label: "CPF", placeholder: "000.000.000-00" },
  {
    id: "linkedin",
    label: "LinkedIn",
    placeholder: "https://exemplo.com.br",
    type: "url",
  },
  { id: "city", label: "Cidade", placeholder: "Ex: Recife" },
  { id: "state", label: "Estado", placeholder: "Ex: Pernambuco" },
  {
    id: "corporateEmail",
    label: "E-mail corporativo",
    placeholder: "Ex: startup12@gmail.com.br",
    type: "email",
  },
];

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

const labelClass = "mb-[5px] block text-[13px] font-medium leading-[15px]";
const inputClass =
  "h-[29px] w-full rounded-[8px] border border-[#d5d5d5] bg-white px-2 text-[10px] text-[#333333] outline-none transition placeholder:text-[#777777] focus:border-[#f05d4c] focus:ring-2 focus:ring-[#f05d4c]/15";

export default function Step1({ onNext }: Step1Props = {}) {
  const [values, setValues] = useState<InvestorStep1Values>(initialValues);

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
          id="investor-step-one"
          onSubmit={handleSubmit}
          className="mt-[26px] rounded-md border border-[#e9e9e9] bg-white px-[17px] pb-[56px] pt-[25px] shadow-[0_2px_3px_rgba(0,0,0,0.22)]"
        >
          <div className="flex items-start gap-[13px]">
            <span className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-full border border-[#f05d4c] text-[17px] text-[#f05d4c]">
              1
            </span>
            <div className="pt-[1px]">
              <h2 className="text-[17px] font-semibold leading-[20px]">
                Dados Básicos
              </h2>
              <p className="mt-[2px] text-[13px] leading-[15px] text-[#5e5e5e]">
                Informações pessoais e de contato
              </p>
            </div>
          </div>

          <div className="mt-[29px] grid grid-cols-1 gap-x-[15px] gap-y-[22px] min-[560px]:grid-cols-[1fr_1fr_1.15fr]">
            {fields.map(({ id, label, placeholder, type = "text" }) => (
              <div key={id}>
                <label htmlFor={`investor-${id}`} className={labelClass}>
                  {label}
                </label>
                <input
                  id={`investor-${id}`}
                  name={id}
                  type={type}
                  placeholder={placeholder}
                  value={values[id]}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setValues((current) => ({ ...current, [id]: value }));
                  }}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </form>

        <div className="mt-[36px] flex justify-end">
          <button
            type="submit"
            form="investor-step-one"
            className="h-[39px] w-full max-w-[270px] rounded-lg bg-[#ef5d4d] text-[18px] font-semibold text-white transition hover:bg-[#dc4e3e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef5d4d]"
          >
            Próximo
          </button>
        </div>
      </div>
    </main>
  );
}
