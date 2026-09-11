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
import { AppWindow, Blocks, Bot, Layers, Play, Settings, User2 } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Progress } from "../ui/progress"
import { UserDetailContext } from "@/context/UserDetailContext"
import { useContext } from "react"
import { UserButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
export function AppSidebar() {
  const  path= usePathname(); 
  const {userDetail ,setUserDetail} =useContext(UserDetailContext)
  const router =useRouter();
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center flex-row px-4 py-4 gap-2">
        <Image src={"/logo.svg"} alt="Logo" width={40} height={40} />
        <h2 className="text-lg font-semibold text-slate-900">Gravity Ai</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenuButton onClick={() => router.push("/dashboard")} className={`h-12 gap-3 hover:bg-blue-100 hover:bg-slate-100 ${path == "/dashboard" ? "bg-slate-100" : ""}`}>
                <div className="flex items-center rounded-lg justify-center h-9 w-9 bg-blue-100 text-blue-900 gap-2">
                    <AppWindow className="h-[18px] text-blue-900 w-[18px]" />
                </div>
                <span>Dashboard</span>
            </SidebarMenuButton>
             <SidebarMenuButton onClick={() => router.push("/dashboard/agents")} className={`h-12 gap-3 hover:bg-blue-100 hover:bg-slate-100 ${path == "/dashboard/agents" ? "bg-slate-100" : ""}`}>
                <div className="flex items-center rounded-lg justify-center h-9 w-9 bg-green-100 text-green-900 gap-2">
                    <Bot className="h-[18px] text-green-900 w-[18px]" />
                </div>
                <span>Agents</span>
            </SidebarMenuButton>
             <SidebarMenuButton onClick={() => router.push("/dashboard/playground")} className={`h-12 gap-3 hover:bg-blue-100 hover:bg-slate-100 ${path == "/dashboard/playground" ? "bg-slate-100" : ""}`}>
                <div className="flex items-center rounded-lg justify-center h-9 w-9 bg-red-100 text-red-900 gap-2">
                    <Play className="h-[18px] text-red-900 w-[18px]" />
                </div>
                <span>Playground</span>
            </SidebarMenuButton>
             <SidebarMenuButton onClick={() => router.push("/dashboard/integrations")} className={`h-12 gap-3 hover:bg-blue-100 hover:bg-slate-100 ${path == "/dashboard/integrations" ? "bg-slate-100" : ""}`}>
                <div className="flex items-center rounded-lg justify-center h-9 w-9 bg-purple-100 text-purple-900 gap-2">
                    <Blocks className="h-[18px] text-purple-900 w-[18px]" />
                </div>
                <span>Integrations</span>
            </SidebarMenuButton>
             <SidebarMenuButton onClick={() => router.push("/dashboard/templates")} className={`h-12 gap-3 hover:bg-blue-100 hover:bg-slate-100 ${path == "/dashboard/templates" ? "bg-slate-100" : ""}`}>
                <div className="flex items-center rounded-lg justify-center h-9 w-9 bg-orange-100 text-orange-900 gap-2">
                    <Layers className="h-[18px] text-orange-900 w-[18px]" />
                </div>
                <span>Templates</span>
            </SidebarMenuButton>
        </SidebarGroup>
        <SidebarGroup >
          <SidebarGroupLabel>Users</SidebarGroupLabel>
            <SidebarMenuButton onClick={() => router.push("/dashboard/settings")} className={`h-12 gap-3 hover:bg-slate-100 hover:bg-slate-100 ${path == "/dashboard/settings" ? "bg-slate-100" : ""}`}>
                <div className="flex items-center rounded-lg justify-center h-9 w-9 bg-slate-100 text-slate-900 gap-2">
                    <Settings className="h-[18px] text-slate-900 w-[18px]" />
                </div>
                <span>Settings</span>
            </SidebarMenuButton>
             <SidebarMenuButton onClick={() => router.push("/dashboard/profile")} className={`h-12 gap-3 hover:bg-yellow-100 hover:bg-slate-100 ${path == "/dashboard/profile" ? "bg-slate-100" : ""}`}>
                <div className="flex items-center rounded-lg justify-center h-9 w-9 bg-yellow-100 text-yellow-900 gap-2">
                    <User2
                     className="h-[18px] text-yellow-900 w-[18px]" />
                </div>
                <span>Profile</span>
            </SidebarMenuButton>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter >
        <div className="flex flex-col rounded-lg border gap-2 px-4 py-4">
          <h2 className="flex justify-between">Agents <span>{userDetail?.agentCredits}</span></h2>
          <h2 className="flex justify-between">Credits <span>{userDetail?.usageCredits}</span></h2>
          <Progress value={60} className="h-2 rounded-full " />
        </div>
        <div  className="flex items-center gap-2 mt-4">
          <UserButton/>
          <span>{userDetail?.name}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}