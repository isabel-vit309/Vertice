import { useState } from "react";
import type { FormEvent } from "react";
import ISidebar from "../../../components/ISidebar";
import StateCityFields from "../../../components/StateCityFields";
import { PhotoPicker } from "../../../components/ProfileUI";
import { isValidCnpj, isValidCpf, maskCnpj, maskCpf } from "../../../utils/forms";

export type DocumentType = "cpf" | "cnpj";

export type InvestorStep1Values = {
  name: string;
  documentType: DocumentType;
  cpf: string;
  cnpj: string;
  linkedin: string;
  city: string;
  state: string;
  corporateEmail: string;
  /** Foto de perfil (opcional), enviada no multipart do cadastro. */
  photo: File | null;
};

type Step1Props = {
  defaultValues?: Partial<InvestorStep1Values>;
  onNext?: (values: InvestorStep1Values) => void | Promise<void>;
};

const initialValues: InvestorStep1Values = {
  name: "",
  documentType: "cpf",
  cpf: "",
  cnpj: "",
  linkedin: "",
  city: "",
  state: "",
  corporateEmail: "",
  photo: null,
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

const labelClass = "mb-[5px] block text-[13px] font-medium leading-[15px]";
const inputClass =
  "h-[29px] w-full rounded-[8px] border border-[#d5d5d5] bg-white px-2 text-[10px] text-[#333333] outline-none transition placeholder:text-[#777777] focus:border-[#f05d4c] focus:ring-2 focus:ring-[#f05d4c]/15 read-only:bg-[#f3f3f3]";

export default function Step1({ onNext, defaultValues }: Step1Props = {}) {
  const [values, setValues] = useState<InvestorStep1Values>({ ...initialValues, ...defaultValues });
  const [documentError, setDocumentError] = useState("");

  const isCpf = values.documentType === "cpf";
  const documentValue = isCpf ? values.cpf : values.cnpj;

  function update<K extends keyof InvestorStep1Values>(key: K, value: InvestorStep1Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function validateDocument(): string {
    if (!documentValue) return isCpf ? "Informe o CPF." : "Informe o CNPJ.";
    if (isCpf ? !isValidCpf(documentValue) : !isValidCnpj(documentValue)) {
      return isCpf ? "CPF inválido." : "CNPJ inválido.";
    }
    return "";
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const error = validateDocument();
    setDocumentError(error);
    if (error) {
      document.getElementById("investor-document")?.focus();
      return;
    }
    // Só o documento escolhido segue para o cadastro.
    void onNext?.({
      ...values,
      cpf: isCpf ? values.cpf : "",
      cnpj: isCpf ? "" : values.cnpj,
    });
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
                Informações pessoais e de contato · todos os campos são obrigatórios
              </p>
            </div>
          </div>


          <div className="mt-[24px] rounded-md border border-dashed border-[#e3e3e3] bg-[#fcfcfc] p-4">
            <PhotoPicker
              file={values.photo}
              onChange={(photo) => setValues((current) => ({ ...current, photo }))}
              name={values.name}
              label="Foto de perfil (opcional)"
            />
          </div>

          <div className="mt-[29px] grid grid-cols-1 gap-x-[15px] gap-y-[22px] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.15fr]">
            <div>
              <label htmlFor="investor-name" className={labelClass}>
                Nome
              </label>
              <input
                id="investor-name"
                name="name"
                required
                placeholder="Informe o seu nome"
                value={values.name}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  update("name", value);
                }}
                className={inputClass}
              />
            </div>

            <div>
              <fieldset>
                <legend className={labelClass}>Cadastrar com</legend>
                <div className="flex h-[29px] items-center gap-4 text-[11px]">
                  {(["cpf", "cnpj"] as const).map((type) => (
                    <label key={type} className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="radio"
                        name="documentType"
                        value={type}
                        checked={values.documentType === type}
                        onChange={() => {
                          update("documentType", type);
                          setDocumentError("");
                        }}
                        className="h-[14px] w-[14px] accent-[#ef5d4d]"
                      />
                      {type === "cpf" ? "CPF (pessoa física)" : "CNPJ (pessoa jurídica)"}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div>
              <label htmlFor="investor-document" className={labelClass}>
                {isCpf ? "CPF" : "CNPJ"}
              </label>
              <input
                id="investor-document"
                name={values.documentType}
                required
                inputMode="numeric"
                placeholder={isCpf ? "000.000.000-00" : "00.000.000/0000-00"}
                value={documentValue}
                aria-invalid={Boolean(documentError)}
                aria-describedby={documentError ? "investor-document-error" : undefined}
                onChange={(event) => {
                  const raw = event.currentTarget.value;
                  update(isCpf ? "cpf" : "cnpj", isCpf ? maskCpf(raw) : maskCnpj(raw));
                  setDocumentError("");
                }}
                onBlur={() => documentValue && setDocumentError(validateDocument())}
                className={inputClass}
              />
              {documentError && (
                <p id="investor-document-error" className="mt-1 text-[11px] text-red-600">
                  {documentError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="investor-linkedin" className={labelClass}>
                LinkedIn
              </label>
              <input
                id="investor-linkedin"
                name="linkedin"
                type="url"
                required
                placeholder="https://linkedin.com/in/seu-perfil"
                value={values.linkedin}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  update("linkedin", value);
                }}
                className={inputClass}
              />
            </div>

            <StateCityFields
              idPrefix="investor"
              state={values.state}
              city={values.city}
              labelClass={labelClass}
              inputClass={inputClass}
              onChange={({ state, city }) => setValues((current) => ({ ...current, state, city }))}
            />

            <div>
              <label htmlFor="investor-corporateEmail" className={labelClass}>
                E-mail corporativo
              </label>
              <input
                id="investor-corporateEmail"
                name="corporateEmail"
                type="email"
                required
                readOnly={Boolean(defaultValues?.corporateEmail)}
                title="E-mail da conta informado na tela de cadastro"
                placeholder="Ex: nome@empresa.com.br"
                value={values.corporateEmail}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  update("corporateEmail", value);
                }}
                className={inputClass}
              />
            </div>
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
