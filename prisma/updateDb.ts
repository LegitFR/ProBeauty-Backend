import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Unsplash Image Banks ────────────────────────────────────────────────────
const SALON_IMAGES = {
  hairSalon: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&fit=crop',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&fit=crop',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&fit=crop',
  ],
  beautyLounge: [
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&fit=crop',
    'https://images.unsplash.com/photo-1633612286906-04c2b6b35e22?w=800&fit=crop',
    'https://images.unsplash.com/photo-1570187144671-60a7a2a9f8e8?w=800&fit=crop',
  ],
  spa: [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&fit=crop',
    'https://images.unsplash.com/photo-1561717104-0e9e85bf56dc?w=800&fit=crop',
    'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800&fit=crop',
  ],
  barber: [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&fit=crop',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&fit=crop',
    'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&fit=crop',
  ],
  nailSalon: [
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&fit=crop',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&fit=crop',
    'https://images.unsplash.com/photo-1567784177951-6fa58317e16b?w=800&fit=crop',
  ],
};

const STAFF_IMAGES = {
  female: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&fit=crop',
  ],
  male: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop',
    'https://images.unsplash.com/photo-1546961342-ea5f60d0edb0?w=400&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop',
  ],
};

const OFFER_IMAGES = [
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&fit=crop',
  'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800&fit=crop',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&fit=crop',
  'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&fit=crop',
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&fit=crop',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&fit=crop',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&fit=crop',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&fit=crop',
];

const PRODUCT_IMAGES = {
  shampoo: [
    'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&fit=crop',
    'https://images.unsplash.com/photo-1590159983013-d4c37b73b0b7?w=500&fit=crop',
  ],
  conditioner: [
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&fit=crop',
    'https://images.unsplash.com/photo-1617278054385-cbb4db1a8a2c?w=500&fit=crop',
  ],
  serum: [
    'https://images.unsplash.com/photo-1611936281663-a2fcca488ddd?w=500&fit=crop',
    'https://images.unsplash.com/photo-1599599810694-b5ac4dd33fdf?w=500&fit=crop',
  ],
  hairOil: [
    'https://images.unsplash.com/photo-1631730486211-cd20e1f60154?w=500&fit=crop',
    'https://images.unsplash.com/photo-1570187144671-60a7a2a9f8e8?w=500&fit=crop',
  ],
  faceMask: [
    'https://images.unsplash.com/photo-1607554886223-403bdd3b808d?w=500&fit=crop',
    'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=500&fit=crop',
  ],
  nailPolish: [
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&fit=crop',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&fit=crop',
  ],
  beardOil: [
    'https://images.unsplash.com/photo-1596728846592-c0d0e5007ead?w=500&fit=crop',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&fit=crop',
  ],
  moisturizer: [
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&fit=crop',
    'https://images.unsplash.com/photo-1543297057-25167463d4e2?w=500&fit=crop',
  ],
  eyeshadow: [
    'https://images.unsplash.com/photo-1586495777744-4e6b23c0d81e?w=500&fit=crop',
    'https://images.unsplash.com/photo-1583795484071-3c453e3a7c71?w=500&fit=crop',
  ],
  lipstick: [
    'https://images.unsplash.com/photo-1567784177951-6fa58317e16b?w=500&fit=crop',
    'https://images.unsplash.com/photo-1614859324669-927e70f7a98a?w=500&fit=crop',
  ],
  sunscreen: [
    'https://images.unsplash.com/photo-1527005671213-e52ffd60ef1a?w=500&fit=crop',
    'https://images.unsplash.com/photo-1619451423987-f7eac69c490f?w=500&fit=crop',
  ],
  hairMask: [
    'https://images.unsplash.com/photo-1570541308623-37c24fb2638f?w=500&fit=crop',
    'https://images.unsplash.com/photo-1631390399739-d3b3e0ee82b1?w=500&fit=crop',
  ],
};

// ─── IDs from the live database ──────────────────────────────────────────────
const SALON_IDS = {
  smthSalon: 'cmiqyjrxl00025e07y9cwa5gs', // Smth Salon → Glamour Beauty Studio
  jasKrrishSalon: 'cmiplyw1n0002li2gbggmr85q', // jas Krrish Salon → Krrish Luxe Salon
  royalStudio: 'cmj85grpq00028m07h183e70z', // Royal studio → Royal Glam Studio
  glamourStudio: 'cmioe38q1000elicn8qha2g2u', // Glamour Studio
  luxeHairSpa: 'cmioe39sx0017licn67bm0j6w', // Luxe Hair & Spa
  primBeauty: 'cmioe39sx0019licn3lq12ebd', // Prime Beauty Collective
  beautyLounge: 'cmioe38q1000flicnfmo8f3pv', // The Beauty Lounge
  urbanCuts: 'cmioe38q1000dlicn6fysb9hu', // Urban Cuts & Color
  // test/placeholder salons to rename
  testSalon: 'cmjabaaza00048g07wy05zhxh',
  exStudio: 'cmox64hsb00027407x6c30sjz',
  example1: 'cmjujtu8e00029407i1frs235',
  newSalon1: 'cmja278l400027s07qs559nsm',
  salonImgStudios: 'cmj9mzeys0002ac07ihhz4qzg',
  newSalon2: 'cmj84g3dh000c9z07tlgdeprm',
  lagmourStdio: 'cmpx031mp0004texa8i98rsiq',
  newestSalon: 'cmjuk0qhj00059407ex3wqcty',
  newSalon3: 'cmj82ndmt00029z074e2j8ius',
  luxStudio: 'cmj830ud000059z07gvwm62lc',
  imgFixSalon: 'cmj9ngjf30005ac07nao5ih75',
  jksSS: 'cmjub0279000e7r07kltg5hqp',
  newStudio: 'cmj36awp400029j072j8eecyh',
  modernSal: 'cmjztivis00024w07axpng1jb',
};

const now = new Date();
const offerStart = now;
const offerEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

async function step1_fixUnknownStaff() {
  console.log('\n📝 Step 1: Fixing UNKNOWN staff names + adding images...');

  const unknownStaff = [
    // Urban Cuts & Color
    { id: 'cmioe392y000klicnxt0cu2fo', name: 'Priya Sharma', image: STAFF_IMAGES.female[0] },
    // The Beauty Lounge
    { id: 'cmioe392y000nlicn39kv82bo', name: 'James Wilson', image: STAFF_IMAGES.male[0] },
    // Glamour Studio
    { id: 'cmioe392y000mlicnu9yxxlb2', name: 'Jessica Martinez', image: STAFF_IMAGES.female[1] },
    { id: 'cmioe392y000llicnf3f1tjqi', name: 'David Brown', image: STAFF_IMAGES.male[1] },
    // jas Krrish Salon
    { id: 'cmipmrn3j0004li2gfywff3qx', name: 'Anika Roy', image: STAFF_IMAGES.female[2] },
    { id: 'cmirpcq8v0001ligvjy8cpdcd', name: 'Rahul Mehta', image: STAFF_IMAGES.male[2] },
    { id: 'cmirpdakk0005ligv1ob0f023', name: 'Sneha Gupta', image: STAFF_IMAGES.female[3] },
    { id: 'cmirpe1x60009ligvjn15zr93', name: 'Kiran Patel', image: STAFF_IMAGES.male[3] },
  ];

  const testStaff = [
    { id: 'cmj8yj75s00019307zzrzdj1i', name: 'Sofia Mendes', image: STAFF_IMAGES.female[4] },
    { id: 'cmj8pklqi00019w0716gmlnrp', name: 'Lucas Costa', image: STAFF_IMAGES.male[0] },
    { id: 'cmk6ylat300017j07pacjofqa', name: 'Natasha Pereira', image: STAFF_IMAGES.female[0] },
  ];

  for (const s of [...unknownStaff, ...testStaff]) {
    await prisma.staff.update({ where: { id: s.id }, data: { name: s.name, image: s.image } });
    console.log(`  ✅ ${s.name}`);
  }
}

