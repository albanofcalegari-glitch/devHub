import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "No autorizado" }, { status: 401 })
  }

  const { code } = await req.json()
  if (!code) {
    return Response.json({ error: "Código requerido" }, { status: 400 })
  }

  const otp = await prisma.otp.findFirst({
    where: {
      userId: session.user.id,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })

  if (!otp) {
    return Response.json({ error: "Código inválido o expirado" }, { status: 400 })
  }

  await prisma.otp.update({
    where: { id: otp.id },
    data: { used: true },
  })

  return Response.json({ verified: true })
}
