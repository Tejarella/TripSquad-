import React from 'react';
import { formatCurrency } from '../../utils/helpers';

const BalanceSummary = ({ balances }) => {
  if (balances.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 text-6xl mb-4">⚖️</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No expenses to balance</h3>
        <p className="text-gray-500">Add some expenses to see the balance summary!</p>
      </div>
    );
  }

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceText = (balance) => {
    if (balance > 0) return `Gets back ${formatCurrency(Math.abs(balance))}`;
    if (balance < 0) return `Owes ${formatCurrency(Math.abs(balance))}`;
    return 'All settled up!';
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6">Balance Summary</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Owes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {balances.map((member, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {member.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(member.paid)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(member.owes)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${getBalanceColor(member.balance)}`}>
                    {getBalanceText(member.balance)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">How to settle up:</h4>
        <div className="text-sm text-blue-800">
          <p>• Members with positive balances should receive money</p>
          <p>• Members with negative balances should pay money</p>
          <p>• The amounts should balance out to zero</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;