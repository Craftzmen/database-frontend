'use client';
import { useState, useEffect } from "react";
import OrganizerAddModal from "../components/modals/organizer/organizerAddModal";
import OrganizerEditModal from "../components/modals/organizer/organizerEditModal";
import OrganizersTable from "../components/tables/organizers";
import { Organizer } from "../types";

export default function Organizers() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);

  const fetchOrganizers = async () => {
    try {
      const res = await fetch('/api/organizers');
      const organizerData = await res.json();
      setOrganizers(organizerData);
    } catch (error) {
      console.error('Error fetching organizers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const handleOrganizerAdded = () => {
    fetchOrganizers();
  };

  const handleOrganizerUpdated = () => {
    fetchOrganizers();
  };

  const handleAddOrganizerClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditOrganizerClick = (organizer: Organizer) => {
    setSelectedOrganizer(organizer);
    setIsEditModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOrganizer(null);
  };

  return (
    <div>
      <div className="space-y-8">
        <OrganizersTable 
          organizers={organizers} 
          isLoading={isLoading}
          onOrganizerDeleted={() => {
            fetchOrganizers();
          }}
          onAddOrganizerClick={handleAddOrganizerClick}
          onEditOrganizerClick={handleEditOrganizerClick}
        />
      </div>
      <OrganizerAddModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onOrganizerAdded={handleOrganizerAdded}
      />
      <OrganizerEditModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onOrganizerUpdated={handleOrganizerUpdated}
        organizer={selectedOrganizer}
      />
    </div>
  );
}