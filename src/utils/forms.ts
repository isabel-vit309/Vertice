// Máscaras e validações dos formulários de cadastro.

export const onlyDigits = (value: string): string => value.replace(/\D/g, "");

export function maskCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function maskCnpj(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function allSameDigits(d: string): boolean {
  return /^(\d)\1+$/.test(d);
}

/** Valida dígitos verificadores do CPF. */
export function isValidCpf(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11 || allSameDigits(d)) return false;
  const check = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}

/** Valida dígitos verificadores do CNPJ. */
export function isValidCnpj(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 14 || allSameDigits(d)) return false;
  const check = (len: number) => {
    const weights = len === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(d[i]) * w, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return check(12) === Number(d[12]) && check(13) === Number(d[13]);
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Máscara monetária: digitar "150000" resulta em "R$ 1.500,00". */
export function maskCurrency(value: string): string {
  const d = onlyDigits(value).replace(/^0+/, "").slice(0, 13);
  if (!d) return "";
  return currency.format(Number(d) / 100);
}

/** "R$ 1.500,00" → 1500 (ou null se vazio). */
export function parseCurrency(value: string): number | null {
  const d = onlyDigits(value);
  return d ? Number(d) / 100 : null;
}

/** Política de senha (espelha RegistrationValidation.passwordPolicy no backend). */
export function passwordError(value: string): string {
  if (!value) return "Informe sua senha.";
  if (value.length < 8 || !/\d/.test(value) || !/[^\p{L}\d\s]/u.test(value)) {
    return "A senha deve ter no mínimo 8 caracteres, incluindo número e caractere especial.";
  }
  return "";
}

/** Comparação sem acento/caixa para buscas. */
export const normalize = (value: string): string =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
