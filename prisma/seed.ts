import { randomUUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

type SeedListing = {
  title: string;
  description: string;
  price: number;
  listingType: "rent" | "sale";
  currency: "USD" | "UZS";
  region: string;
  district: string;
  city: string | null;
  address: string;
  rooms: number;
  area: number;
  propertyType: "flat" | "house" | "room";
  rentType: "monthly" | "daily" | null;
  phone: string;
  telegramUsername: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  images: {
    create: Array<{
      url: string;
    }>;
  };
  userEmail?: string;
};

type RegionSeed = {
  region: string;
  locations: Array<{
    district: string;
    city: string | null;
  }>;
};

const REGION_SEEDS: RegionSeed[] = [
  {
    region: "Tashkent City",
    locations: [
      { district: "Chilonzor", city: "Bunyodkor" },
      { district: "Yunusobod", city: "Minor" },
      { district: "Mirzo Ulugbek", city: "Buyuk Ipak Yoli" },
      { district: "Sergeli", city: "Yangi Sergeli" },
      { district: "Yakkasaroy", city: "Rakat" },
      { district: "Olmazor", city: "Beruniy" },
      { district: "Shaykhantohur", city: "Chorsu" },
      { district: "Uchtepa", city: "Farhod" }
    ]
  },
  {
    region: "Tashkent Region",
    locations: [
      { district: "Nurafshan", city: "New Nurafshan" },
      { district: "Chirchiq", city: "Kimyogarlar" },
      { district: "Angren", city: "Mustaqillik" },
      { district: "Olmaliq", city: "Metallurg" },
      { district: "Bekabad", city: "Sanoat" },
      { district: "Yangiyol", city: "Yangiobod" },
      { district: "Parkent", city: "Parkent markazi" },
      { district: "Bostonliq", city: "Gazalkent" }
    ]
  },
  {
    region: "Samarkand",
    locations: [
      { district: "Samarkand", city: "Registan" },
      { district: "Urgut", city: "Urgut markazi" },
      { district: "Kattakurgan", city: "Kattakurgan shahar" },
      { district: "Jomboy", city: "Jomboy markazi" },
      { district: "Pastdargom", city: "Chelak" },
      { district: "Ishtikhon", city: "Ishtikhon markazi" },
      { district: "Bulungur", city: "Bulungur markazi" },
      { district: "Narpay", city: "Aktash" }
    ]
  },
  {
    region: "Bukhara",
    locations: [
      { district: "Bukhara", city: "Old City" },
      { district: "Kogon", city: "Kogon markazi" },
      { district: "Gijduvan", city: "Gijduvon markazi" },
      { district: "Vobkent", city: "Vobkent markazi" },
      { district: "Qorakol", city: "Qorakol markazi" },
      { district: "Romitan", city: "Romitan markazi" },
      { district: "Shofirkon", city: "Shofirkon markazi" },
      { district: "Jondor", city: "Jondor markazi" }
    ]
  },
  {
    region: "Andijan",
    locations: [
      { district: "Andijan", city: "Bobur xiyoboni" },
      { district: "Asaka", city: "Asaka markazi" },
      { district: "Shahrixon", city: "Shahrixon markazi" },
      { district: "Marhamat", city: "Marhamat markazi" },
      { district: "Khonobod", city: "Khonobod markazi" },
      { district: "Baliqchi", city: "Baliqchi markazi" },
      { district: "Jalaquduq", city: "Jalaquduq markazi" },
      { district: "Izboskan", city: "Poytug'" }
    ]
  },
  {
    region: "Fergana",
    locations: [
      { district: "Fergana", city: "Margilan Road" },
      { district: "Kokand", city: "Dahbed" },
      { district: "Margilan", city: "Atlaschilar" },
      { district: "Quva", city: "Quva markazi" },
      { district: "Rishton", city: "Rishton markazi" },
      { district: "Beshariq", city: "Beshariq markazi" },
      { district: "Bagdod", city: "Bagdod markazi" },
      { district: "Oltiariq", city: "Oltiariq markazi" }
    ]
  },
  {
    region: "Namangan",
    locations: [
      { district: "Namangan", city: "Chorsu" },
      { district: "Chortoq", city: "Chortoq markazi" },
      { district: "Kosonsoy", city: "Kosonsoy markazi" },
      { district: "Pop", city: "Pop markazi" },
      { district: "Chust", city: "Chust markazi" },
      { district: "Torakorgon", city: "Torakorgon markazi" },
      { district: "Uychi", city: "Uychi markazi" },
      { district: "Mingbuloq", city: "Mingbuloq markazi" }
    ]
  },
  {
    region: "Jizzakh",
    locations: [
      { district: "Jizzakh", city: "Sharof Rashidov" },
      { district: "Zomin", city: "Zomin markazi" },
      { district: "Gallaorol", city: "Gallaorol markazi" },
      { district: "Baxmal", city: "Baxmal markazi" },
      { district: "Paxtakor", city: "Paxtakor markazi" },
      { district: "Dostlik", city: "Dostlik markazi" },
      { district: "Forish", city: "Yangiqishloq" },
      { district: "Mirzachol", city: "Mirzachol markazi" }
    ]
  },
  {
    region: "Sirdaryo",
    locations: [
      { district: "Gulistan", city: "Gulistan markazi" },
      { district: "Yangiyer", city: "Yangiyer markazi" },
      { district: "Shirin", city: "Shirin markazi" },
      { district: "Boyovut", city: "Boyovut markazi" },
      { district: "Mirzaobod", city: "Mirzaobod markazi" },
      { district: "Sayxunobod", city: "Sayxunobod markazi" },
      { district: "Sardoba", city: "Sardoba markazi" },
      { district: "Oqoltin", city: "Oqoltin markazi" }
    ]
  },
  {
    region: "Kashkadarya",
    locations: [
      { district: "Qarshi", city: "Nasaf" },
      { district: "Shahrisabz", city: "Shahrisabz markazi" },
      { district: "Kitob", city: "Kitob markazi" },
      { district: "Guzor", city: "Guzor markazi" },
      { district: "Koson", city: "Koson markazi" },
      { district: "Chiroqchi", city: "Chiroqchi markazi" },
      { district: "Muborak", city: "Muborak markazi" },
      { district: "Yakkabog", city: "Yakkabog markazi" }
    ]
  },
  {
    region: "Surkhandarya",
    locations: [
      { district: "Termiz", city: "Hakim at-Termiziy" },
      { district: "Denov", city: "Denov markazi" },
      { district: "Sherobod", city: "Sherobod markazi" },
      { district: "Boysun", city: "Boysun markazi" },
      { district: "Jarqorgon", city: "Jarqorgon markazi" },
      { district: "Sariosiyo", city: "Sariosiyo markazi" },
      { district: "Qumqorgon", city: "Qumqorgon markazi" },
      { district: "Muzrabot", city: "Muzrabot markazi" }
    ]
  },
  {
    region: "Khorezm",
    locations: [
      { district: "Urgench", city: "Al-Xorazmiy" },
      { district: "Khiva", city: "Ichan-Qala" },
      { district: "Pitnak", city: "Pitnak markazi" },
      { district: "Gurlan", city: "Gurlan markazi" },
      { district: "Shovot", city: "Shovot markazi" },
      { district: "Hazorasp", city: "Hazorasp markazi" },
      { district: "Bogot", city: "Bogot markazi" },
      { district: "Yangibozor", city: "Yangibozor markazi" }
    ]
  },
  {
    region: "Navoi",
    locations: [
      { district: "Navoi", city: "Yoshlar" },
      { district: "Zarafshon", city: "Oltin Vodiy" },
      { district: "Karmana", city: "Karmana markazi" },
      { district: "Qiziltepa", city: "Qiziltepa markazi" },
      { district: "Konimex", city: "Konimex markazi" },
      { district: "Nurota", city: "Nurota markazi" },
      { district: "Uchquduq", city: "Uchquduq markazi" },
      { district: "Tomdi", city: "Tomdi markazi" }
    ]
  },
  {
    region: "Karakalpakstan",
    locations: [
      { district: "Nukus", city: "Savitskiy muzeyi" },
      { district: "Beruniy", city: "Beruniy markazi" },
      { district: "Turtkul", city: "Turtkul markazi" },
      { district: "Khojayli", city: "Khojayli markazi" },
      { district: "Chimboy", city: "Chimboy markazi" },
      { district: "Qongirot", city: "Qongirot markazi" },
      { district: "Moynaq", city: "Moynaq markazi" },
      { district: "Taxiatosh", city: "Taxiatosh markazi" }
    ]
  }
];

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80"
] as const;

