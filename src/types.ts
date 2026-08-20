export type HealthcareService =
  | "Physiotherapy"
  | "Occupational Therapy"
  | "Dietetics"
  | "Psychology"
  | "Respiratory Therapy";

export type VisitType = "Online" | "In-person" | "Home visit";

export type MoodType = "Great" | "Okay" | "Low" | "Stressed";

export interface Provider {
  id: string;
  name: string;
  title?: string;
  service: HealthcareService;
  specialties?: string[];
  licenseNumber?: string;
  qualification?: string;
  experienceYears?: number;
  phone?: string;
  email?: string;
  area: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  photo?: string;
  bio?: string;
  consultationFee?: number;
  availableDays?: string[];
  workingHours?: string;
  visitTypes?: VisitType[];
  isVerified?: boolean;
  isDemo?: boolean;
  createdAt?: string;
}

export interface Booking {
  id: string;
  service: HealthcareService;
  professional: string;
  date: string;
  time: string;
  visitType: VisitType;
  createdAt: string;
}

export interface Review {
  id: string;
  professional: string;
  service: string;
  stars: number;
  text: string;
  date: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  times: string[];
}

export interface DiaryEntry {
  id: string;
  pain: number;
  mood: MoodType | null;
  exercise?: string;
  notes?: string;
  createdAt: string;
}

export interface Dependent {
  id: string;
  name: string;
  age: string;
  relation: string;
  conditions?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  age?: string;
  goals?: string;
  conditions?: string;
  ecName?: string;
  ecPhone?: string;
}

export interface Article {
  id: string;
  category: string;
  title: string;
  readTime: string;
  body: string;
}

export interface Assessment {
  id: string;
  client: string;
  type: "initial" | "pain" | "rom" | "mobility";
  date: string;
  data: Record<string, string>;
}

export interface TreatmentNote {
  id: string;
  client: string;
  date: string;
  text: string;
}

export interface ProviderProfile {
  name: string;
  specialty: string;
  bio: string;
  photo?: string;
}

export interface DirectMessage {
  id: string;
  providerId: string;
  providerName: string;
  sender: "patient" | "provider";
  text: string;
  timestamp: string;
}

export type ThemeName = "navy" | "forest" | "coral" | "plum" | "dark";
export type LanguageCode = "en" | "tw" | "ga";
