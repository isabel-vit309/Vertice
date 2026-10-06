import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FiUploadCloud } from "react-icons/fi";
import SSidebar from "../../../components/SSidebar";

export type StartupStep3Values = {
  pitchDeck: File | null;
  businessModelCanvas: File | null;
  presentationVideo: string;
};

type Step3Props = {
  onBack?: () => void;
  onNext?: (values: StartupStep3Values) => void | Promise<void>;
};

const initialValues: StartupStep3Values = {
  pitchDeck: null,
  businessModelCanvas: null,
  presentationVideo: "",
};

function ProgressSteps() {
  return (
    <nav aria-label="Etapas do cadastro" className="flex items-center">
      {[1, 2, 3, 4].map((step, index) => (
        <div key={step} className="flex min-w-0 flex-1 items-center">
          <span
            className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border text-[13px] ${
              step <= 3
                ? "border-[#f05d4c] text-[#f05d4c]"
                : "border-[#7f8589] text-[#555b5f]"
            }`}
          >
            {step}
          </span>

          {index < 3 && (
            <span
              aria-hidden="true"
              className={`mx-[9px] h-px min-w-0 flex-1 ${
                step < 3 ? "bg-[#efb5ad]" : "bg-[#989da1]"
              }`}
            />
          )}
        </div>
      ))}
    </nav>
  );
}

const labelClass = "mb-[5px] block text-[13px] font-medium leading-[15px]";
const inputClass =
  "h-[29px] w-full rounded-[8px] border border-[#d3d3d3] bg-white px-2 text-[10px] text-[#333333] outline-none transition placeholder:text-[#777777] focus:border-[#f05d4c] focus:ring-2 focus:ring-[#f05d4c]/15";

function UploadField({
  id,
  label,
  file,
  onChange,
}: {
  id: string;
  label: string;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept=".pdf,.ppt,.pptx"
        onChange={onChange}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className="flex h-[110px] cursor-pointer flex-col items-center justify-center gap-[8px] rounded-[8px] border border-dashed border-[#d7d7d7] bg-white text-[#666666] transition hover:border-[#f05d4c] hover:bg-[#fffaf8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#f05d4c]"
      >
        <FiUploadCloud size={40} strokeWidth={1.8} aria-hidden="true" />
        <span className="text-[10px] leading-none">
          {file ? file.name : "PDF, PPTX, PPT"}
        </span>
      </label>
    </div>
  );
}

export default function Step3({ onBack, onNext }: Step3Props = {}) {
  const [values, setValues] = useState<StartupStep3Values>(initialValues);

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
          id="startup-step-three"
          onSubmit={handleSubmit}
          className="mt-[35px] rounded-lg border border-[#e9e9e9] bg-white px-[25px] pb-[38px] pt-[28px] shadow-[0_2px_3px_rgba(0,0,0,0.22)]"
        >
          <div className="flex items-start gap-[15px]">
            <span className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-full border border-[#f05d4c] text-[17px] text-[#f05d4c]">
              3
            </span>
            <div className="pt-[2px]">
              <h2 className="text-[17px] font-semibold leading-[20px]">
                Pitch e modelo de negócio
              </h2>
              <p className="mt-[2px] text-[13px] leading-[15px] text-[#5e5e5e]">
                Envie seus materiais e links para apresentar sua solução e modelo de negócio
              </p>
            </div>
          </div>

          <div className="mt-[26px] grid grid-cols-1 gap-x-[23px] gap-y-[24px] min-[560px]:grid-cols-[0.8fr_1fr]">
            <UploadField
              id="startup-pitch-deck"
              label="Pitch deck"
              file={values.pitchDeck}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  pitchDeck: event.currentTarget.files?.[0] ?? null,
                }))
              }
            />
            <UploadField
              id="startup-business-model-canvas"
              label="Business Model Canvas"
              file={values.businessModelCanvas}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  businessModelCanvas: event.currentTarget.files?.[0] ?? null,
                }))
              }
            />
          </div>

          <div className="mt-[39px]">
            <label htmlFor="startup-presentation-video" className={labelClass}>
              Vídeo de apresentação (URL)
            </label>
            <input
              id="startup-presentation-video"
              type="url"
              placeholder="https://www.youtube.com/watch?v=mzB1VGEgcsU&list=RDk1te3ROT3Eo&index=27"
              value={values.presentationVideo}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  presentationVideo: event.currentTarget.value,
                }))
              }
              className={inputClass}
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
            form="startup-step-three"
            className="h-[39px] w-full max-w-[270px] rounded-lg bg-[#ef5d4d] text-[18px] font-semibold text-white transition hover:bg-[#dc4e3e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef5d4d]"
          >
            Próximo
          </button>
        </div>
      </div>
    </main>
  );
}
