import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-svh bg-background">
      <nav className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-primary">
              DocExpiry
            </Link>
            <div className="flex gap-4 items-center">
              <Link href="/dashboard/notifications">
                <Button variant="ghost" size="sm">
                  Notifications
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="ghost" size="sm">
                  Settings
                </Button>
              </Link>
              <form
                action={async () => {
                  "use server"
                  const supabase = await createClient()
                  await supabase.auth.signOut()
                  redirect("/")
                }}
              >
                <Button variant="outline" size="sm" type="submit">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
