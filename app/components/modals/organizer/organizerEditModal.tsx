'use client';
import { useState, useEffect } from "react";
import { Edit, X, AlertCircle } from "lucide-react";
import Button from "../../button";
import Input from "../../input";
import { UserFormData, User } from "@/app/types";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: User | null;
}

export default function UserEditModal({ isOpen, onClose, onUserUpdated, user }: UserEditModalProps) {
  const [form, setForm] = useState<UserFormData>({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.Name || '',
        email: user.Email || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setError(null);
    setSuccess(null);
    
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!form.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Updating user:', { userId: user.UserId, form });
      
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.UserId,
          name: form.name.trim(),
          email: form.email.trim()
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        if (response.status === 409) {
          const errorMessage = data.error || data.details || '';
          
          if (errorMessage.toLowerCase().includes('email')) {
            throw new Error('A user with this email address already exists');
          } else {
            throw new Error('A user with this email address already exists');
          }
        }
        throw new Error(data.error || data.details || `HTTP ${response.status}`);
      }
      
      setSuccess('User updated successfully!');
      
      setTimeout(() => {
        onUserUpdated();
        onClose();
        setSuccess(null);
      }, 1500);
      
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', email: '' });
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Edit size={20} />
            <h2 className="font-semibold text-gray-800">Edit User</h2>
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
          <div className="space-y-4">
            <Input
              label="Name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter full name"
              required
              disabled={isLoading}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter email address"
              required
              disabled={isLoading}
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
              {isLoading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}