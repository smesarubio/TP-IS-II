"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NotificationItem from "@/components/notification-item"
import useSWR from "swr"
import { useEffect, useState } from "react"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function NotificationsPage() {
  const { data: notifications, mutate } = useSWR("/api/notifications", fetcher)
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "unread">("all")

  useEffect(() => {
    if (notifications !== undefined) {
      setIsLoading(false)
    }
  }, [notifications])

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      })
      if (res.ok) mutate()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      })
      if (res.ok) mutate()
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const filteredNotifications = notifications
    ? filterType === "unread"
      ? notifications.filter((n: any) => !n.is_read)
      : notifications
    : []

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">Track your document expiration alerts and renewal reminders</p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filterType} onValueChange={(v) => setFilterType(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all">All {notifications && `(${notifications.length})`}</TabsTrigger>
          <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notif: any) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onDelete={deleteNotification}
                  onMarkRead={markAsRead}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">No notifications yet. Your documents are all up to date!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notif: any) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onDelete={deleteNotification}
                  onMarkRead={markAsRead}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">All caught up! No unread notifications.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
