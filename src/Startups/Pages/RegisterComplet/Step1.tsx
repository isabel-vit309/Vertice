import { useState } from "react";
import type { FormEvent } from "react";
import SSidebar from "../../../components/SSidebar";

export type StartupStep1Values = {
  name: string;
  cnpj: string;
  website: string;
  city: string;
  state: string;
  foundedYear: string;
  profileOwner: string;
  corporateEmail: string;
};

type Step1Props = {
  onNext?: (values: StartupStep1Values) => void | Promise<void>;
};

const initialValues: StartupStep1Values = {
  name: "",
  cnpj: "",
  website: "",
  city: "",
  state: "",
  foundedYear: "",
  profileOwner: "",
  corporateEmail: "",
};

const fields: Array<{
  id: keyof StartupStep1Values;
  label: string;
  placeholder: string;
  type?: string;
}> = [
  {
    id: "name",
    label: "Nome da Startup",
    placeholder: "Informe o nome da Startup",
  },
  {
    id: "cnpj",
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    type: "text",
  },
  {
    id: "website",
    label: "Site",
    placeholder: "https://exemplo.com.br",
    type: "url",
  },
  { id: "city", label: "Cidade", placeholder: "Ex: Recife" },
  { id: "state", label: "Estado", placeholder: "Ex: Pernambuco" },
  {
    id: "foundedYear",
    label: "Ano de Fundação",
    placeholder: "Ex: 2025",
    type: "text",
  },
];

function ProgressSteps() {
  return (
    <nav aria-label="Etapas do cadastro" className="flex items-center">
      {[1, 2, 3, 4].map((step, index) => (
        <div key={step} className="flex min-w-0 flex-1 items-center">
          <span
            className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border text-[13px] ${
              step === 1
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

export default function Step1({ onNext }: Step1Props = {}) {
  const [values, setValues] = useState<StartupStep1Values>(initialValues);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
          id="startup-step-one"
          onSubmit={handleSubmit}
          className="mt-[35px] rounded-lg border border-[#e9e9e9] bg-white px-[25px] pb-[38px] pt-[28px] shadow-[0_2px_3px_rgba(0,0,0,0.22)]"
        >
          <div className="flex items-start gap-[15px]">
            <span className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-full border border-[#f05d4c] text-[17px] text-[#f05d4c]">
              1
            </span>
            <div className="pt-[2px]">
              <h2 className="text-[17px] font-semibold leading-[20px]">
                Dados Básicos
              </h2>
              <p className="mt-[2px] text-[13px] leading-[15px] text-[#5e5e5e]">
                Informações institucionais e de contato da sua startup
              </p>
            </div>
          </div>

          <div className="mt-[26px] grid gap-x-[23px] gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map(({ id, label, placeholder, type = "text" }) => (
              <div key={id}>
                <label
                  htmlFor={`startup-${id}`}
                  className="mb-[5px] block pl-1 text-[13px] font-medium leading-[15px]"
                >
                  {label}
                </label>
                <input
                  id={`startup-${id}`}
                  name={id}
                  type={type}
                  placeholder={placeholder}
                  value={values[id]}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [id]: event.currentTarget.value,
                    }))
                  }
                  className="h-[29px] w-full rounded-lg border border-[#d5d5d5] bg-white px-2 text-[10px] text-[#333333] outline-none transition placeholder:text-[#777777] focus:border-[#f05d4c] focus:ring-2 focus:ring-[#f05d4c]/15"
                />
              </div>
            ))}
          </div>

          <div className="mt-[27px] grid gap-x-6 gap-y-7 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startup-profile-owner"
                className="mb-[5px] block pl-1 text-[13px] font-medium leading-[15px]"
              >
                Responsável pelo perfil
              </label>
              <input
                id="startup-profile-owner"
                name="profileOwner"
                type="text"
                placeholder="Informe o nome completo do responsável pelo perfil"
                value={values.profileOwner}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    profileOwner: event.currentTarget.value,
                  }))
                }
                className="h-[29px] w-full rounded-lg border border-[#d5d5d5] bg-white px-2 text-[10px] text-[#333333] outline-none transition placeholder:text-[#777777] focus:border-[#f05d4c] focus:ring-2 focus:ring-[#f05d4c]/15"
              />
            </div>

            <div>
              <label
                htmlFor="startup-corporate-email"
                className="mb-[5px] block pl-1 text-[13px] font-medium leading-[15px]"
              >
                E-mail corporativo
              </label>
              <input
                id="startup-corporate-email"
                name="corporateEmail"
                type="email"
                placeholder="Ex: startup12@gmail.com.br"
                value={values.corporateEmail}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    corporateEmail: event.currentTarget.value,
                  }))
                }
                className="h-[29px] w-full rounded-lg border border-[#d5d5d5] bg-white px-2 text-[10px] text-[#333333] outline-none transition placeholder:text-[#777777] focus:border-[#f05d4c] focus:ring-2 focus:ring-[#f05d4c]/15"
              />
            </div>
          </div>
        </form>

        <div className="mt-[50px] flex justify-end">
          <button
            type="submit"
            form="startup-step-one"
            className="h-[39px] w-full max-w-[270px] rounded-lg bg-[#ef5d4d] text-[18px] font-semibold text-white transition hover:bg-[#dc4e3e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef5d4d]"
          >
            Próximo
          </button>
        </div>
      </div>
    </main>
  );
}
