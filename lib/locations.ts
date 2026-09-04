import type { Locale } from "@/lib/i18n";

export const LEGACY_PRIMARY_LOCATION = "New Nurafshan, Tashkent Region" as const;
export const DEFAULT_REGION = "Tashkent Region" as const;
export const DEFAULT_DISTRICT = "Nurafshan" as const;
export const DEFAULT_CITY = "New Nurafshan" as const;

export const UZBEKISTAN_REGIONS = [
  "Tashkent City",
  "Tashkent Region",
  "Samarkand",
  "Bukhara",
  "Andijan",
  "Fergana",
  "Namangan",
  "Jizzakh",
  "Sirdaryo",
  "Kashkadarya",
  "Surkhandarya",
  "Khorezm",
  "Navoi",
  "Karakalpakstan"
] as const;

export type UzbekistanRegion = (typeof UZBEKISTAN_REGIONS)[number];

type LocationInput = {
  region?: string | null;
  district?: string | null;
  city?: string | null;
};

type LocationDetails = {
  region: string | null;
  districtCity: string | null;
  city: string | null;
};

const REGION_LABELS: Record<Locale, Record<UzbekistanRegion, string>> = {
  uz: {
    "Tashkent City": "Toshkent shahri",
    "Tashkent Region": "Toshkent viloyati",
    Samarkand: "Samarqand",
    Bukhara: "Buxoro",
    Andijan: "Andijon",
    Fergana: "Farg‘ona",
    Namangan: "Namangan",
    Jizzakh: "Jizzax",
    Sirdaryo: "Sirdaryo",
    Kashkadarya: "Qashqadaryo",
    Surkhandarya: "Surxondaryo",
    Khorezm: "Xorazm",
    Navoi: "Navoiy",
    Karakalpakstan: "Qoraqalpog‘iston"
  },
  ru: {
    "Tashkent City": "Ташкент",
    "Tashkent Region": "Ташкентская область",
    Samarkand: "Самарканд",
    Bukhara: "Бухара",
    Andijan: "Андижан",
    Fergana: "Фергана",
    Namangan: "Наманган",
    Jizzakh: "Джизак",
    Sirdaryo: "Сырдарья",
    Kashkadarya: "Кашкадарья",
    Surkhandarya: "Сурхандарья",
    Khorezm: "Хорезм",
    Navoi: "Навои",
    Karakalpakstan: "Каракалпакстан"
  }
};

export function isUzbekistanRegion(value?: string | null): value is UzbekistanRegion {
  return UZBEKISTAN_REGIONS.includes((value ?? "") as UzbekistanRegion);
}

export function getRegionLabel(region: string | null | undefined, locale: Locale) {
  if (isUzbekistanRegion(region)) {
    return REGION_LABELS[locale][region];
  }

  return region ?? "";
}

export function getRegionOptions(locale: Locale) {
  return UZBEKISTAN_REGIONS.map((value) => ({
    value,
    label: REGION_LABELS[locale][value]
  }));
}

/**
 * Official district (tuman/shahar) names per region, sourced from Uzbekistan's
 * SOATO administrative classifier. Canonical value is the Uzbek Latin name —
 * there's no reliable public dataset for mahalla-level (neighborhood) data,
 * so this stops at district level; "Mahalla yoki mo'ljal" stays free text.
 */
