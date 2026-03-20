export interface TimeSlot {
  id: number;
  time: string;
  label: string;
  availableSeats: number;
  totalSeats: number;
  status: 'available' | 'limited' | 'full';
}

export interface ParkStatus {
  openingTime: string;
  closingTime: string;
  maxCapacity: number;
  currentOccupancy: number;
  status: 'open' | 'closed';
  avgWaitTime: string;
}

export interface AvailabilityResponse {
  parkInfo: ParkStatus;
  timeSlots: TimeSlot[];
}

// ── get-slots API ──────────────────────────────────────────────────────────
export interface DateSlot {
  id: number;
  slot_date: string;
  slot_start: string;
  slot_end: string;
  total_capacity: number;
  booked_count: number;
  remaining: number;
}

export interface SlotsApiResponse {
  success: boolean;
  message: string;
  data: { total: number; slots: DateSlot[] };
}

// ── Real API types ─────────────────────────────────────────────────────────
export interface AvailabilitySlot {
  slot_id: number;
  slot_start: string;
  slot_end: string;
  total_capacity: number;
  booked_count: number;
  remaining: number;
  is_available: boolean;
}

export interface AvailabilityData {
  date: string;
  total_slots: number;
  slots: AvailabilitySlot[];
}

export interface AvailabilityApiResponse {
  success: boolean;
  message: string;
  data: AvailabilityData;
}
