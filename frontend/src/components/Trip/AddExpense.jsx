import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';

const AddExpense = ({ tripId, onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    shared_by: []
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // For now, we'll use mock members since we don't have a members endpoint
    // In a real app, you'd fetch trip members from the API
    setMembers([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ]);
  }, [tripId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.shared_by.length === 0) {
      setError('Please select at least one person to share the expense');
      setLoading(false);
      return;
    }

    try {
      await api.createExpense({
        trip_id: tripId,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        shared_by: formData.shared_by
      });

      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        shared_by: []
      });
      
      onExpenseAdded();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (memberId) => {
    setFormData(prev => ({
      ...prev,
      shared_by: prev.shared_by.includes(memberId)
        ? prev.shared_by.filter(id => id !== memberId)
        : [...prev.shared_by, memberId]
    }));
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6">Add New Expense</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Dinner at restaurant"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-3">
            Split among:
          </label>
          <div className="space-y-2">
            {members.map((member) => (
              <label key={member.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.shared_by.includes(member.id)}
                  onChange={() => handleMemberToggle(member.id)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">{member.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Adding Expense...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;