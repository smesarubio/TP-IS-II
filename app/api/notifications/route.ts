import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        document_id,
        user_id,
        notification_type,
        message,
        is_read,
        sent_at,
        created_at,
        documents(
          id,
          title,
          renewal_url,
          expiration_date,
          document_type
        )
      `)
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ message: "Failed to fetch notifications" }, { status: 500 })
  }
}
