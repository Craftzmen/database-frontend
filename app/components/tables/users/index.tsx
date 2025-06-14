'use client';
import { Delete, Trash, Plus, Pencil } from "lucide-react";
import Checkbox from "../../checkbox";
import Button from "../../button";
import { useState } from "react";
import { User } from "@/app/types";
import { formatDate } from "@/lib/utils";

interface UsersTableProps {
  users: User[];
  isLoading?: boolean;
  onUserDeleted?: () => void;
  onAddUserClick?: () => void;
  onEditUserClick?: (user: User) => void;
}

export default function UsersTable({ users, isLoading, onUserDeleted, onAddUserClick, onEditUserClick }: UsersTableProps) {
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string | number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const safeUsers = Array.isArray(users) ? users : [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(safeUsers.map(user => user.UserId)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: string | number, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedUsers.size} user${selectedUsers.size > 1 ? 's' : ''}?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const deletePromises = Array.from(selectedUsers).map(async (userId) => {
        const response = await fetch(`/api/users?id=${encodeURIComponent(userId)}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Failed to delete user ${userId}: ${error.error}`);
        }
        
        return userId;
      });

      await Promise.all(deletePromises);
      
      setSelectedUsers(new Set());
      onUserDeleted?.();
      alert(`Successfully deleted ${selectedUsers.size} user${selectedUsers.size > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert(`Error during bulk delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async (userId: string | number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    console.log('Attempting to delete user with ID:', userId, typeof userId);

    setDeletingId(userId);
    
    try {
      if (!userId) {
        alert('Invalid user ID');
        return;
      }

      const response = await fetch(`/api/users?id=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const newSelected = new Set(selectedUsers);
        newSelected.delete(userId);
        setSelectedUsers(newSelected);
        
        onUserDeleted?.();
      } else {
        const error = await response.json();
        console.error('Delete error response:', error);
        alert(`Error deleting user: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (user: User) => {
    onEditUserClick?.(user);
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

  const isAllSelected = safeUsers.length > 0 && selectedUsers.size === safeUsers.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Users</h2>
          <p className="text-sm text-gray-500 mt-1">
            {safeUsers.length} {safeUsers.length === 1 ? 'user' : 'users'} in total
            {selectedUsers.size > 0 && (
              <span className="ml-2 text-blue-600">
                • {selectedUsers.size} selected
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedUsers.size > 0 && (
            <Button 
              size="sm" 
              variant="danger" 
              onClick={handleBulkDelete}
              disabled={isDeleting}
              icon={<Trash size={16} />}
            >
              {isDeleting ? 'Deleting...' : `Delete (${selectedUsers.size})`}
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outlined" 
            onClick={onAddUserClick}
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} className="stroke-[2.5]" />
            Add User
          </Button>
        </div>
      </div>
      {safeUsers.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first user</p>
          <Button 
            size="md" 
            variant="outlined" 
            onClick={onAddUserClick}
            className="flex items-center gap-2 mx-auto shadow-sm"
          >
            <Plus size={18} className="stroke-[2.5]" />
            Add User
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
                  Created
                </th>
                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeUsers.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-2.5 whitespace-nowrap">
                    <Checkbox 
                      id={`user-${user.UserId}`}
                      checked={selectedUsers.has(user.UserId)}
                      onChange={(checked) => handleSelectUser(user.UserId, checked)}
                    />
                  </td>
                  <td className="px-6 py-2.5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                        <span className="font-medium text-sm">
                          {getInitials(user.Name)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.Name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-600">
                    {user.Email}
                  </td>
                  <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(user.Created_At)}
                  </td>
                  <td className="px-6 py-2.5 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="cursor-pointer text-blue-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded-md bg-blue-50"
                        title="Edit user"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.UserId)}
                        disabled={deletingId === user.UserId || isDeleting}
                        className="cursor-pointer text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 p-1 rounded-md bg-red-50"
                        title="Delete user"
                      >
                        {deletingId === user.UserId ? (
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