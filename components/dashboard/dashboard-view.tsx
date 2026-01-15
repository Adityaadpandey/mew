'use client'

import { DashboardHome } from './dashboard-home'

export function DashboardView() {
  // Always show dashboard home - documents are opened via /documents/[id] or /designs/[id] routes
  return <DashboardHome />
}
