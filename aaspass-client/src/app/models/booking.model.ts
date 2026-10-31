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

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type SlotStatus = 'FREE' | 'REQUESTED' | 'BOOKED' | 'CLOSED';

export interface SlotView {
  /** 'HH:mm' (normalized from the backend 'HH:mm:ss'). */
  time: string;
  status: SlotStatus;
  pendingCount: number;
}

export interface DaySlots {
  date: string;
  open: boolean;
  slotMinutes: number;
  maxBookingMinutes: number;
  slots: SlotView[];
  /** Offered start times for the requested duration, 'HH:mm'. */
  startTimes: string[];
}

export interface BookingCreatePayload {
  storeId: number;
  serviceId: number;
  /** 'yyyy-MM-ddTHH:mm:00' in store-local time. */
  startAt: string;
  durationMinutes: number;
  note?: string;
  visitorId?: string;
}

export interface Booking {
  id: number;
  storeId: number;
  storeName: string;
  serviceId: number | null;
  serviceName: string;
  userId: number;
  userName: string;
  userAvatarUrl?: string | null;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  status: BookingStatus;
  note?: string | null;
  ownerNote?: string | null;
  price?: number | null;
  decidedAt?: string | null;
  autoRejected?: boolean;
  creationDateTime?: string;
}
