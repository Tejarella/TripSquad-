import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AddExpense from './AddExpense';
import ExpenseList from './ExpenseList';
import BalanceSummary from './BalanceSummary';
import * as api from '../../services/api';

const TripDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('expenses');
  // const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTripData();
  }, [id]);

  const fetchTripData = async () => {
    try {
      // Fetch expenses and balances
      const [expensesRes, balancesRes] = await Promise.all([
        api.getExpenses(id),
        api.getBalance(id)
      ]);

      setExpenses(expensesRes.data.expenses);
      setBalances(balancesRes.data.balances);
    } catch (error) {
      setError('Failed to fetch trip data');
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    fetchTripData();
    setActiveTab('expenses');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trip Details</h1>
        <p className="text-gray-600 mt-2">Manage expenses and track balances</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'expenses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('add-expense')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'add-expense'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Add Expense
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'balance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Balance Summary
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeTab === 'expenses' && <ExpenseList expenses={expenses} />}
        {activeTab === 'add-expense' && (
          <AddExpense tripId={id} onExpenseAdded={handleExpenseAdded} />
        )}
        {activeTab === 'balance' && <BalanceSummary balances={balances} />}
      </div>
    </div>
  );
};

export default TripDetails;