async function step2_renameSalons() {
  console.log('\n🏪 Step 2: Renaming test/placeholder salons...');

  const renames: Array<{
    id: string;
    name: string;
    address: string;
    thumbnail: string;
    images: string[];
    verified: boolean;
    venueType: string;
    geo: { type: string; coordinates: number[] };
    hours: Record<string, { open?: string; close?: string; closed?: boolean }>;
  }> = [
    {
      id: SALON_IDS.smthSalon,
      name: 'Glamour Beauty Studio',
      address: '42 Park Avenue, Bengaluru, KA 560001',
      thumbnail: SALON_IMAGES.hairSalon[0],
      images: SALON_IMAGES.hairSalon,
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.5946, 12.9716] },
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '10:00', close: '19:00' },
        sunday: { open: '10:00', close: '17:00' },
      },
    },
    {
      id: SALON_IDS.jasKrrishSalon,
      name: 'Krrish Luxe Salon',
      address: '15 MG Road, Bengaluru, KA 560025',
      thumbnail: SALON_IMAGES.beautyLounge[0],
      images: SALON_IMAGES.beautyLounge,
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.6101, 12.9762] },
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '09:00', close: '19:00' },
        sunday: { closed: true },
      },
    },
    {
      id: SALON_IDS.royalStudio,
      name: 'Royal Glam Studio',
      address: '88 Indiranagar, Bengaluru, KA 560038',
      thumbnail: SALON_IMAGES.spa[0],
      images: SALON_IMAGES.spa,
      verified: true,
      venueType: 'women',
      geo: { type: 'Point', coordinates: [77.6408, 12.9784] },
      hours: {
        monday: { open: '10:00', close: '20:00' },
        tuesday: { open: '10:00', close: '20:00' },
        wednesday: { open: '10:00', close: '20:00' },
        thursday: { open: '10:00', close: '21:00' },
        friday: { open: '10:00', close: '21:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { open: '11:00', close: '16:00' },
      },
    },
    {
      id: SALON_IDS.testSalon,
      name: 'Elegance Hair Lounge',
      address: '7 Koramangala, Bengaluru, KA 560034',
      thumbnail: SALON_IMAGES.hairSalon[1],
      images: [SALON_IMAGES.hairSalon[1], SALON_IMAGES.hairSalon[2]],
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.6201, 12.9352] },
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { closed: true },
      },
    },
    {
      id: SALON_IDS.exStudio,
      name: 'Revive Beauty Spa',
      address: '201 Whitefield, Bengaluru, KA 560066',
      thumbnail: SALON_IMAGES.spa[1],
      images: SALON_IMAGES.spa,
      verified: true,
      venueType: 'women',
      geo: { type: 'Point', coordinates: [77.7499, 12.9698] },
      hours: {
        monday: { open: '10:00', close: '20:00' },
        tuesday: { open: '10:00', close: '20:00' },
        wednesday: { open: '10:00', close: '20:00' },
        thursday: { open: '10:00', close: '20:00' },
        friday: { open: '10:00', close: '20:00' },
        saturday: { open: '10:00', close: '18:00' },
        sunday: { open: '11:00', close: '16:00' },
      },
    },
    {
      id: SALON_IDS.example1,
      name: 'Golden Glow Salon',
      address: '5 HSR Layout, Bengaluru, KA 560102',
      thumbnail: SALON_IMAGES.nailSalon[0],
      images: SALON_IMAGES.nailSalon,
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.6476, 12.9116] },
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { closed: true },
      },
    },
    {
      id: SALON_IDS.newSalon1,
      name: 'Sunrise Beauty Centre',
      address: '33 Jayanagar, Bengaluru, KA 560011',
      thumbnail: SALON_IMAGES.beautyLounge[1],
      images: [SALON_IMAGES.beautyLounge[1], SALON_IMAGES.beautyLounge[2]],
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.5832, 12.9299] },
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { closed: true },
      },
    },
    {
      id: SALON_IDS.salonImgStudios,
      name: 'Metro Glow Studio',
      address: '18 JP Nagar, Bengaluru, KA 560078',
      thumbnail: SALON_IMAGES.hairSalon[2],
      images: [SALON_IMAGES.hairSalon[2], SALON_IMAGES.beautyLounge[0]],
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.5902, 12.9074] },
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { closed: true },
      },
    },
    {
      id: SALON_IDS.newSalon2,
      name: 'Pearl Beauty Boutique',
      address: '62 Malleshwaram, Bengaluru, KA 560003',
      thumbnail: SALON_IMAGES.spa[2],
      images: SALON_IMAGES.spa,
      verified: true,
      venueType: 'women',
      geo: { type: 'Point', coordinates: [77.5709, 13.0027] },
      hours: {
        monday: { open: '10:00', close: '19:00' },
        tuesday: { open: '10:00', close: '19:00' },
        wednesday: { open: '10:00', close: '19:00' },
        thursday: { open: '10:00', close: '19:00' },
        friday: { open: '10:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { open: '10:00', close: '16:00' },
      },
    },
    {
      id: SALON_IDS.lagmourStdio,
      name: 'Lagoon Beauty Studio',
      address: '74 Rajajinagar, Bengaluru, KA 560010',
      thumbnail: SALON_IMAGES.beautyLounge[2],
      images: [SALON_IMAGES.beautyLounge[2], SALON_IMAGES.hairSalon[0]],
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.5519, 12.9918] },
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { closed: true },
      },
    },
    {
      id: SALON_IDS.newestSalon,
      name: 'Velvet Touch Salon',
      address: '9 Yelahanka, Bengaluru, KA 560064',
      thumbnail: SALON_IMAGES.nailSalon[1],
      images: [SALON_IMAGES.nailSalon[1], SALON_IMAGES.nailSalon[2]],
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.5994, 13.1007] },
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { closed: true },
      },
    },
    {
      id: SALON_IDS.newSalon3,
      name: 'Blossom Hair Studio',
      address: '55 Hebbal, Bengaluru, KA 560024',
      thumbnail: SALON_IMAGES.hairSalon[0],
      images: [SALON_IMAGES.hairSalon[0], SALON_IMAGES.hairSalon[1]],
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.5932, 13.0344] },
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { closed: true },
      },
    },
    {
      id: SALON_IDS.luxStudio,
      name: 'Luxuria Beauty Bar',
      address: '200 Sarjapur Road, Bengaluru, KA 560035',
      thumbnail: SALON_IMAGES.spa[0],
      images: SALON_IMAGES.spa,
      verified: true,
      venueType: 'women',
      geo: { type: 'Point', coordinates: [77.6806, 12.908] },
      hours: {
        monday: { open: '10:00', close: '20:00' },
        tuesday: { open: '10:00', close: '20:00' },
        wednesday: { open: '10:00', close: '20:00' },
        thursday: { open: '10:00', close: '20:00' },
        friday: { open: '10:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { open: '10:00', close: '16:00' },
      },
    },
    {
      id: SALON_IDS.imgFixSalon,
      name: 'Serene Nail & Beauty',
      address: '40 Bannerghatta Road, Bengaluru, KA 560076',
      thumbnail: SALON_IMAGES.nailSalon[2],
      images: SALON_IMAGES.nailSalon,
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.5906, 12.8846] },
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { closed: true },
      },
    },
    {
      id: SALON_IDS.jksSS,
      name: 'Jade & Stone Spa',
      address: '11 Electronic City, Bengaluru, KA 560100',
      thumbnail: SALON_IMAGES.spa[1],
      images: [SALON_IMAGES.spa[1], SALON_IMAGES.spa[2]],
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.6688, 12.8457] },
      hours: {
        monday: { open: '10:00', close: '20:00' },
        tuesday: { open: '10:00', close: '20:00' },
        wednesday: { open: '10:00', close: '20:00' },
        thursday: { open: '10:00', close: '20:00' },
        friday: { open: '10:00', close: '20:00' },
        saturday: { open: '10:00', close: '18:00' },
        sunday: { open: '11:00', close: '16:00' },
      },
    },
    {
      id: SALON_IDS.newStudio,
      name: 'Aura Beauty Studio',
      address: '29 Marathahalli, Bengaluru, KA 560037',
      thumbnail: SALON_IMAGES.beautyLounge[0],
      images: [SALON_IMAGES.beautyLounge[0], SALON_IMAGES.beautyLounge[1]],
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.7016, 12.9591] },
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { closed: true },
      },
    },
    {
      id: SALON_IDS.modernSal,
      name: 'Modern Chic Salon',
      address: '100 Cunningham Road, Bengaluru, KA 560052',
      thumbnail: SALON_IMAGES.hairSalon[1],
      images: SALON_IMAGES.hairSalon,
      verified: true,
      venueType: 'everyone',
      geo: { type: 'Point', coordinates: [77.5935, 12.991] },
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { closed: true },
      },
    },
  ];

  // Also update the core salons that exist: make them verified + add images
  const coreSalonUpdates = [
    {
      id: SALON_IDS.glamourStudio,
      thumbnail: SALON_IMAGES.hairSalon[0],
      images: SALON_IMAGES.hairSalon,
      verified: true,
    },
    {
      id: SALON_IDS.luxeHairSpa,
      thumbnail: SALON_IMAGES.spa[0],
      images: SALON_IMAGES.spa,
      verified: true,
    },
    {
      id: SALON_IDS.primBeauty,
      thumbnail: SALON_IMAGES.beautyLounge[0],
      images: SALON_IMAGES.beautyLounge,
      verified: true,
    },
    {
      id: SALON_IDS.beautyLounge,
      thumbnail: SALON_IMAGES.barber[0],
      images: SALON_IMAGES.barber,
      verified: true,
    },
    {
      id: SALON_IDS.urbanCuts,
      thumbnail: SALON_IMAGES.nailSalon[0],
      images: SALON_IMAGES.nailSalon,
      verified: true,
    },
  ];

  for (const salon of renames) {
    await prisma.salon.update({
      where: { id: salon.id },
      data: {
        name: salon.name,
        address: salon.address,
        thumbnail: salon.thumbnail,
        images: salon.images,
        verified: salon.verified,
        venueType: salon.venueType,
        geo: salon.geo,
        hours: salon.hours,
      },
    });
    console.log(`  ✅ ${salon.name}`);
  }

  for (const salon of coreSalonUpdates) {
    await prisma.salon.update({
      where: { id: salon.id },
      data: { thumbnail: salon.thumbnail, images: salon.images, verified: salon.verified },
    });
  }
  console.log(`  ✅ Updated ${coreSalonUpdates.length} core salon images`);
}

