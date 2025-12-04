import { Prisma } from '@prisma/client';

import { prisma } from '@/configs/db';
import type { StaffAvailability } from '@/schemas/staffSchema';
import { parseStaffAvailability, isSlotAvailable } from '@/utils/availabilityUtils';

type VenueType = 'male' | 'female' | 'everyone';

interface CreateSalonData {
  name: string;
  address: string;
  phone?: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
  hours?: Record<string, { open: string; close: string }>;
  thumbnail?: string;
  images?: string[];
  venueType?: VenueType;
}

interface UpdateSalonData {
  name?: string;
  address?: string;
  phone?: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
  hours?: Record<string, { open: string; close: string }>;
  thumbnail?: string;
  images?: string[];
  venueType?: VenueType;
}

interface GetSalonsFilters {
  page?: number;
  limit?: number;
  verified?: boolean;
}

type SearchSort = 'top_rated' | 'recommended' | 'nearest';

interface SearchSalonsFilters {
  page?: number;
  limit?: number;
  venueType?: VenueType;
  maxPrice?: number;
  sortBy?: SearchSort;
  service?: string;
  location?: string;
  date?: string;
  time?: 'morning' | 'afternoon' | 'evening' | 'night';
  latitude?: number;
  longitude?: number;
}

export async function createSalon(ownerId: string, data: CreateSalonData) {
  return prisma.salon.create({
    data: {
      ownerId,
      name: data.name,
      address: data.address,
      venueType: data.venueType || 'everyone',
      geo: data.geo ? (JSON.stringify(data.geo) as Prisma.InputJsonValue) : undefined,
      hours: data.hours ? (JSON.stringify(data.hours) as Prisma.InputJsonValue) : undefined,
      thumbnail: data.thumbnail,
      images: data.images,
      verified: false,
    },
  });
}

export async function getSalonById(id: string) {
  return prisma.salon.findUnique({
    where: { id },
    include: {
      staff: true,
      services: true,
      products: true,
    },
  });
}

interface SalonsWhereClause {
  ownerId: string;
  verified?: boolean;
}

