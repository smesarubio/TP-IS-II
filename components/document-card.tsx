"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface DocumentCardProps {
  document: {
    id: string
    title: string
    document_type: string
    expiration_date: string
    renewal_url?: string
  }
  onUpdate: () => void
}

export default function DocumentCard({ document, onUpdate }: DocumentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const expirationDate = new Date(document.expiration_date)
  const today = new Date()
  const daysUntilExpiry = Math.floor((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const getStatusBadge = () => {
    if (daysUntilExpiry < 0) return <Badge variant="destructive">Expired</Badge>
    if (daysUntilExpiry <= 30) return <Badge className="bg-amber-500">Expiring Soon</Badge>
    return (
      <Badge variant="outline" className="bg-green-50">
        Valid
      </Badge>
    )
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this document?")) {
      setIsDeleting(true)
      try {
        const res = await fetch(`/api/documents/${document.id}`, {
          method: "DELETE",
        })
        if (res.ok) {
          onUpdate()
        }
      } catch (error) {
        console.error("Error deleting document:", error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{document.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 capitalize">{document.document_type.replace("_", " ")}</p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Expiration Date</p>
          <p className="text-sm text-muted-foreground">{expirationDate.toLocaleDateString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {daysUntilExpiry < 0
              ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
              : `Expires in ${daysUntilExpiry} days`}
          </p>
        </div>

        <div className="flex gap-2">
          {document.renewal_url && (
            <Button size="sm" className="flex-1" onClick={() => window.open(document.renewal_url, "_blank")}>
              Renew Now
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
