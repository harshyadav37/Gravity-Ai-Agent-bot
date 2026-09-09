import { AppSidebar } from '@/components/custom/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'

const DashboardLayout = ({children}:any) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
    <div>{children}</div>
    </SidebarProvider>

  )
}

export default DashboardLayout  