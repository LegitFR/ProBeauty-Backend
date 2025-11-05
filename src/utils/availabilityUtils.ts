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
    if (!availability || typeof availability !== 'object') {
      return null;
    }
    return availability as StaffAvailability;
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
 */
function hasBookingConflict(
  slotStart: Date,
  slotEnd: Date,
  existingBookings: ExistingBooking[]
): boolean {
  return existingBookings.some((booking) => {
    // Check if there's any overlap
    return slotStart < booking.endTime && slotEnd > booking.startTime;
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
 */
export function isSlotAvailable(
  startTime: Date,
  endTime: Date,
  staffAvailability: StaffAvailability | null,
  existingBookings: ExistingBooking[]
): boolean {
  if (!staffAvailability) {
    return false;
  }

  const dayName = getDayName(startTime);
  const dayAvailability = staffAvailability[dayName];

  // Check if staff works on this day
  if (!dayAvailability.isAvailable || !dayAvailability.slots) {
    return false;
  }

  const requestedStartTime = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
  const requestedEndTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

  const requestedStartMinutes = timeToMinutes(requestedStartTime);
  const requestedEndMinutes = timeToMinutes(requestedEndTime);

  // Check if requested time falls within any availability slot
  const withinAvailability = dayAvailability.slots.some((slot) => {
    const slotStartMinutes = timeToMinutes(slot.start);
    const slotEndMinutes = timeToMinutes(slot.end);

    return requestedStartMinutes >= slotStartMinutes && requestedEndMinutes <= slotEndMinutes;
  });

  if (!withinAvailability) {
    return false;
  }

  // Check for booking conflicts
  return !hasBookingConflict(startTime, endTime, existingBookings);
}

/**
 * Check for booking conflicts with existing bookings
 */
export function checkBookingConflicts(
  startTime: Date,
  endTime: Date,
  existingBookings: ExistingBooking[]
): ExistingBooking | null {
  const conflict = existingBookings.find((booking) => {
    return startTime < booking.endTime && endTime > booking.startTime;
  });

  return conflict || null;
}
