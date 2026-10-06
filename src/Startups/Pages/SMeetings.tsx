import {
} from "react-icons/fi";
import SSidebar from "../../components/SSidebar";

type CalendarDay = {
  id: string;
  day: number;
  currentMonth: boolean;
};

type SReunioesProps = {
  logoUrl?: string;
  onSelectDay?: (day: CalendarDay) => void;
};


const calendarDays: CalendarDay[] = Array.from({ length: 55 }, (_, index) => {
  const currentMonth = index < 31;
  const day = currentMonth ? index + 1 : index - 30;

  return {
    id: `${currentMonth ? "current" : "next"}-${day}`,
    day,
    currentMonth,
  };
});

export default function SMeetings({
  onSelectDay,
}: SReunioesProps = {}) {
  return (
    <div
      className="min-h-screen bg-[#F5F8FA] text-[#222222]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <SSidebar />

      <main className="md:ml-48">
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-10">
          <header className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Reuniões
            </h1>

            <p className="mt-2 text-xs text-[#666666] sm:text-sm">
              Acompanhe sua agenda de reuniões
            </p>
          </header>

          <section
            aria-label="Agenda de reuniões"
            className="overflow-hidden rounded-lg border border-[#E7E7E7] bg-white shadow-[0_2px_3px_rgba(0,0,0,0.16)]"
          >
            <div
              tabIndex={0}
              role="region"
              aria-label="Dias da agenda; role horizontalmente em telas pequenas"
              className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#EF5948]"
            >
              <div className="grid min-w-[660px] grid-cols-11">
                {calendarDays.map((item, index) => {
                  const lastColumn = (index + 1) % 11 === 0;
                  const lastRow = index >= 44;

                  const cellClass = [
                    "min-h-[95px] p-3 text-left align-top",
                    "sm:min-h-[110px] lg:min-h-[125px]",
                    !lastColumn ? "border-r border-[#E7E7E7]" : "",
                    !lastRow ? "border-b border-[#E7E7E7]" : "",
                    item.currentMonth ? "text-[#EF5948]" : "text-[#666666]",
                  ].join(" ");

                  const label = `Dia ${item.day} do ${
                    item.currentMonth ? "mês atual" : "próximo mês"
                  }`;

                  return onSelectDay ? (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={label}
                      onClick={() => onSelectDay(item)}
                      className={[
                        cellClass,
                        "flex items-start bg-white transition",
                        "hover:bg-[#FFF6F2]",
                        "focus-visible:z-10 focus-visible:outline",
                        "focus-visible:outline-2",
                        "focus-visible:-outline-offset-2",
                        "focus-visible:outline-[#EF5948]",
                      ].join(" ")}
                    >
                      <span className="text-sm font-semibold">{item.day}</span>
                    </button>
                  ) : (
                    <div key={item.id} aria-label={label} className={cellClass}>
                      <span className="text-sm font-semibold">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
