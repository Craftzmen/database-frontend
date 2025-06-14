'use client';
import { useState, useEffect } from "react";
import BookingAddModal from "../components/modals/booking/bookingAddModal";
import BookingEditModal from "../components/modals/booking/bookingEditModal";
import BookingsTable from "../components/tables/bookings";
import { Booking } from "../types";

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const bookingData = await res.json();
      setBookings(bookingData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingAdded = () => {
    fetchBookings();
  };

  const handleBookingUpdated = () => {
    fetchBookings();
  };

  const handleAddBookingClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div>
      <div className="space-y-8">
        <BookingsTable
          bookings={bookings}
          isLoading={isLoading}
          onBookingDeleted={fetchBookings}
          onAddBookingClick={handleAddBookingClick}
          onEditBookingClick={handleEditBookingClick}
        />
      </div>
      <BookingAddModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onBookingAdded={handleBookingAdded}
      />
      <BookingEditModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onBookingUpdated={handleBookingUpdated}
        booking={selectedBooking}
      />
    </div>
  );
}