const STREET_POOL = [
  "Mustaqillik",
  "Navbahor",
  "Bunyodkor",
  "Istiqlol",
  "Yoshlik",
  "Amir Temur",
  "Bogishamol",
  "Sohil",
  "Afrosiyob",
  "Yangi Hayot",
  "Buyuk Ipak Yoli",
  "Shodlik"
] as const;

const ADJECTIVE_POOL = [
  "Bright",
  "Modern",
  "Cozy",
  "Family",
  "Sunny",
  "Spacious",
  "Renovated",
  "Calm",
  "Central",
  "Practical"
] as const;

const RENT_HIGHLIGHTS = [
  "close to transport and daily shopping",
  "with bright rooms and a practical layout",
  "suited to professionals and small families",
  "with direct owner contact and a clean entrance",
  "near schools, cafés, and evening markets",
  "with stable internet and good natural light"
] as const;

const SALE_HIGHLIGHTS = [
  "move-in ready with strong family potential",
  "well suited to buyers who want a central location",
  "with a practical layout for long-term ownership",
  "close to schools, clinics, and neighborhood retail",
  "with renovation work already completed",
  "positioned well for both living and resale value"
] as const;

function getPropertyType(index: number, listingType: "rent" | "sale"): SeedListing["propertyType"] {
  if (listingType === "sale") {
    return index % 4 === 0 ? "house" : "flat";
  }

  if (index % 5 === 0) {
    return "room";
  }

  return index % 3 === 0 ? "house" : "flat";
}

