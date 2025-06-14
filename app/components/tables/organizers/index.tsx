'use client';
import { Delete, Trash, Plus, Pencil, Phone, Mail } from "lucide-react";
import Checkbox from "../../checkbox";
import Button from "../../button";
import { useState } from "react";
import { Organizer } from "@/app/types";
import { formatDate } from "@/lib/utils";

interface OrganizersTableProps {
  organizers: Organizer[];
  isLoading?: boolean;
  onOrganizerDeleted?: () => void;
  onAddOrganizerClick?: () => void;
  onEditOrganizerClick?: (organizer: Organizer) => void;
}

export default function OrganizersTable({ organizers, isLoading, onOrganizerDeleted, onAddOrganizerClick, onEditOrganizerClick }: OrganizersTableProps) {
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [selectedOrganizers, setSelectedOrganizers] = useState<Set<string | number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const safeOrganizers = Array.isArray(organizers) ? organizers : [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrganizers(new Set(safeOrganizers.map(organizer => organizer.OrganizerId)));
    } else {
      setSelectedOrganizers(new Set());
    }
  };

  const handleSelectOrganizer = (organizerId: string | number, checked: boolean) => {
    const newSelected = new Set(selectedOrganizers);
    if (checked) {
      newSelected.add(organizerId);
    } else {
      newSelected.delete(organizerId);
    }
    setSelectedOrganizers(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedOrganizers.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedOrganizers.size} organizer${selectedOrganizers.size > 1 ? 's' : ''}?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const deletePromises = Array.from(selectedOrganizers).map(async (organizerId) => {
        const response = await fetch(`/api/organizers?id=${encodeURIComponent(organizerId)}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Failed to delete organizer ${organizerId}: ${error.error}`);
        }
        
        return organizerId;
      });

      await Promise.all(deletePromises);
      
      setSelectedOrganizers(new Set());
      onOrganizerDeleted?.();
      alert(`Successfully deleted ${selectedOrganizers.size} organizer${selectedOrganizers.size > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert(`Error during bulk delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async (organizerId: string | number) => {
    if (!confirm('Are you sure you want to delete this organizer?')) {
      return;
    }

    console.log('Attempting to delete organizer with ID:', organizerId, typeof organizerId);

    setDeletingId(organizerId);
    
    try {
      if (!organizerId) {
        alert('Invalid organizer ID');
        return;
      }

      const response = await fetch(`/api/organizers?id=${encodeURIComponent(organizerId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const newSelected = new Set(selectedOrganizers);
        newSelected.delete(organizerId);
        setSelectedOrganizers(newSelected);
        
        onOrganizerDeleted?.();
      } else {
        const error = await response.json();
        console.error('Delete error response:', error);
        alert(`Error deleting organizer: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete organizer. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (organizer: Organizer) => {
    onEditOrganizerClick?.(organizer);
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

  function getInitials(name: string) {
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
  }

  const isAllSelected = safeOrganizers.length > 0 && selectedOrganizers.size === safeOrganizers.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Organizers</h2>
          <p className="text-sm text-gray-500 mt-1">
            {safeOrganizers.length} {safeOrganizers.length === 1 ? 'organizer' : 'organizers'} in total
            {selectedOrganizers.size > 0 && (
              <span className="ml-2 text-blue-600">
                • {selectedOrganizers.size} selected
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedOrganizers.size > 0 && (
            <Button 
              size="sm" 
              variant="danger" 
              onClick={handleBulkDelete}
              disabled={isDeleting}
              icon={<Trash size={16} />}
            >
              {isDeleting ? 'Deleting...' : `Delete (${selectedOrganizers.size})`}
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outlined" 
            onClick={onAddOrganizerClick}
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} className="stroke-[2.5]" />
            Add Organizer
          </Button>
        </div>
      </div>
      {safeOrganizers.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No organizers yet</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first organizer</p>
          <Button 
            size="md" 
            variant="outlined" 
            onClick={onAddOrganizerClick}
            className="flex items-center gap-2 mx-auto shadow-sm"
          >
            <Plus size={18} className="stroke-[2.5]" />
            Add Organizer
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
                  Name
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
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
              {safeOrganizers.map((organizer, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-2.5 whitespace-nowrap">
                    <Checkbox 
                      id={`organizer-${organizer.OrganizerId}`}
                      checked={selectedOrganizers.has(organizer.OrganizerId)}
                      onChange={(checked) => handleSelectOrganizer(organizer.OrganizerId, checked)}
                    />
                  </td>
                  <td className="px-6 py-2.5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                        <span className="font-medium text-sm">
                          {getInitials(organizer.Name)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{organizer.Name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {organizer.Email}
                    </div>
                  </td>
                  <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-600">
                    {organizer.Phone ? (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        {organizer.Phone}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No phone</span>
                    )}
                  </td>
                  <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(organizer.Created_At)}
                  </td>
                  <td className="px-6 py-2.5 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(organizer)}
                        className="cursor-pointer text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded-md bg-blue-50"
                        title="Edit organizer"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(organizer.OrganizerId)}
                        disabled={deletingId === organizer.OrganizerId || isDeleting}
                        className="cursor-pointer text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 p-1 rounded-md bg-red-50"
                        title="Delete organizer"
                      >
                        {deletingId === organizer.OrganizerId ? (
                          <Delete size={18} className="animate-pulse" />
                        ) : (
                          <Trash size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}