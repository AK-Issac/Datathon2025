"use client"

import type React from "react"

import { History, Settings, HelpCircle } from "lucide-react"

export default function Sidebar() {
  return (
    <div className="w-56 border-r border-border bg-sidebar">
      <div className="p-4">
        <nav className="space-y-2">
          <SidebarItem icon={<History className="h-4 w-4" />} label="Analysis History" />
          <SidebarItem icon={<Settings className="h-4 w-4" />} label="Settings" />
          <SidebarItem icon={<HelpCircle className="h-4 w-4" />} label="Help" />
        </nav>
      </div>
    </div>
  )
}

function SidebarItem({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent">
      {icon}
      {label}
    </button>
  )
}