async function step3_fixServiceNames() {
  console.log('\n🔧 Step 3: Fixing test service/product names...');

  await prisma.service
    .update({
      where: { id: 'cmiqyjrxl00025e07y9cwa5gs' },
      data: {},
    })
    .catch(() => null);

  // Fix "cuthair" service
  await prisma.service.updateMany({
    where: { title: 'cuthair' },
    data: { title: 'Hair Cut & Style', category: 'hair' },
  });

  // Fix "Translation test" service
  await prisma.service.updateMany({
    where: { title: 'Translation test' },
    data: { title: 'Keratin Treatment', category: 'hair', price: 120.0 },
  });

  // Fix "haircut" (lowercase, Smth salon)
  await prisma.service.updateMany({
    where: { title: 'haircut', salonId: SALON_IDS.smthSalon },
    data: { title: 'Precision Haircut', category: 'hair' },
  });

  // Fix "cuthair" (Smth salon)
  await prisma.service.updateMany({
    where: { title: 'cuthair' },
    data: { title: 'Hair Cut & Style', category: 'hair' },
  });

  // Rename test products
  await prisma.product.updateMany({
    where: { title: 'Test' },
    data: {
      title: 'Vitamin C Face Brightening Serum',
      images: PRODUCT_IMAGES.serum,
    },
  });
  await prisma.product.updateMany({
    where: { title: 'Sample' },
    data: {
      title: 'Pro-Collagen Anti-Ageing Cream',
      images: PRODUCT_IMAGES.moisturizer,
    },
  });
  await prisma.product.updateMany({
    where: { title: 'Testing img' },
    data: {
      title: 'Moroccan Argan Oil Shampoo',
      images: PRODUCT_IMAGES.shampoo,
    },
  });
  await prisma.product.updateMany({
    where: { title: 'New prod' },
    data: {
      title: 'Deep Conditioning Hair Mask',
      images: PRODUCT_IMAGES.hairMask,
    },
  });
  await prisma.product.updateMany({
    where: { title: 'Seal' },
    data: {
      title: 'Hydrating Hyaluronic Serum',
      images: PRODUCT_IMAGES.serum,
    },
  });
  await prisma.product.updateMany({
    where: { title: 'New seal' },
    data: {
      title: 'Vitamin C Brightening Serum',
      images: PRODUCT_IMAGES.serum,
    },
  });

  // Add images to existing products that may lack them
  await prisma.product.updateMany({
    where: { title: 'Professional Shampoo - 16oz' },
    data: { images: PRODUCT_IMAGES.shampoo },
  });
  await prisma.product.updateMany({
    where: { title: 'Argan Oil Hair Serum' },
    data: { images: PRODUCT_IMAGES.hairOil },
  });
  await prisma.product.updateMany({
    where: { title: 'Heat Protection Spray' },
    data: { images: PRODUCT_IMAGES.hairOil },
  });
  await prisma.product.updateMany({
    where: { title: 'Nail Polish - Ruby Red' },
    data: { images: PRODUCT_IMAGES.nailPolish },
  });
  await prisma.product.updateMany({
    where: { title: 'Cuticle Oil' },
    data: { images: PRODUCT_IMAGES.moisturizer },
  });
  await prisma.product.updateMany({
    where: { title: 'Beard Oil - Sandalwood' },
    data: { images: PRODUCT_IMAGES.beardOil },
  });
  await prisma.product.updateMany({
    where: { title: 'Styling Pomade' },
    data: { images: PRODUCT_IMAGES.beardOil },
  });

  console.log('  ✅ Service and product names cleaned');
}

async function step4_addMoreProducts() {
  console.log('\n🛍️ Step 4: Adding more beauty & salon stock products...');

  interface ProductData {
    salonId: string;
    title: string;
    sku: string;
    price: number;
    quantity: number;
    images: string[];
  }

  const newProducts: ProductData[] = [
    // ── Glamour Studio ──
    {
      salonId: SALON_IDS.glamourStudio,
      title: 'Keratin Smoothing Treatment',
      sku: 'KRT-GS-001',
      price: 55.0,
      quantity: 20,
      images: PRODUCT_IMAGES.hairMask,
    },
    {
      salonId: SALON_IDS.glamourStudio,
      title: 'Volumizing Mousse - 8oz',
      sku: 'MUS-GS-001',
      price: 18.0,
      quantity: 40,
      images: PRODUCT_IMAGES.hairOil,
    },
    {
      salonId: SALON_IDS.glamourStudio,
      title: 'Deep Repair Hair Mask',
      sku: 'MASK-GS-001',
      price: 32.0,
      quantity: 30,
      images: PRODUCT_IMAGES.hairMask,
    },
    {
      salonId: SALON_IDS.glamourStudio,
      title: 'SPF 50 Hair & Scalp Sunscreen',
      sku: 'SUN-GS-001',
      price: 28.0,
      quantity: 25,
      images: PRODUCT_IMAGES.sunscreen,
    },

    // ── Urban Cuts & Color ──
    {
      salonId: SALON_IDS.urbanCuts,
      title: 'Gel Nail Kit - At-Home',
      sku: 'GEL-UC-001',
      price: 38.0,
      quantity: 35,
      images: PRODUCT_IMAGES.nailPolish,
    },
    {
      salonId: SALON_IDS.urbanCuts,
      title: 'Nail Strengthener Base Coat',
      sku: 'BASE-UC-001',
      price: 14.0,
      quantity: 70,
      images: PRODUCT_IMAGES.nailPolish,
    },
    {
      salonId: SALON_IDS.urbanCuts,
      title: 'Hydrating Hand Cream - Rose',
      sku: 'HCREAM-UC-001',
      price: 16.0,
      quantity: 55,
      images: PRODUCT_IMAGES.moisturizer,
    },
    {
      salonId: SALON_IDS.urbanCuts,
      title: "Men's 2-in-1 Shampoo & Conditioner",
      sku: 'MSH-UC-001',
      price: 24.0,
      quantity: 45,
      images: PRODUCT_IMAGES.shampoo,
    },

    // ── The Beauty Lounge ──
    {
      salonId: SALON_IDS.beautyLounge,
      title: 'Premium Shaving Cream',
      sku: 'SHAV-BL-001',
      price: 22.0,
      quantity: 40,
      images: PRODUCT_IMAGES.beardOil,
    },
    {
      salonId: SALON_IDS.beautyLounge,
      title: 'After-Shave Balm - Cool Mint',
      sku: 'ASB-BL-001',
      price: 19.0,
      quantity: 35,
      images: PRODUCT_IMAGES.moisturizer,
    },
    {
      salonId: SALON_IDS.beautyLounge,
      title: 'Hair Wax - Medium Hold',
      sku: 'WAX-BL-001',
      price: 16.0,
      quantity: 50,
      images: PRODUCT_IMAGES.beardOil,
    },
    {
      salonId: SALON_IDS.beautyLounge,
      title: "Men's Moisturiser - Oil Free",
      sku: 'MOIST-BL-001',
      price: 28.0,
      quantity: 30,
      images: PRODUCT_IMAGES.moisturizer,
    },

    // ── Luxe Hair & Spa ──
    {
      salonId: SALON_IDS.luxeHairSpa,
      title: 'Rose Water Toner Mist',
      sku: 'TONE-LH-001',
      price: 26.0,
      quantity: 40,
      images: PRODUCT_IMAGES.moisturizer,
    },
    {
      salonId: SALON_IDS.luxeHairSpa,
      title: 'Bio-Repair Scalp Serum',
      sku: 'SCALP-LH-001',
      price: 48.0,
      quantity: 18,
      images: PRODUCT_IMAGES.serum,
    },
    {
      salonId: SALON_IDS.luxeHairSpa,
      title: 'Aloe Vera Hair Growth Oil',
      sku: 'AGRO-LH-001',
      price: 34.0,
      quantity: 28,
      images: PRODUCT_IMAGES.hairOil,
    },
    {
      salonId: SALON_IDS.luxeHairSpa,
      title: 'Overnight Repair Hair Serum',
      sku: 'ORS-LH-001',
      price: 52.0,
      quantity: 15,
      images: PRODUCT_IMAGES.serum,
    },

    // ── Prime Beauty Collective ──
    {
      salonId: SALON_IDS.primBeauty,
      title: 'Retinol Anti-Wrinkle Cream',
      sku: 'RET-PB-001',
      price: 72.0,
      quantity: 12,
      images: PRODUCT_IMAGES.moisturizer,
    },
    {
      salonId: SALON_IDS.primBeauty,
      title: 'Luxury Eye Contour Cream',
      sku: 'EYE-PB-001',
      price: 68.0,
      quantity: 15,
      images: PRODUCT_IMAGES.moisturizer,
    },
    {
      salonId: SALON_IDS.primBeauty,
      title: 'Pearl Brightening Face Wash',
      sku: 'FW-PB-001',
      price: 34.0,
      quantity: 25,
      images: PRODUCT_IMAGES.moisturizer,
    },
    {
      salonId: SALON_IDS.primBeauty,
      title: 'HD Matte Foundation - 30ml',
      sku: 'FOUND-PB-001',
      price: 45.0,
      quantity: 20,
      images: PRODUCT_IMAGES.faceMask,
    },

    // ── Krrish Luxe Salon (jasKrrishSalon) ──
    {
      salonId: SALON_IDS.jasKrrishSalon,
      title: 'Protein-Rich Hair Serum',
      sku: 'PS-KLS-001',
      price: 36.0,
      quantity: 30,
      images: PRODUCT_IMAGES.serum,
    },
    {
      salonId: SALON_IDS.jasKrrishSalon,
      title: 'Charcoal Detox Shampoo',
      sku: 'CDS-KLS-001',
      price: 28.0,
      quantity: 35,
      images: PRODUCT_IMAGES.shampoo,
    },
    {
      salonId: SALON_IDS.jasKrrishSalon,
      title: 'Anti-Dandruff Scalp Mask',
      sku: 'ADM-KLS-001',
      price: 24.0,
      quantity: 40,
      images: PRODUCT_IMAGES.hairMask,
    },
    {
      salonId: SALON_IDS.jasKrrishSalon,
      title: 'Biotin Hair Growth Supplement',
      sku: 'BIOT-KLS-001',
      price: 42.0,
      quantity: 20,
      images: PRODUCT_IMAGES.hairOil,
    },

    // ── Glamour Beauty Studio (smthSalon) ──
    {
      salonId: SALON_IDS.smthSalon,
      title: 'Gloss Nourishing Conditioner',
      sku: 'GNC-GBS-001',
      price: 30.0,
      quantity: 35,
      images: PRODUCT_IMAGES.conditioner,
    },
    {
      salonId: SALON_IDS.smthSalon,
      title: 'Colour-Protect Shampoo - 500ml',
      sku: 'CPS-GBS-001',
      price: 26.0,
      quantity: 40,
      images: PRODUCT_IMAGES.shampoo,
    },
    {
      salonId: SALON_IDS.smthSalon,
      title: 'Hydrating Eye Shadow Palette',
      sku: 'ESP-GBS-001',
      price: 38.0,
      quantity: 25,
      images: PRODUCT_IMAGES.eyeshadow,
    },
    {
      salonId: SALON_IDS.smthSalon,
      title: 'Long-Lasting Lip Colour',
      sku: 'LLC-GBS-001',
      price: 18.0,
      quantity: 60,
      images: PRODUCT_IMAGES.lipstick,
    },

    // ── Royal Glam Studio ──
    {
      salonId: SALON_IDS.royalStudio,
      title: 'Golden Glow Face Oil',
      sku: 'GFO-RGS-001',
      price: 58.0,
      quantity: 15,
      images: PRODUCT_IMAGES.serum,
    },
    {
      salonId: SALON_IDS.royalStudio,
      title: 'Luxury Collagen Face Mask',
      sku: 'CFM-RGS-001',
      price: 44.0,
      quantity: 20,
      images: PRODUCT_IMAGES.faceMask,
    },
    {
      salonId: SALON_IDS.royalStudio,
      title: 'SPF 30 Daily Moisturiser',
      sku: 'SPF-RGS-001',
      price: 32.0,
      quantity: 30,
      images: PRODUCT_IMAGES.sunscreen,
    },
    {
      salonId: SALON_IDS.royalStudio,
      title: 'Rose Hip Brightening Serum',
      sku: 'RHS-RGS-001',
      price: 62.0,
      quantity: 18,
      images: PRODUCT_IMAGES.serum,
    },

    // ── Elegance Hair Lounge ──
    {
      salonId: SALON_IDS.testSalon,
      title: 'Shea Butter Deep Conditioner',
      sku: 'SDC-EHL-001',
      price: 29.0,
      quantity: 35,
      images: PRODUCT_IMAGES.conditioner,
    },
    {
      salonId: SALON_IDS.testSalon,
      title: 'Bond Repair Treatment',
      sku: 'BRT-EHL-001',
      price: 48.0,
      quantity: 20,
      images: PRODUCT_IMAGES.hairMask,
    },
    {
      salonId: SALON_IDS.testSalon,
      title: 'Thermal Protectant Spray',
      sku: 'TPS-EHL-001',
      price: 22.0,
      quantity: 45,
      images: PRODUCT_IMAGES.hairOil,
    },

    // ── Revive Beauty Spa ──
    {
      salonId: SALON_IDS.exStudio,
      title: 'Lavender Body Butter',
      sku: 'LBB-RBS-001',
      price: 36.0,
      quantity: 25,
      images: PRODUCT_IMAGES.moisturizer,
    },
    {
      salonId: SALON_IDS.exStudio,
      title: 'Exfoliating Sugar Scrub',
      sku: 'ESS-RBS-001',
      price: 28.0,
      quantity: 30,
      images: PRODUCT_IMAGES.faceMask,
    },
    {
      salonId: SALON_IDS.exStudio,
      title: 'Aromatherapy Massage Oil',
      sku: 'AMO-RBS-001',
      price: 34.0,
      quantity: 20,
      images: PRODUCT_IMAGES.hairOil,
    },

    // ── Golden Glow Salon ──
    {
      salonId: SALON_IDS.example1,
      title: 'Glitter Nail Polish Set - 6 Pack',
      sku: 'GNS-GGS-001',
      price: 32.0,
      quantity: 50,
      images: PRODUCT_IMAGES.nailPolish,
    },
    {
      salonId: SALON_IDS.example1,
      title: 'Nail Art Sticker Kit',
      sku: 'NAS-GGS-001',
      price: 14.0,
      quantity: 80,
      images: PRODUCT_IMAGES.nailPolish,
    },
    {
      salonId: SALON_IDS.example1,
      title: 'Cuticle Repair Serum',
      sku: 'CRS-GGS-001',
      price: 18.0,
      quantity: 60,
      images: PRODUCT_IMAGES.moisturizer,
    },
  ];

  let created = 0;
  for (const p of newProducts) {
    try {
      await prisma.product.create({ data: p });
      created++;
    } catch {
      // Skip if SKU already exists
    }
  }
  console.log(`  ✅ Added ${created} new products`);
}

