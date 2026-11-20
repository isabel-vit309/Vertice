// Converte o rascunho do cadastro (valores das telas) no corpo esperado pelo backend.
import { normalizeTicket } from "../services/api";

/* --------------------------------------------------- Montagem do payload */

export function buildPayload(draft: Record<string, unknown>): Record<string, unknown> {
  // corporateEmail é alias de email no backend: enviar os dois pode gerar
  // valores divergentes. A conta usa o e-mail da tela inicial.
  // documentType só controla a tela (CPF ou CNPJ); arquivos vão no multipart.
  const {
    corporateEmail: _ignored,
    documentType: _d,
    pitchDeck: _p,
    businessModelCanvas: _c,
    photo: _photo,
    ...rest
  } = draft;
  void _photo;
  void _ignored;
  void _d;
  void _p;
  void _c;

  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    payload[key] = typeof value === "string" ? value.trim() : value;
  }
  // Tickets digitados com máscara ("R$ 1.500,00") viram decimal simples.
  for (const key of ["minimumTicket", "maximumTicket"]) {
    if (typeof payload[key] === "string") payload[key] = normalizeTicket(payload[key] as string);
  }
  // CPF/CNPJ seguem só com dígitos.
  for (const key of ["cpf", "cnpj"]) {
    if (typeof payload[key] === "string") payload[key] = (payload[key] as string).replace(/\D/g, "");
  }
  return payload;
}
