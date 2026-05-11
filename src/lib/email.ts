const RESEND_API_KEY = process.env.RESEND_API_KEY || ""
const FROM_EMAIL = process.env.FROM_EMAIL || "DevHub <noreply@turnit.com.ar>"

export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[OTP MOCK] ${to}: ${code}`)
    return true
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: "DevHub — Código de verificación",
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 32px; background: #07070f; border-radius: 12px; color: #e5e5e5;">
            <h2 style="color: #c084fc; margin: 0 0 8px;">DevHub</h2>
            <p style="color: #999; font-size: 12px; margin: 0 0 24px;">Qngine</p>
            <p style="margin: 0 0 16px;">Tu código de verificación es:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; background: #1a1a2e; border-radius: 8px; color: #7c5cfc;">
              ${code}
            </div>
            <p style="margin: 16px 0 0; font-size: 13px; color: #666;">
              Este código expira en 10 minutos.
            </p>
          </div>
        `,
      }),
    })
    return res.status === 200
  } catch {
    console.error("Error sending OTP email")
    return false
  }
}
