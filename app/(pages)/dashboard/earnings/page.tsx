"use client";
import { useState } from 'react';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ComponentType } from 'react';

// Type definitions
type Period = 'week' | 'month' | 'year';
type TransactionStatus = 'completed' | 'pending';

interface Transaction {
  id: number;
  job: string;
  amount: number;
  date: string;
  status: TransactionStatus;
}

interface Earnings {
  total: number;
  pending: number;
  completed: number;
  averagePerJob: number;
  transactions: Transaction[];
}

interface StatCardProps {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
}

export default function EarningsPage() {
  const [period, setPeriod] = useState<Period>('month');

  // Mock data with proper typing
  const earnings: Earnings = {
    total: 385000,
    pending: 45000,
    completed: 340000,
    averagePerJob: 32000,
    transactions: [
      { id: 1, job: 'Plumbing Repair', amount: 15000, date: '2024-03-15', status: 'completed' },
      { id: 2, job: 'Electrical Wiring', amount: 25000, date: '2024-03-14', status: 'completed' },
      { id: 3, job: 'House Painting', amount: 50000, date: '2024-03-10', status: 'pending' },
      { id: 4, job: 'Carpentry Work', amount: 35000, date: '2024-03-05', status: 'completed' },
    ]
  };

  const periods: Period[] = ['week', 'month', 'year'];

  const getStatusStyles = (status: TransactionStatus): string => {
    const styles: Record<TransactionStatus, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status];
  };

  const availableForWithdrawal = earnings.completed - 50000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-600">Track your income and payouts</p>
      </div>

      {/* Period Selector */}
      <div className="flex space-x-2">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Earnings"
          value={`₦${earnings.total.toLocaleString()}`}
          icon={BanknotesIcon}
          trend="+15%"
          trendUp={true}
        />
        <StatCard
          title="Pending"
          value={`₦${earnings.pending.toLocaleString()}`}
          icon={ClockIcon}
        />
        <StatCard
          title="Completed"
          value={`₦${earnings.completed.toLocaleString()}`}
          icon={CheckCircleIcon}
        />
        <StatCard
          title="Average per Job"
          value={`₦${earnings.averagePerJob.toLocaleString()}`}
          icon={CurrencyDollarIcon}
        />
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Earnings Overview</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chart will be displayed here</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {earnings.transactions.map((transaction) => (
            <div key={transaction.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{transaction.job}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(transaction.status)}`}>
                  {transaction.status}
                </span>
                <span className="font-semibold text-emerald-600">
                  ₦{transaction.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdraw Button */}
      {availableForWithdrawal > 0 && (
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-emerald-900 mb-1">
                Available for Withdrawal
              </h3>
              <p className="text-3xl font-bold text-emerald-600">
                ₦{availableForWithdrawal.toLocaleString()}
              </p>
            </div>
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
              Withdraw Funds
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5 text-gray-400" />
        {trend && (
          <span className={`flex items-center text-sm ${
            trendUp ? 'text-green-600' : 'text-red-600'
          }`}>
            {trendUp ? (
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
            )}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}