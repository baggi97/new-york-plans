export interface TripImage {
  url: string;
  alt: string;
  hero?: boolean;
}

export interface FoodSpot {
  name: string;
  note?: string;
  url?: string;
  price?: '$' | '$$' | '$$$';
}

export interface FromListItem {
  label: string;
  googleMapsUrl: string;
}

export interface Booking {
  label: string;
  note?: string;
  url?: string;
  time?: string;
}

export interface HighlightItem {
  label: string;
  duration?: string;
}

export interface MapMarker {
  label: string;
  lat: number;
  lng: number;
  category: 'highlight' | 'food' | 'hotel';
  /** When true, a proximity (geofence) notification fires near this place. */
  notify?: boolean;
}

export interface TripDay {
  id: number;
  title: string;
  date: string;
  isoDate: string;
  theme: string;
  intro: string;
  highlights: HighlightItem[];
  food: FoodSpot[];
  transport: string[];
  bookings: Booking[];
  fromList: FromListItem[];
  markers: MapMarker[];
  images: TripImage[];
  walkingDistance?: string;
  tips?: string[];
  funFact?: string;
}

export interface EmergencyContact {
  label: string;
  number: string;
  note?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
}

export interface TippingRule {
  category: string;
  tip: string;
}

export interface PracticalInfo {
  flights: { code: string; route: string; time: string; url?: string }[];
  hotel: { name: string; note: string; url?: string };
  transportNotes: string[];
  generalNotes: string[];
  emergencyContacts: EmergencyContact[];
  checklist: ChecklistItem[];
  tipping: TippingRule[];
}

export interface TripDestination {
  city: string;
  country: string;
  timezone: string;
  lat: number;
  lng: number;
  currency: string;
  mapZoom?: number;
}

export interface TripData {
  id: string;
  title: string;
  subtitle: string;
  dates: string;
  travelers: string;
  tripStart: string;
  tripEnd: string;
  destination: TripDestination;
  homeCurrency: string;
  homeTimezone: string;
  heroImages?: string[];
  days: TripDay[];
  practicalInfo: PracticalInfo;
}