function getRooms(index: number, propertyType: SeedListing["propertyType"]) {
  if (propertyType === "room") {
    return 1;
  }

  if (propertyType === "house") {
    return 3 + (index % 4);
  }

  return 1 + (index % 4);
}

function getArea(index: number, propertyType: SeedListing["propertyType"]) {
  if (propertyType === "room") {
    return 16 + (index % 7) * 2;
  }

  if (propertyType === "house") {
    return 120 + (index % 6) * 22;
  }

  return 42 + (index % 7) * 8;
}

function getListingType(index: number): SeedListing["listingType"] {
  return index % 3 === 1 ? "sale" : "rent";
}

function getRentType(
  index: number,
  listingType: SeedListing["listingType"],
  propertyType: SeedListing["propertyType"]
): SeedListing["rentType"] {
  if (listingType === "sale") {
    return null;
  }

  if (propertyType === "room") {
    return "monthly";
  }

  return index % 7 === 0 ? "daily" : "monthly";
}

function getCurrency(index: number, listingType: SeedListing["listingType"]): SeedListing["currency"] {
  if (listingType === "sale") {
    return index % 2 === 0 ? "USD" : "UZS";
  }

  return index % 4 === 0 ? "UZS" : "USD";
}

function getPrice(input: {
  index: number;
  listingType: SeedListing["listingType"];
  currency: SeedListing["currency"];
  rentType: SeedListing["rentType"];
  propertyType: SeedListing["propertyType"];
  rooms: number;
}) {
  const { index, listingType, currency, rentType, propertyType, rooms } = input;

  if (listingType === "sale") {
    if (currency === "USD") {
      return 42000 + rooms * 9000 + index * 950;
    }

    return 520_000_000 + rooms * 115_000_000 + index * 8_500_000;
  }

  if (rentType === "daily") {
    if (currency === "USD") {
      return 28 + rooms * 9 + (index % 12) * 3;
    }

    return 320_000 + rooms * 95_000 + (index % 9) * 45_000;
  }

  if (currency === "USD") {
    return propertyType === "room"
      ? 140 + (index % 8) * 22
      : 280 + rooms * 110 + (index % 10) * 28;
  }

  return propertyType === "room"
    ? 1_700_000 + (index % 8) * 250_000
    : 3_400_000 + rooms * 850_000 + (index % 9) * 320_000;
}

function getStatus(index: number): SeedListing["status"] {
  if (index < 82) {
    return "APPROVED";
  }

  if (index < 94) {
    return "PENDING";
  }

  return "REJECTED";
}

function getTitle(input: {
  adjective: string;
  district: string;
  listingType: SeedListing["listingType"];
  propertyType: SeedListing["propertyType"];
  rooms: number;
  rentType: SeedListing["rentType"];
}) {
  const { adjective, district, listingType, propertyType, rooms, rentType } = input;
  const propertyLabel =
    propertyType === "flat" ? "flat" : propertyType === "house" ? "house" : "room";

  if (listingType === "sale") {
    return `${adjective} ${rooms}-room ${propertyLabel} for sale in ${district}`;
  }

  if (rentType === "daily") {
    return `${adjective} daily ${propertyLabel} stay in ${district}`;
  }

  return `${adjective} ${rooms}-room ${propertyLabel} for rent in ${district}`;
}

