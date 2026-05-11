import { cookies } from "next/headers";

export const LOCALE_COOKIE_NAME = "site-locale";
export const LOCALES = ["uz", "ru"] as const;

export type Locale = (typeof LOCALES)[number];
type PropertyType = "flat" | "house" | "room";
type RentType = "monthly" | "daily";
type ListingStatus = "PENDING" | "APPROVED" | "REJECTED";
type ListingAvailabilityStatus = "ACTIVE" | "RENTED" | "SOLD";
type UserStatus = "ACTIVE" | "BLOCKED";

const DEFAULT_LOCALE: Locale = "uz";

const translations = {
  uz: {
    meta: {
      siteDescription:
        "O‘zbekiston bo‘ylab ijaraga olish yoki sotib olish uchun tasdiqlangan kvartira, uy va xonalarni ko‘ring."
    },
    language: {
      label: "Til",
      uz: "O‘zbekcha",
      ru: "Русский"
    },
    nav: {
      menu: "Menyu",
      rentals: "Ijara",
      addListing: "E'lon qo'shish",
      saved: "Saqlanganlar",
      account: "Kabinet",
      owner: "Egasi",
      login: "Kirish",
      register: "Ro'yxatdan o'tish"
    },
    footer: {
      summary:
        "Tasdiqlangan e'lonlar, aniq narxlar va to'g'ridan-to'g'ri egasi bilan aloqa {location} bo'ylab bir joyda.",
      about: "Loyiha haqida",
      contact: "Aloqa",
      privacy: "Maxfiylik",
      terms: "Shartlar"
    },
    location: {
      primary: "O‘zbekiston"
    },
    enums: {
      listingTypes: {
        rent: "Ijara",
        sale: "Sotuv"
      } satisfies Record<"rent" | "sale", string>,
      propertyTypes: {
        flat: "Kvartira",
        house: "Hovli",
        room: "Xona"
      } satisfies Record<PropertyType, string>,
      rentTypes: {
        monthly: "Oylik",
        daily: "Kunlik"
      } satisfies Record<RentType, string>,
      listingStatuses: {
        PENDING: "Ko'rib chiqilmoqda",
        APPROVED: "Tasdiqlangan",
        REJECTED: "Rad etilgan"
      } satisfies Record<ListingStatus, string>,
      listingAvailabilityStatuses: {
        ACTIVE: "Faol",
        RENTED: "Ijaraga berilgan",
        SOLD: "Sotilgan"
      } satisfies Record<ListingAvailabilityStatus, string>,
      userStatuses: {
        ACTIVE: "Faol",
        BLOCKED: "Bloklangan"
      } satisfies Record<UserStatus, string>
    },
    common: {
      noResults: "Natija yo'q",
      roomsShort: "xona",
      perMonth: "/oy",
      perDay: "/kun",
      adminReviewed: "Admin ko'rib chiqqan",
      verifiedOwner: "Tasdiqlangan egasi",
      noAgencyFee: "Vositachisiz",
      viewDetails: "Batafsil",
      contactOwner: "Egasi bilan bog'lanish",
      backToListings: "E'lonlarga qaytish",
      location: "Joylashuv",
      listingType: "E’lon turi",
      region: "Viloyat",
      district: "Tuman yoki shahar",
      cityNeighborhood: "Mahalla yoki mo'ljal",
      address: "Manzil",
      rooms: "Xonalar",
      area: "Maydon",
      propertyType: "Uy turi",
      rentType: "Ijara turi",
      phone: "Telefon",
      created: "Joylangan sana",
      logInToView: "Ko'rish uchun kiring",
      logInToContact: "Kirish orqali egasi bilan bog‘laning",
      overview: "Umumiy ma'lumot",
      fullDescription: "To'liq tavsif",
      save: "Saqlash",
      saved: "Saqlangan",
      saveListing: "E'lonni saqlash",
      removeFromSaved: "Saqlanganlardan olib tashlash",
      submit: "Yuborish",
      removeImage: "Rasmni olib tashlash",
      placeholderPreview: "Namunaviy ko'rinish",
      search: "Qidirish",
      signOut: "Chiqish",
      joinDatePrefix: "Qo'shilgan",
      owner: "Egasi",
      propertyInfo: "Uy haqida",
      ownerContact: "Egasi bilan aloqa",
      forRentIndicator: "Ijaraga beriladi",
      forSaleIndicator: "Sotuvda",
      active: "Faol",
      rented: "Ijaraga berilgan",
      sold: "Sotilgan"
    },
    home: {
      title: "O‘zbekiston bo‘ylab uy-joy toping",
      subtitle:
        "Ijaraga olish yoki sotib olish uchun kvartira, uy va xonalarni oson qidiring.",
      resultsFound: "{count} ta e'lon topildi",
      resultsNote: "Faqat tasdiqlangan e'lonlar. Egalar bilan to'g'ridan-to'g'ri bog'laning.",
      emptyTitle: "Bu filtrlarga mos ijara topilmadi",
      emptyDescription:
        "Narx oralig'ini kengaytiring, xona sonini tozalang yoki boshqa ko'cha va mo'ljalni qidiring."
    },
    search: {
      searchLabel: "Qidiruv",
      searchPlaceholder: "Masalan: Chilonzor, Samarqand, Buxoro...",
      region: "Viloyat",
      districtCity: "Tuman / shahar",
      districtCityPlaceholder: "Masalan: Chilonzor, Nurafshon, Registon",
      searchButton: "Qidirish",
      moreFilters: "Ko‘proq filtrlar",
      popularAreas: "Mashhur hududlar:",
      allListingTypes: "Barchasi",
      minPrice: "Min narx",
      maxPrice: "Max narx",
      rooms: "Xonalar",
      propertyType: "Uy turi",
      currency: "Valyuta",
      sort: "Saralash",
      noMinimum: "Cheklovsiz",
      noMaximum: "Cheklovsiz",
      any: "Istalgan",
      allRegions: "Barcha viloyatlar",
      allTypes: "Barcha turlar",
      allCurrencies: "Barcha valyutalar",
      newest: "Yangi",
      priceAsc: "Narx: arzondan qimmatga",
      priceDesc: "Narx: qimmatdan arzonga"
    },
    listingDetail: {
      revealContact: "Kirish orqali egasi bilan bog‘laning.",
      listingNotFound: "E'lon topilmadi"
    },
    auth: {
      loginPill: "Foydalanuvchi kirishi",
      loginTitle: "Kirish",
      loginDescription:
        "Saqlanganlarni boshqarish, tavsiyalar olish va ijara afzalliklarini bir joyda saqlash uchun kiring.",
      email: "Email",
      password: "Parol",
      phoneOptional: "Telefon raqami (ixtiyoriy)",
      confirmPassword: "Parolni tasdiqlang",
      confirmPasswordPlaceholder: "Parolni qayta kiriting",
      passwordMismatch: "Parollar mos kelmaydi.",
      rateLimited:
        "Juda ko‘p urinish. 10 daqiqadan keyin qayta urinib ko‘ring yoki biroz kuting.",
      enterPassword: "Parolingizni kiriting",
      logIn: "Kirish",
      noAccountYet: "Hisobingiz yo‘qmi?",
      createOne: "Ro‘yxatdan o‘tish",
      blocked: "Hisobingiz bloklangan.",
      invalidLogin: "Email yoki parol noto‘g‘ri.",
      verifyEmail: "Email manzilingizni tasdiqlang, keyin kiring.",
      verifiedSuccess: "Email muvaffaqiyatli tasdiqlandi. Endi kirishingiz mumkin.",
      registeredSuccess: "Hisob yaratildi. Endi kirishingiz mumkin.",
      passwordResetSuccess: "Parol yangilandi. Endi yangi parol bilan kiring.",
      registerPill: "Ro‘yxatdan o‘tish",
      registerTitle: "Ro‘yxatdan o‘tish",
      registerDescription:
        "Saqlanganlar ro'yxatini tuzish, yaqinda ko'rilganlarni saqlash va O‘zbekiston bo‘yicha tavsiyalar olish uchun hisob yarating.",
      fullName: "To'liq ism",
      createAccount: "Hisob yaratish",
      alreadyRegistered: "Hisobingiz bormi?",
      accountExists: "Bu email bilan hisob allaqachon mavjud.",
      passwordTooShort: "Parol kamida 8 ta belgidan iborat bo'lishi kerak.",
      fillFormCorrectly: "Formani to'g'ri to'ldiring.",
      strongPasswordPlaceholder: "Kamida 8 ta belgi",
      noAccountNamePlaceholder: "Aziza Karimova",
      showPassword: "Ko‘rsatish",
      hidePassword: "Yashirish",
      showPasswordAria: "Parolni ko‘rsatish",
      hidePasswordAria: "Parolni yashirish",
      acceptTermsPrefix: "Men ",
      acceptTermsPrivacy: "Maxfiylik siyosati",
      acceptTermsMiddle: " va ",
      acceptTermsTerms: "Shartlarga",
      acceptTermsSuffix: " roziman",
      termsRequired: "Davom etish uchun Maxfiylik siyosati va Shartlarga rozilik bildiring.",
      featurePrimaryTitle: "Bir akkaunt, bitta ritm",
      featurePrimaryCopy: "Saqlanganlar, egasi bilan aloqa va e’lonlaringiz bir joyda boshqariladi.",
      featureSecurityTitle: "Xavfsiz kirish",
      featureSecurityCopy: "Sessiyalar bazada saqlanadi va kerak bo‘lsa tezda bekor qilinadi.",
      featureSavedTitle: "Tezkor qaytish",
      featureSavedCopy: "Kirishdan so‘ng saqlangan e’lonlar va ko‘rilgan uylar siz bilan qoladi.",
      recoveryFeatureTitle: "Xavfsiz tiklash",
      recoveryFeatureCopy: "Parolni yangilash havolasi faqat bitta akkaunt sessiyasini qayta tiklash uchun ishlatiladi.",
      recoverySupportTitle: "Tezkor davom etish",
      recoverySupportCopy: "Emailga yuborilgan havola orqali yangi parol o‘rnatib, akkauntingizga yana tezda qaytasiz.",
      forgotPassword: "Parolni unutdingizmi?",
      forgotPasswordTitle: "Parolni tiklash",
      forgotPasswordDescription:
        "Emailingizni kiriting. Agar akkaunt mavjud bo'lsa, parolni yangilash havolasini yuboramiz.",
      sendResetLink: "Tiklash havolasini yuborish",
      forgotPasswordSent:
        "Agar akkaunt mavjud bo'lsa, parolni tiklash bo'yicha ko'rsatmalar emailingizga yuborildi.",
      forgotPasswordDeliveryError:
        "Tiklash xatini hozir yuborib bo‘lmadi. Iltimos, birozdan keyin qayta urinib ko‘ring.",
      resetPasswordTitle: "Yangi parol o'rnating",
      resetPasswordDescription:
        "Akkauntingiz uchun yangi parol tanlang. Havola faqat bir marta ishlaydi.",
      resetPassword: "Parolni yangilash",
      invalidOrExpiredToken: "Havola yaroqsiz yoki muddati tugagan.",
      passwordResetEmailSubject: "Uzbekistan Rentals parolini tiklash",
      passwordResetEmailEyebrow: "Parolni tiklash",
      passwordResetEmailTitle: "Yangi parol tanlang",
      passwordResetEmailIntro:
        "Uzbekistan Rentals akkauntingiz uchun parolni tiklash so‘rovi oldik. Yangi parol o‘rnatish uchun quyidagi tugmadan foydalaning.",
      passwordResetEmailAction: "Parolni yangilash",
      passwordResetEmailNote:
        "Ushbu havola 60 daqiqa davomida amal qiladi va faqat bir marta ishlatiladi. Agar siz parolni tiklashni so‘ramagan bo‘lsangiz, bu xatni e’tiborsiz qoldirishingiz mumkin.",
      passwordResetEmailFooter:
        "Bu xat Uzbekistan Rentals akkauntingiz uchun parolni tiklash so‘rovi yuborilgani sababli jo‘natildi.",
      emailFallbackTitle: "Tugma ishlamasa-chi?",
      emailFallbackCopy: "Quyidagi havolani nusxalab brauzeringizda oching:",
      verifyEmailTitle: "Emailni tasdiqlang",
      verifyEmailDescription:
        "Ro'yxatdan o'tishni yakunlash uchun emailga yuborilgan havolani oching.",
      verifyEmailSent:
        "Tasdiqlash havolasi yuborildi. Emailni tekshiring va tasdiqlagach kiring.",
      verifyEmailInvalid: "Tasdiqlash havolasi yaroqsiz yoki muddati tugagan.",
      resendVerification: "Tasdiqlash havolasini qayta yuborish",
      resendVerificationSent:
        "Agar tasdiqlanmagan akkaunt mavjud bo'lsa, yangi tasdiqlash havolasi yuborildi."
    },
    account: {
      pill: "Mening kabinetim",
      title: "Mening kabinetim",
      memberSince: "Ro‘yxatdan o‘tgan sana:",
      intro:
        "E’lonlaringiz, saqlangan uy-joylaringiz va hisob xavfsizligini bir joyda boshqaring.",
      loggedInAs: "Kirish qilingan email",
      quickActions: "Tezkor amallar",
      security: "Xavfsizlik",
      securityTitle: "Hisob xavfsizligi",
      securityDescription:
        "Faol sessiyalarni kuzating va kerak bo‘lsa boshqa qurilmalardagi kirishlarni yakunlang.",
      openFavorites: "Saqlanganlar",
      trackListings: "E'lonlarim",
      submitListing: "E'lon yuborish",
      manageSessions: "Sessiyalarni boshqarish",
      overview: "Kabinet",
      overviewTitle: "Kabinet bo‘limlari",
      overviewDescription:
        "Bu yerda e’lonlaringiz, saqlangan uy-joylar va hisob xavfsizligiga oid asosiy bo‘limlar jamlangan.",
      myListingsTitle: "Yuborgan e’lonlaringiz",
      myListingsDescription:
        "E’lonlaringiz holatini kuzating, kerak bo‘lsa tahrirlang va bozordagi statusini boshqaring.",
      savedTitle: "Saqlangan uy-joylar",
      savedListingsDescription:
        "Keyinroq ko‘rmoqchi bo‘lgan uy-joylarni bir joyda oching va qulay tarzda taqqoslang.",
      recentTitle: "Yaqinda ko‘rilganlar",
      recentlyViewedDescription:
        "Oxirgi ochilgan e’lonlar pastdagi bo‘limda ko‘rinadi, shu yerda esa kabinetning umumiy ko‘rinishi beriladi.",
      name: "Ism",
      phone: "Telefon",
      favorites: "Saqlanganlar",
      savedListings: "Saqlangan e'lonlar",
      noFavoritesTitle: "Hozircha saqlangan e’lon yo‘q",
      noFavorites:
        "Yoqtirgan uy-joylaringizni keyinroq ko‘rish uchun saqlab qo‘ying.",
      recentActivity: "So'nggi faollik",
      recentlyViewed: "Yaqinda ko'rilganlar",
      noRecentViewsTitle: "Hozircha ko‘rilgan e’lon yo‘q",
      noRecentViews: "E’lon sahifalarini ochganingizda ular shu yerda paydo bo‘ladi."
    },
    addListing: {
      pill: "Uy-joy e'loni yuborish",
      title: "Uy-joy e’lonini joylashtirish",
      intro: "Ijaraga berish yoki sotish uchun e’lon yuboring.",
      editTitle: "Uy-joy e’lonini tahrirlash",
      editIntro: "E’lon tafsilotlarini yangilang va bozor holatini boshqaring.",
      tips:
        "Aniq sarlavha, haqiqiy manzil, to'g'ri narx va ishlaydigan telefon raqamini kiriting. Yuklangan rasmlar xavfsiz saqlanadi va tasdiqlangach e'londa ko'rsatiladi.",
      locationOnly:
        "Bu sayt O‘zbekiston bo‘ylab e’lonlarni qabul qiladi. E’lon akkauntingizga avtomatik biriktiriladi va saqlangan aloqa ma’lumotlari bu yerga to‘ldiriladi.",
      success: "E'loningiz yuborildi va tasdiqlanishni kutmoqda.",
      form: {
        listingType: "E’lon turi",
        listingTypeRent: "Ijaradagi uylar",
        listingTypeSale: "Sotuvdagi uylar",
        title: "Sarlavha",
        titlePlaceholder: "Masalan: Minor metrosi yaqinida yorug' 2 xonali kvartira",
        description: "Tavsif",
        descriptionPlaceholder:
          "Kvartira, yaqin atrof, mebel, ta'mir va kimlar uchun mosligini yozing.",
        rentPrice: "Ijara narxi",
        salePrice: "Sotuv narxi",
        currency: "Valyuta",
        region: "Viloyat",
        districtCity: "Tuman yoki shahar",
        districtCityPlaceholder: "Masalan: Chilonzor yoki Nurafshon",
        cityNeighborhood: "Mahalla yoki mo'ljal",
        cityNeighborhoodPlaceholder: "Masalan: Yangiobod dahasi",
        address: "Manzil",
        addressPlaceholder: "Ko'cha, uy raqami",
        rooms: "Xonalar",
        area: "Maydon (m²)",
        propertyType: "Uy turi",
        rentType: "Ijara turi",
        phone: "Telefon raqami",
        images: "Rasmlar",
        uploadNote: "10 tagacha rasm yuklang. Yuklamasangiz, standart rasm ishlatiladi.",
        submit: "E'lonni yuborish",
        submitting: "E'lon yuborilmoqda...",
        uploading: "Rasmlar yuklanmoqda...",
        uploadPreviewAlt: "E'lon ko'rinishi",
        uploadFailed: "Rasm yuklashda xatolik yuz berdi.",
        uploadUnable: "Rasmlarni yuklab bo'lmadi.",
        submitUnable: "E'lonni yuborib bo'lmadi.",
        updateSubmit: "E'lonni yangilash",
        updating: "E'lon yangilanmoqda..."
      }
    },
    favoritesPage: {
      pill: "Saqlanganlar",
      title: "Saqlangan ijaralar",
      intro:
        "Narxlar, reja va aloqa variantlarini taqqoslayotganingizda qisqa ro'yxatni shu yerda saqlang.",
      browseMore: "Yana e'lonlarni ko'rish",
      emptyTitle: "Hozircha saqlangan ijara yo'q",
      emptyDescription:
        "Qisqa ro'yxat tuzish uchun kartalar yoki batafsil sahifalarda Saqlash tugmasidan foydalaning."
    },
    myListings: {
      pill: "Mening e'lonlarim",
      title: "Yuborganlaringizni kuzating",
      intro:
        "Har bir yangi e'lon avval kutish holatida bo'ladi. Admin tasdiqlagach, ommaviy e'lon sahifasi avtomatik ochiladi.",
      submitAnother: "Yana e'lon yuborish",
      total: "Jami",
      pending: "Kutilmoqda",
      approved: "Tasdiqlangan",
      inactive: "Bozordan olingan",
      updated: "E'lon yangilandi.",
      deleted: "E'lon o'chirildi.",
      statusUpdated: "E'lon holati yangilandi.",
      emptyTitle: "Hali e'lon yubormagansiz",
      emptyDescription:
        "Birinchi kvartira, xona yoki hovli e'loningizni admin ko'rib chiqishi uchun Add Listing sahifasidan yuboring."
    },
    userListingCard: {
      statusCopy: {
        PENDING: "E'lon admin tasdiqlamaguncha yopiq turadi.",
        APPROVED: "E'lon ommaviy bozorda ko'rinadi.",
        REJECTED: "E'lon ommaviy qidiruv natijalarida yashirin qoladi."
      } satisfies Record<ListingStatus, string>,
      offMarketStatusCopy:
        "E'lon tasdiqlangan, ammo hozir bozor ro'yxatidan olingan. Uni qayta faollashtirsangiz, ommaviy sahifaga qaytadi.",
      createdPrefix: "Joylangan",
      viewPublicPage: "Ochiq sahifani ko'rish",
      awaitingPublicLink: "Ommaviy havola kutilmoqda",
      offMarketPublicLink: "Hozircha ommaviy ko'rinmaydi",
      edit: "Tahrirlash",
      delete: "O'chirish",
      deleting: "O'chirilmoqda...",
      updating: "Yangilanmoqda...",
      deleteConfirm: "Bu e'lonni o'chirishni tasdiqlaysizmi?",
      markRentedConfirm: "E'lonni ijaraga berilgan deb belgilaysizmi?",
      markSoldConfirm: "E'lonni sotilgan deb belgilaysizmi?",
      markActiveConfirm: "E'lonni qayta faol holatga qaytarasizmi?",
      markRented: "Ijaraga berildi deb belgilash",
      markSold: "Sotildi deb belgilash",
      markActive: "Qayta faollashtirish"
    },
    owner: {
      dashboardPill: "Egasi paneli",
      title: "Kutayotgan e'lonlar",
      intro:
        "Yuborilgan uy-joy e'lonlarini ommaga chiqishidan oldin ko'rib chiqing va tasdiqlang yoki rad eting.",
      emptyTitle: "Kutayotgan e'lonlar yo'q",
      emptyDescription: "Yangi yuborilgan e'lonlar ommaga chiqishidan oldin shu yerda paydo bo'ladi.",
      controlsPill: "Egasi boshqaruvi",
      manageUsers: "Foydalanuvchilarni boshqarish",
      manageUsersIntro:
        "Email bo'yicha qidiring va akkauntlarni egasi panelidan bloklang yoki blokdan chiqaring.",
      userUpdated: "Foydalanuvchi holati yangilandi.",
      ownerProtected: "Egasi akkauntini bloklab bo'lmaydi.",
      invalidAction: "So'ralgan amal qabul qilinmadi.",
      notFound: "Bunday foydalanuvchi topilmadi.",
      searchPlaceholder: "Email bo'yicha qidiring",
      searchButton: "Qidirish",
      searchHint: "Akkauntni bloklash yoki blokdan chiqarish uchun foydalanuvchi emailini qidiring.",
      noUsersTitle: "Foydalanuvchi topilmadi",
      noUsersDescription: "To'liqroq email kiriting yoki kengroq qidiruv qiling.",
      ownerProtectedText: "Egasi akkaunti bloklanishdan himoyalangan.",
      joined: "Qo'shilgan",
      blockUser: "Foydalanuvchini bloklash",
      unblockUser: "Foydalanuvchini blokdan chiqarish",
      approve: "Tasdiqlash",
      reject: "Rad etish"
    },
    about: {
      eyebrow: "Loyiha haqida",
      title: "Loyiha haqida",
      body1:
        "{name} - {location} bo'ylab kvartira, uy va xonalarni ijaraga olish yoki sotib olish uchun moderatsiyadan o'tgan bozor.",
      body2:
        "Har bir e'lon moderatsiyadan o'tadi, narxlar ochiq ko'rsatiladi va foydalanuvchilar egalar bilan to'g'ridan-to'g'ri bog'lanadi."
    },
    contact: {
      eyebrow: "Aloqa",
      title: "Jamoa bilan bog'lanish",
      intro: "Akkaunt muammolari, moderatsiya savollari yoki e'lon tuzatishlari uchun yozing:",
      note:
        "Ijara kartalaridagi aloqa tugmalari sayt jamoasiga emas, bevosita uy egasiga olib boradi."
    },
    privacy: {
      eyebrow: "Maxfiylik",
      title: "Maxfiylik siyosati",
      body1:
        "Biz akkaunt yaratish, e'lonlarni boshqarish, saqlanganlar, parolni tiklash va emailni tasdiqlash uchun zarur bo'lgan ma'lumotlarni saqlaymiz.",
      body2:
        "Yuklangan rasmlar bulutli media saqlashga yuboriladi, akkaunt sessiyalari va moderatsiya holatlari esa PostgreSQL da saqlanadi.",
      body3:
        "Telefon raqamlari faqat tizimga kirgan foydalanuvchilarga ko'rsatiladi. Xizmat ma'lumotlarni xavfsizlik, xizmat sifati va qonuniy majburiyatlar uchun qayta ishlaydi."
    },
    terms: {
      eyebrow: "Shartlar",
      title: "Foydalanish shartlari",
      body1:
        "Foydalanuvchilar joylangan e'lonlar, narxlar, rasmlar va aloqa ma'lumotlarining to'g'riligi uchun javobgar.",
      body2:
        "Platforma chalg'ituvchi, takroriy, haqoratomuz yoki noqonuniy e'lonlarni rad etish, yashirish yoki o'chirish huquqini o'zida saqlaydi.",
      body3:
        "Sayt agentlik, broker yoki to'lov vositachisi emas. Bitimlar va tekshiruvlar xaridor, ijarachi va mulk egasi zimmasida qoladi."
    },
    notFound: {
      title: "E'lon topilmadi",
      description: "E'lon o'chirilgan bo'lishi yoki hali admin tasdig'ini kutayotgan bo'lishi mumkin.",
      returnHome: "Bosh sahifaga qaytish"
    },
    api: {
      loginRequired: "Tizimga kirish talab qilinadi.",
      loginToSubmitListing: "E'lon yuborish uchun kiring.",
      invalidListingPayload: "E'lon ma'lumotlari noto'g'ri.",
      listingSubmitted: "E'loningiz yuborildi va tasdiqlanishni kutmoqda.",
      unableToSaveListing: "E'lonni saqlab bo'lmadi.",
      loginToUploadImages: "Rasm yuklash uchun kiring.",
      noImageProvided: "Rasm fayli topilmadi.",
      onlyImagesAllowed: "Faqat rasm fayllarini yuklash mumkin.",
      imageTooLarge: "Har bir rasm 8 MB dan kichik bo'lishi kerak.",
      cloudUploadNotConfigured:
        "Ommaviy muhit uchun rasm bulutli saqlash xizmati sozlanmagan. Iltimos, Supabase Storage yoki Cloudinary kalitlarini kiriting.",
      unableToUploadImage: "Rasmni yuklab bo'lmadi."
    }
  },
  ru: {
    meta: {
      siteDescription:
        "Смотрите проверенные квартиры, дома и комнаты по всему Узбекистану для аренды или покупки."
    },
    language: {
      label: "Язык",
      uz: "O‘zbekcha",
      ru: "Русский"
    },
    nav: {
      menu: "Меню",
      rentals: "Аренда",
      addListing: "Добавить объявление",
      saved: "Сохранённое",
      account: "Кабинет",
      owner: "Владелец",
      login: "Войти",
      register: "Регистрация"
    },
    footer: {
      summary:
        "Одобренные объявления, понятные цены и прямой контакт с владельцем по всему {location}.",
      about: "О проекте",
      contact: "Контакты",
      privacy: "Конфиденциальность",
      terms: "Условия"
    },
    location: {
      primary: "Узбекистан"
    },
    enums: {
      listingTypes: {
        rent: "Аренда",
        sale: "Продажа"
      } satisfies Record<"rent" | "sale", string>,
      propertyTypes: {
        flat: "Квартира",
        house: "Дом",
        room: "Комната"
      } satisfies Record<PropertyType, string>,
      rentTypes: {
        monthly: "Помесячно",
        daily: "Посуточно"
      } satisfies Record<RentType, string>,
      listingStatuses: {
        PENDING: "На проверке",
        APPROVED: "Одобрено",
        REJECTED: "Отклонено"
      } satisfies Record<ListingStatus, string>,
      listingAvailabilityStatuses: {
        ACTIVE: "Активно",
        RENTED: "Сдано",
        SOLD: "Продано"
      } satisfies Record<ListingAvailabilityStatus, string>,
      userStatuses: {
        ACTIVE: "Активен",
        BLOCKED: "Заблокирован"
      } satisfies Record<UserStatus, string>
    },
    common: {
      noResults: "Нет результатов",
      roomsShort: "комн.",
      perMonth: "/мес",
      perDay: "/сутки",
      adminReviewed: "Проверено админом",
      verifiedOwner: "Владелец подтверждён",
      noAgencyFee: "Без комиссии",
      viewDetails: "Подробнее",
      contactOwner: "Связаться с владельцем",
      backToListings: "Назад к объявлениям",
      location: "Локация",
      listingType: "Тип объявления",
      region: "Регион",
      district: "Район или город",
      cityNeighborhood: "Махалля или ориентир",
      address: "Адрес",
      rooms: "Комнаты",
      area: "Площадь",
      propertyType: "Тип жилья",
      rentType: "Тип аренды",
      phone: "Телефон",
      created: "Дата публикации",
      logInToView: "Войдите, чтобы посмотреть",
      logInToContact: "Войдите, чтобы связаться с владельцем",
      overview: "Обзор",
      fullDescription: "Полное описание",
      save: "Сохранить",
      saved: "Сохранено",
      saveListing: "Сохранить объявление",
      removeFromSaved: "Убрать из сохранённого",
      submit: "Отправить",
      removeImage: "Удалить фото",
      placeholderPreview: "Превью заглушки",
      search: "Поиск",
      signOut: "Выйти",
      joinDatePrefix: "Дата регистрации",
      owner: "Владелец",
      propertyInfo: "О жилье",
      ownerContact: "Контакт владельца",
      forRentIndicator: "Сдается в аренду",
      forSaleIndicator: "На продажу",
      active: "Активно",
      rented: "Сдано",
      sold: "Продано"
    },
    home: {
      title: "Найдите жильё по всему Узбекистану",
      subtitle:
        "Легко ищите квартиры, дома и комнаты для аренды или покупки.",
      resultsFound: "Найдено объявлений: {count}",
      resultsNote: "Только одобренные объявления. Связывайтесь с владельцами напрямую.",
      emptyTitle: "По этим фильтрам ничего не найдено",
      emptyDescription:
        "Расширьте диапазон цены, уберите фильтр по комнатам или попробуйте другой адрес и ориентир."
    },
    search: {
      searchLabel: "Поиск",
      searchPlaceholder: "Например: Чиланзар, Самарканд, Бухара...",
      region: "Регион",
      districtCity: "Район / город",
      districtCityPlaceholder: "Например: Чиланзар, Нурафшан, Регистан",
      searchButton: "Искать",
      moreFilters: "Больше фильтров",
      popularAreas: "Популярные регионы:",
      allListingTypes: "Все",
      minPrice: "Мин. цена",
      maxPrice: "Макс. цена",
      rooms: "Комнаты",
      propertyType: "Тип жилья",
      currency: "Валюта",
      sort: "Сортировка",
      noMinimum: "Без минимума",
      noMaximum: "Без максимума",
      any: "Любое",
      allRegions: "Все регионы",
      allTypes: "Все типы",
      allCurrencies: "Все валюты",
      newest: "Сначала новые",
      priceAsc: "Цена: по возрастанию",
      priceDesc: "Цена: по убыванию"
    },
    listingDetail: {
      revealContact: "Войдите, чтобы связаться с владельцем.",
      listingNotFound: "Объявление не найдено"
    },
    auth: {
      loginPill: "Вход",
      loginTitle: "Вход",
      loginDescription:
        "Войдите, чтобы сохранять понравившиеся варианты, получать рекомендации и хранить свои предпочтения по аренде в одном месте.",
      email: "Email",
      password: "Пароль",
      phoneOptional: "Номер телефона (необязательно)",
      confirmPassword: "Подтвердите пароль",
      confirmPasswordPlaceholder: "Повторите пароль",
      passwordMismatch: "Пароли не совпадают.",
      rateLimited: "Слишком много попыток. Подождите около 10 минут и попробуйте снова.",
      enterPassword: "Введите пароль",
      logIn: "Войти",
      noAccountYet: "Нет аккаунта?",
      createOne: "Зарегистрироваться",
      blocked: "Ваш аккаунт заблокирован.",
      invalidLogin: "Неверный email или пароль.",
      verifyEmail: "Подтвердите email, затем войдите.",
      verifiedSuccess: "Email подтвержден. Теперь можно войти.",
      registeredSuccess: "Аккаунт создан. Теперь можно войти.",
      passwordResetSuccess: "Пароль обновлен. Войдите с новым паролем.",
      registerPill: "Регистрация",
      registerTitle: "Регистрация",
      registerDescription:
        "Создайте аккаунт, чтобы собирать избранное, отслеживать просмотренные варианты и получать рекомендации по Узбекистану.",
      fullName: "Полное имя",
      createAccount: "Создать аккаунт",
      alreadyRegistered: "Уже есть аккаунт?",
      accountExists: "Аккаунт с таким email уже существует.",
      passwordTooShort: "Пароль должен содержать не менее 8 символов.",
      fillFormCorrectly: "Пожалуйста, заполните форму корректно.",
      strongPasswordPlaceholder: "Не менее 8 символов",
      noAccountNamePlaceholder: "Азиза Каримова",
      showPassword: "Показать",
      hidePassword: "Скрыть",
      showPasswordAria: "Показать пароль",
      hidePasswordAria: "Скрыть пароль",
      acceptTermsPrefix: "Я соглашаюсь с ",
      acceptTermsPrivacy: "Политикой конфиденциальности",
      acceptTermsMiddle: " и ",
      acceptTermsTerms: "Условиями",
      acceptTermsSuffix: "",
      termsRequired: "Чтобы продолжить, подтвердите согласие с Политикой конфиденциальности и Условиями.",
      featurePrimaryTitle: "Один аккаунт, один ритм",
      featurePrimaryCopy: "Избранное, контакт с владельцем и ваши объявления управляются в одном месте.",
      featureSecurityTitle: "Безопасный вход",
      featureSecurityCopy: "Сессии хранятся в базе и при необходимости быстро отзываются.",
      featureSavedTitle: "Быстрый возврат",
      featureSavedCopy: "После входа сохранённые объявления и просмотренные варианты остаются с вами.",
      recoveryFeatureTitle: "Безопасное восстановление",
      recoveryFeatureCopy: "Ссылка для смены пароля используется только для безопасного возврата в аккаунт.",
      recoverySupportTitle: "Быстрое продолжение",
      recoverySupportCopy: "Откройте письмо, установите новый пароль и вернитесь к своим объявлениям без лишних шагов.",
      forgotPassword: "Забыли пароль?",
      forgotPasswordTitle: "Сбросить пароль",
      forgotPasswordDescription:
        "Введите свой email. Если аккаунт существует, мы отправим ссылку для сброса пароля.",
      sendResetLink: "Отправить ссылку",
      forgotPasswordSent:
        "Если аккаунт существует, инструкции по сбросу пароля отправлены на ваш email.",
      forgotPasswordDeliveryError:
        "Сейчас не удалось отправить письмо для сброса. Попробуйте еще раз немного позже.",
      resetPasswordTitle: "Установите новый пароль",
      resetPasswordDescription:
        "Выберите новый пароль для аккаунта. Ссылка работает только один раз.",
      resetPassword: "Обновить пароль",
      invalidOrExpiredToken: "Ссылка недействительна или срок ее действия истек.",
      passwordResetEmailSubject: "Сброс пароля Uzbekistan Rentals",
      passwordResetEmailEyebrow: "Сброс пароля",
      passwordResetEmailTitle: "Установите новый пароль",
      passwordResetEmailIntro:
        "Мы получили запрос на сброс пароля для вашего аккаунта Uzbekistan Rentals. Используйте кнопку ниже, чтобы установить новый пароль.",
      passwordResetEmailAction: "Сменить пароль",
      passwordResetEmailNote:
        "Эта ссылка действует 60 минут и может быть использована только один раз. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.",
      passwordResetEmailFooter:
        "Вы получили это письмо, потому что для вашего аккаунта Uzbekistan Rentals был запрошен сброс пароля.",
      emailFallbackTitle: "Если кнопка не работает",
      emailFallbackCopy: "Скопируйте и откройте эту ссылку в браузере:",
      verifyEmailTitle: "Подтвердите email",
      verifyEmailDescription:
        "Откройте ссылку из письма, чтобы завершить регистрацию.",
      verifyEmailSent:
        "Ссылка для подтверждения отправлена. Проверьте почту и войдите после подтверждения.",
      verifyEmailInvalid: "Ссылка подтверждения недействительна или устарела.",
      resendVerification: "Отправить ссылку повторно",
      resendVerificationSent:
        "Если у вас есть неподтвержденный аккаунт, новая ссылка уже отправлена."
    },
    account: {
      pill: "Мой кабинет",
      title: "Мой кабинет",
      memberSince: "Дата регистрации:",
      intro:
        "Управляйте своими объявлениями, сохранённым жильём и безопасностью аккаунта в одном месте.",
      loggedInAs: "Вы вошли как",
      quickActions: "Быстрые действия",
      security: "Безопасность",
      securityTitle: "Безопасность аккаунта",
      securityDescription:
        "Следите за активными сессиями и при необходимости завершайте входы на других устройствах.",
      openFavorites: "Избранное",
      trackListings: "Мои объявления",
      submitListing: "Подать объявление",
      manageSessions: "Управление сессиями",
      overview: "Кабинет",
      overviewTitle: "Разделы кабинета",
      overviewDescription:
        "Здесь собраны основные разделы для ваших объявлений, сохранённого жилья и безопасности аккаунта.",
      myListingsTitle: "Ваши объявления",
      myListingsDescription:
        "Следите за состоянием объявлений, редактируйте их и управляйте рыночным статусом.",
      savedTitle: "Сохранённое жильё",
      savedListingsDescription:
        "Быстро возвращайтесь к понравившимся объектам и сравнивайте их в одном месте.",
      recentTitle: "Недавно просмотренные",
      recentlyViewedDescription:
        "Последние открытые объявления показываются в отдельном блоке ниже, а здесь находится общий обзор кабинета.",
      name: "Имя",
      phone: "Телефон",
      favorites: "Избранное",
      savedListings: "Сохранённые объявления",
      noFavoritesTitle: "Пока нет сохранённых объявлений",
      noFavorites:
        "Сохраняйте понравившееся жильё, чтобы позже быстро к нему вернуться.",
      recentActivity: "Недавняя активность",
      recentlyViewed: "Недавно просмотренные",
      noRecentViewsTitle: "Пока нет просмотренных объявлений",
      noRecentViews: "Когда вы откроете карточки объявлений, они появятся здесь."
    },
    addListing: {
      pill: "Подать объявление",
      title: "Разместить объявление о жилье",
      intro: "Отправьте объявление для аренды или продажи.",
      editTitle: "Редактировать объявление о жилье",
      editIntro: "Обновите детали объявления и управляйте его рыночным статусом.",
      tips:
        "Укажите понятный заголовок, реальный адрес, точную цену и рабочий номер телефона. Загруженные фото хранятся безопасно и показываются в объявлении после одобрения.",
      locationOnly:
        "Сайт принимает объявления по всему Узбекистану. Объявление автоматически привяжется к вашему аккаунту, а сохранённые контактные данные можно использовать здесь.",
      success: "Ваше объявление отправлено и ожидает одобрения.",
      form: {
        listingType: "Тип объявления",
        listingTypeRent: "Жильё в аренду",
        listingTypeSale: "Жильё на продажу",
        title: "Заголовок",
        titlePlaceholder: "Например: Светлая 2-комнатная квартира рядом с метро Minor",
        description: "Описание",
        descriptionPlaceholder:
          "Опишите жильё, транспорт рядом, мебель, ремонт и для кого подходит вариант.",
        rentPrice: "Цена аренды",
        salePrice: "Цена продажи",
        currency: "Валюта",
        region: "Регион",
        districtCity: "Район или город",
        districtCityPlaceholder: "Например: Чиланзар или Нурафшан",
        cityNeighborhood: "Махалля или ориентир",
        cityNeighborhoodPlaceholder: "Например: новый квартал",
        address: "Адрес",
        addressPlaceholder: "Улица, номер дома",
        rooms: "Комнаты",
        area: "Площадь (м²)",
        propertyType: "Тип жилья",
        rentType: "Тип аренды",
        phone: "Номер телефона",
        images: "Фотографии",
        uploadNote: "Загрузите до 10 изображений. Если пропустите этот шаг, будет использована заглушка.",
        submit: "Отправить объявление",
        submitting: "Объявление отправляется...",
        uploading: "Фотографии загружаются...",
        uploadPreviewAlt: "Превью объявления",
        uploadFailed: "Не удалось загрузить фото.",
        uploadUnable: "Не удалось загрузить фотографии.",
        submitUnable: "Не удалось отправить объявление.",
        updateSubmit: "Обновить объявление",
        updating: "Объявление обновляется..."
      }
    },
    favoritesPage: {
      pill: "Избранное",
      title: "Сохранённые варианты",
      intro:
        "Держите здесь короткий список, пока сравниваете цены, планировки и способы связи.",
      browseMore: "Смотреть ещё",
      emptyTitle: "Пока нет сохранённых вариантов",
      emptyDescription:
        "Открывайте карточки или страницы объявлений и используйте Сохранить, чтобы собрать свой список."
    },
    myListings: {
      pill: "Мои объявления",
      title: "Отслеживайте отправленные объявления",
      intro:
        "Каждое новое объявление сначала ждёт проверки. После одобрения админом публичная страница появится автоматически.",
      submitAnother: "Подать ещё одно объявление",
      total: "Всего",
      pending: "На проверке",
      approved: "Одобрено",
      inactive: "Снято с публикации",
      updated: "Объявление обновлено.",
      deleted: "Объявление удалено.",
      statusUpdated: "Статус объявления обновлен.",
      emptyTitle: "Вы ещё не отправляли объявления",
      emptyDescription:
        "Используйте Add Listing, чтобы отправить свою первую квартиру, комнату или дом на проверку."
    },
    userListingCard: {
      statusCopy: {
        PENDING: "Объявление остаётся приватным, пока админ его не одобрит.",
        APPROVED: "Объявление видно на публичном маркетплейсе.",
        REJECTED: "Объявление скрыто из публичной выдачи."
      } satisfies Record<ListingStatus, string>,
      offMarketStatusCopy:
        "Объявление уже одобрено, но сейчас снято с публикации. Активируйте его снова, чтобы вернуть в открытый каталог.",
      createdPrefix: "Создано",
      viewPublicPage: "Открыть публичную страницу",
      awaitingPublicLink: "Публичная ссылка появится позже",
      offMarketPublicLink: "Сейчас скрыто из каталога",
      edit: "Редактировать",
      delete: "Удалить",
      deleting: "Удаление...",
      updating: "Обновление...",
      deleteConfirm: "Удалить это объявление?",
      markRentedConfirm: "Отметить объявление как сданное?",
      markSoldConfirm: "Отметить объявление как проданное?",
      markActiveConfirm: "Вернуть объявление в активный каталог?",
      markRented: "Отметить как сданное",
      markSold: "Отметить как проданное",
      markActive: "Снова опубликовать"
    },
    owner: {
      dashboardPill: "Панель владельца",
      title: "Объявления на проверке",
      intro:
        "Проверяйте отправленные объявления о жилье и одобряйте или отклоняйте их до публикации.",
      emptyTitle: "Нет объявлений на проверке",
      emptyDescription: "Новые заявки появятся здесь до того, как станут видны на публичном сайте.",
      controlsPill: "Управление владельца",
      manageUsers: "Управление пользователями",
      manageUsersIntro:
        "Ищите по email и блокируйте или разблокируйте аккаунты прямо из панели владельца.",
      userUpdated: "Статус пользователя обновлён.",
      ownerProtected: "Аккаунт владельца нельзя заблокировать.",
      invalidAction: "Запрошенное действие не принято.",
      notFound: "Пользователь не найден.",
      searchPlaceholder: "Поиск по email",
      searchButton: "Найти",
      searchHint: "Найдите email пользователя, чтобы заблокировать или разблокировать аккаунт.",
      noUsersTitle: "Пользователь не найден",
      noUsersDescription: "Попробуйте более полный email или более широкий фрагмент.",
      ownerProtectedText: "Аккаунт владельца защищён от блокировки.",
      joined: "Дата регистрации",
      blockUser: "Заблокировать пользователя",
      unblockUser: "Разблокировать пользователя",
      approve: "Одобрить",
      reject: "Отклонить"
    },
    about: {
      eyebrow: "О проекте",
      title: "О проекте",
      body1:
        "{name} — модерируемая площадка для поиска квартир, домов и комнат по всему {location} для аренды или покупки.",
      body2:
        "Объявления проходят модерацию, публикуются с открытыми ценами и позволяют связываться с владельцами напрямую."
    },
    contact: {
      eyebrow: "Контакты",
      title: "Связаться с командой",
      intro: "По вопросам аккаунта, модерации или исправления объявлений пишите:",
      note:
        "Кнопки связи в карточках ведут напрямую к владельцу, а не к команде сайта."
    },
    privacy: {
      eyebrow: "Конфиденциальность",
      title: "Политика конфиденциальности",
      body1:
        "Мы храним данные, необходимые для регистрации, управления объявлениями, избранного, сброса пароля и подтверждения email.",
      body2:
        "Загруженные изображения отправляются в облачное хранилище медиа, а сессии и статусы модерации сохраняются в PostgreSQL.",
      body3:
        "Телефоны владельцев доступны только авторизованным пользователям. Данные обрабатываются для безопасности, качества сервиса и выполнения законных обязанностей."
    },
    terms: {
      eyebrow: "Условия",
      title: "Условия использования",
      body1:
        "Пользователи несут ответственность за точность объявлений, цен, фотографий и контактных данных.",
      body2:
        "Платформа оставляет за собой право отклонять, скрывать или удалять вводящие в заблуждение, дублирующиеся, оскорбительные или незаконные объявления.",
      body3:
        "Сайт не является агентством, брокером или платёжным посредником. Проверка документов и условия сделки остаются на стороне пользователя и владельца."
    },
    notFound: {
      title: "Объявление не найдено",
      description: "Объявление могло быть удалено или всё ещё ожидает одобрения администратора.",
      returnHome: "Вернуться на главную"
    },
    api: {
      loginRequired: "Требуется вход в систему.",
      loginToSubmitListing: "Войдите, чтобы отправить объявление.",
      invalidListingPayload: "Данные объявления некорректны.",
      listingSubmitted: "Ваше объявление отправлено и ожидает одобрения.",
      unableToSaveListing: "Не удалось сохранить объявление.",
      loginToUploadImages: "Войдите, чтобы загрузить изображения.",
      noImageProvided: "Файл изображения не был передан.",
      onlyImagesAllowed: "Разрешена загрузка только изображений.",
      imageTooLarge: "Каждое изображение должно быть меньше 8 МБ.",
      cloudUploadNotConfigured:
        "Для публичного режима не настроено облачное хранилище изображений. Укажите ключи Supabase Storage или Cloudinary.",
      unableToUploadImage: "Не удалось загрузить изображение."
    }
  }
} as const;

export function isLocale(value?: string | null): value is Locale {
  return LOCALES.includes((value ?? "") as Locale);
}

export function getLocaleFromValue(value?: string | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getLocale() {
  return getLocaleFromValue(cookies().get(LOCALE_COOKIE_NAME)?.value);
}

export function getTranslations(locale: Locale) {
  return translations[locale];
}

export function getLocaleForDate(locale: Locale) {
  return locale === "ru" ? "ru-RU" : "uz-UZ";
}

export function getLocaleForOpenGraph(locale: Locale) {
  return locale === "ru" ? "ru_RU" : "uz_UZ";
}

export function formatMessage(
  template: string,
  values: Record<string, string | number> = {}
) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    template
  );
}
