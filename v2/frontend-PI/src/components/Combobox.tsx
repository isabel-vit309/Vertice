// Select digitável: o usuário pode digitar para filtrar as opções (sem acento/caixa)
// e escolher com mouse ou teclado (↑ ↓ Enter Esc). Só aceita valores da lista.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { FiChevronDown } from "react-icons/fi";

import type { Option } from "../data/options";
import { normalize } from "../utils/forms";

const MAX_VISIBLE = 80;

type ComboboxProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** Classes do campo (mantém o visual de cada tela). */
  className?: string;
  "aria-label"?: string;
  emptyText?: string;
};

export default function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
  emptyText = "Nenhuma opção encontrada",
}: ComboboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-list`;
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);
  const [query, setQuery] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  // Mantém o texto sincronizado quando o valor muda por fora (ex.: troca de UF limpa a cidade).
  useEffect(() => {
    if (!open) setQuery(selected?.label ?? "");
  }, [selected?.label, open]);

  // O campo mostra o rótulo, então a validação nativa usa o valor real.
  useEffect(() => {
    inputRef.current?.setCustomValidity(
      required && !value ? "Selecione uma opção da lista." : "",
    );
  }, [required, value]);

  const filtered = useMemo(() => {
    const term = normalize(query);
    if (!open || !term || term === normalize(selected?.label ?? "")) return options;
    return options.filter((option) => normalize(option.label).includes(term));
  }, [open, options, query, selected?.label]);

  function choose(option: Option) {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  }

  function commitTyped() {
    const term = normalize(query);
    if (!term) {
      if (value) onChange("");
      setQuery("");
      return;
    }
    const exact = options.find(
      (option) => normalize(option.label) === term || normalize(option.value) === term,
    );
    if (exact) choose(exact);
    else if (filtered.length === 1) choose(filtered[0]);
    else setQuery(selected?.label ?? "");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActive((index) => Math.min(index + 1, Math.min(filtered.length, MAX_VISIBLE) - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      const option = filtered[active];
      if (option) choose(option);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      setQuery(selected?.label ?? "");
    }
  }

  const visible = filtered.slice(0, MAX_VISIBLE);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && visible[active] ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        value={query}
        onFocus={() => {
          setOpen(true);
          setActive(0);
        }}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          const next = event.currentTarget.value;
          setQuery(next);
          setOpen(true);
          setActive(0);
        }}
        onBlur={() => {
          commitTyped();
          setOpen(false);
        }}
        onKeyDown={handleKeyDown}
        className={`${className} pr-7 disabled:cursor-not-allowed disabled:bg-[#f3f3f3]`}
      />
      <FiChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#666666]"
      />

      {open && !disabled && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[#d5d5d5] bg-white py-1 text-xs shadow-lg"
        >
          {visible.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              onMouseDown={(event) => {
                event.preventDefault(); // evita o blur antes do clique
                choose(option);
              }}
              onMouseEnter={() => setActive(index)}
              className={`cursor-pointer px-3 py-1.5 ${
                index === active ? "bg-[#FFF1EE] text-[#EF5948]" : "text-[#333333]"
              } ${option.value === value ? "font-semibold" : ""}`}
            >
              {option.label}
            </li>
          ))}
          {filtered.length > MAX_VISIBLE && (
            <li className="px-3 py-1.5 text-[#888888]">
              Continue digitando para refinar ({filtered.length} opções)
            </li>
          )}
          {filtered.length === 0 && (
            <li className="px-3 py-1.5 text-[#888888]">{emptyText}</li>
          )}
        </ul>
      )}
    </div>
  );
}
