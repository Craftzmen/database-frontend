'use client';
import { useState, useEffect } from "react";
import TripAddModal from "../components/modals/trip/tripAddModal";
import TripEditModal from "../components/modals/trip/tripEditModal";
import TripsTable from "../components/tables/trips";
import { Trip } from "../types";

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      const tripData = await res.json();
      setTrips(tripData);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleTripAdded = () => {
    fetchTrips();
  };

  const handleTripUpdated = () => {
    fetchTrips();
  };

  const handleAddTripClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditTripClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsEditModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTrip(null);
  };

  return (
    <div>
      <div className="space-y-8">
        <TripsTable
          trips={trips}
          isLoading={isLoading}
          onTripDeleted={fetchTrips}
          onAddTripClick={handleAddTripClick}
          onEditTripClick={handleEditTripClick}
        />
      </div>
      <TripAddModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onTripAdded={handleTripAdded}
      />
      <TripEditModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onTripUpdated={handleTripUpdated}
        trip={selectedTrip}
      />
    </div>
  );
}