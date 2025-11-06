"use client"

import NotificationSettings from "@/components/notification-settings"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your notification preferences</p>
      </div>

      <NotificationSettings />
    </div>
  )
}
