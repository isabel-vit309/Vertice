// Seleção múltipla digitável: o usuário digita para filtrar, escolhe vários itens da lista
// e remove pelas etiquetas. Teclado: ↑ ↓ Enter Esc, e Backspace no campo vazio remove o último.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { FiX } from "react-icons/fi";

import type { Option } from "../data/options";
import { normalize } from "../utils/forms";

type MultiComboboxProps = {
  id?: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  /** Classes do campo de texto (mantém o visual de cada tela). */
  className?: string;
  "aria-label"?: string;
};

export default function MultiCombobox({
  id,
  values,
  onChange,
  options,
  placeholder,
  required = false,
  className = "",
  "aria-label": ariaLabel,
}: MultiComboboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    inputRef.current?.setCustomValidity(
      required && values.length === 0 ? "Selecione pelo menos uma opção da lista." : "",
    );
  }, [required, values.length]);

  const available = useMemo(() => {
    const term = normalize(query);
    return options.filter(
      (option) => !values.includes(option.value) && (!term || normalize(option.label).includes(term)),
    );
  }, [options, query, values]);

  const labelOf = (value: string) => options.find((option) => option.value === value)?.label ?? value;

  function add(option: Option) {
    onChange([...values, option.value]);
    setQuery("");
    setActive(0);
  }

  function remove(value: string) {
    onChange(values.filter((item) => item !== value));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, available.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && open && available[active]) {
      event.preventDefault();
      add(available[active]);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      setQuery("");
    } else if (event.key === "Backspace" && !query && values.length > 0) {
      remove(values[values.length - 1]);
    }
  }

  return (
    <div className="relative">
      {values.length > 0 && (
        <ul className="mb-1 flex flex-wrap gap-1" aria-label="Opções selecionadas">
          {values.map((value) => (
            <li
              key={value}
              className="flex items-center gap-1 rounded-full bg-[#FFF1EE] py-0.5 pl-2 pr-1 text-[10px] text-[#EF5948]"
            >
              {labelOf(value)}
              <button
                type="button"
                onClick={() => remove(value)}
                aria-label={`Remover ${labelOf(value)}`}
                className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-[#EF5948] hover:text-white"
              >
                <FiX size={10} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && available[active] ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder={values.length > 0 ? "Adicionar outro..." : placeholder}
        value={query}
        onFocus={() => {
          setOpen(true);
          setActive(0);
        }}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
          setOpen(true);
          setActive(0);
        }}
        onBlur={() => {
          setOpen(false);
          setQuery("");
        }}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[#d5d5d5] bg-white py-1 text-xs shadow-lg"
        >
          {available.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={false}
              onMouseDown={(event) => {
                event.preventDefault(); // mantém o foco para escolher vários em sequência
                add(option);
              }}
              onMouseEnter={() => setActive(index)}
              className={`cursor-pointer px-3 py-1.5 ${
                index === active ? "bg-[#FFF1EE] text-[#EF5948]" : "text-[#333333]"
              }`}
            >
              {option.label}
            </li>
          ))}
          {available.length === 0 && (
            <li className="px-3 py-1.5 text-[#888888]">
              {query ? "Nenhuma opção encontrada" : "Todas as opções já foram selecionadas"}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
