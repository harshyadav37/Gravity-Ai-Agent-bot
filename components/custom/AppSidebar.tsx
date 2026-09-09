"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AppWindow, Blocks, Bot, Layers, Play } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  const  path= usePathname(); 
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center flex-row px-4 py-4 gap-2">
        <Image src={"/logo.svg"} alt="Logo" width={40} height={40} />
        <h2 className="text-lg font-semibold text-slate-900">Gravity Ai</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenuButton className={`h-12 gap-3 hover:bg-blue-100 hover:bg-slate-100 ${path.includes("/dashboard") ? "bg-slate-100" : ""}`}>
                <div className="flex items-center rounded-lg justify-center h-9 w-9 bg-blue-100 text-blue-900 gap-2">
                    <AppWindow className="h-[18px] text-blue-900 w-[18px]" />
                </div>
                <span>Dashboard</span>
            </SidebarMenuButton>
             <SidebarMenuButton className={`h-12 gap-3 hover:bg-blue-100 hover:bg-slate-100 ${path.includes("/dashboard/agents") ? "bg-slate-100" : ""}`}>
                <div className="flex items-center rounded-lg justify-center h-9 w-9 bg-green-100 text-green-900 gap-2">
                    <Bot className="h-[18px] text-green-900 w-[18px]" />
                </div>
                <span>Agents</span>
            </SidebarMenuButton>
             <SidebarMenuButton className={`h-12 gap-3 hover:bg-blue-100 hover:bg-slate-100 ${path.includes("/dashboard/playground") ? "bg-slate-100" : ""}`}>
                <div className="flex items-center rounded-lg justify-center h-9 w-9 bg-red-100 text-red-900 gap-2">
                    <Play className="h-[18px] text-red-900 w-[18px]" />
                </div>
                <span>Playground</span>
            </SidebarMenuButton>
             <SidebarMenuButton className={`h-12 gap-3 hover:bg-blue-100 hover:bg-slate-100 ${path.includes("/dashboard/integrations") ? "bg-slate-100" : ""}`}>
                <div className="flex items-center rounded-lg justify-center h-9 w-9 bg-purple-100 text-purple-900 gap-2">
                    <Blocks className="h-[18px] text-purple-900 w-[18px]" />
                </div>
                <span>Integrations</span>
            </SidebarMenuButton>
             <SidebarMenuButton className={`h-12 gap-3 hover:bg-blue-100 hover:bg-slate-100 ${path.includes("/dashboard/templates") ? "bg-slate-100" : ""}`}>
                <div className="flex items-center rounded-lg justify-center h-9 w-9 bg-orange-100 text-orange-900 gap-2">
                    <Layers className="h-[18px] text-orange-900 w-[18px]" />
                </div>
                <span>Templates</span>
            </SidebarMenuButton>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}