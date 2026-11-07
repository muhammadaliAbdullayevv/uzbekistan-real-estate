import type {
  AmenityKey,
  IncludedInPriceKey,
  TenantPreferenceKey
} from "@/lib/constants";

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
    all: "Barchaga",
    cadastr_ready: "Kadastr hujjati tayyor",
    vacant_propiska: "Propiska bo'sh",
    new_building: "Yangi qurilgan bino (Novostroyka)",
    ready_to_move: "Darhol ko'chib kirishga tayyor",
    euro_renovation: "Yangi Yevroremont",
    first_owner: "Birinchi egasidan"
  },
  ru: {
    family: "Для семьи",
    students: "Для студентов",
    boys: "Парням",
    girls: "Девушкам",
    foreigners: "Иностранцам",
    all: "Всем",
    cadastr_ready: "Кадастр готов",
    vacant_propiska: "Прописка чистая",
    new_building: "Новостройка",
    ready_to_move: "Готова к заселению",
    euro_renovation: "Евроремонт",
    first_owner: "От первого собственника"
  }
};

export const INCLUDED_IN_PRICE_LABELS: Record<"uz" | "ru", Record<IncludedInPriceKey, string>> = {
  uz: {
    utilities_included: "Kommunal to'lovlar narx ichida",
    utilities_separate: "Kommunal alohida (hisoblagich bo'yicha)",
    wifi_included: "Wi-Fi va TV narx ichida",
    no_deposit: "Depozitsiz (zalog yo'q)",
    deposit_required: "Oldindan depozit (zalog) bor",
    no_commission: "Maklersiz (uy egasidan — 0% komissiya)",
    long_term_discount: "Uzoq muddatga chegirma bor",
    furniture_included: "Mebel va texnikasi narx ichida qoladi",
    mortgage_available: "Ipoteka (bank krediti) orqali sotiladi",
    installment_available: "Bo'lib to'lash (Rassrochka) bor",
    cadastr_ready: "Kadastr va hujjatlari tayyor",
    barter_possible: "Barter (mashina yoki uyga almashish) bor"
  },
  ru: {
    utilities_included: "Коммунальные услуги включены в цену",
    utilities_separate: "Коммунальные отдельно (по счётчикам)",
    wifi_included: "Wi-Fi и ТВ включены в цену",
    no_deposit: "Без залога (депозита)",
    deposit_required: "Требуется залог (депозит)",
    no_commission: "Без маклера (от хозяина — 0% комиссия)",
    long_term_discount: "Скидка при длительной аренде",
    furniture_included: "Мебель и техника остаются в цене",
    mortgage_available: "Доступна ипотека (через банк)",
    installment_available: "Возможна рассрочка",
    cadastr_ready: "Кадастр и документы готовы",
    barter_possible: "Возможен бартер (обмен)"
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

export function getIncludedInPriceLabel(key: string, locale: "uz" | "ru"): string {
  const dict = INCLUDED_IN_PRICE_LABELS[locale];
  return (dict as Record<string, string>)[key] ?? key;
}