export const UZBEKISTAN_DISTRICTS: Record<UzbekistanRegion, string[]> = {
  "Tashkent City": ["Bektemir tumani", "Chilonzor tumani", "Mirobod tumani", "Mirzo Ulug‘bek tumani", "Olmazor tumani", "Shayxontohur tumani", "Sirg‘ali tumani", "Uchtepa tumani", "Yakkasaroy tumani", "Yangihayot tumani", "Yashnobod tumani", "Yunusobod tumani"],
  "Tashkent Region": ["Angren", "Bekobod", "Bekobod tumani", "Bo‘ka tumani", "Bo‘stonliq tumani", "Chinoz tumani", "Chirchiq", "Nurafshon", "O‘rtachirchiq tumani", "Ohangaron", "Ohangaron tumani", "Olmaliq", "Oqqo‘rg‘on tumani", "Parkent tumani", "Piskent tumani", "Qibray tumani", "Quyichirchiq tumani", "Toshkent tumani", "Yangiyo‘l", "Yangiyo‘l tumani", "Yuqorichirchiq tumani", "Zangiota tumani"],
  Samarkand: ["Bulung‘ur tumani", "Ishtixon tumani", "Jomboy tumani", "Kattaqo‘rg‘on", "Kattaqo‘rg‘on tumani", "Narpay tumani", "Nurobod tumani", "Oqdaryo tumani", "Pastdarg‘om tumani", "Paxtachi tumani", "Payariq tumani", "Qo‘shrabot tumani", "Samarqand", "Samarqand tumani", "Tayloq tumani", "Urgut tumani"],
  Bukhara: ["Buxoro", "Buxoro tumani", "G‘ijduvon tumani", "Jondor tumani", "Kogon", "Kogon tumani", "Olot tumani", "Peshku tumani", "Qorako‘l tumani", "Qorovulbozor tumani", "Romitan tumani", "Shofirkon tumani", "Vobkent tumani"],
  Andijan: ["Andijon", "Andijon tumani", "Asaka tumani", "Baliqchi tumani", "Bo‘z tumani", "Buloqboshi tumani", "Izboskan tumani", "Jalaquduq tumani", "Marxamat tumani", "Oltinko‘l tumani", "Paxtaobod tumani", "Qo‘rg‘ontepa tumani", "Shahrixon tumani", "Ulug‘nor tumani", "Xo‘jaobod tumani", "Xonobod"],
  Fergana: ["Beshariq tumani", "Bog‘dod tumani", "Buvayda tumani", "Dang‘ara tumani", "Farg‘ona", "Farg‘ona tumani", "Furqat tumani", "Marg‘ilon", "O‘zbekiston tumani", "Oltiariq tumani", "Qo‘qon", "Qo‘shtepa tumani", "Quva tumani", "Quvasoy", "Rishton tumani", "So‘x tumani", "Toshloq tumani", "Uchko‘prik tumani", "Yozyovon tumani"],
  Namangan: ["Chortoq tumani", "Chust tumani", "Davlatobod tumani", "Kosonsoy tumani", "Mingbuloq tumani", "Namangan", "Namangan tumani", "Norin tumani", "Pop tumani", "To‘raqo‘rg‘on tumani", "Uchqo‘rg‘on tumani", "Uychi tumani", "Yangi Namangan tumani", "Yangiqo‘rg‘on tumani"],
  Jizzakh: ["Arnasoy tumani", "Baxmal tumani", "Do‘stlik tumani", "Forish tumani", "G‘allaorol tumani", "Jizzax", "Mirzacho‘l tumani", "Paxtakor tumani", "Sh.Rashidov tumani", "Yangiobod tumani", "Zafarobod tumani", "Zarbdor tumani", "Zomin tumani"],
  Sirdaryo: ["Baxt shahri", "Boyovut tumani", "Guliston", "Guliston tumani", "Mirzaobod tumani", "Oqoltin tumani", "Sardoba tumani", "Sayxunobod tumani", "Shirin", "Sirdaryo tumani", "Xovos tumani", "Yangiyer"],
  Kashkadarya: ["Chiroqchi tumani", "Dehqonobod tumani", "G‘uzor tumani", "Kasbi tumani", "Kitob tumani", "Koson tumani", "Ko‘kdala tumani", "Mirishkor tumani", "Muborak tumani", "Nishon tumani", "Qamashi tumani", "Qarshi", "Qarshi tumani", "Shahrisabz", "Shahrisabz tumani", "Yakkabog‘ tumani"],
  Surkhandarya: ["Angor tumani", "Bandixon tumani", "Boysun tumani", "Denov tumani", "Jarqo‘rg‘on tumani", "Muzrabot tumani", "Oltinsoy tumani", "Qiziriq tumani", "Qumqo‘rg‘on tumani", "Sariosiyo tumani", "Sherobod tumani", "Sho‘rchi tumani", "Termiz", "Termiz tumani", "Uzun tumani"],
  Khorezm: ["Bog‘ot tumani", "Gurlan tumani", "Qo‘shko‘pir tumani", "Shovot tumani", "Tuproqqal‘a tumani", "Urganch", "Urganch tumani", "Xazorasp tumani", "Xiva", "Xiva tumani", "Xonqa tumani", "Yangiariq tumani", "Yangibozor tumani"],
  Navoi: ["G‘ozg‘on tumani", "Karmana tumani", "Konimex tumani", "Navbahor tumani", "Navoiy", "Nurota tumani", "Qiziltepa tumani", "Tomdi tumani", "Uchquduq tumani", "Xatirchi tumani", "Zarafshon"],
  Karakalpakstan: ["Amudaryo tumani", "Beruniy tumani", "Bo‘zatov tumani", "Chimboy tumani", "Ellikqal‘a tumani", "Kegeyli tumani", "Mo‘ynoq tumani", "Nukus", "Nukus tumani", "Qanliko‘l tumani", "Qo‘ng‘irot tumani", "Qorao‘zak tumani", "Shumanay tumani", "Taxiatosh tumani", "Taxtako‘pir tumani", "To‘rtko‘l tumani", "Xo‘jayli tumani"]
};

