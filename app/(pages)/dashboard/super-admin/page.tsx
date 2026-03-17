'use client'

import React from 'react'
import QuickActions from '../../../components/dashboard/QuickActions'
import SuperAdminLayout from './layouts'
// import PendingRequests from '@/components/dashboard/PendingRequests'

export default function SuperAdminDashboard() {
  return (    
    <SuperAdminLayout>
      <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Super Admin!</h1>
            <p className="text-emerald-100">Here&apos;s what&apos;s happening with your properties today.</p>
          </div>
        </div>
      </div>

      {/* Recent Activities & Pending Requests */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingRequests />
      </div> */}

      {/* Quick Actions */}
      <QuickActions />
      </div>
    </SuperAdminLayout>
  )
}