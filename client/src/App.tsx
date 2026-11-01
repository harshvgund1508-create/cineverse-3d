import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { Navbar } from './components/layout/Navbar';
import { AuthModal } from './components/auth/AuthModal';

import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { CinemasPage } from './pages/CinemasPage';
import { Auditorium3DPage } from './pages/Auditorium3DPage';
import { TicketConfirmationPage } from './pages/TicketConfirmationPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <div className="min-h-screen bg-cine-dark text-slate-100 flex flex-col font-sans selection:bg-cine-cyan selection:text-black">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/movies/:id" element={<MovieDetailsPage />} />
                <Route path="/cinemas" element={<CinemasPage />} />
                <Route path="/auditorium/:showId" element={<Auditorium3DPage />} />
                <Route path="/ticket/:ticketCode" element={<TicketConfirmationPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <AuthModal />
          </div>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
