import React from 'react';
import { formatCurrency, formatDate } from '../../utils/helpers';

const ExpenseList = ({ expenses }) => {
  if (expenses.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 text-6xl mb-4">💰</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No expenses yet</h3>
        <p className="text-gray-500">Add your first expense to get started!</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6">All Expenses</h3>
      
      <div className="space-y-4">
        {expenses.map((expense) => (
          <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{expense.description}</h4>
                <p className="text-sm text-gray-600">
                  Paid by {expense.paid_by_name} on {formatDate(expense.date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            </div>
            
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Split among:</p>
              <div className="flex flex-wrap gap-2">
                {expense.shares.map((share, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {share.name}: {formatCurrency(share.amount)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;