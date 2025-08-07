import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: '',
    start_date: '',
    end_date: ''
  });
  const [error, setError] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.getTrips();
      setTrips(response.data.trips);
    } catch (error) {
      setError('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setError('');

    if (new Date(newTrip.start_date) > new Date(newTrip.end_date)) {
      setError('End date must be after start date');
      return;
    }

    try {
      await api.createTrip(newTrip);
      setNewTrip({ name: '', start_date: '', end_date: '' });
      setShowCreateForm(false);
      fetchTrips();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create trip');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">Manage your group trips and expenses</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create New Trip
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Create Trip Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Trip</h3>
            <form onSubmit={handleCreateTrip}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Trip Name
                </label>
                <input
                  type="text"
                  value={newTrip.name}
                  onChange={(e) => setNewTrip({...newTrip, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newTrip.start_date}
                  onChange={(e) => setNewTrip({...newTrip, start_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={newTrip.end_date}
                  onChange={(e) => setNewTrip({...newTrip, end_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No trips yet</h3>
            <p className="text-gray-500">Create your first trip to get started!</p>
          </div>
        ) : (
          trips.map((trip) => (
            <Link
              key={trip.id}
              to={`/trip/${trip.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{trip.name}</h3>
                <p className="text-gray-600 text-sm">
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </p>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <span>{trip.member_count} members</span>
                <span className="text-green-600 font-semibold">
                  {formatCurrency(trip.total_expenses)} total
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                Created by {trip.creator_name}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;