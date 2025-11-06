"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DocumentUploadFormProps {
  onSuccess: () => void
}

const DOCUMENT_TYPES = [
  { value: "driver_license", label: "Driver's License" },
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID" },
  { value: "vehicle_registration", label: "Vehicle Registration" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
]

export default function DocumentUploadForm({ onSuccess }: DocumentUploadFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    document_type: "",
    expiration_date: "",
    renewal_url: "",
    days_before_expiry: "30",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to add document")
      }

      setFormData({
        title: "",
        document_type: "",
        expiration_date: "",
        renewal_url: "",
        days_before_expiry: "30",
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="title">Document Title</Label>
          <Input
            id="title"
            placeholder="e.g., My Driver's License"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="document_type">Document Type</Label>
          <Select
            value={formData.document_type}
            onValueChange={(value) => setFormData({ ...formData, document_type: value })}
          >
            <SelectTrigger id="document_type">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="expiration_date">Expiration Date</Label>
          <Input
            id="expiration_date"
            type="date"
            value={formData.expiration_date}
            onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="renewal_url">Renewal Website URL</Label>
          <Input
            id="renewal_url"
            type="url"
            placeholder="https://example.com/renew"
            value={formData.renewal_url}
            onChange={(e) => setFormData({ ...formData, renewal_url: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="days_before_expiry">Notify me (days before expiry)</Label>
          <Input
            id="days_before_expiry"
            type="number"
            min="1"
            max="365"
            value={formData.days_before_expiry}
            onChange={(e) => setFormData({ ...formData, days_before_expiry: e.target.value })}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Adding Document..." : "Add Document"}
      </Button>
    </form>
  )
}
