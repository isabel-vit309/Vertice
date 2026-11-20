// Faixa de ticket com máscara monetária (R$) e validação mínimo ≤ máximo.
import { useEffect, useRef } from "react";

import { maskCurrency, parseCurrency } from "../utils/forms";

type Props = {
  idPrefix: string;
  label: string;
  minimum: string;
  maximum: string;
  onChange: (values: { minimum: string; maximum: string }) => void;
  labelClass: string;
  inputClass: string;
  required?: boolean;
};

export function ticketRangeError(minimum: string, maximum: string): string {
  const min = parseCurrency(minimum);
  const max = parseCurrency(maximum);
  return min !== null && max !== null && min > max
    ? "O valor mínimo não pode ser maior que o máximo."
    : "";
}

export default function TicketRangeFields({
  idPrefix,
  label,
  minimum,
  maximum,
  onChange,
  labelClass,
  inputClass,
  required = true,
}: Props) {
  const maxRef = useRef<HTMLInputElement>(null);
  const error = ticketRangeError(minimum, maximum);

  // Bloqueia o envio nativo do formulário enquanto a faixa for inválida.
  useEffect(() => {
    maxRef.current?.setCustomValidity(error);
  }, [error]);

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="grid grid-cols-2 gap-1">
        <input
          id={`${idPrefix}-minimum-ticket`}
          aria-label={`${label} — mínimo`}
          type="text"
          inputMode="numeric"
          required={required}
          placeholder="R$ mínimo"
          value={minimum}
          onChange={(event) => {
            const value = maskCurrency(event.currentTarget.value);
            onChange({ minimum: value, maximum });
          }}
          className={inputClass}
        />
        <input
          ref={maxRef}
          id={`${idPrefix}-maximum-ticket`}
          aria-label={`${label} — máximo`}
          type="text"
          inputMode="numeric"
          required={required}
          placeholder="R$ máximo"
          value={maximum}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            const value = maskCurrency(event.currentTarget.value);
            onChange({ minimum, maximum: value });
          }}
          className={inputClass}
        />
      </div>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
