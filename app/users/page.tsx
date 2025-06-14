'use client';
import { useState, useEffect } from "react";
import UserAddModal from "../components/modals/user/userAddModal";
import UserEditModal from "../components/modals/user/userEditModal";
import UsersTable from "../components/tables/users";
import { User } from "../types";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const userData = await res.json();
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserAdded = () => {
    fetchUsers();
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  const handleAddUserClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditUserClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div>
      <div className="space-y-8">
        <UsersTable 
          users={users} 
          isLoading={isLoading}
          onUserDeleted={() => {
            fetchUsers();
          }}
          onAddUserClick={handleAddUserClick}
          onEditUserClick={handleEditUserClick}
        />
      </div>
      <UserAddModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onUserAdded={handleUserAdded}
      />
      <UserEditModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
      />
    </div>
  );
}