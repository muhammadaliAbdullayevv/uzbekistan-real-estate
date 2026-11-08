"use client";

import { useState } from "react";

type ScheduleViewingModalProps = {
  listingTitle: string;
  phone: string;
  telegramUsername?: string | null;
  locale?: "uz" | "ru";
};

export function ScheduleViewingModal({
  listingTitle,
  phone,
  telegramUsername,
  locale = "uz"
}: ScheduleViewingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<"today" | "tomorrow" | "weekend">("today");
  const [selectedTime, setSelectedTime] = useState<"morning" | "afternoon" | "evening">("afternoon");
  const [isSuccess, setIsSuccess] = useState(false);

  const isRu = locale === "ru";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsOpen(false);
    }, 3000);
  }

  const dayLabels = {
    today: isRu ? "Сегодня" : "Bugun",
    tomorrow: isRu ? "Завтра" : "Ertaga",
    weekend: isRu ? "Выходные" : "Dam olish kuni"
  };

  const timeLabels = {
    morning: isRu ? "Утро (10:00 - 13:00)" : "Ertalab (10:00 - 13:00)",
    afternoon: isRu ? "День (14:00 - 18:00)" : "Tushdan keyin (14:00 - 18:00)",
    evening: isRu ? "Вечер (18:00 - 21:00)" : "Kechqurun (18:00 - 21:00)"
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 active:scale-98 flex items-center justify-center gap-2"
      >
        <span>📅</span>
        <span>{isRu ? "Записаться на просмотр" : "Uyni ko'rishga yozilish"}</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-extrabold text-slate-900">
                  {isRu ? "Запись на просмотр" : "Uyni ko'rishga yozilish"}
                </h3>
                <p className="line-clamp-1 text-xs text-slate-400 font-semibold mt-0.5">
                  {listingTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {isSuccess ? (
              <div className="py-8 text-center space-y-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl font-black">
                  ✓
                </span>
                <p className="text-sm font-black text-slate-900">
                  {isRu ? "Заявка успешно принята!" : "Arizangiz qabul qilindi!"}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {isRu
                    ? "Владелец свяжется с вами для подтверждения времени."
                    : "Mulkdor tez orada vaqtni tasdiqlash uchun siz bilan bog'lanadi."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Day selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isRu ? "Выберите день" : "Qulay kunni tanlang"}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["today", "tomorrow", "weekend"] as const).map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`rounded-xl py-2 px-1 text-xs font-bold transition text-center ${
                          selectedDay === day
                            ? "bg-blue-600 text-white shadow-xs font-black"
                            : "bg-[#F4F7FB] text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {dayLabels[day]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isRu ? "Время суток" : "Vaqt oralig'i"}
                  </label>
                  <div className="space-y-1.5">
                    {(["morning", "afternoon", "evening"] as const).map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`w-full text-left rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          selectedTime === time
                            ? "border border-blue-300 bg-blue-50 text-blue-700 font-bold"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {timeLabels[time]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-11 rounded-2xl bg-blue-600 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 hover:bg-blue-700 transition"
                  >
                    {isRu ? "Подтвердить запись" : "Uchrashuvni tasdiqlash"}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-slate-400">
                    {isRu ? "Или позвоните напрямую:" : "Yoki to'g'ridan-to'g'ri qo'ng'iroq qiling:"}{" "}
                    <a href={`tel:${phone}`} className="font-bold text-blue-600 hover:underline">
                      {phone}
                    </a>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
