import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Movie, Show, Seat } from '../types';
import { api } from '../services/api';

interface BookingContextType {
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;
  selectedShow: Show | null;
  setSelectedShow: (show: Show | null) => void;
  selectedSeats: Seat[];
  toggleSeatSelection: (seat: Seat) => void;
  removeSeat: (seatId: string) => void;
  clearSelectedSeats: () => void;
  activePreviewSeat: Seat | null;
  setActivePreviewSeat: (seat: Seat | null) => void;
  isLocked: boolean;
  lockExpiresAt: string | null;
  lockSecondsRemaining: number;
  lockSeats: () => Promise<boolean>;
  unlockSeats: () => Promise<void>;
  lockError: string | null;
  totalSeatPrice: number;
  convenienceFee: number;
  taxes: number;
  finalTotal: number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [activePreviewSeat, setActivePreviewSeat] = useState<Seat | null>(null);

  // Lock state
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockExpiresAt, setLockExpiresAt] = useState<string | null>(null);
  const [lockSecondsRemaining, setLockSecondsRemaining] = useState<number>(0);
  const [lockError, setLockError] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  // Countdown timer for locked seats
  useEffect(() => {
    if (lockExpiresAt) {
      const updateRemaining = () => {
        const diffMs = new Date(lockExpiresAt).getTime() - Date.now();
        const diffSec = Math.max(0, Math.floor(diffMs / 1000));
        setLockSecondsRemaining(diffSec);

        if (diffSec <= 0) {
          setIsLocked(false);
          setLockExpiresAt(null);
          setLockError('Your seat lock has expired. Please reselect your seats.');
          setSelectedSeats([]);
          clearInterval(timerRef.current);
        }
      };

      updateRemaining();
      timerRef.current = setInterval(updateRemaining, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setLockSecondsRemaining(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lockExpiresAt]);

  const toggleSeatSelection = (seat: Seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'LOCKED') return;

    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      }
      if (prev.length >= 6) {
        alert('Maximum 6 seats can be selected per booking.');
        return prev;
      }
      return [...prev, seat];
    });
  };

  const removeSeat = (seatId: string) => {
    setSelectedSeats((prev) => prev.filter((s) => s.id !== seatId));
  };

  const clearSelectedSeats = () => {
    setSelectedSeats([]);
    setIsLocked(false);
    setLockExpiresAt(null);
  };

  const lockSeats = async (): Promise<boolean> => {
    if (!selectedShow || selectedSeats.length === 0) return false;
    setLockError(null);

    try {
      const seatIds = selectedSeats.map((s) => s.id);
      const res = await api.locks.lockSeats(selectedShow.id, seatIds);

      setIsLocked(true);
      setLockExpiresAt(res.expiresAt);
      return true;
    } catch (err: any) {
      setLockError(err.message || 'Failed to lock seats. They may have been booked by someone else.');
      return false;
    }
  };

  const unlockSeats = async () => {
    if (!selectedShow) return;
    try {
      await api.locks.unlockSeats(selectedShow.id);
      setIsLocked(false);
      setLockExpiresAt(null);
    } catch (err) {
      console.warn('Unlock error:', err);
    }
  };

  // Pricing calculations
  const totalSeatPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const convenienceFee = selectedSeats.length * 35;
  const taxes = Math.round((totalSeatPrice + convenienceFee) * 0.18);
  const finalTotal = totalSeatPrice + convenienceFee + taxes;

  return (
    <BookingContext.Provider
      value={{
        selectedMovie,
        setSelectedMovie,
        selectedShow,
        setSelectedShow,
        selectedSeats,
        toggleSeatSelection,
        removeSeat,
        clearSelectedSeats,
        activePreviewSeat,
        setActivePreviewSeat,
        isLocked,
        lockExpiresAt,
        lockSecondsRemaining,
        lockSeats,
        unlockSeats,
        lockError,
        totalSeatPrice,
        convenienceFee,
        taxes,
        finalTotal,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
