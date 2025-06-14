'use client';
import { Delete, Trash, Plus, Pencil, MapPin, Calendar } from "lucide-react";
import Checkbox from "../../checkbox";
import Button from "../../button";
import { useState } from "react";
import { Trip } from "@/app/types";
import { formatDate } from "@/lib/utils";

interface TripsTableProps {
  trips: Trip[];
  isLoading?: boolean;
  onTripDeleted?: () => void;
  onAddTripClick?: () => void;
  onEditTripClick?: (trip: Trip) => void;
}

export default function TripsTable({ trips, isLoading, onTripDeleted, onAddTripClick, onEditTripClick }: TripsTableProps) {
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [selectedTrips, setSelectedTrips] = useState<Set<string | number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const safeTrips = Array.isArray(trips) ? trips : [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTrips(new Set(safeTrips.map(trip => trip.TripId)));
    } else {
      setSelectedTrips(new Set());
    }
  };

  const handleSelectTrip = (tripId: string | number, checked: boolean) => {
    const newSelected = new Set(selectedTrips);
    if (checked) {
      newSelected.add(tripId);
    } else {
      newSelected.delete(tripId);
    }
    setSelectedTrips(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedTrips.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedTrips.size} trip${selectedTrips.size > 1 ? 's' : ''}?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const deletePromises = Array.from(selectedTrips).map(async (tripId) => {
        const response = await fetch(`/api/trips?id=${encodeURIComponent(tripId)}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Failed to delete trip ${tripId}: ${error.error}`);
        }
        
        return tripId;
      });

      await Promise.all(deletePromises);
      
      setSelectedTrips(new Set());
      onTripDeleted?.();
      alert(`Successfully deleted ${selectedTrips.size} trip${selectedTrips.size > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert(`Error during bulk delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async (tripId: string | number) => {
    if (!confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    console.log('Attempting to delete trip with ID:', tripId, typeof tripId);

    setDeletingId(tripId);
    
    try {
      if (!tripId) {
        alert('Invalid trip ID');
        return;
      }

      const response = await fetch(`/api/trips?id=${encodeURIComponent(tripId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const newSelected = new Set(selectedTrips);
        newSelected.delete(tripId);
        setSelectedTrips(newSelected);
        
        onTripDeleted?.();
      } else {
        const error = await response.json();
        console.error('Delete error response:', error);
        alert(`Error deleting trip: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete trip. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (trip: Trip) => {
    onEditTripClick?.(trip);
  };

  const getTripStatus = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return { status: 'Planning', color: 'bg-gray-100 text-gray-800' };
    
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

  const getDestinationInitials = (destination: string) => {
    return destination.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
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

  const isAllSelected = safeTrips.length > 0 && selectedTrips.size === safeTrips.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Trips</h2>
          <p className="text-sm text-gray-500 mt-1">
            {safeTrips.length} {safeTrips.length === 1 ? 'trip' : 'trips'} in total
            {selectedTrips.size > 0 && (
              <span className="ml-2 text-blue-600">
                • {selectedTrips.size} selected
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedTrips.size > 0 && (
            <Button 
              size="sm" 
              variant="danger" 
              onClick={handleBulkDelete}
              disabled={isDeleting}
              icon={<Trash size={16} />}
            >
              {isDeleting ? 'Deleting...' : `Delete (${selectedTrips.size})`}
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outlined" 
            onClick={onAddTripClick}
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} className="stroke-[2.5]" />
            Add Trip
          </Button>
        </div>
      </div>
      {safeTrips.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MapPin size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
          <p className="text-gray-500 mb-6">Get started by planning your first trip</p>
          <Button 
            size="md" 
            variant="outlined" 
            onClick={onAddTripClick}
            className="flex items-center gap-2 mx-auto shadow-sm"
          >
            <Plus size={18} className="stroke-[2.5]" />
            Add Trip
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
                  Trip
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeTrips.map((trip, index) => {
                const { status, color } = getTripStatus(trip.Start_Date, trip.End_Date);
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <Checkbox 
                        id={`trip-${trip.TripId}`}
                        checked={selectedTrips.has(trip.TripId)}
                        onChange={(checked) => handleSelectTrip(trip.TripId, checked)}
                      />
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                          <span className="font-medium text-sm text-black">
                            {getDestinationInitials(trip.Name)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{trip.Name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={14} className="mr-1 text-gray-400" />
                        {trip.Destination}
                      </div>
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(trip.Start_Date)}
                          </span>
                          <div className="w-[1px] h-4 bg-gray-300" />
                          <span className="text-xs text-gray-500">
                            {formatDate(trip.End_Date)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(trip.Created_At)}
                    </td>
                    <td className="px-6 py-2.5 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(trip)}
                          className="cursor-pointer text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded-md bg-blue-50"
                          title="Edit trip"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(trip.TripId)}
                          disabled={deletingId === trip.TripId || isDeleting}
                          className="cursor-pointer text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 p-1 rounded-md bg-red-50"
                          title="Delete trip"
                        >
                          {deletingId === trip.TripId ? (
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