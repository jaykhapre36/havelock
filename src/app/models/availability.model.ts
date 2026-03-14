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
