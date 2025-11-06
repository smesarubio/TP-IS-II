"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import DocumentUploadForm from "@/components/document-upload-form"
import DocumentCard from "@/components/document-card"
import useSWR from "swr"
import Link from "next/link"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function DashboardPage() {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const { data: documents, mutate } = useSWR("/api/documents", fetcher)
  const { data: notifications } = useSWR("/api/notifications", fetcher)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (documents !== undefined) {
      setIsLoading(false)
    }
  }, [documents])

  const handleDocumentAdded = () => {
    setShowUploadForm(false)
    mutate()
  }

  const expiringDocuments =
    documents?.filter((doc: any) => {
      const expirationDate = new Date(doc.expiration_date)
      const daysUntilExpiry = Math.floor((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0
    }).length || 0

  const unreadNotifications = notifications?.filter((n: any) => !n.is_read).length || 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Documents</h1>
          <p className="text-muted-foreground mt-1">Manage and track your documents' expiration dates</p>
        </div>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>{showUploadForm ? "Cancel" : "Add Document"}</Button>
      </div>

      {/* Alert Cards */}
      {(expiringDocuments > 0 || unreadNotifications > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {expiringDocuments > 0 && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100">Documents Expiring Soon</p>
                    <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">{expiringDocuments}</p>
                  </div>
                  <Badge className="bg-amber-500">Action Needed</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {unreadNotifications > 0 && (
            <Link href="/dashboard/notifications">
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Unread Notifications</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{unreadNotifications}</p>
                    </div>
                    <Badge className="bg-blue-500">Review</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      )}

      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>Add a new document to track its expiration date</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadForm onSuccess={handleDocumentAdded} />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading your documents...</p>
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc: any) => (
            <DocumentCard key={doc.id} document={doc} onUpdate={() => mutate()} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground mb-4">No documents yet. Start by adding one!</p>
            <Button onClick={() => setShowUploadForm(true)}>Add First Document</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
