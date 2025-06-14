export interface User {
  UserId: string | number;
  Name: string;
  Email: string;
  Created_At: string;
}

export interface UserFormData {
  name: string;
  email: string;
}

export interface Trip {
  TripId: number;
  Name: string;
  Destination: string;
  Start_Date: string | null;
  End_Date: string | null;
  Created_At: string;
}

export interface TripFormData {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
}

export interface Organizer {
  OrganizerId: number;
  Name: string;
  Email: string;
  Phone?: string;
  Created_At: string;
}

export interface OrganizerFormData {
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  BookingId: number;
  TripId: number;
  OrganizerId: number;
  Type: string;
  Provider_Name?: string | null;
  Booking_Ref?: string | null;
  Start_Date?: string | null;
  End_Date?: string | null;
  UserIds?: (string | number)[];
  // These are populated from JOIN queries
  TripName?: string;
  TripDestination?: string;
  OrganizerName?: string;
  OrganizerEmail?: string;
  Created_At?: string;
  Updated_At?: string;
}

export interface BookingFormData {
  tripId: string;
  organizerId: string;
  type: string;
  providerName: string;
  bookingRef: string;
  startDate: string;
  endDate: string;
  userIds: (string | number)[];
}