import { useState } from "react";
import type { ChangeEvent, FocusEvent, FormEvent } from "react";

import {
  FiArrowUpRight,
  FiBarChart2,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiMessageCircle,
} from "react-icons/fi";

type LoginValues = {
  email: string;
  password: string;
};

type FieldName = keyof LoginValues;

type LoginErrors = Partial<Record<FieldName, string>>;

type AdmPageProps = {
  onLogin?: (credentials: LoginValues) => void | Promise<void>;
  signupHref?: string;
  notice?: string;
};

const benefits = [
  {
    icon: FiArrowUpRight,
    title: "Matches Inteligentes",
    description: "Encontre investidores alinhados ao seu momento.",
  },
  {
    icon: FiMessageCircle,
    title: "Conexões estratégicas",
    description: "Inicie conversas e agende reuniões com facilidade.",
  },
  {
    icon: FiBarChart2,
    title: "Crescimento sustentável",
    description: "Receba feedbacks e impulsione sua jornada.",
  },
];

function isFieldName(name: string): name is FieldName {
  return name === "email" || name === "password";
}

function validateField(name: FieldName, value: string): string {
  if (name === "email") {
    if (!value.trim()) {
      return "Informe seu e-mail.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return "Informe um e-mail válido, como nome@empresa.com.";
    }
  }

  if (name === "password" && !value) {
    return "Informe sua senha.";
  }

  return "";
}

export default function ILogin({
  onLogin,
  signupHref = "/investors/register",
  notice,
}: AdmPageProps = {}) {
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.currentTarget;

    if (!isFieldName(name)) return;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    setSubmitError("");

    setErrors((current) => ({
      ...current,
      [name]: current[name] ? validateField(name, value) : "",
    }));
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>): void {
    const { name, value } = event.currentTarget;

    if (!isFieldName(name)) return;

    setErrors((current) => ({
      ...current,
      [name]: validateField(name, value),
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isSubmitting) return;

    const form = event.currentTarget;

    setSubmitError("");

    const nextErrors: LoginErrors = {
      email: validateField("email", values.email),
      password: validateField("password", values.password),
    };

    setErrors(nextErrors);

    const fields: FieldName[] = ["email", "password"];
    const firstInvalidField = fields.find((name) => nextErrors[name]);

    if (firstInvalidField) {
      const input = form.elements.namedItem(firstInvalidField);

      if (input instanceof HTMLInputElement) {
        input.focus();
      }

      return;
    }

    if (!onLogin) {
      setSubmitError("O serviço de autenticação ainda não foi conectado.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onLogin({
        email: values.email.trim(),
        password: values.password,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Não foi possível entrar. Verifique seus dados e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputWrapper = (hasError: boolean): string =>
    [
      "flex items-center gap-3 rounded-lg border bg-white px-3",
      "transition focus-within:ring-2",
      hasError
        ? "border-red-500 focus-within:ring-red-100"
        : "border-[#D8D8D8] focus-within:border-[#EF5948] focus-within:ring-[#EF5948]/15",
    ].join(" ");

  return (
    <main
      className="min-h-screen bg-white text-[#151515] flex items-center justify-center "
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 sm:px-10 lg:px-14">
        <div className="grid items-center gap-12 py-12 md:grid-cols-2 md:gap-14 lg:gap-24 lg:py-16">
          <section className="max-w-md">
            <p className="mb-4 text-sm font-medium text-[#EF5948]">
              Para Investidores
            </p>

            <h1 className="text-3xl font-semibold leading-[1.45] tracking-tight lg:text-[34px]">
              Conecte-se a startups que moldam o {""}
              <span className="text-[#EF5948]">futuro.</span>
            </h1>

            <p className="mt-4 text-base leading-relaxed text-[#626262]">
              A plataforma que aproxima ideias inovadoras de startups alinhados
              com a sua visão.
            </p>

            <ul className="mt-9 space-y-7">
              {benefits.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#FAF7F5] text-[#EF5948] shadow-[0_3px_4px_rgba(0,0,0,0.2)]">
                    <Icon size={23} aria-hidden="true" />
                  </span>

                  <div>
                    <h2 className="text-sm font-medium">{title}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-[#626262]">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="login-title"
            className="w-full max-w-md justify-self-center rounded-2xl border border-[#EAEAEA] bg-white px-6 py-10 shadow-[0_3px_4px_rgba(0,0,0,0.3)] sm:px-8 lg:py-12"
          >
            <header className="text-center">
              <h2
                id="login-title"
                className="text-xl font-semibold tracking-tight"
              >
                Login para Investidores
              </h2>
              <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-[#777777]">
                Acesse sua conta para continuar se conectando a grandes ideias.
              </p>
            </header>

            <form
              onSubmit={handleSubmit}
              noValidate
              aria-busy={isSubmitting}
              className="mt-8"
            >
              <div>
                <label
                  htmlFor="startup-email"
                  className="mb-2 block text-xs font-medium"
                >
                  Email
                </label>

                <div className={inputWrapper(Boolean(errors.email))}>
                  <FiMail
                    className="shrink-0 text-[#858585]"
                    aria-hidden="true"
                  />
                  <input
                    id="startup-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="seu@gmail.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    readOnly={isSubmitting}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? "startup-email-error" : undefined
                    }
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#909090]"
                  />
                </div>

                {errors.email && (
                  <p
                    id="startup-email-error"
                    className="mt-2 text-xs text-red-600"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="mt-5">
                <label
                  htmlFor="startup-password"
                  className="mb-2 block text-xs font-medium"
                >
                  Senha
                </label>

                <div className={inputWrapper(Boolean(errors.password))}>
                  <FiLock
                    className="shrink-0 text-[#858585]"
                    aria-hidden="true"
                  />
                  <input
                    id="startup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    readOnly={isSubmitting}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? "startup-password-error" : undefined
                    }
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#909090]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    aria-controls="startup-password"
                    aria-pressed={showPassword}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-[#858585] transition hover:text-[#EF5948] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EF5948]"
                  >
                    {showPassword ? (
                      <FiEyeOff aria-hidden="true" />
                    ) : (
                      <FiEye aria-hidden="true" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p
                    id="startup-password-error"
                    className="mt-2 text-xs text-red-600"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {notice && !submitError && (
                <p
                  role="status"
                  className="mt-5 rounded-lg bg-green-50 px-3 py-2 text-xs leading-relaxed text-green-800"
                >
                  {notice}
                </p>
              )}

              {submitError && (
                <p
                  role="alert"
                  className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700"
                >
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 flex min-h-11 w-full items-center justify-center gap-2 rounded bg-[#EF5948] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#DA4939] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948] disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                  />
                )}
                {isSubmitting ? "Entrando..." : "Entrar"}
              </button>

              <p className="mt-6 text-center text-xs leading-relaxed text-[#777777]">
                Ainda não tem uma conta?{" "}
                <a
                  href={signupHref}
                  className="font-medium text-[#EF5948] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EF5948]"
                >
                  Cadastrar-se aqui
                </a>
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
