"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSendTestEmail = async () => {
    setIsLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch("/api/send-test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: "test-id",
          documentTitle: "Test Document",
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          renewalUrl: "https://example.com/renew",
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessage(`Test email sent to ${data.email}`)
      } else {
        const errorData = await res.json()
        setError(errorData.message || "Failed to send test email")
      }
    } catch (err) {
      setError("An error occurred while sending test email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>Configure and test your notification settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm mb-2">Email Configuration</h4>
          <p className="text-sm text-muted-foreground mb-4">
            You'll receive email notifications when your documents are approaching their expiration date.
          </p>

          <Button onClick={handleSendTestEmail} disabled={isLoading} variant="outline">
            {isLoading ? "Sending..." : "Send Test Email"}
          </Button>

          {message && <p className="text-sm text-green-600 mt-4">{message}</p>}
          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
