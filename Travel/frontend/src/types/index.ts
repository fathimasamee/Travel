export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  createdAt: string;
  _count?: {
    bookings?: number;
    reviews?: number;
    favourites?: number;
  };
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  location: string;
  category: string;
  rating: number;
  isFeatured: boolean;
  startingPrice?: number;
  _count?: {
    packages?: number;
  };
  packages?: Package[];
  hotels?: Hotel[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string;
  hotel?: string;
}

export interface Package {
  id: string;
  title: string;
  destinationId: string;
  destination: Destination;
  description: string;
  duration: string;
  durationDays: number;
  price: number;
  discount: number;
  effectivePrice?: number;
  maxPeople: number;
  availableSeats: number;
  image: string;
  gallery: string[];
  includedServices: string[];
  excludedServices: string[];
  itinerary: ItineraryDay[];
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  featured: boolean;
  rating: number;
  reviewCount: number;
  hotelId?: string;
  hotel?: Hotel;
  vehicleId?: string;
  vehicle?: Vehicle;
  reviews?: Review[];
  _count?: {
    reviews?: number;
    bookings?: number;
  };
  createdAt: string;
}

export interface Traveller {
  id?: string;
  fullName: string;
  email?: string;
  phone?: string;
  passportNumber?: string;
  age?: number;
  gender?: string;
  isLead: boolean;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: "CARD" | "BANK_TRANSFER" | "CASH";
  transactionId: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customer?: User;
  packageId: string;
  package: Package;
  staffId?: string;
  staff?: User;
  bookingDate: string;
  travelDate: string;
  returnDate?: string;
  numberOfPeople: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  couponCode?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "REFUNDED";
  specialRequests?: string;
  cancellationReason?: string;
  operationsNotes?: string;
  travellers: Traveller[];
  payments: Payment[];
  createdAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  destinationId?: string;
  destination?: Destination;
  location: string;
  description: string;
  pricePerNight: number;
  rooms: number;
  rating: number;
  images: string[];
  amenities: string[];
  availability: boolean;
}

export interface Vehicle {
  id: string;
  type: "VAN" | "CAR" | "BUS" | "AIRPORT_TRANSFER";
  name: string;
  capacity: number;
  price: number;
  driverIncluded: boolean;
  availability: boolean;
  image: string;
  features: string[];
}

export interface Review {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email?: string;
  };
  packageId: string;
  package?: {
    id: string;
    title: string;
  };
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "BOOKING" | "PAYMENT" | "SYSTEM" | "PROMO";
  isRead: boolean;
  link?: string;
  createdAt: string;
}