async function step5_addServicesToEmptySalons() {
  console.log('\n💅 Step 5: Adding services to salons that have none...');

  interface ServiceData {
    salonId: string;
    title: string;
    durationMinutes: number;
    price: number;
    category: string;
    image: string;
  }

  const newServices: ServiceData[] = [
    // Luxe Hair & Spa
    {
      salonId: SALON_IDS.luxeHairSpa,
      title: "Women's Haircut & Blowdry",
      durationMinutes: 75,
      price: 75.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[0],
    },
    {
      salonId: SALON_IDS.luxeHairSpa,
      title: 'Hair Spa & Scalp Massage',
      durationMinutes: 60,
      price: 55.0,
      category: 'hair',
      image: SALON_IMAGES.spa[0],
    },
    {
      salonId: SALON_IDS.luxeHairSpa,
      title: 'Balayage & Ombre Colour',
      durationMinutes: 180,
      price: 200.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[1],
    },
    {
      salonId: SALON_IDS.luxeHairSpa,
      title: 'Anti-Frizz Keratin Treatment',
      durationMinutes: 120,
      price: 160.0,
      category: 'hair',
      image: SALON_IMAGES.beautyLounge[0],
    },

    // Prime Beauty Collective
    {
      salonId: SALON_IDS.primBeauty,
      title: 'HydraFacial Treatment',
      durationMinutes: 60,
      price: 120.0,
      category: 'facial',
      image: SALON_IMAGES.spa[0],
    },
    {
      salonId: SALON_IDS.primBeauty,
      title: 'Full Body Massage',
      durationMinutes: 90,
      price: 95.0,
      category: 'massage',
      image: SALON_IMAGES.spa[1],
    },
    {
      salonId: SALON_IDS.primBeauty,
      title: 'LED Light Therapy Facial',
      durationMinutes: 45,
      price: 85.0,
      category: 'facial',
      image: SALON_IMAGES.spa[2],
    },
    {
      salonId: SALON_IDS.primBeauty,
      title: 'Lash Lift & Tint',
      durationMinutes: 60,
      price: 65.0,
      category: 'beauty',
      image: SALON_IMAGES.beautyLounge[0],
    },

    // Royal Glam Studio
    {
      salonId: SALON_IDS.royalStudio,
      title: 'Luxury Facial',
      durationMinutes: 60,
      price: 80.0,
      category: 'facial',
      image: SALON_IMAGES.spa[0],
    },
    {
      salonId: SALON_IDS.royalStudio,
      title: "Women's Haircut & Style",
      durationMinutes: 60,
      price: 60.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[0],
    },
    {
      salonId: SALON_IDS.royalStudio,
      title: 'Eyebrow Threading & Tint',
      durationMinutes: 30,
      price: 25.0,
      category: 'beauty',
      image: SALON_IMAGES.beautyLounge[1],
    },
    {
      salonId: SALON_IDS.royalStudio,
      title: 'Bridal Makeup Package',
      durationMinutes: 120,
      price: 200.0,
      category: 'makeup',
      image: SALON_IMAGES.beautyLounge[2],
    },

    // Elegance Hair Lounge
    {
      salonId: SALON_IDS.testSalon,
      title: 'Precision Haircut',
      durationMinutes: 45,
      price: 45.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[0],
    },
    {
      salonId: SALON_IDS.testSalon,
      title: 'Highlights & Toning',
      durationMinutes: 120,
      price: 130.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[1],
    },
    {
      salonId: SALON_IDS.testSalon,
      title: 'Scalp Treatment',
      durationMinutes: 45,
      price: 40.0,
      category: 'hair',
      image: SALON_IMAGES.spa[0],
    },

    // Revive Beauty Spa
    {
      salonId: SALON_IDS.exStudio,
      title: 'Swedish Massage',
      durationMinutes: 60,
      price: 70.0,
      category: 'massage',
      image: SALON_IMAGES.spa[0],
    },
    {
      salonId: SALON_IDS.exStudio,
      title: 'Deep Tissue Massage',
      durationMinutes: 90,
      price: 90.0,
      category: 'massage',
      image: SALON_IMAGES.spa[1],
    },
    {
      salonId: SALON_IDS.exStudio,
      title: 'Aromatherapy Facial',
      durationMinutes: 60,
      price: 65.0,
      category: 'facial',
      image: SALON_IMAGES.spa[2],
    },

    // Golden Glow Salon
    {
      salonId: SALON_IDS.example1,
      title: 'Classic Manicure',
      durationMinutes: 45,
      price: 28.0,
      category: 'nails',
      image: SALON_IMAGES.nailSalon[0],
    },
    {
      salonId: SALON_IDS.example1,
      title: 'Gel Pedicure',
      durationMinutes: 60,
      price: 45.0,
      category: 'nails',
      image: SALON_IMAGES.nailSalon[1],
    },
    {
      salonId: SALON_IDS.example1,
      title: 'Nail Art Design',
      durationMinutes: 30,
      price: 20.0,
      category: 'nails',
      image: SALON_IMAGES.nailSalon[2],
    },
    {
      salonId: SALON_IDS.example1,
      title: 'Acrylic Nail Extensions',
      durationMinutes: 90,
      price: 65.0,
      category: 'nails',
      image: SALON_IMAGES.nailSalon[0],
    },

    // Modern Chic Salon
    {
      salonId: SALON_IDS.modernSal,
      title: 'Trendy Bob Haircut',
      durationMinutes: 45,
      price: 55.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[0],
    },
    {
      salonId: SALON_IDS.modernSal,
      title: 'Ombre Hair Colour',
      durationMinutes: 150,
      price: 175.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[1],
    },
    {
      salonId: SALON_IDS.modernSal,
      title: 'Express Blowout',
      durationMinutes: 30,
      price: 35.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[2],
    },

    // Metro Glow Studio
    {
      salonId: SALON_IDS.salonImgStudios,
      title: "Ladies' Haircut & Style",
      durationMinutes: 60,
      price: 50.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[0],
    },
    {
      salonId: SALON_IDS.salonImgStudios,
      title: 'Hair Colour - Balayage',
      durationMinutes: 150,
      price: 180.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[1],
    },
    {
      salonId: SALON_IDS.salonImgStudios,
      title: 'Relaxing Head Massage',
      durationMinutes: 30,
      price: 25.0,
      category: 'massage',
      image: SALON_IMAGES.spa[0],
    },

    // Serene Nail & Beauty
    {
      salonId: SALON_IDS.imgFixSalon,
      title: 'Luxury Manicure',
      durationMinutes: 60,
      price: 38.0,
      category: 'nails',
      image: SALON_IMAGES.nailSalon[0],
    },
    {
      salonId: SALON_IDS.imgFixSalon,
      title: 'Spa Pedicure',
      durationMinutes: 75,
      price: 50.0,
      category: 'nails',
      image: SALON_IMAGES.nailSalon[1],
    },
    {
      salonId: SALON_IDS.imgFixSalon,
      title: 'Nail Art & Extensions',
      durationMinutes: 90,
      price: 70.0,
      category: 'nails',
      image: SALON_IMAGES.nailSalon[2],
    },

    // Jade & Stone Spa
    {
      salonId: SALON_IDS.jksSS,
      title: 'Hot Stone Massage',
      durationMinutes: 90,
      price: 100.0,
      category: 'massage',
      image: SALON_IMAGES.spa[0],
    },
    {
      salonId: SALON_IDS.jksSS,
      title: 'Jade Roller Facial',
      durationMinutes: 60,
      price: 75.0,
      category: 'facial',
      image: SALON_IMAGES.spa[1],
    },
    {
      salonId: SALON_IDS.jksSS,
      title: 'Body Wrap Treatment',
      durationMinutes: 75,
      price: 85.0,
      category: 'massage',
      image: SALON_IMAGES.spa[2],
    },

    // Luxuria Beauty Bar
    {
      salonId: SALON_IDS.luxStudio,
      title: 'Brow Lamination',
      durationMinutes: 45,
      price: 55.0,
      category: 'beauty',
      image: SALON_IMAGES.beautyLounge[0],
    },
    {
      salonId: SALON_IDS.luxStudio,
      title: 'Lash Extensions - Classic',
      durationMinutes: 90,
      price: 80.0,
      category: 'beauty',
      image: SALON_IMAGES.beautyLounge[1],
    },
    {
      salonId: SALON_IDS.luxStudio,
      title: 'Full Face Waxing',
      durationMinutes: 30,
      price: 30.0,
      category: 'beauty',
      image: SALON_IMAGES.beautyLounge[2],
    },

    // Blossom Hair Studio
    {
      salonId: SALON_IDS.newSalon3,
      title: 'Hair Wash & Blowdry',
      durationMinutes: 45,
      price: 35.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[0],
    },
    {
      salonId: SALON_IDS.newSalon3,
      title: 'Straightening Treatment',
      durationMinutes: 120,
      price: 150.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[1],
    },
    {
      salonId: SALON_IDS.newSalon3,
      title: 'Hair Colour - Global',
      durationMinutes: 90,
      price: 100.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[2],
    },

    // Aura Beauty Studio
    {
      salonId: SALON_IDS.newStudio,
      title: 'Bridal Hair & Makeup',
      durationMinutes: 180,
      price: 250.0,
      category: 'makeup',
      image: SALON_IMAGES.beautyLounge[0],
    },
    {
      salonId: SALON_IDS.newStudio,
      title: 'Party Makeup',
      durationMinutes: 60,
      price: 85.0,
      category: 'makeup',
      image: SALON_IMAGES.beautyLounge[1],
    },
    {
      salonId: SALON_IDS.newStudio,
      title: "Women's Haircut",
      durationMinutes: 60,
      price: 55.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[0],
    },

    // Pearl Beauty Boutique
    {
      salonId: SALON_IDS.newSalon2,
      title: 'Derma Facial',
      durationMinutes: 60,
      price: 90.0,
      category: 'facial',
      image: SALON_IMAGES.spa[0],
    },
    {
      salonId: SALON_IDS.newSalon2,
      title: 'Hydra Boost Facial',
      durationMinutes: 75,
      price: 75.0,
      category: 'facial',
      image: SALON_IMAGES.spa[1],
    },
    {
      salonId: SALON_IDS.newSalon2,
      title: 'Full Body Wax',
      durationMinutes: 90,
      price: 80.0,
      category: 'beauty',
      image: SALON_IMAGES.beautyLounge[0],
    },

    // Lagoon Beauty Studio
    {
      salonId: SALON_IDS.lagmourStdio,
      title: 'Ayurvedic Hair Spa',
      durationMinutes: 60,
      price: 45.0,
      category: 'hair',
      image: SALON_IMAGES.spa[0],
    },
    {
      salonId: SALON_IDS.lagmourStdio,
      title: 'Scalp Micropigmentation',
      durationMinutes: 120,
      price: 180.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[0],
    },
    {
      salonId: SALON_IDS.lagmourStdio,
      title: 'Manicure & Pedicure Combo',
      durationMinutes: 90,
      price: 60.0,
      category: 'nails',
      image: SALON_IMAGES.nailSalon[0],
    },

    // Velvet Touch Salon
    {
      salonId: SALON_IDS.newestSalon,
      title: 'Velvet Glow Facial',
      durationMinutes: 60,
      price: 70.0,
      category: 'facial',
      image: SALON_IMAGES.spa[0],
    },
    {
      salonId: SALON_IDS.newestSalon,
      title: "Ladies' Cut & Style",
      durationMinutes: 60,
      price: 55.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[0],
    },
    {
      salonId: SALON_IDS.newestSalon,
      title: 'Spa Manicure',
      durationMinutes: 45,
      price: 32.0,
      category: 'nails',
      image: SALON_IMAGES.nailSalon[0],
    },

    // Sunrise Beauty Centre
    {
      salonId: SALON_IDS.newSalon1,
      title: 'Hair Rebonding',
      durationMinutes: 180,
      price: 160.0,
      category: 'hair',
      image: SALON_IMAGES.hairSalon[0],
    },
    {
      salonId: SALON_IDS.newSalon1,
      title: 'Eyebrow Microblading',
      durationMinutes: 90,
      price: 120.0,
      category: 'beauty',
      image: SALON_IMAGES.beautyLounge[0],
    },
    {
      salonId: SALON_IDS.newSalon1,
      title: 'Full Body Scrub',
      durationMinutes: 60,
      price: 65.0,
      category: 'massage',
      image: SALON_IMAGES.spa[0],
    },
  ];

  let created = 0;
  for (const s of newServices) {
    await prisma.service.create({ data: s });
    created++;
  }
  console.log(`  ✅ Added ${created} new services`);
}

