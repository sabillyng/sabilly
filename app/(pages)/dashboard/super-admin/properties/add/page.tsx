
'use client'

import React from 'react'
import DashboardLayout from '../../../../../(pages)/dashboard/DashboardLayout'
import PropertyForm from '../../../../../components/Property/PropertyForm'

export default function AddPropertyPage() {
  return (
    <DashboardLayout activeTab="add-property" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Add New Property</h1>
          <p className="text-emerald-600 mt-2">
            Fill in the property details to create a new listing. Your progress is auto-saved.
          </p>
        </div>

        {/* Form */}
        <PropertyForm />
      </div>
    </DashboardLayout>
  )
}