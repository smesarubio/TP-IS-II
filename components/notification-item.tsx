"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Trash2, ExternalLink } from "lucide-react"
import { useState } from "react"

interface NotificationItemProps {
  notification: {
    id: string
    message: string
    is_read: boolean
    sent_at: string
    documents?: {
      title: string
      renewal_url?: string
      expiration_date: string
      document_type: string
    }
  }
  onDelete: (id: string) => void
  onMarkRead: (id: string) => void
}

export default function NotificationItem({ notification, onDelete, onMarkRead }: NotificationItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(notification.id)
  }

  const handleMarkRead = async () => {
    await onMarkRead(notification.id)
  }

  const document = notification.documents
  const expirationDate = document?.expiration_date ? new Date(document.expiration_date) : null
  const daysUntilExpiry = expirationDate
    ? Math.floor((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const isExpired = daysUntilExpiry < 0
  const isExpiringSoon = daysUntilExpiry <= 30

  return (
    <Card className={`transition-opacity ${notification.is_read ? "opacity-60" : ""}`}>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            {isExpired ? (
              <AlertCircle className="w-5 h-5 text-destructive" />
            ) : isExpiringSoon ? (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="font-medium text-foreground">{notification.message}</p>
                {document && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-semibold">{document.title}</span>
                    {" • "}
                    <span className="capitalize">{document.document_type.replace("_", " ")}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isExpired && <Badge variant="destructive">Expired</Badge>}
                {isExpiringSoon && !isExpired && <Badge className="bg-amber-500">Urgent</Badge>}
              </div>
            </div>

            {document && (
              <div className="bg-muted/50 rounded px-3 py-2 mb-3">
                <p className="text-xs text-muted-foreground">
                  Expiration: {expirationDate?.toLocaleDateString()}
                  {" • "}
                  {isExpired ? `Expired ${Math.abs(daysUntilExpiry)} days ago` : `${daysUntilExpiry} days remaining`}
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground mb-3">{new Date(notification.sent_at).toLocaleString()}</p>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {document?.renewal_url && (
                <Button size="sm" className="gap-1" onClick={() => window.open(document.renewal_url, "_blank")}>
                  <ExternalLink className="w-4 h-4" />
                  Renew Now
                </Button>
              )}

              {!notification.is_read && (
                <Button size="sm" variant="outline" onClick={handleMarkRead}>
                  Mark as Read
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
