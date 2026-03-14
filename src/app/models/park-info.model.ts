export interface ParkZone {
  id: number;
  name: string;
  color: string;
  description: string;
}

export interface ParkInfo {
  name: string;
  tagline: string;
  description: string;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    supportHours: string;
  };
  openingHours: {
    weekday: { open: string; close: string };
    weekend: { open: string; close: string };
    holiday: { open: string; close: string };
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
  mapCoordinates: { lat: number; lng: number };
  parkZones: ParkZone[];
}
