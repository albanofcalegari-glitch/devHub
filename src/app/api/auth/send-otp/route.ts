import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendOtpEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "No autorizado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) {
    return Response.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  await prisma.otp.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  })

  const code = crypto.randomInt(0, 1000000).toString().padStart(6, "0")
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.otp.create({
    data: { code, expiresAt, userId: user.id },
  })

  const sent = await sendOtpEmail(user.email, code)
  if (!sent) {
    return Response.json({ error: "Error al enviar email" }, { status: 500 })
  }

  return Response.json({ status: "otp_sent", email: user.email })
}