async function step6_addStaffToSalonsWithNone() {
  console.log('\n👤 Step 6: Adding staff to salons with no/few staff...');

  interface StaffEntry {
    salonId: string;
    name: string;
    image: string;
    availability: Record<string, string[]>;
    averageRating: number;
    totalRatings: number;
  }

  const staffToAdd: StaffEntry[] = [
    // ── Luxe Hair & Spa ──
    {
      salonId: SALON_IDS.luxeHairSpa,
      name: 'Ananya Krishnan',
      image: STAFF_IMAGES.female[0],
      availability: {
        monday: ['09:00-17:00'],
        tuesday: ['09:00-17:00'],
        wednesday: ['09:00-17:00'],
        thursday: ['09:00-17:00'],
        friday: ['09:00-17:00'],
      },
      averageRating: 4.8,
      totalRatings: 42,
    },
    {
      salonId: SALON_IDS.luxeHairSpa,
      name: 'Rohan Verma',
      image: STAFF_IMAGES.male[0],
      availability: {
        tuesday: ['10:00-18:00'],
        wednesday: ['10:00-18:00'],
        thursday: ['10:00-18:00'],
        friday: ['10:00-18:00'],
        saturday: ['10:00-18:00'],
      },
      averageRating: 4.7,
      totalRatings: 38,
    },
    {
      salonId: SALON_IDS.luxeHairSpa,
      name: 'Meera Nair',
      image: STAFF_IMAGES.female[1],
      availability: {
        monday: ['10:00-19:00'],
        wednesday: ['10:00-19:00'],
        thursday: ['10:00-19:00'],
        friday: ['10:00-19:00'],
        saturday: ['09:00-17:00'],
      },
      averageRating: 4.9,
      totalRatings: 56,
    },

    // ── Prime Beauty Collective ──
    {
      salonId: SALON_IDS.primBeauty,
      name: 'Isabella Fernandez',
      image: STAFF_IMAGES.female[2],
      availability: {
        monday: ['09:00-17:00'],
        tuesday: ['09:00-17:00'],
        wednesday: ['09:00-17:00'],
        thursday: ['09:00-17:00'],
        friday: ['09:00-17:00'],
      },
      averageRating: 4.9,
      totalRatings: 67,
    },
    {
      salonId: SALON_IDS.primBeauty,
      name: 'Arjun Kapoor',
      image: STAFF_IMAGES.male[1],
      availability: {
        tuesday: ['10:00-18:00'],
        wednesday: ['10:00-18:00'],
        thursday: ['10:00-18:00'],
        friday: ['10:00-18:00'],
        saturday: ['10:00-18:00'],
      },
      averageRating: 4.6,
      totalRatings: 29,
    },
    {
      salonId: SALON_IDS.primBeauty,
      name: 'Fatima Al-Hassan',
      image: STAFF_IMAGES.female[3],
      availability: {
        monday: ['10:00-19:00'],
        tuesday: ['10:00-19:00'],
        thursday: ['10:00-19:00'],
        friday: ['10:00-19:00'],
        saturday: ['09:00-17:00'],
      },
      averageRating: 4.8,
      totalRatings: 51,
    },

    // ── Royal Glam Studio ──
    {
      salonId: SALON_IDS.royalStudio,
      name: 'Preethi Subramaniam',
      image: STAFF_IMAGES.female[4],
      availability: {
        monday: ['10:00-19:00'],
        tuesday: ['10:00-19:00'],
        wednesday: ['10:00-19:00'],
        friday: ['10:00-20:00'],
        saturday: ['09:00-18:00'],
      },
      averageRating: 4.7,
      totalRatings: 33,
    },
    {
      salonId: SALON_IDS.royalStudio,
      name: 'Daniel Okafor',
      image: STAFF_IMAGES.male[2],
      availability: {
        monday: ['10:00-18:00'],
        tuesday: ['10:00-18:00'],
        wednesday: ['10:00-18:00'],
        thursday: ['10:00-18:00'],
        saturday: ['10:00-17:00'],
      },
      averageRating: 4.5,
      totalRatings: 21,
    },

    // ── Elegance Hair Lounge ──
    {
      salonId: SALON_IDS.testSalon,
      name: 'Sunita Rao',
      image: STAFF_IMAGES.female[0],
      availability: {
        monday: ['09:00-17:00'],
        tuesday: ['09:00-17:00'],
        wednesday: ['09:00-17:00'],
        thursday: ['09:00-17:00'],
        friday: ['09:00-17:00'],
      },
      averageRating: 4.6,
      totalRatings: 24,
    },
    {
      salonId: SALON_IDS.testSalon,
      name: 'Marco Silva',
      image: STAFF_IMAGES.male[3],
      availability: {
        tuesday: ['10:00-18:00'],
        thursday: ['10:00-18:00'],
        friday: ['10:00-18:00'],
        saturday: ['09:00-17:00'],
      },
      averageRating: 4.4,
      totalRatings: 17,
    },

    // ── Revive Beauty Spa ──
    {
      salonId: SALON_IDS.exStudio,
      name: 'Kavya Reddy',
      image: STAFF_IMAGES.female[1],
      availability: {
        monday: ['10:00-19:00'],
        tuesday: ['10:00-19:00'],
        wednesday: ['10:00-19:00'],
        thursday: ['10:00-19:00'],
        friday: ['10:00-19:00'],
      },
      averageRating: 4.8,
      totalRatings: 45,
    },
    {
      salonId: SALON_IDS.exStudio,
      name: 'Thomas Mwangi',
      image: STAFF_IMAGES.male[0],
      availability: {
        tuesday: ['10:00-18:00'],
        wednesday: ['10:00-18:00'],
        thursday: ['10:00-18:00'],
        friday: ['10:00-18:00'],
        saturday: ['10:00-17:00'],
      },
      averageRating: 4.6,
      totalRatings: 31,
    },

    // ── Golden Glow Salon ──
    {
      salonId: SALON_IDS.example1,
      name: 'Divya Pillai',
      image: STAFF_IMAGES.female[2],
      availability: {
        monday: ['09:00-18:00'],
        tuesday: ['09:00-18:00'],
        wednesday: ['09:00-18:00'],
        thursday: ['09:00-18:00'],
        friday: ['09:00-18:00'],
      },
      averageRating: 4.7,
      totalRatings: 39,
    },
    {
      salonId: SALON_IDS.example1,
      name: 'Kevin Nair',
      image: STAFF_IMAGES.male[1],
      availability: {
        tuesday: ['10:00-18:00'],
        wednesday: ['10:00-18:00'],
        friday: ['10:00-18:00'],
        saturday: ['09:00-17:00'],
      },
      averageRating: 4.5,
      totalRatings: 18,
    },

    // ── Modern Chic Salon ──
    {
      salonId: SALON_IDS.modernSal,
      name: 'Priya Iyer',
      image: STAFF_IMAGES.female[3],
      availability: {
        monday: ['09:00-17:00'],
        tuesday: ['09:00-17:00'],
        wednesday: ['09:00-17:00'],
        thursday: ['09:00-17:00'],
        friday: ['09:00-17:00'],
      },
      averageRating: 4.6,
      totalRatings: 28,
    },
    {
      salonId: SALON_IDS.modernSal,
      name: 'Ravi Shankar',
      image: STAFF_IMAGES.male[2],
      availability: {
        tuesday: ['10:00-18:00'],
        wednesday: ['10:00-18:00'],
        thursday: ['10:00-18:00'],
        saturday: ['09:00-17:00'],
      },
      averageRating: 4.4,
      totalRatings: 15,
    },

    // ── Metro Glow Studio ──
    {
      salonId: SALON_IDS.salonImgStudios,
      name: 'Nisha Patel',
      image: STAFF_IMAGES.female[4],
      availability: {
        monday: ['09:00-18:00'],
        tuesday: ['09:00-18:00'],
        wednesday: ['09:00-18:00'],
        thursday: ['09:00-18:00'],
        friday: ['09:00-18:00'],
      },
      averageRating: 4.7,
      totalRatings: 32,
    },

    // ── Serene Nail & Beauty ──
    {
      salonId: SALON_IDS.imgFixSalon,
      name: 'Lakshmi Venkat',
      image: STAFF_IMAGES.female[0],
      availability: {
        monday: ['09:00-18:00'],
        tuesday: ['09:00-18:00'],
        wednesday: ['09:00-18:00'],
        thursday: ['09:00-18:00'],
        friday: ['09:00-18:00'],
      },
      averageRating: 4.8,
      totalRatings: 47,
    },
    {
      salonId: SALON_IDS.imgFixSalon,
      name: 'Amy Chen',
      image: STAFF_IMAGES.female[1],
      availability: {
        tuesday: ['10:00-18:00'],
        wednesday: ['10:00-18:00'],
        thursday: ['10:00-18:00'],
        friday: ['10:00-18:00'],
        saturday: ['09:00-17:00'],
      },
      averageRating: 4.6,
      totalRatings: 29,
    },

    // ── Jade & Stone Spa ──
    {
      salonId: SALON_IDS.jksSS,
      name: 'Zara Mohammed',
      image: STAFF_IMAGES.female[2],
      availability: {
        monday: ['10:00-19:00'],
        tuesday: ['10:00-19:00'],
        wednesday: ['10:00-19:00'],
        thursday: ['10:00-19:00'],
        friday: ['10:00-19:00'],
      },
      averageRating: 4.9,
      totalRatings: 58,
    },
    {
      salonId: SALON_IDS.jksSS,
      name: 'Carlos Diaz',
      image: STAFF_IMAGES.male[3],
      availability: {
        tuesday: ['10:00-18:00'],
        wednesday: ['10:00-18:00'],
        thursday: ['10:00-18:00'],
        friday: ['10:00-18:00'],
        saturday: ['10:00-17:00'],
      },
      averageRating: 4.7,
      totalRatings: 34,
    },

    // ── Luxuria Beauty Bar ──
    {
      salonId: SALON_IDS.luxStudio,
      name: 'Sophie Laurent',
      image: STAFF_IMAGES.female[3],
      availability: {
        monday: ['10:00-19:00'],
        tuesday: ['10:00-19:00'],
        wednesday: ['10:00-19:00'],
        thursday: ['10:00-19:00'],
        friday: ['10:00-19:00'],
      },
      averageRating: 4.8,
      totalRatings: 43,
    },

    // ── Blossom Hair Studio ──
    {
      salonId: SALON_IDS.newSalon3,
      name: 'Shreya Mishra',
      image: STAFF_IMAGES.female[4],
      availability: {
        monday: ['09:00-17:00'],
        tuesday: ['09:00-17:00'],
        wednesday: ['09:00-17:00'],
        thursday: ['09:00-17:00'],
        friday: ['09:00-17:00'],
      },
      averageRating: 4.6,
      totalRatings: 26,
    },
    {
      salonId: SALON_IDS.newSalon3,
      name: 'Mohammed Ali',
      image: STAFF_IMAGES.male[0],
      availability: {
        tuesday: ['10:00-18:00'],
        wednesday: ['10:00-18:00'],
        thursday: ['10:00-18:00'],
        saturday: ['09:00-17:00'],
      },
      averageRating: 4.5,
      totalRatings: 19,
    },

    // ── Aura Beauty Studio ──
    {
      salonId: SALON_IDS.newStudio,
      name: 'Elena Popescu',
      image: STAFF_IMAGES.female[0],
      availability: {
        monday: ['09:00-18:00'],
        tuesday: ['09:00-18:00'],
        wednesday: ['09:00-18:00'],
        thursday: ['09:00-18:00'],
        friday: ['09:00-18:00'],
      },
      averageRating: 4.7,
      totalRatings: 37,
    },

    // ── Pearl Beauty Boutique ──
    {
      salonId: SALON_IDS.newSalon2,
      name: 'Anjali Singh',
      image: STAFF_IMAGES.female[1],
      availability: {
        monday: ['10:00-19:00'],
        tuesday: ['10:00-19:00'],
        wednesday: ['10:00-19:00'],
        thursday: ['10:00-19:00'],
        friday: ['10:00-19:00'],
      },
      averageRating: 4.8,
      totalRatings: 52,
    },
    {
      salonId: SALON_IDS.newSalon2,
      name: 'Aryan Malhotra',
      image: STAFF_IMAGES.male[1],
      availability: {
        tuesday: ['10:00-18:00'],
        wednesday: ['10:00-18:00'],
        thursday: ['10:00-18:00'],
        saturday: ['09:00-17:00'],
      },
      averageRating: 4.4,
      totalRatings: 16,
    },

    // ── Lagoon Beauty Studio ──
    {
      salonId: SALON_IDS.lagmourStdio,
      name: 'Priyanka Das',
      image: STAFF_IMAGES.female[2],
      availability: {
        monday: ['09:00-17:00'],
        tuesday: ['09:00-17:00'],
        wednesday: ['09:00-17:00'],
        thursday: ['09:00-17:00'],
        friday: ['09:00-17:00'],
      },
      averageRating: 4.6,
      totalRatings: 23,
    },

    // ── Velvet Touch Salon ──
    {
      salonId: SALON_IDS.newestSalon,
      name: 'Sara Ahuja',
      image: STAFF_IMAGES.female[3],
      availability: {
        monday: ['09:00-18:00'],
        tuesday: ['09:00-18:00'],
        wednesday: ['09:00-18:00'],
        thursday: ['09:00-18:00'],
        friday: ['09:00-18:00'],
      },
      averageRating: 4.7,
      totalRatings: 31,
    },

    // ── Sunrise Beauty Centre ──
    {
      salonId: SALON_IDS.newSalon1,
      name: 'Riya Desai',
      image: STAFF_IMAGES.female[4],
      availability: {
        monday: ['09:00-17:00'],
        tuesday: ['09:00-17:00'],
        wednesday: ['09:00-17:00'],
        thursday: ['09:00-17:00'],
        friday: ['09:00-17:00'],
      },
      averageRating: 4.7,
      totalRatings: 28,
    },
    {
      salonId: SALON_IDS.newSalon1,
      name: 'Sanjay Kumar',
      image: STAFF_IMAGES.male[2],
      availability: {
        tuesday: ['10:00-18:00'],
        thursday: ['10:00-18:00'],
        friday: ['10:00-18:00'],
        saturday: ['09:00-17:00'],
      },
      averageRating: 4.5,
      totalRatings: 14,
    },

    // ── New salon 2 / Pearl ──  (needs extra staff on previously empty salons)
    {
      salonId: SALON_IDS.newSalon2,
      name: 'Isha Choudhury',
      image: STAFF_IMAGES.female[0],
      availability: {
        monday: ['10:00-18:00'],
        wednesday: ['10:00-18:00'],
        friday: ['10:00-18:00'],
        saturday: ['09:00-16:00'],
      },
      averageRating: 4.6,
      totalRatings: 22,
    },
  ];

  let created = 0;
  for (const s of staffToAdd) {
    await prisma.staff.create({ data: s });
    created++;
  }
  console.log(`  ✅ Added ${created} new staff members`);
}