export async function getSalonsByOwnerId(ownerId: string, filters?: GetSalonsFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where: SalonsWhereClause = { ownerId };
  if (filters?.verified !== undefined) {
    where.verified = filters.verified;
  }

  const [salons, total] = await Promise.all([
    prisma.salon.findMany({
      where,
      skip,
      take: limit,
      include: {
        staff: true,
        services: true,
        products: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.salon.count({ where }),
  ]);

  return {
    salons,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateSalon(id: string, ownerId: string, data: UpdateSalonData) {
  // Verify ownership
  const salon = await prisma.salon.findUnique({
    where: { id },
  });

  if (!salon || salon.ownerId !== ownerId) {
    return null;
  }

  return prisma.salon.update({
    where: { id },
    data: {
      name: data.name,
      address: data.address,
      venueType: data.venueType,
      geo: data.geo ? (JSON.stringify(data.geo) as Prisma.InputJsonValue) : undefined,
      hours: data.hours ? (JSON.stringify(data.hours) as Prisma.InputJsonValue) : undefined,
      thumbnail: data.thumbnail,
      images: data.images,
    },
    include: {
      staff: true,
      services: true,
      products: true,
    },
  });
}

export async function deleteSalon(id: string, ownerId: string) {
  // Verify ownership
  const salon = await prisma.salon.findUnique({
    where: { id },
  });

  if (!salon || salon.ownerId !== ownerId) {
    return null;
  }

  return prisma.salon.delete({
    where: { id },
  });
}

interface AllSalonsWhereClause {
  verified?: boolean;
}

export async function getAllSalons(filters?: GetSalonsFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where: AllSalonsWhereClause = {};
  if (filters?.verified !== undefined) {
    where.verified = filters.verified;
  }

  const [salons, total] = await Promise.all([
    prisma.salon.findMany({
      where,
      skip,
      take: limit,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        staff: true,
        services: true,
        products: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.salon.count({ where }),
  ]);

  return {
    salons,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

const TIME_SEGMENT_RANGES: Record<
  NonNullable<SearchSalonsFilters['time']>,
  { startMinutes: number; endMinutes: number }
> = {
  morning: { startMinutes: 5 * 60, endMinutes: 12 * 60 },
  afternoon: { startMinutes: 12 * 60, endMinutes: 17 * 60 },
  evening: { startMinutes: 17 * 60, endMinutes: 21 * 60 },
  night: { startMinutes: 21 * 60, endMinutes: 24 * 60 },
};

const DAY_KEYS: string[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

type SalonWithRelations = Prisma.SalonGetPayload<{
  include: {
    services: {
      include: {
        staff: {
          include: {
            staff: {
              include: {
                user: {
                  select: {
                    id: true;
                    name: true;
                    email: true;
                  };
                };
              };
            };
          };
        };
      };
    };
    reviews: true;
  };
}>;

type ServiceWithStaff = SalonWithRelations['services'][number];
type StaffServiceRelation = ServiceWithStaff['staff'][number];
type StaffWithUser = StaffServiceRelation['staff'];

interface ProcessedService {
  id: string;
  title: string;
  price: Prisma.Decimal;
  durationMinutes: number;
  staff: {
    id: string;
    userId: string | null;
    user: { id: string; name: string; email: string } | null;
    availability: StaffAvailability | null;
  }[];
}

interface ProcessedSalon extends Omit<SalonWithRelations, 'services' | 'geo' | 'hours'> {
  services: ProcessedService[];
  averageRating: number;
  distanceKm?: number;
  geo: unknown;
  hours: unknown;
}

interface SearchResult {
  salons: ProcessedSalon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function parseJsonField<T>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  if (typeof value === 'object') {
    return value as T;
  }
  return null;
}

function timeStringToMinutes(time: string): number | null {
  const parts = time.split(':');
  if (parts.length !== 2) {
    return null;
  }
  const [hours, minutes] = parts.map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
}

function isSalonOpenForSegment(
  salon: SalonWithRelations,
  date: string,
  segment: NonNullable<SearchSalonsFilters['time']>
): boolean {
  const hoursData = parseJsonField<Record<string, { open: string; close: string }>>(salon.hours);
  if (!hoursData) {
    return true;
  }

  const targetDate = new Date(date);
  if (Number.isNaN(targetDate.getTime())) {
    return true;
  }

  const dayIndex = targetDate.getDay();
  const dayKey = DAY_KEYS[dayIndex];

  const dayHours = hoursData[dayKey];
  if (!dayHours) {
    return false;
  }

  const openMinutes = timeStringToMinutes(dayHours.open);
  const closeMinutes = timeStringToMinutes(dayHours.close);
  if (openMinutes === null || closeMinutes === null) {
    return false;
  }

  const segmentRange = TIME_SEGMENT_RANGES[segment];
  const overlaps =
    Math.max(openMinutes, segmentRange.startMinutes) <
    Math.min(closeMinutes, segmentRange.endMinutes);

  return overlaps;
}

function computeAverageRating(reviews: { rating: number }[]): number {
  if (!reviews.length) {
    return 0;
  }
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.length).toFixed(2));
}

interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

function getSalonCoordinates(salon: SalonWithRelations): GeoCoordinates | null {
  const geo = parseJsonField<GeoCoordinates>(salon.geo);
  if (!geo || typeof geo.latitude !== 'number' || typeof geo.longitude !== 'number') {
    return null;
  }
  return geo;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function computeDistanceKm(coordA: GeoCoordinates, coordB: GeoCoordinates): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(coordB.latitude - coordA.latitude);
  const dLon = toRadians(coordB.longitude - coordA.longitude);

  const lat1 = toRadians(coordA.latitude);
  const lat2 = toRadians(coordB.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function sortSalons(
  salons: SalonWithRelations[],
  sortBy: SearchSort | undefined,
  userCoords?: GeoCoordinates
): (SalonWithRelations & { averageRating: number; distanceKm?: number })[] {
  return salons
    .map((salon) => {
      const averageRating = computeAverageRating(salon.reviews);
      let distanceKm: number | undefined;
      if (sortBy === 'nearest' && userCoords) {
        const salonCoords = getSalonCoordinates(salon);
        if (salonCoords) {
          distanceKm = computeDistanceKm(userCoords, salonCoords);
        } else {
          distanceKm = Number.POSITIVE_INFINITY;
        }
      }
      return { ...salon, averageRating, distanceKm };
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'top_rated':
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }
          return b.reviews.length - a.reviews.length;
        case 'recommended':
          if (a.verified !== b.verified) {
            return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
          }
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'nearest':
          if (a.distanceKm === undefined && b.distanceKm === undefined) {
            return 0;
          }
          if (a.distanceKm === undefined) {
            return 1;
          }
          if (b.distanceKm === undefined) {
            return -1;
          }
          return a.distanceKm - b.distanceKm;
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
}

function filterByAvailability(
  salons: SalonWithRelations[],
  date?: string,
  segment?: NonNullable<SearchSalonsFilters['time']>
): SalonWithRelations[] {
  if (!date || !segment) {
    return salons;
  }
  return salons.filter((salon) => isSalonOpenForSegment(salon, date, segment));
}

function sanitizeSalonResponse(
  salon: SalonWithRelations & { averageRating: number; distanceKm?: number }
) {
  return {
    ...salon,
    geo: parseJsonField(salon.geo),
    hours: parseJsonField(salon.hours),
    images: salon.images || [],
  };
}

/**
 * Check if staff is available for a specific date and time segment
 */
async function isStaffAvailableForTimeSegment(
  staffId: string,
  date: string,
  timeSegment: NonNullable<SearchSalonsFilters['time']>,
  serviceDurationMinutes: number
): Promise<boolean> {
  const targetDate = new Date(date);
  if (Number.isNaN(targetDate.getTime())) {
    return false;
  }

  // Get staff with availability
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: { availability: true },
  });

  if (!staff) {
    return false;
  }

  const staffAvailability = parseStaffAvailability(staff.availability);
  if (!staffAvailability) {
    return false;
  }

  // Get time segment range
  const segmentRange = TIME_SEGMENT_RANGES[timeSegment];
  const dayIndex = targetDate.getDay();
  const dayKey = DAY_KEYS[dayIndex];

  const validDayKeys: (keyof StaffAvailability)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  if (!validDayKeys.includes(dayKey as keyof StaffAvailability)) {
    return false;
  }

  const dayAvailability = staffAvailability[dayKey as keyof StaffAvailability];
  if (!dayAvailability.isAvailable || !dayAvailability.slots) {
    return false;
  }

  // Check if any availability slot overlaps with the time segment
  const hasOverlap = dayAvailability.slots.some((slot: { start: string; end: string }) => {
    const slotStartMinutes = timeStringToMinutes(slot.start);
    const slotEndMinutes = timeStringToMinutes(slot.end);
    if (slotStartMinutes === null || slotEndMinutes === null) {
      return false;
    }

    // Check if segment overlaps with slot
    const overlaps =
      Math.max(slotStartMinutes, segmentRange.startMinutes) <
      Math.min(slotEndMinutes, segmentRange.endMinutes);

    if (!overlaps) {
      return false;
    }

    // Check if there's enough time for the service within the overlapping period
    const overlapStart = Math.max(slotStartMinutes, segmentRange.startMinutes);
    const overlapEnd = Math.min(slotEndMinutes, segmentRange.endMinutes);
    const overlapDuration = overlapEnd - overlapStart;

    return overlapDuration >= serviceDurationMinutes;
  });

  if (!hasOverlap) {
    return false;
  }

  // Check for existing bookings on this date
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const existingBookings = await prisma.booking.findMany({
    where: {
      staffId,
      startTime: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        notIn: ['CANCELLED', 'NO_SHOW'],
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  // Check if there's at least one available slot within the time segment
  // We'll check a sample time within the segment
  const sampleStartMinutes = Math.max(
    segmentRange.startMinutes,
    dayAvailability.slots[0] ? timeStringToMinutes(dayAvailability.slots[0].start) || 0 : 0
  );
  const sampleEndMinutes = sampleStartMinutes + serviceDurationMinutes;

  if (sampleEndMinutes > segmentRange.endMinutes) {
    return false;
  }

  // Create sample datetime for availability check
  const sampleStart = new Date(targetDate);
  sampleStart.setHours(Math.floor(sampleStartMinutes / 60), sampleStartMinutes % 60, 0, 0);
  const sampleEnd = new Date(sampleStart);
  sampleEnd.setMinutes(sampleEnd.getMinutes() + serviceDurationMinutes);

  return isSlotAvailable(sampleStart, sampleEnd, staffAvailability, existingBookings);
}

export async function searchSalonsWithServices(
  filters: SearchSalonsFilters
): Promise<SearchResult> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const serviceConditions: Prisma.ServiceWhereInput[] = [];

  if (filters.service) {
    const keywords = filters.service
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);

    keywords.forEach((keyword) => {
      serviceConditions.push({
        title: {
          contains: keyword,
          mode: 'insensitive',
        },
      });
    });
  }

  if (typeof filters.maxPrice === 'number') {
    serviceConditions.push({
      price: {
        lte: new Prisma.Decimal(filters.maxPrice),
      },
    });
  }

  const serviceWhere =
    serviceConditions.length > 0
      ? ({
          AND: serviceConditions,
        } as Prisma.ServiceWhereInput)
      : undefined;

  const where: Prisma.SalonWhereInput = {};

  if (filters.venueType) {
    where.venueType = filters.venueType;
  }

  if (filters.location) {
    where.address = {
      contains: filters.location,
      mode: 'insensitive',
    };
  }

  if (serviceWhere) {
    where.services = {
      some: serviceWhere,
    };
  }

  const salons = await prisma.salon.findMany({
    where,
    include: {
      services: serviceWhere
        ? {
            where: serviceWhere,
            orderBy: {
              price: 'asc',
            },
            include: {
              staff: {
                include: {
                  staff: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                          email: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          }
        : {
            include: {
              staff: {
                include: {
                  staff: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                          email: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
      reviews: true,
    },
  });

  const availabilityFiltered = filterByAvailability(salons, filters.date, filters.time);
  const sortedSalons = sortSalons(
    availabilityFiltered,
    filters.sortBy,
    (() => {
      if (filters.latitude === undefined || filters.longitude === undefined) {
        return undefined;
      }
      return { latitude: filters.latitude, longitude: filters.longitude };
    })()
  );

  const total = sortedSalons.length;
  const startIndex = (page - 1) * limit;
  const pagedSalons = sortedSalons.slice(startIndex, startIndex + limit);

  // Process services to include staff with availability filtering
  const processedSalons = await Promise.all(
    pagedSalons.map(async (salon) => {
      const processedServices = await Promise.all(
        salon.services.map(async (service: ServiceWithStaff) => {
          // Get all staff for this service
          const staffServices: StaffServiceRelation[] = service.staff || [];
          let availableStaff: StaffWithUser[] = staffServices
            .map((ss: StaffServiceRelation) => ss.staff)
            .filter(
              (staff: StaffWithUser | null): staff is StaffWithUser =>
                staff !== null && staff !== undefined
            );

          // If date and time are provided, filter staff by availability
          if (filters.date && filters.time) {
            const date = filters.date;
            const time = filters.time;
            const availabilityChecks = await Promise.all(
              availableStaff.map(async (staff: StaffWithUser) => {
                const isAvailable = await isStaffAvailableForTimeSegment(
                  staff.id,
                  date,
                  time,
                  service.durationMinutes
                );
                return { staff, isAvailable };
              })
            );

            // Only include available staff
            availableStaff = availabilityChecks
              .filter((check) => check.isAvailable)
              .map((check) => check.staff);
          }

          // Format staff data for response
          const staffData = availableStaff.map((staff) => ({
            id: staff.id,
            userId: staff.userId,
            user: staff.user,
            availability: staff.availability ? parseStaffAvailability(staff.availability) : null,
          }));

          return {
            id: service.id,
            title: service.title,
            price: service.price,
            durationMinutes: service.durationMinutes,
            staff: staffData,
          };
        })
      );

      const sanitizedSalon = sanitizeSalonResponse(salon);
      return {
        ...sanitizedSalon,
        services: processedServices,
      };
    })
  );

  return {
    salons: processedSalons,
    pagination: {
      page,
      limit,
      total,
      totalPages: total ? Math.ceil(total / limit) : 0,
    },
  };
}
