// app/dashboard/super-admin/layout.tsx
'use client'

import React, { ReactNode } from 'react'
import DashboardLayout from '../../dashboard/DashboardLayout'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}