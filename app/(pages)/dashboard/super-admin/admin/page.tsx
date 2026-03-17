// app/dashboard/admin/page.tsx
'use client'

import React from 'react'
import DashboardLayout from '../../../dashboard/DashboardLayout'
import QuickActions from '../../../../components/dashboard/QuickActions'
// import PendingRequests from '@/components/dashboard/PendingRequests'

export default function AdminDashboard() {
  return (
    <DashboardLayout activeTab="dashboard" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </DashboardLayout>
  )
}