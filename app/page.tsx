'use client';
import { useState, useEffect } from "react";
import UserAddModal from "./components/userAddModal";
import UsersTable from "./components/tables/users";
import { User } from "./types";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleAddUserClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Systems</h1>
          <p className="text-gray-600">Next.js with MySQL & Azure Data Studio</p>
        </div>
        <div className="space-y-8">
          <UsersTable 
            users={users} 
            isLoading={isLoading}
            onUserDeleted={() => {
              fetchUsers();
            }}
            onAddUserClick={handleAddUserClick}
          />
        </div>
      </div>
      <UserAddModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}