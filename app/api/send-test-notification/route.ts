import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
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
    const { documentId, documentTitle, expirationDate, renewalUrl } = body

    const expirationDateObj = new Date(expirationDate)
    const daysUntilExpiry = Math.floor((expirationDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">Document Expiration Alert</h2>
        <p>Your document <strong>${documentTitle}</strong> will expire in ${daysUntilExpiry} days.</p>
        
        <div style="background-color: #FEF2F2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Expiration Date:</strong> ${expirationDateObj.toLocaleDateString()}</p>
          <p><strong>Days Remaining:</strong> ${daysUntilExpiry}</p>
        </div>
        
        ${
          renewalUrl
            ? `
          <p>
            <a href="${renewalUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Renewal Process
            </a>
          </p>
        `
            : ""
        }
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated notification from DocExpiry. Please act soon to avoid disruptions.
        </p>
      </div>
    `

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: user.email,
      subject: `Test Notification: ${documentTitle}`,
      html,
    })

    // Create in-app notification
    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: user.id,
      document_id: documentId,
      notification_type: "email",
      message: `Test notification sent for "${documentTitle}"`,
    })

    if (notifError) throw notifError

    return NextResponse.json({
      message: "Test notification sent successfully",
      email: user.email,
    })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json({ message: "Failed to send test notification", error: String(error) }, { status: 500 })
  }
}
