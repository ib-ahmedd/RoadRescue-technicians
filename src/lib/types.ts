export interface Provider {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  speciality: string;
  rating: number;
  reviews: number;
  status: "Available" | "Dispatched" | "Offline";
  avatar: string;
  username: string | null;
}

export type RequestStatus =
  | "received"
  | "matched"
  | "en-route"
  | "arrived"
  | "completed";

export interface RequestData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  vehicleType: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  location: string;
  landmark?: string;
  notes?: string;
  status: RequestStatus;
  assignedProvider: Provider | null;
  contacted: boolean;
  createdAt: string;
}
