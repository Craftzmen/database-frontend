'use client';
import { Delete, Trash, Plus, Pencil, Calendar, Building, Plane, Train, Package } from "lucide-react";
import Checkbox from "../../checkbox";
import Button from "../../button";
import { useState } from "react";
import { Booking } from "@/app/types";
import { formatDate } from "@/lib/utils";

interface BookingsTableProps {
  bookings: Booking[];
  isLoading?: boolean;
  onBookingDeleted?: () => void;
  onAddBookingClick?: () => void;
  onEditBookingClick?: (booking: Booking) => void;
}

export default function BookingsTable({ 
  bookings, 
  isLoading, 
  onBookingDeleted, 
  onAddBookingClick, 
  onEditBookingClick 
}: BookingsTableProps) {
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<Set<string | number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(new Set(safeBookings.map(booking => booking.BookingId)));
    } else {
      setSelectedBookings(new Set());
    }
  };

  const handleSelectBooking = (bookingId: string | number, checked: boolean) => {
    const newSelected = new Set(selectedBookings);
    if (checked) {
      newSelected.add(bookingId);
    } else {
      newSelected.delete(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedBookings.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedBookings.size} booking${selectedBookings.size > 1 ? 's' : ''}?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const deletePromises = Array.from(selectedBookings).map(async (bookingId) => {
        const response = await fetch(`/api/bookings?id=${encodeURIComponent(bookingId)}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Failed to delete booking ${bookingId}: ${error.error}`);
        }
        
        return bookingId;
      });

      await Promise.all(deletePromises);
      
      setSelectedBookings(new Set());
      onBookingDeleted?.();
      alert(`Successfully deleted ${selectedBookings.size} booking${selectedBookings.size > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert(`Error during bulk delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async (bookingId: string | number) => {
    if (!confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    console.log('Attempting to delete booking with ID:', bookingId, typeof bookingId);

    setDeletingId(bookingId);
    
    try {
      if (!bookingId) {
        alert('Invalid booking ID');
        return;
      }

      const response = await fetch(`/api/bookings?id=${encodeURIComponent(bookingId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const newSelected = new Set(selectedBookings);
        newSelected.delete(bookingId);
        setSelectedBookings(newSelected);
        
        onBookingDeleted?.();
      } else {
        const error = await response.json();
        console.error('Delete error response:', error);
        alert(`Error deleting booking: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete booking. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (booking: Booking) => {
    onEditBookingClick?.(booking);
  };

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case 'Hotel':
        return <Building size={14} />;
      case 'Flight':
        return <Plane size={14} />;
      case 'Train':
        return <Train size={14} />;
      default:
        return <Package size={14} />;
    }
  };

  const getBookingTypeColor = (type: string) => {
    switch (type) {
      case 'Hotel':
        return 'bg-blue-100 text-blue-800';
      case 'Flight':
        return 'bg-green-100 text-green-800';
      case 'Train':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatus = (startDate: string | null | undefined, endDate: string | null | undefined) => {
    if (!startDate || !endDate) return { status: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) {
      return { status: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= start && now <= end) {
      return { status: 'Active', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Completed', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-8 text-center text-gray-500">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-2 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const isAllSelected = safeBookings.length > 0 && selectedBookings.size === safeBookings.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">
            {safeBookings.length} {safeBookings.length === 1 ? 'booking' : 'bookings'} in total
            {selectedBookings.size > 0 && (
              <span className="ml-2 text-blue-600">
                • {selectedBookings.size} selected
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedBookings.size > 0 && (
            <Button 
              size="sm" 
              variant="danger" 
              onClick={handleBulkDelete}
              disabled={isDeleting}
              icon={<Trash size={16} />}
            >
              {isDeleting ? 'Deleting...' : `Delete (${selectedBookings.size})`}
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outlined" 
            onClick={onAddBookingClick}
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} className="stroke-[2.5]" />
            Add Booking
          </Button>
        </div>
      </div>
      {safeBookings.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first booking</p>
          <Button 
            size="md" 
            variant="outlined" 
            onClick={onAddBookingClick}
            className="flex items-center gap-2 mx-auto shadow-sm"
          >
            <Plus size={18} className="stroke-[2.5]" />
            Add Booking
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <Checkbox 
                    id="select-all" 
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider & Reference
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organizer
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeBookings.map((booking, index) => {
                const { status, color } = getBookingStatus(booking.Start_Date, booking.End_Date);
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <Checkbox 
                        id={`booking-${booking.BookingId}`}
                        checked={selectedBookings.has(booking.BookingId)}
                        onChange={(checked) => handleSelectBooking(booking.BookingId, checked)}
                      />
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getBookingTypeColor(booking.Type)}`}>
                          {getBookingTypeIcon(booking.Type)}
                          {booking.Type}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.Provider_Name || 'No provider specified'}
                      </div>
                      {booking.Booking_Ref && (
                        <div className="text-xs text-gray-500 font-mono">
                          {booking.Booking_Ref}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.TripName}</div>
                      <div className="text-xs text-gray-500">{booking.TripDestination}</div>
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(booking.Start_Date)}
                          </span>
                          <div className="w-[1px] h-4 bg-gray-300" />
                          <span className="text-xs text-gray-500">
                            {formatDate(booking.End_Date)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.OrganizerName}</div>
                      <div className="text-xs text-gray-500">{booking.OrganizerEmail}</div>
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(booking)}
                          className="cursor-pointer text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded-md bg-blue-50"
                          title="Edit booking"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(booking.BookingId)}
                          disabled={deletingId === booking.BookingId || isDeleting}
                          className="cursor-pointer text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 p-1 rounded-md bg-red-50"
                          title="Delete booking"
                        >
                          {deletingId === booking.BookingId ? (
                            <Delete size={18} className="animate-pulse" />
                          ) : (
                            <Trash size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}