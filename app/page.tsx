"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
      }
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh w-full bg-gradient-to-b from-background to-muted">
      <nav className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">DocExpiry</h1>
            <div className="flex gap-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
                  <Link href="/dashboard">
                    <Button>Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button>Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Never Miss a Document Renewal
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Upload your documents, track their expiration dates, and get notified before they expire.
          </p>

          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground">Upload Documents</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload your driver's license, passport, or any document with an expiration date.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground">Track Expiration</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get real-time alerts when documents are approaching their expiration date.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground">Quick Renewal</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Direct links to renewal portals in notifications for quick access.
              </p>
            </div>
          </div>

          {!user && (
            <div className="mt-12 flex justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
