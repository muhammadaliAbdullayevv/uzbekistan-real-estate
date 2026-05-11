import { randomUUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();
const NURAFSHAN_LOCATION = {
  region: "Tashkent Region",
  district: "Nurafshan",
  city: "New Nurafshan"
} as const;

const TASHKENT_CITY_LOCATION = {
  region: "Tashkent City",
  district: "Chilonzor",
  city: "Bunyodkor"
} as const;

const SAMARKAND_LOCATION = {
  region: "Samarkand",
  district: "Samarkand",
  city: "Registan"
} as const;

const FERGANA_LOCATION = {
  region: "Fergana",
  district: "Fergana",
  city: "Margilan Road"
} as const;

const BUKHARA_LOCATION = {
  region: "Bukhara",
  district: "Bukhara",
  city: "Old City"
} as const;

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

const seedListings: Array<
  SeedListing
> = [
  {
    title: "Bright 2-room flat near Nurafshan Central Park",
    description:
      "A clean and sunny apartment with a renovated kitchen, balcony, and fast internet. Good for couples or professionals who want a central address and an easy walk to cafés, the park, and evening shops.",
    price: 520,
    listingType: "rent",
    currency: "USD",
    ...NURAFSHAN_LOCATION,
    address: "Mustaqillik ko'chasi, 17",
    rooms: 2,
    area: 68,
    propertyType: "flat",
    rentType: "monthly",
    phone: "+998901234501",
    telegramUsername: "park_flat_nr",
    status: "APPROVED",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
        },
        {
          url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner1@example.com"
  },
  {
    title: "Family house with courtyard in Yangi Nurafshan",
    description:
      "Quiet street, private courtyard, summer kitchen, and indoor parking for one car. Strong fit for families who want to buy a move-in-ready home close to schools and daily shopping.",
    price: 128000,
    listingType: "sale",
    currency: "USD",
    ...NURAFSHAN_LOCATION,
    address: "Yangi Hayot ko'chasi, 41",
    rooms: 4,
    area: 150,
    propertyType: "house",
    rentType: null,
    phone: "+998901234502",
    telegramUsername: "courtyard_nurafshan",
    status: "APPROVED",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80"
        },
        {
          url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner2@example.com"
  },
  {
    title: "Compact room near Nurafshan Pedagogical College",
    description:
      "Budget-friendly room with shared kitchen and bathroom, close to study routes and supermarkets. Best for one student or junior employee who wants a simple, clean base.",
    price: 180,
    listingType: "rent",
    currency: "USD",
    ...NURAFSHAN_LOCATION,
    address: "Talabalar ko'chasi, 8",
    rooms: 1,
    area: 18,
    propertyType: "room",
    rentType: "monthly",
    phone: "+998901234503",
    telegramUsername: "college_room_nr",
    status: "APPROVED",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner3@example.com"
  },
  {
    title: "Daily studio by Nurafshan Eco Park",
    description:
      "Modern studio with hotel-style linens, smart TV, and self check-in. Convenient for short visits, family arrivals, and business travel around the region.",
    price: 42,
    listingType: "rent",
    currency: "USD",
    ...NURAFSHAN_LOCATION,
    address: "Eco Park avenue, 6",
    rooms: 1,
    area: 44,
    propertyType: "flat",
    rentType: "daily",
    phone: "+998901234504",
    telegramUsername: "ecopark_daily",
    status: "APPROVED",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
        },
        {
          url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner4@example.com"
  },
  {
    title: "Renovated 2-room flat near Chilonzor metro",
    description:
      "Fresh renovation, warm flooring, and a separate bedroom with strong natural light. A good sale option near metro access, banks, and grocery stores.",
    price: 85000,
    listingType: "sale",
    currency: "USD",
    ...TASHKENT_CITY_LOCATION,
    address: "Bunyodkor shoh ko'chasi, 28",
    rooms: 2,
    area: 72,
    propertyType: "flat",
    rentType: null,
    phone: "+998901234505",
    telegramUsername: "hokimiyat_flat",
    status: "APPROVED",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner5@example.com"
  },
  {
    title: "3-room flat with parking near Samarkand Boulevard",
    description:
      "Well-kept apartment with elevator access, open living room, and secure parking. Suitable for families who want a newer building and clean shared spaces.",
    price: 720,
    listingType: "rent",
    currency: "USD",
    ...SAMARKAND_LOCATION,
    address: "Universitet xiyoboni, 13",
    rooms: 3,
    area: 88,
    propertyType: "flat",
    rentType: "monthly",
    phone: "+998901234506",
    telegramUsername: "boulevard_home",
    status: "APPROVED",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
        },
        {
          url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner6@example.com"
  },
  {
    title: "Affordable room near the taxi stand",
    description:
      "A tidy room in a calm neighborhood with wardrobe space and quick access to local transport. The owner prefers clean, long-term tenants and keeps utility costs predictable.",
    price: 2500000,
    listingType: "rent",
    currency: "UZS",
    ...NURAFSHAN_LOCATION,
    address: "Navbahor ko'chasi, 21",
    rooms: 1,
    area: 16,
    propertyType: "room",
    rentType: "monthly",
    phone: "+998901234507",
    telegramUsername: null,
    status: "APPROVED",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner7@example.com"
  },
  {
    title: "Large house for daily stays near the reservoir road",
    description:
      "A spacious house prepared for short family visits, events, and regional guests. Includes a large dining space, private entrance, and easy car access from the main road.",
    price: 1400000,
    listingType: "rent",
    currency: "UZS",
    ...NURAFSHAN_LOCATION,
    address: "Sohil yo'li, 5",
    rooms: 5,
    area: 210,
    propertyType: "house",
    rentType: "daily",
    phone: "+998901234508",
    telegramUsername: "nurafshan_guest_house",
    status: "APPROVED",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner8@example.com"
  },
  {
    title: "Modern flat with balcony, no agency fee in Fergana",
    description:
      "Comfortable apartment with AC, washing machine, dedicated work desk, and balcony. No agency fee, direct owner deal, and a clean entrance lobby.",
    price: 480,
    listingType: "rent",
    currency: "USD",
    ...FERGANA_LOCATION,
    address: "Marg'ilon yo'li, 54",
    rooms: 2,
    area: 60,
    propertyType: "flat",
    rentType: "monthly",
    phone: "+998901234509",
    telegramUsername: "balcony_no_fee",
    status: "APPROVED",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
        },
        {
          url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner9@example.com"
  },
  {
    title: "Starter flat with fresh renovation in New Nurafshan",
    description:
      "A practical option for tenants who want a newer building and an easy move-in. Furnished, bright, and suited to first-time renters or young couples.",
    price: 430,
    listingType: "rent",
    currency: "USD",
    ...NURAFSHAN_LOCATION,
    address: "Yoshlik ko'chasi, 19",
    rooms: 2,
    area: 58,
    propertyType: "flat",
    rentType: "monthly",
    phone: "+998901234510",
    telegramUsername: "starter_flat_nr",
    status: "APPROVED",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner10@example.com"
  },
  {
    title: "Family flat near School 17 and new clinic in Bukhara",
    description:
      "Bright family apartment with a practical layout, closed balcony, and storage space. Strong fit for buyers who want schools, healthcare, and groceries within a short walk.",
    price: 970000000,
    listingType: "sale",
    currency: "UZS",
    ...BUKHARA_LOCATION,
    address: "Istiqlol ko'chasi, 12",
    rooms: 3,
    area: 84,
    propertyType: "flat",
    rentType: null,
    phone: "+998901234511",
    telegramUsername: "school17_flat",
    status: "APPROVED",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
        },
        {
          url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner11@example.com"
  },
  {
    title: "Cozy flat near Nurafshan market",
    description:
      "Submitted for moderation. Neat one-bedroom apartment with updated appliances and a short walk to the market and bus stop.",
    price: 510,
    listingType: "rent",
    currency: "USD",
    ...NURAFSHAN_LOCATION,
    address: "Bozor ko'chasi, 10",
    rooms: 2,
    area: 62,
    propertyType: "flat",
    rentType: "monthly",
    phone: "+998901234512",
    telegramUsername: "pending_market_flat",
    status: "PENDING",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner12@example.com"
  },
  {
    title: "Compact flat near the bus depot",
    description:
      "Sale listing on a busy connection road with a practical plan, balcony, and quick transport access.",
    price: 410000000,
    listingType: "sale",
    currency: "UZS",
    ...NURAFSHAN_LOCATION,
    address: "Avtovokzal yo'li, 3",
    rooms: 2,
    area: 55,
    propertyType: "flat",
    rentType: null,
    phone: "+998901234513",
    telegramUsername: null,
    status: "REJECTED",
    images: {
      create: [
        {
          url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },
    userEmail: "owner13@example.com"
  }
];

async function main() {
  await prisma.$executeRawUnsafe('DELETE FROM "FavoriteListing"');
  await prisma.$executeRawUnsafe('DELETE FROM "ListingView"');
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const userCache = new Map<string, string>();
  const createdListings = new Map<string, string>();

  const demoUser = {
    id: randomUUID(),
    email: "demo@uzbekistanrentals.uz",
    name: "Aziza Karimova"
  };

  await prisma.$executeRaw`
    INSERT INTO "User" (
      "id",
      "email",
      "emailVerifiedAt",
      "name",
      "passwordHash",
      "phone",
      "telegramUsername",
      "preferredRegion",
      "preferredDistrict",
      "preferredPropertyType",
      "preferredRentType",
      "preferredMinPrice",
      "preferredMaxPrice",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${demoUser.id},
      ${demoUser.email},
      ${new Date()},
      ${demoUser.name},
      ${await hashPassword("Password123!")},
      ${"+998901118877"},
      ${"aziza_tashkent"},
      ${NURAFSHAN_LOCATION.region},
      ${NURAFSHAN_LOCATION.district},
      CAST(${"flat"} AS "PropertyType"),
      CAST(${"monthly"} AS "RentType"),
      ${350},
      ${700},
      ${new Date()},
      ${new Date()}
    )
  `;

  userCache.set(demoUser.email, demoUser.id);

  for (const listing of seedListings) {
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
    const createdAt = new Date();

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

    createdListings.set(listingData.title, listingId);
  }

  const favoriteTitles = [
    "Bright 2-room flat near Nurafshan Central Park",
    "Renovated 2-room flat near Chilonzor metro",
    "Modern flat with balcony, no agency fee in Fergana"
  ];

  for (const title of favoriteTitles) {
    const listingId = createdListings.get(title);

    if (!listingId) {
      continue;
    }

    await prisma.$executeRaw`
      INSERT INTO "FavoriteListing" ("id", "userId", "listingId", "createdAt")
      VALUES (${randomUUID()}, ${demoUser.id}, ${listingId}, ${new Date()})
    `;
  }

  const viewedTitles = [
    "Bright 2-room flat near Nurafshan Central Park",
    "3-room flat with parking near Samarkand Boulevard",
    "Starter flat with fresh renovation in New Nurafshan",
    "Modern flat with balcony, no agency fee in Fergana",
    "Daily studio by Nurafshan Eco Park"
  ];

  for (const title of viewedTitles) {
    const listingId = createdListings.get(title);

    if (!listingId) {
      continue;
    }

    await prisma.$executeRaw`
      INSERT INTO "ListingView" ("id", "userId", "listingId", "viewedAt")
      VALUES (${randomUUID()}, ${demoUser.id}, ${listingId}, ${new Date()})
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