async function step7_addOffersWithCarouselImages() {
  console.log('\n🎁 Step 7: Adding active carousel offers for salons & products...');

  // Get product IDs for offer linking
  const allProducts = await prisma.product.findMany({
    select: { id: true, salonId: true, title: true },
  });

  const productBySalon = (salonId: string) => allProducts.filter((p) => p.salonId === salonId);

  // Get service IDs
  const allServices = await prisma.service.findMany({
    select: { id: true, salonId: true, title: true },
  });
  const serviceBySalon = (salonId: string) => allServices.filter((s) => s.salonId === salonId);

  interface OfferData {
    salonId: string;
    title: string;
    description: string;
    offerType: string;
    discountType: string;
    discountValue: number;
    startsAt: Date;
    endsAt: Date;
    isActive: boolean;
    image: string;
    productId?: string;
    serviceId?: string;
  }

  const offers: OfferData[] = [
    // ── Glamour Studio ──
    {
      salonId: SALON_IDS.glamourStudio,
      title: 'Summer Hair Makeover — 20% Off',
      description:
        'Transform your look this summer! Get 20% off on all hair colour and balayage services.',
      offerType: 'seasonal',
      discountType: 'percentage',
      discountValue: 20,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[0],
      serviceId: serviceBySalon(SALON_IDS.glamourStudio)[0]?.id,
    },
    {
      salonId: SALON_IDS.glamourStudio,
      title: 'Buy 2 Hair Products, Get 1 Free',
      description: 'Stock up on salon-grade products. Buy any 2 and take a third one home free!',
      offerType: 'bundle',
      discountType: 'flat',
      discountValue: 28,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[1],
      productId: productBySalon(SALON_IDS.glamourStudio)[0]?.id,
    },

    // ── Urban Cuts & Color ──
    {
      salonId: SALON_IDS.urbanCuts,
      title: 'Mani-Pedi Duo — Save ₹500',
      description:
        'Book a manicure and pedicure together and save big. Perfect pre-event pampering.',
      offerType: 'combo',
      discountType: 'flat',
      discountValue: 500,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[7],
      serviceId: serviceBySalon(SALON_IDS.urbanCuts)[0]?.id,
    },
    {
      salonId: SALON_IDS.urbanCuts,
      title: 'Nail Products — 15% Off Sitewide',
      description: 'Treat your nails right. 15% off all nail care products this month.',
      offerType: 'sale',
      discountType: 'percentage',
      discountValue: 15,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[2],
      productId: productBySalon(SALON_IDS.urbanCuts)[0]?.id,
    },

    // ── The Beauty Lounge ──
    {
      salonId: SALON_IDS.beautyLounge,
      title: "Men's Grooming Day — 25% Off",
      description: 'Haircut, beard trim & hot towel shave. All-in-one grooming day at 25% off.',
      offerType: 'seasonal',
      discountType: 'percentage',
      discountValue: 25,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[3],
      serviceId: serviceBySalon(SALON_IDS.beautyLounge)[0]?.id,
    },

    // ── Luxe Hair & Spa ──
    {
      salonId: SALON_IDS.luxeHairSpa,
      title: 'Spa Sunday Special — 30% Off',
      description:
        'Unwind with our signature spa treatments every Sunday. 30% off all spa services.',
      offerType: 'weekly',
      discountType: 'percentage',
      discountValue: 30,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[5],
      serviceId: serviceBySalon(SALON_IDS.luxeHairSpa)[0]?.id,
    },
    {
      salonId: SALON_IDS.luxeHairSpa,
      title: 'Keratin Treatment Bonanza — ₹800 Off',
      description:
        'Get silky, frizz-free hair with our premium keratin treatment. Limited slots available.',
      offerType: 'limited',
      discountType: 'flat',
      discountValue: 800,
      startsAt: offerStart,
      endsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      image: OFFER_IMAGES[4],
      serviceId: serviceBySalon(SALON_IDS.luxeHairSpa)[2]?.id,
    },

    // ── Prime Beauty Collective ──
    {
      salonId: SALON_IDS.primBeauty,
      title: 'HydraFacial First-Time Offer — 40% Off',
      description:
        'Experience the gold standard of facials. First-timers get 40% off their HydraFacial.',
      offerType: 'first_time',
      discountType: 'percentage',
      discountValue: 40,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[6],
      serviceId: serviceBySalon(SALON_IDS.primBeauty)[0]?.id,
    },
    {
      salonId: SALON_IDS.primBeauty,
      title: 'Luxury Skincare — Buy & Save',
      description: 'Buy 2 premium skincare products, get 20% off your entire cart.',
      offerType: 'bundle',
      discountType: 'percentage',
      discountValue: 20,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[0],
      productId: productBySalon(SALON_IDS.primBeauty)[0]?.id,
    },

    // ── Krrish Luxe Salon ──
    {
      salonId: SALON_IDS.jasKrrishSalon,
      title: 'New Member Offer — 20% Off First Visit',
      description:
        'Welcome to Krrish Luxe! New customers enjoy 20% off their first service — on us.',
      offerType: 'first_time',
      discountType: 'percentage',
      discountValue: 20,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[1],
      serviceId: serviceBySalon(SALON_IDS.jasKrrishSalon)[0]?.id,
    },
    {
      salonId: SALON_IDS.jasKrrishSalon,
      title: 'Hair Care Combo — Products 15% Off',
      description: 'Grab our curated hair care bundle at 15% off. Suitable for all hair types.',
      offerType: 'bundle',
      discountType: 'percentage',
      discountValue: 15,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[2],
      productId: productBySalon(SALON_IDS.jasKrrishSalon)[0]?.id,
    },

    // ── Glamour Beauty Studio (smthSalon) ──
    {
      salonId: SALON_IDS.smthSalon,
      title: 'Weekend Glow Package — 25% Off',
      description: 'Hair + nails + makeup package every weekend. Book by Friday and save 25%.',
      offerType: 'weekly',
      discountType: 'percentage',
      discountValue: 25,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[3],
      serviceId: serviceBySalon(SALON_IDS.smthSalon)[0]?.id,
    },

    // ── Royal Glam Studio ──
    {
      salonId: SALON_IDS.royalStudio,
      title: 'Bridal Package Special — 35% Off',
      description:
        'Your big day deserves the best. Book our bridal makeup + hair package and save 35%.',
      offerType: 'seasonal',
      discountType: 'percentage',
      discountValue: 35,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[4],
      serviceId: serviceBySalon(SALON_IDS.royalStudio)[3]?.id,
    },
    {
      salonId: SALON_IDS.royalStudio,
      title: 'Glow Skincare Range — 20% Off',
      description: 'Radiant skin starts here. 20% off on our golden glow skincare collection.',
      offerType: 'sale',
      discountType: 'percentage',
      discountValue: 20,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[5],
      productId: productBySalon(SALON_IDS.royalStudio)[0]?.id,
    },

    // ── Elegance Hair Lounge ──
    {
      salonId: SALON_IDS.testSalon,
      title: 'Monsoon Hair Care — 20% Off All Services',
      description: 'Fight frizz and protect your hair this season. All services 20% off.',
      offerType: 'seasonal',
      discountType: 'percentage',
      discountValue: 20,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[6],
      serviceId: serviceBySalon(SALON_IDS.testSalon)[0]?.id,
    },

    // ── Revive Beauty Spa ──
    {
      salonId: SALON_IDS.exStudio,
      title: 'Spa Retreat — Couple Massage ₹1000 Off',
      description:
        'Book a couple massage session and enjoy ₹1000 off. The perfect relaxing escape.',
      offerType: 'combo',
      discountType: 'flat',
      discountValue: 1000,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[7],
      serviceId: serviceBySalon(SALON_IDS.exStudio)[0]?.id,
    },

    // ── Golden Glow Salon ──
    {
      salonId: SALON_IDS.example1,
      title: 'Festive Nails — Full Set 30% Off',
      description:
        'Celebrate in style! Full nail set with art design at 30% off this festive season.',
      offerType: 'seasonal',
      discountType: 'percentage',
      discountValue: 30,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[0],
      serviceId: serviceBySalon(SALON_IDS.example1)[3]?.id,
    },

    // ── Jade & Stone Spa ──
    {
      salonId: SALON_IDS.jksSS,
      title: 'Hot Stone Therapy — Early Bird Offer',
      description: 'Book before 11 AM and get 25% off our signature hot stone massage.',
      offerType: 'limited',
      discountType: 'percentage',
      discountValue: 25,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[1],
      serviceId: serviceBySalon(SALON_IDS.jksSS)[0]?.id,
    },

    // ── Luxuria Beauty Bar ──
    {
      salonId: SALON_IDS.luxStudio,
      title: 'Lash & Brow Bundle — Save ₹600',
      description: 'Get lash extensions + brow lamination in one visit. Save ₹600 on the bundle.',
      offerType: 'bundle',
      discountType: 'flat',
      discountValue: 600,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[2],
      serviceId: serviceBySalon(SALON_IDS.luxStudio)[1]?.id,
    },

    // ── Modern Chic Salon ──
    {
      salonId: SALON_IDS.modernSal,
      title: 'Ombre Makeover — ₹500 Off',
      description:
        'Get the trendiest ombre look this season. Limited slots, book now and save ₹500.',
      offerType: 'limited',
      discountType: 'flat',
      discountValue: 500,
      startsAt: offerStart,
      endsAt: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
      isActive: true,
      image: OFFER_IMAGES[3],
      serviceId: serviceBySalon(SALON_IDS.modernSal)[1]?.id,
    },

    // ── Pearl Beauty Boutique ──
    {
      salonId: SALON_IDS.newSalon2,
      title: 'Derma Glow Facial — Introductory 35% Off',
      description: 'Try our new Derma Facial and see the difference. 35% off for a limited time.',
      offerType: 'first_time',
      discountType: 'percentage',
      discountValue: 35,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[4],
      serviceId: serviceBySalon(SALON_IDS.newSalon2)[0]?.id,
    },

    // ── Velvet Touch Salon ──
    {
      salonId: SALON_IDS.newestSalon,
      title: 'Velvet Glow Facial + Haircut — Combo Offer',
      description: 'Look stunning from head to toe. Book a facial + haircut combo and save 20%.',
      offerType: 'combo',
      discountType: 'percentage',
      discountValue: 20,
      startsAt: offerStart,
      endsAt: offerEnd,
      isActive: true,
      image: OFFER_IMAGES[5],
      serviceId: serviceBySalon(SALON_IDS.newestSalon)[0]?.id,
    },

    // ── Sunrise Beauty Centre ──
    {
      salonId: SALON_IDS.newSalon1,
      title: 'Hair Rebonding — Flat ₹1000 Off',
      description:
        'Get ultra-straight, lustrous hair. Flat ₹1000 off on our hair rebonding service.',
      offerType: 'limited',
      discountType: 'flat',
      discountValue: 1000,
      startsAt: offerStart,
      endsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      image: OFFER_IMAGES[6],
      serviceId: serviceBySalon(SALON_IDS.newSalon1)[0]?.id,
    },
  ];

  let created = 0;
  for (const offer of offers) {
    const { productId, serviceId, ...rest } = offer;
    await prisma.offer.create({
      data: {
        ...rest,
        ...(productId ? { productId } : {}),
        ...(serviceId ? { serviceId } : {}),
      },
    });
    created++;
  }
  console.log(`  ✅ Created ${created} carousel offers`);
}

