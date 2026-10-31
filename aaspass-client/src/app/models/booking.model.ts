export const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

/** Times are 'HH:mm' on the client; the backend returns 'HH:mm:ss' and accepts 'HH:mm'. */
export interface AvailabilityRange {
  day: DayOfWeek;
  start: string;
  end: string;
}

export interface StoreAvailability {
  slotMinutes: number;
  maxBookingMinutes: number;
  ranges: AvailabilityRange[];
}

export interface SaveAvailabilityResult {
  availability: StoreAvailability;
  confirmedOutsideCount: number;
}

export type AvailabilityExceptionType = 'OPEN' | 'BLOCKED';

export interface AvailabilityException {
  id: number;
  date: string;
  type: AvailabilityExceptionType;
  start?: string | null;
  end?: string | null;
  reason?: string | null;
  confirmedOutsideCount: number;
}

export interface AvailabilityExceptionRequest {
  date: string;
  type: AvailabilityExceptionType;
  start?: string;
  end?: string;
  reason?: string;
}

export const SLOT_OPTIONS = [15, 30, 45, 60, 90, 120] as const;

export const DEFAULT_AVAILABILITY: StoreAvailability = {
  slotMinutes: 30,
  maxBookingMinutes: 120,
  ranges: (['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const).map(day => ({
    day,
    start: '09:00',
    end: '18:00'
  }))
};
