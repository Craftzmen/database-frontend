'use client';
import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import Button from "./button";
import Input from "./input";
import { UserFormData } from "../types";

interface UserAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export default function UserAddModal({ isOpen, onClose, onUserAdded }: UserAddModalProps) {
  const [form, setForm] = useState<UserFormData>({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    
    setIsLoading(true);
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ name: '', email: '' });
      onUserAdded();
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', email: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3" >
            <UserPlus size={20} />
            <h2 className="font-semibold text-gray-800">Add User</h2>
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <Input
              label="Name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter email"
              required
            />
          </div>
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
              disabled={isLoading || !form.name.trim() || !form.email.trim()}
            >
              {isLoading ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}