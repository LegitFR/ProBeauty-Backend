import type { StaffAvailability } from '@/schemas/staffSchema';

interface ExistingBooking {
  startTime: Date;
  endTime: Date;
}

interface GeneratedSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

/**
 * Parse and validate staff availability JSON
 */
export function parseStaffAvailability(availability: unknown): StaffAvailability | null {
  try {
    if (!availability) {
      return null;
    }

    // If it's a string, parse it first
    if (typeof availability === 'string') {
      const parsed = JSON.parse(availability);
      return parsed as StaffAvailability;
    }

    // If it's already an object, return it
    if (typeof availability === 'object') {
      return availability as StaffAvailability;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get day name from date
 */
function getDayName(date: Date): keyof StaffAvailability {
  const days: (keyof StaffAvailability)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[date.getDay()];
}

/**
 * Convert HH:mm time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to HH:mm format
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Create datetime from date and time string
 */
function createDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const dt = new Date(date);
  dt.setHours(hours, minutes, 0, 0);
  return dt;
}

/**
 * Check if a booking overlaps with a time slot
 *
 * Two time ranges overlap if:
 * - slotStart < booking.endTime AND slotEnd > booking.startTime
 *
 * This handles all overlap cases:
 * - Booking starts before slot and ends during slot
 * - Booking starts during slot and ends after slot
 * - Booking is completely within slot
 * - Slot is completely within booking
 * - Booking and slot share exact boundaries (exclusive comparison prevents this)
 *
 * @param slotStart - Start time of the requested slot
 * @param slotEnd - End time of the requested slot
 * @param existingBookings - Array of existing bookings to check against
 * @returns true if there's any overlap, false otherwise
 */
function hasBookingConflict(
  slotStart: Date,
  slotEnd: Date,
  existingBookings: ExistingBooking[]
): boolean {
  if (!existingBookings || existingBookings.length === 0) {
    return false;
  }

  return existingBookings.some((booking) => {
    // Robust overlap detection: two time ranges overlap if one starts before the other ends
    // and ends after the other starts
    // Using < and > (exclusive) ensures bookings that end exactly when slot starts
    // or start exactly when slot ends don't conflict (allows back-to-back bookings)
    const hasOverlap = slotStart < booking.endTime && slotEnd > booking.startTime;

    return hasOverlap;
  });
}

/**
 * Generate 30-minute interval time slots for a specific date
 */
export function generateTimeSlots(
  date: Date,
  staffAvailability: StaffAvailability | null,
  serviceDurationMinutes: number,
  existingBookings: ExistingBooking[]
): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];

  if (!staffAvailability) {
    return slots;
  }

  const dayName = getDayName(date);
  const dayAvailability = staffAvailability[dayName];

  // If staff is not available on this day
  if (!dayAvailability.isAvailable || !dayAvailability.slots) {
    return slots;
  }

  // Generate slots for each availability period
  for (const availabilitySlot of dayAvailability.slots) {
    const startMinutes = timeToMinutes(availabilitySlot.start);
    const endMinutes = timeToMinutes(availabilitySlot.end);

    // Generate 30-minute interval slots
    const slotInterval = 30;

    for (
      let currentMinutes = startMinutes;
      currentMinutes < endMinutes;
      currentMinutes += slotInterval
    ) {
      const slotEndMinutes = currentMinutes + slotInterval;

      // Ensure we have enough time for the service
      const remainingMinutes = endMinutes - currentMinutes;
      if (remainingMinutes < serviceDurationMinutes) {
        break;
      }

      const slotStartTime = minutesToTime(currentMinutes);
      const slotEndTime = minutesToTime(slotEndMinutes);

      const slotStart = createDateTime(date, slotStartTime);
      const slotEnd = createDateTime(date, slotEndTime);

      // Check if this slot conflicts with existing bookings
      const available = !hasBookingConflict(slotStart, slotEnd, existingBookings);

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        available,
      });
    }
  }

  return slots;
}

/**
 * Check if a specific time slot is available for booking
 *
 * This function implements a 3-step availability check:
 * Step 1: Check Weekly Availability (Rule Check) - Verify staff has availability rules for the day
 * Step 2: Calculate Exact Time Window - The requested time window is already calculated (startTime to endTime)
 * Step 3: Check for OVERLAPPING BOOKINGS - Verify no existing bookings overlap with the requested time
 *
 * @param startTime - The requested booking start time
 * @param endTime - The requested booking end time (startTime + service duration)
 * @param staffAvailability - The staff member's weekly availability rules
 * @param existingBookings - Array of existing bookings for the staff on the requested date
 * @returns true if the slot is available, false otherwise
 */
export function isSlotAvailable(
  startTime: Date,
  endTime: Date,
  staffAvailability: StaffAvailability | null,
  existingBookings: ExistingBooking[]
): boolean {
  // Step 1: Check Weekly Availability (Rule Check)
  // Verify staff has availability rules configured
  if (!staffAvailability) {
    return false;
  }

  const dayName = getDayName(startTime);
  const dayAvailability = staffAvailability[dayName];

  // Check if staff works on this day of the week
  if (!dayAvailability.isAvailable || !dayAvailability.slots) {
    return false;
  }

  // Convert requested time to minutes for comparison
  const requestedStartTime = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
  const requestedEndTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

  const requestedStartMinutes = timeToMinutes(requestedStartTime);
  const requestedEndMinutes = timeToMinutes(requestedEndTime);

  // Check if requested time window fits within any availability slot
  // The entire service duration must be contained within a single availability slot
  // This ensures the service can be completed without interruption
  const fitsWithinAvailability = dayAvailability.slots.some((slot) => {
    const slotStartMinutes = timeToMinutes(slot.start);
    const slotEndMinutes = timeToMinutes(slot.end);

    // The requested time window must be fully contained within the slot
    // This means: requestedStart >= slotStart AND requestedEnd <= slotEnd
    // This allows the service to start at the slot boundary and end at the slot boundary
    return requestedStartMinutes >= slotStartMinutes && requestedEndMinutes <= slotEndMinutes;
  });

  if (!fitsWithinAvailability) {
    return false;
  }

  // Step 3: Check for OVERLAPPING BOOKINGS (Most Important)
  // Verify no existing bookings conflict with the requested time window
  return !hasBookingConflict(startTime, endTime, existingBookings);
}

/**
 * Check for booking conflicts with existing bookings
 *
 * Returns the first conflicting booking if any overlap exists.
 * Uses the same robust overlap detection as hasBookingConflict.
 *
 * @param startTime - Start time of the requested booking
 * @param endTime - End time of the requested booking
 * @param existingBookings - Array of existing bookings to check against
 * @returns The conflicting booking if found, null otherwise
 */
export function checkBookingConflicts(
  startTime: Date,
  endTime: Date,
  existingBookings: ExistingBooking[]
): ExistingBooking | null {
  if (!existingBookings || existingBookings.length === 0) {
    return null;
  }

  // Find the first booking that overlaps with the requested time window
  const conflict = existingBookings.find((booking) => {
    // Robust overlap detection: two time ranges overlap if one starts before the other ends
    // and ends after the other starts
    return startTime < booking.endTime && endTime > booking.startTime;
  });

  return conflict || null;
}
