import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: body.is_read })
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ message: "Notification updated" })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ message: "Failed to update notification" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("notifications").delete().eq("id", params.id).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ message: "Notification deleted" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ message: "Failed to delete notification" }, { status: 500 })
  }
}
