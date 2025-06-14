'use client';
import { useState, useEffect } from "react";
import { Edit, X, AlertCircle, Calendar } from "lucide-react";
import Button from "../../button";
import Input from "../../input";
import Select from "../../select";
import MultiSelect from "../../multi-select";
import { BookingFormData, Trip, Organizer, User, Booking } from "@/app/types";

interface BookingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingUpdated: () => void;
  booking: Booking | null;
}

export default function BookingEditModal({ isOpen, onClose, onBookingUpdated, booking }: BookingEditModalProps) {
  const [form, setForm] = useState<BookingFormData>({ 
    tripId: '',
    organizerId: '',
    type: 'Hotel',
    providerName: '',
    bookingRef: '',
    startDate: '',
    endDate: '',
    userIds: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const bookingTypes = [
    { value: 'Hotel', label: 'Hotel' },
    { value: 'Flight', label: 'Flight' },
    { value: 'Train', label: 'Train' },
    { value: 'Other', label: 'Other' }
  ];

  const formatDateForInput = (dateValue: string | null | undefined): string => {
    if (!dateValue) return '';
    
    try {
      const date = new Date(dateValue);
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date received:', dateValue);
        return '';
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Error formatting date:', dateValue, error);
      return '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (booking) {
      console.log('Booking data received:', booking);
      console.log('Start_Date:', booking.Start_Date, 'End_Date:', booking.End_Date);
      
      setForm({
        tripId: booking.TripId?.toString() || '',
        organizerId: booking.OrganizerId?.toString() || '',
        type: booking.Type || 'Hotel',
        providerName: booking.Provider_Name || '',
        bookingRef: booking.Booking_Ref || '',
        startDate: formatDateForInput(booking.Start_Date),
        endDate: formatDateForInput(booking.End_Date),
        userIds: booking.UserIds || []
      });
    }
  }, [booking]);

  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      const [tripsRes, organizersRes, usersRes] = await Promise.all([
        fetch('/api/trips'),
        fetch('/api/organizers'),
        fetch('/api/users')
      ]);

      const [tripsData, organizersData, usersData] = await Promise.all([
        tripsRes.json(),
        organizersRes.json(),
        usersRes.json()
      ]);

      setTrips(tripsData);
      setOrganizers(organizersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load required data');
    } finally {
      setLoadingData(false);
    }
  };

  const validateDates = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return true;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return start <= end;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking) return;
    
    setError(null);
    setSuccess(null);
    
    if (!form.tripId) {
      setError('Trip is required');
      return;
    }
    
    if (!form.organizerId) {
      setError('Organizer is required');
      return;
    }
    
    if (!form.type) {
      setError('Booking type is required');
      return;
    }
    
    if (form.startDate && form.endDate && !validateDates(form.startDate, form.endDate)) {
      setError('Start date cannot be after end date');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Updating booking:', { bookingId: booking.BookingId, form });
      
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: booking.BookingId,
          tripId: parseInt(form.tripId),
          organizerId: parseInt(form.organizerId),
          type: form.type,
          providerName: form.providerName?.trim() || null,
          bookingRef: form.bookingRef?.trim() || null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          userIds: form.userIds?.map((id: any) => parseInt(id.toString())) || []
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.details || `HTTP ${response.status}`);
      }
      
      setSuccess('Booking updated successfully!');
      
      setTimeout(() => {
        onBookingUpdated();
        onClose();
        setSuccess(null);
      }, 1500);
      
    } catch (error) {
      console.error('Error updating booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to update booking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ 
      tripId: '',
      organizerId: '',
      type: 'Hotel',
      providerName: '',
      bookingRef: '',
      startDate: '',
      endDate: '',
      userIds: []
    });
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleUserSelectionChange = (selectedUserIds: string[]) => {
    setForm({ ...form, userIds: selectedUserIds });
  };

  const today = new Date().toISOString().split('T')[0];

  const tripOptions = trips.map(trip => ({
    value: trip.TripId.toString(),
    label: `${trip.Name} - ${trip.Destination}`
  }));

  const organizerOptions = organizers.map(organizer => ({
    value: organizer.OrganizerId.toString(),
    label: organizer.Name
  }));

  const userOptions = users.map(user => ({
    value: user.UserId.toString(),
    label: `${user.Name} (${user.Email})`
  }));

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <Edit size={20} />
            <h2 className="font-semibold text-gray-800">Edit Booking</h2>
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
              <span className="text-sm">{success}</span>
            </div>
          )}
          {loadingData ? (
            <div className="p-8 text-center">
              <div className="animate-pulse">Loading required data...</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trip *
                  </label>
                  <Select
                    options={tripOptions}
                    value={form.tripId}
                    onChange={(value) => setForm({ ...form, tripId: value })}
                    placeholder="Select a trip"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organizer *
                  </label>
                  <Select
                    options={organizerOptions}
                    value={form.organizerId}
                    onChange={(value) => setForm({ ...form, organizerId: value })}
                    placeholder="Select an organizer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Type *
                  </label>
                  <Select
                    options={bookingTypes}
                    value={form.type}
                    onChange={(value) => setForm({ ...form, type: value })}
                    placeholder="Select booking type"
                  />
                </div>
                <Input
                  label="Provider Name"
                  type="text"
                  value={form.providerName}
                  onChange={(e) => setForm({ ...form, providerName: e.target.value })}
                  placeholder="e.g., Marriott, Emirates, etc."
                  disabled={isLoading}
                />
              </div>
              <Input
                label="Booking Reference"
                type="text"
                value={form.bookingRef}
                onChange={(e) => setForm({ ...form, bookingRef: e.target.value })}
                placeholder="Confirmation number or reference"
                disabled={isLoading}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      min={today}
                      disabled={isLoading}
                      className="pl-10"
                    />
                    <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      min={form.startDate || today}
                      disabled={isLoading}
                      className="pl-10"
                    />
                    <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
              {users.length > 0 && (
                <div>
                  <MultiSelect
                    label="Associated Users"
                    options={userOptions}
                    selectedValues={form.userIds.map(String)}
                    onChange={handleUserSelectionChange}
                    placeholder="Search and select users"
                    disabled={isLoading}
                  />
                </div>
              )}
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
                <span className="font-medium">Note:</span> Only required fields are Trip, Organizer, and Booking Type. All other fields are optional.
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button 
              size="sm"
              variant="outlined" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              variant="solid" 
              disabled={isLoading || !form.tripId || !form.organizerId || !form.type}
            >
              {isLoading ? 'Updating...' : 'Update Booking'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}