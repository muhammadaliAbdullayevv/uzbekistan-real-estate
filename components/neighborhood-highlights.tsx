"use client";

type NeighborhoodHighlightsProps = {
  locale?: "uz" | "ru";
};

export function NeighborhoodHighlights({ locale = "uz" }: NeighborhoodHighlightsProps) {
  const isRu = locale === "ru";

  const amenities = [
    {
      icon: "🚌",
      name: isRu ? "Автобусная остановка" : "Avtobus bekati",
      distance: isRu ? "150 м (2 мин)" : "150 metr (2 daqiqa)"
    },
    {
      icon: "🏫",
      name: isRu ? "Средняя школа" : "Maktab",
      distance: isRu ? "350 м (4 мин)" : "350 metr (4 daqiqa)"
    },
    {
      icon: "🛒",
      name: isRu ? "Супермаркет / Магазин" : "Supermarket / Do'kon",
      distance: isRu ? "400 м" : "400 metr"
    },
    {
      icon: "🌳",
      name: isRu ? "Парк / Сквер" : "Istirohat bog'i",
      distance: isRu ? "650 м" : "650 metr"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
      {amenities.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-[#F4F7FB]/70 p-2.5 sm:p-3 transition hover:border-blue-200 hover:bg-[#EFF6FF]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-2xs">
            {item.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold text-slate-800">
              {item.name}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              {item.distance}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
