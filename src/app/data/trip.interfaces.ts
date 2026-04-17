export interface TripImage {
  url: string;
  alt: string;
  hero?: boolean;
}

export interface FoodSpot {
  name: string;
  note?: string;
  url?: string;
}

export interface FromListItem {
  label: string;
  googleMapsUrl: string;
}

export interface Booking {
  label: string;
  note?: string;
  url?: string;
}

export interface TripDay {
  id: number;
  title: string;
  date: string;
  isoDate: string;
  theme: string;
  intro: string;
  highlights: string[];
  food: FoodSpot[];
  transport: string[];
  bookings: Booking[];
  fromList: FromListItem[];
  mapEmbedUrl: string;
  images: TripImage[];
  walkingDistance?: string;
  tips?: string[];
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

export interface PracticalInfo {
  flights: { code: string; route: string; time: string; url?: string }[];
  hotel: { name: string; note: string; url?: string };
  transportNotes: string[];
  generalNotes: string[];
  emergencyContacts: EmergencyContact[];
  checklist: ChecklistItem[];
}

export interface TripData {
  title: string;
  subtitle: string;
  dates: string;
  travelers: string;
  tripStart: string;
  tripEnd: string;
  days: TripDay[];
  practicalInfo: PracticalInfo;
}