async function step8_removeTestUsers() {
  console.log(
    '\n🗑️  Step 8: Removing clearly test/unknown users (no salons, no orders, no bookings)...'
  );

  const testUserEmails = [
    's@gmail.com', // "QW"
    'newmail@gmail.com', // "New name"
    'check@gmail.com', // "Smone"
    'someone@gmail.com', // "Someone" (customer)
    'john@example.com', // "John Doe"
    'rathneshkumar@outlook.com', // "test test"
    'scts.info21@outlook.com', // "test chi"
    'johnsmithjas123@gmail.com', // "chi chi"
    'johnbabycruzz@gmail.com', // "john son"
    'smth@gmail.com', // "Someone" (owner but no content)
  ];

  let removed = 0;
  for (const email of testUserEmails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) continue;

    // Safety check: only delete if they have no salons, bookings, or orders
    const hasSalon = await prisma.salon.count({ where: { ownerId: user.id } });
    const hasBooking = await prisma.booking.count({ where: { userId: user.id } });
    const hasOrder = await prisma.order.count({ where: { userId: user.id } });

    if (hasSalon === 0 && hasBooking === 0 && hasOrder === 0) {
      await prisma.user.delete({ where: { id: user.id } });
      console.log(`  🗑️  Removed: ${user.name} <${user.email}>`);
      removed++;
    } else {
      console.log(`  ⚠️  Skipped (has activity): ${user.name} <${user.email}>`);
    }
  }
  console.log(`  ✅ Removed ${removed} test users`);
}

async function main() {
  console.log('🚀 Starting ProBeauty database update...\n');

  await step1_fixUnknownStaff();
  await step2_renameSalons();
  await step3_fixServiceNames();
  await step4_addMoreProducts();
  await step5_addServicesToEmptySalons();
  await step6_addStaffToSalonsWithNone();
  await step7_addOffersWithCarouselImages();
  await step8_removeTestUsers();

  // Final summary
  const [users, salons, staff, services, products, offers] = await Promise.all([
    prisma.user.count(),
    prisma.salon.count(),
    prisma.staff.count(),
    prisma.service.count(),
    prisma.product.count(),
    prisma.offer.count(),
  ]);

  console.log(`
✅ ProBeauty database update complete!

📊 Final counts:
  👤 Users:    ${users}
  🏪 Salons:   ${salons}
  👥 Staff:    ${staff}
  💅 Services: ${services}
  🛍️  Products: ${products}
  🎁 Offers:   ${offers}
`);
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
