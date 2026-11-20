// Regressão: máscaras e validações dos cadastros (regras pedidas nas correções iniciais).
import { describe, expect, it } from "vitest";

import {
  isValidCnpj,
  isValidCpf,
  maskCnpj,
  maskCpf,
  maskCurrency,
  normalize,
  parseCurrency,
  passwordError,
} from "../utils/forms";

describe("senha", () => {
  it("exige 8 caracteres, número e caractere especial", () => {
    expect(passwordError("")).toBe("Informe sua senha.");
    expect(passwordError("Abc@12")).not.toBe("");
    expect(passwordError("Abcdefgh")).not.toBe("");
    expect(passwordError("Abcdefg1")).not.toBe("");
    expect(passwordError("Abcdef@g")).not.toBe("");
    expect(passwordError("Senha@123")).toBe("");
  });
});

describe("CPF e CNPJ", () => {
  it("aplica as máscaras e corta excesso de dígitos", () => {
    expect(maskCpf("12345678909")).toBe("123.456.789-09");
    expect(maskCpf("123456789091234")).toBe("123.456.789-09");
    expect(maskCnpj("15881399000134")).toBe("15.881.399/0001-34");
    expect(maskCnpj("1588")).toBe("15.88");
  });

  it("valida dígitos verificadores e rejeita sequências repetidas", () => {
    expect(isValidCpf("123.456.789-09")).toBe(true);
    expect(isValidCpf("123.456.789-00")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCnpj("15.881.399/0001-34")).toBe(true);
    expect(isValidCnpj("15.881.399/0001-35")).toBe(false);
    expect(isValidCnpj("00.000.000/0000-00")).toBe(false);
  });
});

describe("valores em reais", () => {
  it("máscara e leitura são inversas", () => {
    const masked = maskCurrency("150000");
    expect(masked.replace(/\s/g, " ")).toBe("R$ 1.500,00");
    expect(parseCurrency(masked)).toBe(1500);
    expect(maskCurrency("")).toBe("");
    expect(parseCurrency("")).toBeNull();
  });
});

it("normaliza textos para busca sem acento e sem caixa", () => {
  expect(normalize("  Ideação ")).toBe("ideacao");
});