const DISTRICT_LABELS_RU: Record<string, string> = {
  "Bektemir tumani": "Бектемирский район",
  "Chilonzor tumani": "Чиланзарский район",
  "Mirobod tumani": "Мирабадский район",
  "Mirzo Ulug‘bek tumani": "Мирзо-Улугбекский район",
  "Olmazor tumani": "Алмазарский район",
  "Shayxontohur tumani": "Шайхантахурский район",
  "Sirg‘ali tumani": "Сергелийский район",
  "Uchtepa tumani": "Учтепинский район",
  "Yakkasaroy tumani": "Яккасарайский район",
  "Yangihayot tumani": "Янгихаётский район",
  "Yashnobod tumani": "Яшнабадский район",
  "Yunusobod tumani": "Юнусабадский район",
  Angren: "Ангрен",
  Bekobod: "Бекабад",
  "Bekobod tumani": "Бекабадский район",
  "Bo‘ka tumani": "Букинский район",
  "Bo‘stonliq tumani": "Бостанлыкский район",
  "Chinoz tumani": "Чиназский район",
  Chirchiq: "Чирчик",
  Nurafshon: "Нурафшон",
  "O‘rtachirchiq tumani": "Уртачирчикский район",
  Ohangaron: "Ахангаран",
  "Ohangaron tumani": "Ахангаранский район",
  Olmaliq: "Алмалык",
  "Oqqo‘rg‘on tumani": "Аккурганский район",
  "Parkent tumani": "Паркентский район",
  "Piskent tumani": "Пскентский район",
  "Qibray tumani": "Кибрайский район",
  "Quyichirchiq tumani": "Куйичирчикский район",
  "Toshkent tumani": "Ташкентский район",
  "Yangiyo‘l": "Янгиюль",
  "Yangiyo‘l tumani": "Янгиюльский район",
  "Yuqorichirchiq tumani": "Юкоричирчикский район",
  "Zangiota tumani": "Зангиатинский район",
  "Bulung‘ur tumani": "Булунгурский район",
  "Ishtixon tumani": "Иштыханский район",
  "Jomboy tumani": "Джамбайский район",
  "Kattaqo‘rg‘on": "Каттакурган",
  "Kattaqo‘rg‘on tumani": "Каттакурганский район",
  "Narpay tumani": "Нарпайский район",
  "Nurobod tumani": "Нурабадский район",
  "Oqdaryo tumani": "Акдарьинский район",
  "Pastdarg‘om tumani": "Пастдаргомский район",
  "Paxtachi tumani": "Пахтачийский район",
  "Payariq tumani": "Пайарыкский район",
  "Qo‘shrabot tumani": "Кушрабадский район",
  Samarqand: "Самарканд",
  "Samarqand tumani": "Самаркандский район",
  "Tayloq tumani": "Тайлякский район",
  "Urgut tumani": "Ургутский район",
  Buxoro: "Бухара",
  "Buxoro tumani": "Бухарский район",
  "G‘ijduvon tumani": "Гиждуванский район",
  "Jondor tumani": "Жандарский район",
  Kogon: "Каган",
  "Kogon tumani": "Каганский район",
  "Olot tumani": "Алатский район",
  "Peshku tumani": "Пешкунский район",
  "Qorako‘l tumani": "Каракульский район",
  "Qorovulbozor tumani": "Караулбазарский район",
  "Romitan tumani": "Ромитанский район",
  "Shofirkon tumani": "Шафирканский район",
  "Vobkent tumani": "Вабкентский район",
  Andijon: "Андижан",
  "Andijon tumani": "Андижанский район",
  "Asaka tumani": "Асакинский район",
  "Baliqchi tumani": "Балыкчинский район",
  "Bo‘z tumani": "Бозский район",
  "Buloqboshi tumani": "Булакбашинский район",
  "Izboskan tumani": "Избасканский район",
  "Jalaquduq tumani": "Джалалкудукский район",
  "Marxamat tumani": "Мархаматский район",
  "Oltinko‘l tumani": "Алтынкульский район",
  "Paxtaobod tumani": "Пахтаабадский район",
  "Qo‘rg‘ontepa tumani": "Кургантепинский район",
  "Shahrixon tumani": "Шахриханский район",
  "Ulug‘nor tumani": "Улугнорский район",
  "Xo‘jaobod tumani": "Ходжаабадский район",
  Xonobod: "Ханабад",
  "Beshariq tumani": "Бешарыкский район",
  "Bog‘dod tumani": "Багдадский район",
  "Buvayda tumani": "Бувайдинский район",
  "Dang‘ara tumani": "Дангаринский район",
  "Farg‘ona": "Фергана",
  "Farg‘ona tumani": "Ферганский район",
  "Furqat tumani": "Фуркатский район",
  "Marg‘ilon": "Маргилан",
  "O‘zbekiston tumani": "Узбекистанский район",
  "Oltiariq tumani": "Алтыарыкский район",
  "Qo‘qon": "Коканд",
  "Qo‘shtepa tumani": "Куштепинский район",
  "Quva tumani": "Кувинский район",
  Quvasoy: "Кувасай",
  "Rishton tumani": "Риштанский район",
  "So‘x tumani": "Сохский район",
  "Toshloq tumani": "Ташлакский район",
  "Uchko‘prik tumani": "Учкуприкский район",
  "Yozyovon tumani": "Язъяванский район",
  "Chortoq tumani": "Чартакский район",
  "Chust tumani": "Чустский район",
  "Davlatobod tumani": "Давлатабадский район",
  "Kosonsoy tumani": "Касансайский район",
  "Mingbuloq tumani": "Мингбулакский район",
  Namangan: "Наманган",
  "Namangan tumani": "Наманганский район",
  "Norin tumani": "Нарынский район",
  "Pop tumani": "Папский район",
  "To‘raqo‘rg‘on tumani": "Туракурганский район",
  "Uchqo‘rg‘on tumani": "Учкурганский район",
  "Uychi tumani": "Уйчинский район",
  "Yangi Namangan tumani": "Янги Наманганский район",
  "Yangiqo‘rg‘on tumani": "Янгикурганский район",
  "Arnasoy tumani": "Арнасайский район",
  "Baxmal tumani": "Бахмальский район",
  "Do‘stlik tumani": "Дустликский район",
  "Forish tumani": "Фаришский район",
  "G‘allaorol tumani": "Галляаральский район",
  Jizzax: "Джизак",
  "Mirzacho‘l tumani": "Мирзачульский район",
  "Paxtakor tumani": "Пахтакорский район",
  "Sh.Rashidov tumani": "Ш.Рашидовский район",
  "Yangiobod tumani": "Янгиабадский район",
  "Zafarobod tumani": "Зафарабадский район",
  "Zarbdor tumani": "Зарбдарский район",
  "Zomin tumani": "Зааминский район",
  "Baxt shahri": "город Бахт",
  "Boyovut tumani": "Баяутский район",
  Guliston: "Гулистан",
  "Guliston tumani": "Гулистанский район",
  "Mirzaobod tumani": "Мирзаабадский район",
  "Oqoltin tumani": "Акалтынский район",
  "Sardoba tumani": "Сардобинский район",
  "Sayxunobod tumani": "Сайхунабадский район",
  Shirin: "Ширин",
  "Sirdaryo tumani": "Сырдарьинский район",
  "Xovos tumani": "Хавастский район",
  Yangiyer: "Янгиер",
  "Chiroqchi tumani": "Чиракчинский район",
  "Dehqonobod tumani": "Дехканабадский район",
  "G‘uzor tumani": "Гузарский район",
  "Kasbi tumani": "Касбинский район",
  "Kitob tumani": "Китабский район",
  "Koson tumani": "Касанский район",
  "Ko‘kdala tumani": "Кукдалинский район",
  "Mirishkor tumani": "Миришкорский район",
  "Muborak tumani": "Мубарекский район",
  "Nishon tumani": "Нишанский район",
  "Qamashi tumani": "Камашинский район",
  Qarshi: "Карши",
  "Qarshi tumani": "Каршинский район",
  Shahrisabz: "Шахрисабз",
  "Shahrisabz tumani": "Шахрисабзский район",
  "Yakkabog‘ tumani": "Яккабагский район",
  "Angor tumani": "Ангорский район",
  "Bandixon tumani": "Бандиханский район",
  "Boysun tumani": "Байсунский район",
  "Denov tumani": "Денауский район",
  "Jarqo‘rg‘on tumani": "Джаркурганский район",
  "Muzrabot tumani": "Музрабадский район",
  "Oltinsoy tumani": "Алтынсайский район",
  "Qiziriq tumani": "Кизирикский район",
  "Qumqo‘rg‘on tumani": "Кумкурганский район",
  "Sariosiyo tumani": "Сариасийский район",
  "Sherobod tumani": "Шерабадский район",
  "Sho‘rchi tumani": "Шурчинский район",
  Termiz: "Термез",
  "Termiz tumani": "Термезский район",
  "Uzun tumani": "Узунский район",
  "Bog‘ot tumani": "Багатский район",
  "Gurlan tumani": "Гурленский район",
  "Qo‘shko‘pir tumani": "Кошкупырский район",
  "Shovot tumani": "Шаватский район",
  "Tuproqqal‘a tumani": "Тупроккалинский район",
  Urganch: "Ургенч",
  "Urganch tumani": "Ургенчский район",
  "Xazorasp tumani": "Хазараспский район",
  Xiva: "Хива",
  "Xiva tumani": "Хивинский район",
  "Xonqa tumani": "Ханкинский район",
  "Yangiariq tumani": "Янгиарыкский район",
  "Yangibozor tumani": "Янгибазарский район",
  "G‘ozg‘on tumani": "Газганский район",
  "Karmana tumani": "Карманинский район",
  "Konimex tumani": "Канимехский район",
  "Navbahor tumani": "Навбахорский район",
  Navoiy: "Навои",
  "Nurota tumani": "Нуратинский район",
  "Qiziltepa tumani": "Кызылтепинский район",
  "Tomdi tumani": "Тамдынский район",
  "Uchquduq tumani": "Учкудукский район",
  "Xatirchi tumani": "Хатырчинский район",
  Zarafshon: "Зарафшан",
  "Amudaryo tumani": "Амударьинский район",
  "Beruniy tumani": "Берунийский район",
  "Bo‘zatov tumani": "Бузатовский район",
  "Chimboy tumani": "Чимбайский район",
  "Ellikqal‘a tumani": "Элликкалинский район",
  "Kegeyli tumani": "Кегейлийский район",
  "Mo‘ynoq tumani": "Муйнакский район",
  Nukus: "Нукус",
  "Nukus tumani": "Нукусский район",
  "Qanliko‘l tumani": "Канлыкульский район",
  "Qo‘ng‘irot tumani": "Кунградский район",
  "Qorao‘zak tumani": "Караузякский район",
  "Shumanay tumani": "Шуманайский район",
  "Taxiatosh tumani": "Тахиаташский район",
  "Taxtako‘pir tumani": "Тахтакупырский район",
  "To‘rtko‘l tumani": "Турткульский район",
  "Xo‘jayli tumani": "Ходжейлийский район"
};

