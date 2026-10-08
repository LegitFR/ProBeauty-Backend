import 'dotenv/config';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

// Assigns the curated photos in prisma/assets/salon-images to the most frequently
// booked salons, matching each photo to the service category a salon is booked for most.
//
// Dry run (default):  bunx tsx prisma/assignSalonImages.ts
// Apply changes:      bunx tsx prisma/assignSalonImages.ts --apply

const prisma = new PrismaClient();

const ASSETS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'assets',
  'salon-images'
);
const CLOUDINARY_FOLDER = 'probeauty/salons/featured';

type ImageTheme = 'barber' | 'nails' | 'facial';

interface CuratedImage {
  file: string;
  theme: ImageTheme;
  description: string;
}

interface RankedSalon {
  id: string;
  name: string;
  venueType: string;
  thumbnail: string | null;
  images: string[];
  bookingCount: number;
  themeScores: Map<ImageTheme, number>;
}

interface Assignment {
  salon: RankedSalon;
  image: CuratedImage;
}

// Ordered so the strongest shot of each theme goes to the busiest matching salon.
const CURATED_IMAGES: CuratedImage[] = [
  {
    file: 'barber-scissor-cut.jpg',
    theme: 'barber',
    description: 'Barber doing a scissor-over-comb cut on a bearded client',
  },
  {
    file: 'barber-beard-trim.jpg',
    theme: 'barber',
    description: 'Barber trimming a client’s beard with scissors',
  },
  {
    file: 'barber-haircut-brick-wall.jpg',
    theme: 'barber',
    description: 'Barber finishing a short haircut against a brick wall',
  },
  {
    file: 'nail-polish-wall.jpg',
    theme: 'nails',
    description: 'Wall of gel nail polish colours on gold shelves',
  },
  {
    file: 'facial-mask-treatment.jpg',
    theme: 'facial',
    description: 'Client receiving a facial mask treatment',
  },
];

const CATEGORY_THEMES: Record<string, ImageTheme> = {
  hair: 'barber',
  haircut: 'barber',
  barber: 'barber',
  beard: 'barber',
  grooming: 'barber',
  nails: 'nails',
  nail: 'nails',
  manicure: 'nails',
  pedicure: 'nails',
  facial: 'facial',
  skincare: 'facial',
  skin: 'facial',
  spa: 'facial',
  beauty: 'facial',
  massage: 'facial',
};

const VENUE_EXCLUDED_THEMES: Record<string, ImageTheme[]> = {
  female: ['barber'],
  women: ['barber'],
  male: ['nails', 'facial'],
  men: ['nails', 'facial'],
};

const INACTIVE_BOOKING_STATUSES = ['CANCELLED', 'PAYMENT_FAILED', 'NO_SHOW'];

function themeForCategory(category: string | null): ImageTheme | undefined {
  if (!category) return undefined;
  return CATEGORY_THEMES[category.trim().toLowerCase()];
}

function addScore(scores: Map<ImageTheme, number>, theme: ImageTheme | undefined, weight: number) {
  if (!theme) return;
  scores.set(theme, (scores.get(theme) ?? 0) + weight);
}

async function rankSalonsByUsage(): Promise<RankedSalon[]> {
  const bookings = await prisma.booking.findMany({
    where: { status: { notIn: INACTIVE_BOOKING_STATUSES } },
    select: { salonId: true, serviceIds: true },
  });

  const bookingCounts = new Map<string, number>();
  const bookedServiceCounts = new Map<string, number>();
  for (const booking of bookings) {
    bookingCounts.set(booking.salonId, (bookingCounts.get(booking.salonId) ?? 0) + 1);
    for (const serviceId of booking.serviceIds) {
      bookedServiceCounts.set(serviceId, (bookedServiceCounts.get(serviceId) ?? 0) + 1);
    }
  }

  const salons = await prisma.salon.findMany({
    where: { id: { in: [...bookingCounts.keys()] } },
    select: {
      id: true,
      name: true,
      venueType: true,
      thumbnail: true,
      images: true,
      services: { select: { id: true, category: true } },
    },
  });

  return salons
    .map((salon) => {
      const themeScores = new Map<ImageTheme, number>();
      for (const service of salon.services) {
        const theme = themeForCategory(service.category);
        // Booked services drive the theme; the listed menu only breaks ties for unbooked categories.
        addScore(themeScores, theme, (bookedServiceCounts.get(service.id) ?? 0) * 10 + 1);
      }
      return {
        id: salon.id,
        name: salon.name,
        venueType: salon.venueType,
        thumbnail: salon.thumbnail,
        images: salon.images,
        bookingCount: bookingCounts.get(salon.id) ?? 0,
        themeScores,
      };
    })
    .sort((a, b) => b.bookingCount - a.bookingCount);
}

function planAssignments(rankedSalons: RankedSalon[]): Assignment[] {
  const pools = new Map<ImageTheme, CuratedImage[]>();
  for (const image of CURATED_IMAGES) {
    pools.set(image.theme, [...(pools.get(image.theme) ?? []), image]);
  }

  const assignments: Assignment[] = [];
  for (const salon of rankedSalons) {
    const excluded = VENUE_EXCLUDED_THEMES[salon.venueType.toLowerCase()] ?? [];
    const preferredThemes = [...salon.themeScores.entries()]
      .filter(([theme]) => !excluded.includes(theme))
      .sort((a, b) => b[1] - a[1])
      .map(([theme]) => theme);

    for (const theme of preferredThemes) {
      const image = pools.get(theme)?.shift();
      if (image) {
        assignments.push({ salon, image });
        break;
      }
    }

    if (assignments.length === CURATED_IMAGES.length) break;
  }

  return assignments;
}

async function uploadImage(image: CuratedImage): Promise<string> {
  const result = await cloudinary.uploader.upload(path.join(ASSETS_DIR, image.file), {
    folder: CLOUDINARY_FOLDER,
    public_id: path.parse(image.file).name,
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });
  return result.secure_url;
}

async function main() {
  const apply = process.argv.includes('--apply');

  const rankedSalons = await rankSalonsByUsage();
  if (rankedSalons.length === 0) {
    console.log('No salons with active bookings found — nothing to assign.');
    return;
  }

  console.log('\n📊 Most frequently booked salons:');
  for (const salon of rankedSalons.slice(0, 10)) {
    const themes = [...salon.themeScores.entries()].map(([t, s]) => `${t}:${s}`).join(', ');
    console.log(`  ${salon.bookingCount.toString().padStart(4)}  ${salon.name}  [${themes}]`);
  }

  const assignments = planAssignments(rankedSalons);
  console.log('\n🖼️  Planned image placement:');
  for (const { salon, image } of assignments) {
    console.log(`  ${image.file.padEnd(30)} → ${salon.name} (${salon.bookingCount} bookings)`);
  }

  const unplaced = CURATED_IMAGES.filter((img) => !assignments.some((a) => a.image === img));
  for (const image of unplaced) {
    console.log(`  ⚠️  ${image.file}: no booked salon offers ${image.theme} services`);
  }

  if (!apply) {
    console.log('\nDry run only. Re-run with --apply to upload and update salons.');
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  for (const { salon, image } of assignments) {
    const url = await uploadImage(image);
    const gallery = [url, ...salon.images.filter((existing) => existing !== url)];
    if (salon.thumbnail && !gallery.includes(salon.thumbnail)) gallery.push(salon.thumbnail);

    await prisma.salon.update({
      where: { id: salon.id },
      data: { thumbnail: url, images: gallery },
    });
    console.log(`  ✅ ${salon.name}: thumbnail set to ${url}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error('❌ Failed to assign salon images:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