function getDescription(input: {
  district: string;
  region: string;
  listingType: SeedListing["listingType"];
  rentType: SeedListing["rentType"];
  propertyType: SeedListing["propertyType"];
  rooms: number;
  area: number;
}) {
  const { district, region, listingType, rentType, propertyType, rooms, area } = input;
  const propertyLabel =
    propertyType === "flat" ? "flat" : propertyType === "house" ? "house" : "room";
  const highlightPool = listingType === "sale" ? SALE_HIGHLIGHTS : RENT_HIGHLIGHTS;
  const highlight = highlightPool[(rooms + area) % highlightPool.length];
  const transactionText =
    listingType === "sale"
      ? "This sale option is"
      : rentType === "daily"
        ? "This short-stay option is"
        : "This rental option is";

  return `${transactionText} located in ${district}, ${region}, offering ${rooms} rooms and ${area} m² of space. The ${propertyLabel} is ${highlight}.`;
}

function getAddress(index: number, district: string) {
  const street = STREET_POOL[index % STREET_POOL.length];
  const number = 10 + ((index * 7) % 73);

  return `${street} ko'chasi, ${number} (${district})`;
}

function getImages(index: number) {
  const first = IMAGE_POOL[index % IMAGE_POOL.length];
  const second = IMAGE_POOL[(index + 3) % IMAGE_POOL.length];

  return {
    create:
      index % 2 === 0
        ? [{ url: first }, { url: second }]
        : [{ url: first }]
  };
}

function buildSeedListings() {
  const listings: SeedListing[] = [];
  let index = 0;

  while (listings.length < 100) {
    const regionSeed = REGION_SEEDS[index % REGION_SEEDS.length];
    const location =
      regionSeed.locations[
        Math.floor(index / REGION_SEEDS.length) % regionSeed.locations.length
      ];
    const listingType = getListingType(index);
    const propertyType = getPropertyType(index, listingType);
    const rooms = getRooms(index, propertyType);
    const area = getArea(index, propertyType);
    const rentType = getRentType(index, listingType, propertyType);
    const currency = getCurrency(index, listingType);
    const adjective = ADJECTIVE_POOL[index % ADJECTIVE_POOL.length];

    listings.push({
      title: getTitle({
        adjective,
        district: location.district,
        listingType,
        propertyType,
        rooms,
        rentType
      }),
      description: getDescription({
        district: location.district,
        region: regionSeed.region,
        listingType,
        rentType,
        propertyType,
        rooms,
        area
      }),
      price: getPrice({
        index,
        listingType,
        currency,
        rentType,
        propertyType,
        rooms
      }),
      listingType,
      currency,
      region: regionSeed.region,
      district: location.district,
      city: location.city,
      address: getAddress(index, location.district),
      rooms,
      area,
      propertyType,
      rentType,
      phone: `+99890${String(1234500 + index).padStart(7, "0")}`,
      telegramUsername: null,
      status: getStatus(index),
      images: getImages(index),
      userEmail: `owner${index + 1}@example.com`
    });

    index += 1;
  }

  return listings;
}

const seedListings = buildSeedListings();

