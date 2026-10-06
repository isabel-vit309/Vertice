import { useState } from "react";
import type { FormEvent } from "react";

import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiLayers,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import SSidebar from "../../components/SSidebar";

type CadastroStartupProps = {
  onSubmit?: (data: FormData) => void | Promise<void>;
  onBack?: () => void;
};

const inputClass =
  "block w-full rounded-md border border-[#DCDCDC] bg-white px-3 py-2 text-xs text-[#303030] outline-none transition placeholder:text-[#999999] focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/10";

const labelClass = "mb-1.5 block text-xs font-medium text-[#303030]";

const cardClass =
  "rounded-lg border border-[#ECECEC] bg-white p-5 shadow-[0_2px_3px_rgba(0,0,0,0.14)] sm:p-7";

function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#EF5948] text-xs font-medium text-[#EF5948]">
        {number}
      </span>

      <div>
        <h2 className="text-sm font-semibold text-[#303030]">{title}</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-[#8A8A8A]">
          {description}
        </p>
      </div>
    </div>
  );
}

function SelectField({
  id,
  label,
  placeholder,
  options,
}: {
  id: string;
  label: string;
  placeholder: string;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          name={id}
          defaultValue=""
          required
          className={`${inputClass} appearance-none pr-9`}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <FiChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#888888]"
        />
      </div>
    </div>
  );
}

