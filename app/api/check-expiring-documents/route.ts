import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendEmailNotification(
  userEmail: string,
  documentTitle: string,
  expirationDate: string,
  renewalUrl?: string,
  daysUntilExpiry?: number,
) {
  const subject = `Document Expiring Soon: ${documentTitle}`
  const daysText = daysUntilExpiry === 0 ? "TODAY" : `in ${daysUntilExpiry} days`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #DC2626;">Document Expiration Alert</h2>
      <p>Your document <strong>${documentTitle}</strong> will expire ${daysText}.</p>
      
      <div style="background-color: #FEF2F2; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Expiration Date:</strong> ${new Date(expirationDate).toLocaleDateString()}</p>
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

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: userEmail,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error("Error sending email with Resend:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar que la solicitud viene de un cron job autorizado
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Obtener todos los documentos
    const { data: documents, error: docError } = await supabase.from("documents").select("*, profiles(email)")

    if (docError) throw docError

    let notificationCount = 0
    const now = new Date()

    for (const doc of documents || []) {
      const expirationDate = new Date(doc.expiration_date)
      const daysUntilExpiry = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Verificar si el documento está próximo a vencer
      if (daysUntilExpiry <= doc.days_before_expiry && daysUntilExpiry >= 0 && !doc.notification_sent) {
        const userEmail = doc.profiles?.email

        // Enviar email
        const emailSent = await sendEmailNotification(
          userEmail,
          doc.title,
          doc.expiration_date,
          doc.renewal_url,
          daysUntilExpiry,
        )

        if (emailSent) {
          // Crear notificación en la base de datos
          const { error: notifError } = await supabase.from("notifications").insert({
            user_id: doc.user_id,
            document_id: doc.id,
            notification_type: "email",
            message: `Your document "${doc.title}" will expire in ${daysUntilExpiry} days.`,
          })

          if (!notifError) {
            // Marcar como notificado
            await supabase.from("documents").update({ notification_sent: true }).eq("id", doc.id)

            notificationCount++
          }
        }
      }

      // Resetear notificación si el documento ya expiró y fue renovado
      if (daysUntilExpiry > doc.days_before_expiry && doc.notification_sent) {
        await supabase.from("documents").update({ notification_sent: false }).eq("id", doc.id)
      }
    }

    return NextResponse.json({
      message: "Notification check completed",
      notificationsCreated: notificationCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in notification check:", error)
    return NextResponse.json({ message: "Failed to check expiring documents", error: String(error) }, { status: 500 })
  }
}
