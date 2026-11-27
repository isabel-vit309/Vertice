// Gráfico de linhas em SVG (sem biblioteca): um eixo, linhas de 2px, marcador no último ponto,
// linha do zero quando há valores negativos, linha-guia + tooltip no mouse/teclado e legenda
// com chave de linha quando há duas séries. Os valores também ficam na tabela de histórico.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

export type ChartSeries = {
  key: string;
  label: string;
  color: string;
  values: (number | null)[];
  /** Preenche a área sob a linha com 10% da cor (só para série única). */
  area?: boolean;
};

const HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 64 };
const GRID = "#EEF0F2";
const AXIS_TEXT = "#8A8F94";

/** Marcas "redondas" para o eixo: 0, 25 mil, 50 mil... */
function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) {
    const pad = Math.abs(min) || 1;
    min -= pad;
    max += pad;
  }
  const raw = (max - min) / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.round(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

export default function LineChart({
  labels,
  series,
  format,
  axisFormat = format,
  title,
}: {
  /** Rótulos do eixo X (meses). */
  labels: string[];
  series: ChartSeries[];
  format: (value: number) => string;
  axisFormat?: (value: number) => string;
  /** Nome acessível do gráfico. */
  title: string;
}) {
  const { ref, width } = useWidth();
  const [active, setActive] = useState<number | null>(null);
  const clipId = useId();

  const values = series.flatMap((s) => s.values.filter((v): v is number => v != null));
  const ticks = useMemo(() => {
    const min = Math.min(0, ...values);
    const max = Math.max(0, ...values);
    return niceTicks(min, max);
  }, [values.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const lo = ticks[0];
  const hi = ticks[ticks.length - 1];
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const n = labels.length;
  const x = (i: number) => PAD.left + (n <= 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const y = (v: number) => PAD.top + ((hi - v) / (hi - lo || 1)) * plotH;

  // Rótulos do eixo X: cabem ~1 a cada 56px (no máximo 6), sempre o primeiro e o último.
  const fit = Math.max(2, Math.min(6, Math.floor(plotW / 56)));
  const every = Math.max(1, Math.ceil((n - 1) / (fit - 1)));
  const showLabel = (i: number) => i === n - 1 || (i % every === 0 && n - 1 - i >= every);

  function path(vals: (number | null)[]) {
    let d = "";
    let pen = false;
    vals.forEach((v, i) => {
      if (v == null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  }

  function lastIndex(vals: (number | null)[]) {
    for (let i = vals.length - 1; i >= 0; i--) if (vals[i] != null) return i;
    return -1;
  }

  function onPointer(event: PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * plotW;
    setActive(n <= 1 ? 0 : Math.max(0, Math.min(n - 1, Math.round((px / plotW) * (n - 1)))));
  }

  function onKey(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      setActive((current) => Math.max(0, Math.min(n - 1, (current ?? n - 1) + step)));
    } else if (event.key === "Escape") {
      setActive(null);
    }
  }

  // Valor no fim da linha: só quando as séries não se encostam.
  const ends = series.map((s) => {
    const i = lastIndex(s.values);
    return i < 0 ? null : { key: s.key, i, v: s.values[i] as number };
  });
  const endYs = ends.map((e) => (e ? y(e.v) : null));
  const endLabelsFit = endYs.every((a, i) => endYs.every((b, j) => i === j || a == null || b == null || Math.abs(a - b) >= 16));

  const tooltipLeft = active == null ? 0 : Math.min(Math.max(x(active) - 105, 0), width - 210);

  return (
    <div>
      {series.length > 1 && (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#666666]" aria-label="Legenda">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-[2px] w-3.5 rounded" style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      <div ref={ref} className="relative">
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={title}
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
          className="block max-w-full overflow-visible focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948]"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={PAD.left - 6} y={0} width={plotW + 12} height={HEIGHT} />
            </clipPath>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={t === 0 && lo < 0 ? "#C9CED3" : GRID} strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={10} fill={AXIS_TEXT}>
                {axisFormat(t)}
              </text>
            </g>
          ))}
          {labels.map((label, i) =>
            showLabel(i) ? (
              <text key={label} x={x(i)} y={HEIGHT - 8} textAnchor={n > 1 && i === n - 1 ? "end" : n > 1 && i === 0 ? "start" : "middle"} fontSize={10} fill={AXIS_TEXT}>
                {label}
              </text>
            ) : null,
          )}

          <g clipPath={`url(#${clipId})`}>
            {series.map((s) =>
              s.area && series.length === 1 && lastIndex(s.values) > 0 ? (
                <path
                  key={`${s.key}-area`}
                  d={`${path(s.values)}L${x(lastIndex(s.values))},${y(Math.max(lo, 0))}L${x(s.values.findIndex((v) => v != null))},${y(Math.max(lo, 0))}Z`}
                  fill={s.color}
                  opacity={0.1}
                />
              ) : null,
            )}
            {series.map((s) => (
              <path key={s.key} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            ))}
          </g>

          {active != null && (
            <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} stroke="#B8BEC4" strokeWidth={1} />
          )}

          {/* marcador no último ponto (ou no ponto em foco), com anel na cor da superfície */}
          {series.map((s, si) => {
            const i = active ?? ends[si]?.i ?? -1;
            const v = s.values[i];
            return v == null ? null : (
              <circle key={`${s.key}-dot`} cx={x(i)} cy={y(v)} r={4} fill={s.color} stroke="#FFFFFF" strokeWidth={2} />
            );
          })}

          {active == null &&
            endLabelsFit &&
            ends.map((e) =>
              e ? (
                <text key={`${e.key}-end`} x={x(e.i)} y={y(e.v) - 10} textAnchor={n > 1 ? "end" : "middle"} fontSize={10} fontWeight={600} fill="#444444" stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke">
                  {format(e.v)}
                </text>
              ) : null,
            )}

          <rect
            x={PAD.left}
            y={PAD.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={onPointer}
            onPointerLeave={() => setActive(null)}
          />
        </svg>

        {active != null && (
          <div
            role="status"
            className="pointer-events-none absolute top-1 z-10 w-[210px] rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
            style={{ left: tooltipLeft }}
          >
            <p className="mb-1 text-[#888888]">{labels[active]}</p>
            {series.map((s) => (
              <p key={s.key} className="flex items-center gap-1.5 leading-5">
                <span aria-hidden="true" className="inline-block h-[2px] w-3 rounded" style={{ background: s.color }} />
                <strong className="whitespace-nowrap font-semibold text-[#222222]">{s.values[active] == null ? "—" : format(s.values[active] as number)}</strong>
                <span className="truncate text-[#888888]">{s.label}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