async function main() {
  const sampleOwnerEmails = Array.from(
    new Set(
      seedListings
        .map((listing) => listing.userEmail)
        .filter((email): email is string => Boolean(email))
    )
  );

  const existingSampleOwners = await prisma.user.findMany({
    where: {
      email: {
        in: sampleOwnerEmails
      }
    },
    select: {
      id: true
    }
  });

  const existingSampleOwnerIds = existingSampleOwners.map((user) => user.id);
  const existingSampleListings =
    existingSampleOwnerIds.length > 0
      ? await prisma.listing.findMany({
          where: {
            userId: {
              in: existingSampleOwnerIds
            }
          },
          select: {
            id: true
          }
        })
      : [];

  const existingSampleListingIds = existingSampleListings.map((listing) => listing.id);
  const existingDemoUser = await prisma.user.findUnique({
    where: {
      email: "demo@uzbekistanrentals.uz"
    },
    select: {
      id: true
    }
  });

  await prisma.favoriteListing.deleteMany({
    where: {
      OR: [
        existingSampleListingIds.length > 0
          ? {
              listingId: {
                in: existingSampleListingIds
              }
            }
          : { id: "__no_sample_favorites__" },
        existingDemoUser
          ? {
              userId: existingDemoUser.id
            }
          : { id: "__no_demo_favorites__" }
      ]
    }
  });

  await prisma.listingView.deleteMany({
    where: {
      OR: [
        existingSampleListingIds.length > 0
          ? {
              listingId: {
                in: existingSampleListingIds
              }
            }
          : { id: "__no_sample_views__" },
        existingDemoUser
          ? {
              userId: existingDemoUser.id
            }
          : { id: "__no_demo_views__" }
      ]
    }
  });

  await prisma.listing.deleteMany({
    where: {
      userId: {
        in: existingSampleOwnerIds
      }
    }
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: sampleOwnerEmails
      }
    }
  });

  const userCache = new Map<string, string>();
  const approvedListingIds: string[] = [];

  const demoUser = {
    id: randomUUID(),
    email: "demo@uzbekistanrentals.uz",
    name: "Aziza Karimova"
  };

  const hashedDemoPassword = await hashPassword("Password123!");

  await prisma.user.upsert({
    where: {
      email: demoUser.email
    },
    update: {
      emailVerifiedAt: new Date(),
      name: demoUser.name,
      passwordHash: hashedDemoPassword,
      phone: "+998901118877",
      telegramUsername: "aziza_tashkent",
      preferredRegion: "Tashkent Region",
      preferredDistrict: "Nurafshan",
      preferredPropertyType: "flat",
      preferredRentType: "monthly",
      preferredMinPrice: 350,
      preferredMaxPrice: 700
    },
    create: {
      id: demoUser.id,
      email: demoUser.email,
      emailVerifiedAt: new Date(),
      name: demoUser.name,
      passwordHash: hashedDemoPassword,
      phone: "+998901118877",
      telegramUsername: "aziza_tashkent",
      preferredRegion: "Tashkent Region",
      preferredDistrict: "Nurafshan",
      preferredPropertyType: "flat",
      preferredRentType: "monthly",
      preferredMinPrice: 350,
      preferredMaxPrice: 700
    }
  });

  const freshDemoUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: demoUser.email
    },
    select: {
      id: true
    }
  });

  userCache.set(demoUser.email, freshDemoUser.id);

  for (const [index, listing] of seedListings.entries()) {
    let userId: string | undefined;

    if (listing.userEmail) {
      const existingUserId = userCache.get(listing.userEmail);

      if (existingUserId) {
        userId = existingUserId;
      } else {
        const user = await prisma.user.create({
          data: {
            email: listing.userEmail
          }
        });

        userId = user.id;
        userCache.set(listing.userEmail, user.id);
      }
    }

    const { userEmail, images, ...listingData } = listing;
    const listingId = randomUUID();
    const createdAt = new Date(Date.now() - index * 43_200_000);

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO "Listing" (
          "id",
          "title",
          "description",
          "price",
          "listingType",
          "currency",
          "region",
          "district",
          "city",
          "address",
          "rooms",
          "area",
          "propertyType",
          "rentType",
          "phone",
          "telegramUsername",
          "status",
          "createdAt",
          "updatedAt",
          "userId"
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          CAST($6 AS "Currency"),
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          CAST($13 AS "PropertyType"),
          CAST($14 AS "RentType"),
          $15,
          $16,
          CAST($17 AS "ListingStatus"),
          $18,
          $19,
          $20
        )
      `,
      listingId,
      listingData.title,
      listingData.description,
      listingData.price,
      listingData.listingType,
      listingData.currency,
      listingData.region,
      listingData.district,
      listingData.city,
      listingData.address,
      listingData.rooms,
      listingData.area,
      listingData.propertyType,
      listingData.rentType,
      listingData.phone,
      listingData.telegramUsername ?? null,
      listingData.status,
      createdAt,
      createdAt,
      userId ?? null
    );

    for (const image of images.create) {
      await prisma.$executeRaw`
        INSERT INTO "ListingImage" ("id", "url", "listingId")
        VALUES (${randomUUID()}, ${image.url}, ${listingId})
      `;
    }

    if (listingData.status === "APPROVED") {
      approvedListingIds.push(listingId);
    }
  }

  for (const listingId of approvedListingIds.slice(0, 3)) {
    await prisma.$executeRaw`
      INSERT INTO "FavoriteListing" ("id", "userId", "listingId", "createdAt")
      VALUES (${randomUUID()}, ${freshDemoUser.id}, ${listingId}, ${new Date()})
    `;
  }

  for (const listingId of approvedListingIds.slice(3, 8)) {
    await prisma.$executeRaw`
      INSERT INTO "ListingView" ("id", "userId", "listingId", "viewedAt")
      VALUES (${randomUUID()}, ${freshDemoUser.id}, ${listingId}, ${new Date()})
    `;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
