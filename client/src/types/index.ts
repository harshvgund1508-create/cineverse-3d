export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
}

export interface SeatCategory {
  id: string;
  name: string;
  basePrice: number;
  color: string;
  description: string;
}

export interface Seat {
  id: string;
  auditoriumId: string;
  seatNumber: string; // e.g. "G8"
  row: string; // "G"
  col: number; // 8
  categoryId: string;
  category: SeatCategory;
  coordX: number;
  coordY: number;
  coordZ: number;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
  price: number;
  lockInfo?: {
    sessionId: string;
    expiresAt: string;
  };
}

export interface Movie {
  id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  duration: number;
  genre: string;
  language: string;
  rating: number;
  releaseDate: string;
  ageRating: string;
  director: string;
  cast: string;
  isFeatured: boolean;
  isTrending: boolean;
  isNowShowing: boolean;
  shows?: Show[];
  reviews?: Review[];
  _count?: {
    shows: number;
    reviews: number;
  };
}

export interface Cinema {
  id: string;
  name: string;
  city: string;
  address: string;
  facilities: string;
  imageUrl: string;
  auditoriums?: Auditorium[];
}

export interface Auditorium {
  id: string;
  cinemaId: string;
  name: string;
  screenType: string;
  soundSystem: string;
  totalRows: number;
  totalCols: number;
  cinema?: Cinema;
  seats?: Seat[];
}

export interface Show {
  id: string;
  movieId: string;
  movie: Movie;
  auditoriumId: string;
  auditorium: Auditorium;
  date: string;
  startTime: string;
  endTime: string;
  basePriceMultiplier: number;
}

export interface BookingSeat {
  id: string;
  bookingId: string;
  seatId: string;
  seat: Seat;
  price: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
}

export interface Ticket {
  id: string;
  bookingId: string;
  ticketCode: string;
  qrCodeData: string;
  generatedAt: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  user?: User;
  showId: string;
  show: Show;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentId?: string;
  createdAt: string;
  bookingSeats: BookingSeat[];
  payment?: Payment;
  ticket?: Ticket;
}

export interface Review {
  id: string;
  movieId: string;
  userId: string;
  user: { id: string; name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SeatMetrics {
  seat: Seat;
  distanceMeters: number;
  horizontalAngleDeg: number;
  verticalAngleDeg: number;
}
