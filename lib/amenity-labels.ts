import type { AmenityKey, TenantPreferenceKey } from "@/lib/constants";

export const AMENITY_LABELS: Record<"uz" | "ru", Record<AmenityKey, string>> = {
  uz: {
    heating: "Isitish tizimi (Kombi)",
    ac: "Konditsioner",
    washer: "Kir yuvish mashinasi",
    fridge: "Muzlatkich",
    wifi: "Wi-Fi Internet",
    pool: "Basseyn",
    tv: "Televizor (Smart TV)",
    kitchen: "Oshxona mebeli",
    balcony: "Balkon / Terassa",
    elevator: "Lift bor",
    metro: "Metro yaqinida",
    parking: "Avtoturargoh",
    sauna: "Sauna / Hammom",
    garden: "Bog' / Tapchan",
    bbq: "Mangal / Barbekyu",
    security: "Qo'riqlash / Kamera"
  },
  ru: {
    heating: "Отопление (Комби)",
    ac: "Кондиционер",
    washer: "Стиральная машина",
    fridge: "Холодильник",
    wifi: "Wi-Fi интернет",
    pool: "Бассейн",
    tv: "Телевизор (Smart TV)",
    kitchen: "Кухонная мебель",
    balcony: "Балкон / Терраса",
    elevator: "Лифт",
    metro: "Рядом с метро",
    parking: "Парковка",
    sauna: "Сауна / Баня",
    garden: "Сад / Тапчан",
    bbq: "Мангал / Барбекю",
    security: "Охрана / Камеры"
  }
};

export const TENANT_PREFERENCE_LABELS: Record<"uz" | "ru", Record<TenantPreferenceKey, string>> = {
  uz: {
    family: "Oila uchun",
    students: "Talabalar uchun",
    boys: "O'g'il bolalarga",
    girls: "Qizlarga",
    foreigners: "Xorijliklarga",
    all: "Barchaga"
  },
  ru: {
    family: "Для семьи",
    students: "Для студентов",
    boys: "Парням",
    girls: "Девушкам",
    foreigners: "Иностранцам",
    all: "Всем"
  }
};

export function getAmenityLabel(key: string, locale: "uz" | "ru"): string {
  const dict = AMENITY_LABELS[locale];
  return (dict as Record<string, string>)[key] ?? key;
}

export function getTenantPreferenceLabel(key: string, locale: "uz" | "ru"): string {
  const dict = TENANT_PREFERENCE_LABELS[locale];
  return (dict as Record<string, string>)[key] ?? key;
}
