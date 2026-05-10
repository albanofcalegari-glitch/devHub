import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { compare, hash } from "bcryptjs"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "No autorizado" }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return Response.json({ error: "La nueva contrasena debe tener al menos 6 caracteres" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) {
    return Response.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const isValid = await compare(currentPassword, user.password)
  if (!isValid) {
    return Response.json({ error: "Contrasena actual incorrecta" }, { status: 400 })
  }

  const hashedPassword = await hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  return Response.json({ ok: true })
}