export function isKnownDistrict(region: string | null | undefined, district: string | null | undefined) {
  if (!isUzbekistanRegion(region) || !district) {
    return false;
  }

  return UZBEKISTAN_DISTRICTS[region].includes(district);
}

export function getDistrictLabel(district: string | null | undefined, locale: Locale) {
  if (!district) {
    return "";
  }

  if (locale === "ru") {
    return DISTRICT_LABELS_RU[district] ?? district;
  }

  return district;
}

export function getDistrictOptions(region: UzbekistanRegion | string | null | undefined, locale: Locale) {
  if (!isUzbekistanRegion(region)) {
    return [];
  }

  return UZBEKISTAN_DISTRICTS[region].map((value) => ({
    value,
    label: getDistrictLabel(value, locale)
  }));
}

/** Every region's district options, precomputed so the client can switch region without a round trip. */
export function getDistrictOptionsByRegion(locale: Locale) {
  const result: Record<string, Array<{ value: string; label: string }>> = {};

  for (const region of UZBEKISTAN_REGIONS) {
    result[region] = getDistrictOptions(region, locale);
  }

  return result;
}

export function normalizeLocation(input: LocationInput) {
  if (input.district === LEGACY_PRIMARY_LOCATION) {
    return {
      region: input.region || DEFAULT_REGION,
      district: DEFAULT_DISTRICT,
      city: input.city || DEFAULT_CITY
    };
  }

  return {
    region: input.region || null,
    district: input.district || null,
    city: input.city || null
  };
}

