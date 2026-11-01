import { Movie, Cinema, Show, Seat, Booking, User, Ticket } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Manage unique browser session ID for anonymous or authenticated seat locking
export function getSessionId(): string {
  let sessionId = localStorage.getItem('cineverse_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
    localStorage.setItem('cineverse_session_id', sessionId);
  }
  return sessionId;
}

export function getToken(): string | null {
  return localStorage.getItem('cineverse_auth_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('cineverse_auth_token', token);
  } else {
    localStorage.removeItem('cineverse_auth_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch {
      // response wasn't json
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: { name: string; email: string; password: string; phone?: string }) =>
      request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<{ user: User }>('/auth/me'),
  },

  // Movies
  movies: {
    getAll: (params?: { search?: string; genre?: string; language?: string; trending?: boolean; featured?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.genre) q.append('genre', params.genre);
      if (params?.language) q.append('language', params.language);
      if (params?.trending) q.append('trending', 'true');
      if (params?.featured) q.append('featured', 'true');
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{ movies: Movie[] }>(`/movies${queryStr}`);
    },
    getById: (id: string) => request<{ movie: Movie }>(`/movies/${id}`),
    create: (data: Partial<Movie>) =>
      request<{ movie: Movie }>('/movies', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Movie>) =>
      request<{ movie: Movie }>(`/movies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/movies/${id}`, {
        method: 'DELETE',
      }),
  },

  // Cinemas
  cinemas: {
    getAll: () => request<{ cinemas: Cinema[] }>('/cinemas'),
    getById: (id: string) => request<{ cinema: Cinema }>(`/cinemas/${id}`),
  },

  // Shows & 3D Seats
  shows: {
    getAll: (params?: { movieId?: string; cinemaId?: string; date?: string }) => {
      const q = new URLSearchParams();
      if (params?.movieId) q.append('movieId', params.movieId);
      if (params?.cinemaId) q.append('cinemaId', params.cinemaId);
      if (params?.date) q.append('date', params.date);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{ shows: Show[] }>(`/shows${queryStr}`);
    },
    getById: (id: string) =>
      request<{
        show: Show;
        seats: Seat[];
      }>(`/shows/${id}`),
    create: (data: {
      movieId: string;
      auditoriumId: string;
      date: string;
      startTime: string;
      endTime: string;
      basePriceMultiplier: number;
    }) =>
      request<{ show: Show }>('/shows', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Real-time Seat Locks
  locks: {
    lockSeats: (showId: string, seatIds: string[]) =>
      request<{
        success: boolean;
        lockedSeatIds: string[];
        expiresAt: string;
        expiresInSeconds: number;
      }>(`/shows/${showId}/lock`, {
        method: 'POST',
        body: JSON.stringify({
          seatIds,
          sessionId: getSessionId(),
        }),
      }),
    unlockSeats: (showId: string, seatIds?: string[]) =>
      request<{ success: boolean }>(`/shows/${showId}/unlock`, {
        method: 'POST',
        body: JSON.stringify({
          seatIds,
          sessionId: getSessionId(),
        }),
      }),
  },

  // Bookings
  bookings: {
    createDraft: (showId: string, seatIds: string[]) =>
      request<{
        booking: {
          id: string;
          bookingRef: string;
          totalAmount: number;
          status: string;
          baseTotal: number;
          convenienceFee: number;
          taxes: number;
          seats: { seatId: string; seatNumber: string; category: string; price: number }[];
          show: any;
        };
      }>('/bookings/create', {
        method: 'POST',
        body: JSON.stringify({
          showId,
          seatIds,
          sessionId: getSessionId(),
        }),
      }),
    getMy: () => request<{ bookings: Booking[] }>('/bookings/my'),
    getById: (id: string) => request<{ booking: Booking }>(`/bookings/${id}`),
    verifyQr: (ticketCode: string) =>
      request<{
        valid: boolean;
        ticketCode: string;
        bookingRef: string;
        customerName: string;
        movie: string;
        cinema: string;
        auditorium: string;
        date: string;
        time: string;
        seats: string[];
        amount: number;
        paymentMethod: string;
        generatedAt: string;
      }>(`/bookings/verify-qr/${ticketCode}`),
  },

  // Payments
  payments: {
    createOrder: (bookingId: string) =>
      request<{
        orderId: string;
        amount: number;
        amountInPaise: number;
        currency: string;
        keyId: string;
        bookingRef: string;
        paymentId: string;
      }>('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
      }),
    verify: (data: {
      bookingId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature?: string;
      paymentMethod?: string;
    }) =>
      request<{
        success: boolean;
        message: string;
        booking: Booking;
        ticket: Ticket;
        ticketCode: string;
        qrCodeData: string;
      }>('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Admin
  admin: {
    getAnalytics: () =>
      request<{
        metrics: {
          totalBookings: number;
          totalRevenue: number;
          totalMovies: number;
          totalShows: number;
          occupancyRate: string;
        };
        movieStats: any[];
        categoryStats: any[];
        recentBookings: any[];
      }>('/admin/analytics'),
    getBookings: (params?: { status?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.search) q.append('search', params.search);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{ bookings: Booking[] }>(`/admin/bookings${queryStr}`);
    },
    updateCategory: (id: string, data: { basePrice?: number; color?: string; description?: string }) =>
      request<{ category: any }>(`/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    cancelBooking: (id: string) =>
      request<{ success: boolean; message: string }>(`/admin/bookings/${id}/cancel`, {
        method: 'POST',
      }),
  },
};
