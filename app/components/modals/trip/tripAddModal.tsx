'use client';
import { useState } from "react";
import { MapPin, X, AlertCircle, Calendar } from "lucide-react";
import Button from "../../button";
import Input from "../../input";
import { TripFormData } from "@/app/types";

interface TripAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripAdded: () => void;
}

export default function TripAddModal({ isOpen, onClose, onTripAdded }: TripAddModalProps) {
  const [form, setForm] = useState<TripFormData>({ 
    name: '', 
    destination: '', 
    startDate: '', 
    endDate: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateDates = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return true
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setSuccess(null);
    
    if (!form.name.trim()) {
      setError('Trip name is required');
      return;
    }
    
    if (!form.destination.trim()) {
      setError('Destination is required');
      return;
    }
    
    if (form.startDate && form.endDate && !validateDates(form.startDate, form.endDate)) {
      setError('Start date cannot be after end date');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Submitting trip form:', form);
      
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          destination: form.destination.trim(),
          startDate: form.startDate || null,
          endDate: form.endDate || null
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.details || `HTTP ${response.status}`);
      }
      
      setSuccess('Trip created successfully!');
      setForm({ name: '', destination: '', startDate: '', endDate: '' });
      
      setTimeout(() => {
        onTripAdded();
        onClose();
        setSuccess(null);
      }, 1500);
      
    } catch (error) {
      console.error('Error adding trip:', error);
      setError(error instanceof Error ? error.message : 'Failed to create trip');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', destination: '', startDate: '', endDate: '' });
    setError(null);
    setSuccess(null);
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MapPin size={20} />
            <h2 className="font-semibold text-gray-800">Add Trip</h2>
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
              label="Trip Name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter trip name"
              required
              disabled={isLoading}
            />
            <Input
              label="Destination"
              type="text"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              placeholder="Enter destination"
              required
              disabled={isLoading}
            />
            <div className="grid grid-cols-2 gap-3">
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
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
              <span className="font-medium">Note:</span> Dates are optional. Leave empty if you're still planning your trip.
            </div>
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
              disabled={isLoading || !form.name.trim() || !form.destination.trim()}
            >
              {isLoading ? 'Creating...' : 'Add Trip'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}