function normalizeText(value?: string | null) {
  return value?.trim() || null;
}

function isSameLocationLabel(left?: string | null, right?: string | null) {
  return normalizeText(left)?.toLocaleLowerCase() === normalizeText(right)?.toLocaleLowerCase();
}

function joinUnique(parts: Array<string | null | undefined>, separator: string) {
  const uniqueParts: string[] = [];

  for (const part of parts) {
    const normalized = normalizeText(part);

    if (!normalized) {
      continue;
    }

    if (uniqueParts.some((item) => isSameLocationLabel(item, normalized))) {
      continue;
    }

    uniqueParts.push(normalized);
  }

  return uniqueParts.join(separator);
}

export function getLocationDetails(input: LocationInput, locale: Locale): LocationDetails {
  const normalized = normalizeLocation(input);
  const rawRegion = normalizeText(normalized.region);
  const region = normalizeText(getRegionLabel(normalized.region, locale));
  const district = normalizeText(normalized.district);
  const city = normalizeText(normalized.city);
  const districtCity =
    joinUnique(
      [
        district && !isSameLocationLabel(district, rawRegion) && !isSameLocationLabel(district, region)
          ? district
          : null,
        city
      ],
      " · "
    ) || null;

  return {
    region,
    districtCity,
    city
  };
}

export function formatLocationSummary(input: LocationInput, locale: Locale) {
  const normalized = normalizeLocation(input);
  const rawRegion = normalizeText(normalized.region);
  const region = normalizeText(getRegionLabel(normalized.region, locale));
  const district = normalizeText(normalized.district);
  const city = normalizeText(normalized.city);
  const primary =
    (district && !isSameLocationLabel(district, rawRegion) && !isSameLocationLabel(district, region)
      ? district
      : null) ||
    (city && !isSameLocationLabel(city, rawRegion) && !isSameLocationLabel(city, region)
      ? city
      : null) ||
    district ||
    city ||
    region;

  return joinUnique([primary, region], ", ");
}

export function formatLocationTrail(input: LocationInput, locale: Locale) {
  const { region, districtCity } = getLocationDetails(input, locale);

  return [districtCity, region].filter(Boolean);
}
