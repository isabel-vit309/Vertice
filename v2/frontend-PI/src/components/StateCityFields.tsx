// Estado primeiro; a lista de cidades é carregada com base na UF escolhida.
import { useEffect, useState } from "react";

import Combobox from "./Combobox";
import { ESTADOS, carregarMunicipios, toOptions } from "../data/options";
import type { Option } from "../data/options";

type Props = {
  idPrefix: string;
  state: string;
  city: string;
  onChange: (values: { state: string; city: string }) => void;
  labelClass: string;
  inputClass: string;
  required?: boolean;
};

export default function StateCityFields({
  idPrefix,
  state,
  city,
  onChange,
  labelClass,
  inputClass,
  required = true,
}: Props) {
  const [cities, setCities] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!state) {
      setCities([]);
      return;
    }
    setLoading(true);
    carregarMunicipios(state)
      .then((names) => {
        if (active) setCities(toOptions(names));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [state]);

  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-state`} className={labelClass}>
          Estado
        </label>
        <Combobox
          id={`${idPrefix}-state`}
          value={state}
          options={ESTADOS}
          required={required}
          placeholder="Digite ou selecione o estado"
          className={inputClass}
          // Trocar de UF invalida a cidade escolhida.
          onChange={(next) => onChange({ state: next, city: next === state ? city : "" })}
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-city`} className={labelClass}>
          Cidade
        </label>
        <Combobox
          id={`${idPrefix}-city`}
          value={city}
          options={cities}
          required={required}
          disabled={!state || loading}
          placeholder={
            !state ? "Selecione o estado primeiro" : loading ? "Carregando cidades..." : "Digite a cidade"
          }
          className={inputClass}
          onChange={(next) => onChange({ state, city: next })}
        />
      </div>
    </>
  );
}