function FileUpload({
  id,
  label,
  file,
  onChange,
}: {
  id: string;
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type="file"
          accept=".pdf,.ppt,.pptx"
          onChange={(event) => onChange(event.currentTarget.files?.[0] ?? null)}
          className="peer sr-only"
        />

        <label
          htmlFor={id}
          className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-[#E5E5E5] px-5 py-6 text-center transition hover:border-[#EF5948] hover:bg-[#FFF9F7] peer-focus-visible:ring-2 peer-focus-visible:ring-[#EF5948]"
        >
          <FiUploadCloud
            size={30}
            className="text-[#747474]"
            aria-hidden="true"
          />

          <span className="max-w-full break-all text-[11px] text-[#777777]">
            {file ? file.name : "PDF, PPT, PPTX"}
          </span>
        </label>

        {file && (
          <button
            type="button"
            aria-label={`Remover arquivo de ${label}`}
            onClick={() => {
              onChange(null);

              const input = document.getElementById(id);

              if (input instanceof HTMLInputElement) {
                input.value = "";
              }
            }}
            className="absolute right-2 top-2 rounded p-1 text-[#888888] hover:bg-red-50 hover:text-[#EF5948]"
          >
            <FiX size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function CompletRegister({
  onSubmit,
  onBack,
}: CadastroStartupProps = {}) {
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);
  const [businessCanvas, setBusinessCanvas] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setSubmitError("");
    setSuccess(false);

    const data = new FormData(event.currentTarget);

    if (!onSubmit) {
      setSubmitError("O serviço de cadastro ainda não foi conectado.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(data);
      setSuccess(true);
    } catch {
      setSubmitError("Não foi possível cadastrar o perfil. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#F5F7F8] text-[#303030]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <SSidebar />

      <header className="flex items-center gap-2 border-b border-[#EAEAEA] bg-white px-5 py-4 md:hidden">
        <FiLayers size={22} className="text-[#EF5948]" />
        <span className="text-xs font-semibold tracking-[0.2em]">VÉRTICE</span>
      </header>

      <main className="">
        <div className="mx-auto max-w-5xl px-4 py-7 ">
          <header className="mb-7">
            <h1 className="text-xl font-semibold tracking-tight">
              Cadastro da Startup
            </h1>

            <p className="mt-1.5 text-xs leading-relaxed text-[#777777]">
              Complete as informações da sua startup para encontrar investidores
              e mentores compatíveis.
            </p>
          </header>

          <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
            <fieldset disabled={isSubmitting} className="min-w-0 space-y-7">
              <section className={cardClass}>
                <SectionHeader
                  number="1"
                  title="Dados básicos"
                  description="Informações fundamentais e de contato da sua startup"
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label htmlFor="nomeStartup" className={labelClass}>
                      Nome da Startup
                    </label>
                    <input
                      id="nomeStartup"
                      name="nomeStartup"
                      placeholder="Informe o nome da Startup"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="cnpj" className={labelClass}>
                      CNPJ
                    </label>
                    <input
                      id="cnpj"
                      name="cnpj"
                      placeholder="Informe o CNPJ"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="site" className={labelClass}>
                      Site
                    </label>
                    <input
                      id="site"
                      name="site"
                      type="url"
                      placeholder="https://suastartup.com.br"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="cidade" className={labelClass}>
                      Cidade
                    </label>
                    <input
                      id="cidade"
                      name="cidade"
                      placeholder="Ex.: Recife"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="estado" className={labelClass}>
                      Estado
                    </label>
                    <input
                      id="estado"
                      name="estado"
                      placeholder="Ex.: Pernambuco"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="anoFundacao" className={labelClass}>
                      Ano de Fundação
                    </label>
                    <input
                      id="anoFundacao"
                      name="anoFundacao"
                      type="number"
                      min={1900}
                      max={new Date().getFullYear()}
                      placeholder="Ex.: 2025"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="responsavel" className={labelClass}>
                      Responsável pelo perfil
                    </label>
                    <input
                      id="responsavel"
                      name="responsavel"
                      autoComplete="name"
                      placeholder="Informe o nome completo do responsável pelo perfil"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      E-mail corporativo
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Ex.: contato@empresa.com.br"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section className={cardClass}>
                <SectionHeader
                  number="2"
                  title="Perfil e necessidades"
                  description="Conte mais sobre sua solução, seu estágio atual e o que está buscando"
                />

                <div className="grid gap-4 lg:grid-cols-3">
                  <SelectField
                    id="segmento"
                    label="Segmento"
                    placeholder="Selecione o segmento de atuação"
                    options={[
                      "Tecnologia",
                      "Educação",
                      "Saúde",
                      "Finanças",
                      "Recursos Humanos",
                      "Agronegócio",
                      "Varejo",
                      "Sustentabilidade",
                      "Outros",
                    ]}
                  />

                  <SelectField
                    id="estagio"
                    label="Estágio da startup"
                    placeholder="Selecione o estágio do seu negócio"
                    options={[
                      "Ideação",
                      "Validação",
                      "MVP",
                      "Tração",
                      "Crescimento",
                      "Escala",
                    ]}
                  />

                  <div>
                    <span className={labelClass}>Ticket médio buscado</span>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        name="ticketMinimo"
                        type="number"
                        min={0}
                        step="0.01"
                        aria-label="Ticket mínimo buscado em reais"
                        placeholder="Valor mínimo"
                        className={inputClass}
                      />
                      <input
                        name="ticketMaximo"
                        type="number"
                        min={0}
                        step="0.01"
                        aria-label="Ticket máximo buscado em reais"
                        placeholder="Valor máximo"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="resumo" className={labelClass}>
                      Resumo da startup
                    </label>
                    <textarea
                      id="resumo"
                      name="resumo"
                      placeholder="Dê um breve resumo da sua startup"
                      required
                      rows={7}
                      className={`${inputClass} resize-y`}
                    />
                  </div>

                  <div>
                    <label htmlFor="problema" className={labelClass}>
                      Problema que resolve
                    </label>
                    <textarea
                      id="problema"
                      name="problema"
                      placeholder="Informe brevemente o problema que sua solução resolve"
                      required
                      rows={7}
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="diferenciais" className={labelClass}>
                    Diferenciais competitivos
                  </label>
                  <textarea
                    id="diferenciais"
                    name="diferenciais"
                    placeholder="O que torna sua startup diferente e competitiva no mercado?"
                    rows={3}
                    className={`${inputClass} resize-y`}
                  />
                </div>
              </section>

              <section className={cardClass}>
                <SectionHeader
                  number="3"
                  title="Pitch e modelo de negócio"
                  description="Envie seus materiais e links para apresentar sua solução e modelo de negócio"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <FileUpload
                    id="pitchDeck"
                    label="Pitch deck"
                    file={pitchDeck}
                    onChange={setPitchDeck}
                  />

                  <FileUpload
                    id="businessCanvas"
                    label="Business Model Canvas"
                    file={businessCanvas}
                    onChange={setBusinessCanvas}
                  />
                </div>

                <div className="mt-5">
                  <label htmlFor="video" className={labelClass}>
                    Vídeo de apresentação (URL)
                  </label>
                  <input
                    id="video"
                    name="video"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={inputClass}
                  />
                </div>
              </section>

              <section className={cardClass}>
                <SectionHeader
                  number="4"
                  title="Consentimento e privacidade"
                  description="Suas escolhas sobre participação e utilização dos dados"
                />

                <div className="space-y-4">
                  <label className="flex items-start gap-3 text-xs leading-relaxed">
                    <input
                      name="aceitaTermos"
                      type="checkbox"
                      required
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#EF5948]"
                    />

                    <span>
                      Li e aceito os{" "}
                      <a
                        href="/termos-de-uso"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#EF5948] underline underline-offset-2"
                      >
                        Termos de Uso
                      </a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-xs leading-relaxed">
                    <input
                      name="cientePrivacidade"
                      type="checkbox"
                      required
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#EF5948]"
                    />

                    <span>
                      Li e concordo com a{" "}
                      <a
                        href="/politica-de-privacidade"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#EF5948] underline underline-offset-2"
                      >
                        Política de Privacidade
                      </a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-xs leading-relaxed">
                    <input
                      name="autorizaTratamento"
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#EF5948]"
                    />

                    <span>
                      Autorizo o tratamento dos dados conforme a LGPD para fins
                      de conexões com investidores e mentores
                    </span>
                  </label>
                </div>
              </section>
            </fieldset>

            {submitError && (
              <p
                role="alert"
                className="mt-5 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700"
              >
                {submitError}
              </p>
            )}

            {success && (
              <p
                role="status"
                className="mt-5 flex items-center gap-2 rounded-md border border-green-100 bg-green-50 px-4 py-3 text-xs text-green-700"
              >
                <FiCheck size={16} aria-hidden="true" />
                Perfil cadastrado com sucesso!
              </p>
            )}

            <footer className="mt-8 flex items-center justify-between gap-4 pb-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (onBack) {
                    onBack();
                  } else {
                    window.history.back();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-md px-1 py-2 text-xs text-[#686868] transition hover:text-[#EF5948] disabled:opacity-50"
              >
                <FiArrowLeft size={15} aria-hidden="true" />
                Voltar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-10 w-52 items-center justify-center gap-2 rounded-md bg-[#EF5948] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#DA4939] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948] disabled:cursor-wait disabled:opacity-60 sm:w-72"
              >
                {isSubmitting && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                )}

                {isSubmitting ? "Cadastrando..." : "Cadastrar Perfil"}
              </button>
            </footer>
          </form>
        </div>
      </main>
    </div>
  );
}
