import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clientSchema } from "@/lib/validations"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        include: {
          project: {
            select: { id: true, name: true, slug: true, color: true, icon: true },
          },
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!client) return Response.json({ error: "Cliente no encontrado" }, { status: 404 })
  if (client.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  return Response.json(client)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.client.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: "Cliente no encontrado" }, { status: 404 })
  if (existing.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = clientSchema.partial().safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const client = await prisma.client.update({
    where: { id },
    data: parsed.data,
  })

  return Response.json(client)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.client.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: "Cliente no encontrado" }, { status: 404 })
  if (existing.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  await prisma.client.delete({ where: { id } })

  return Response.json({ ok: true })
}
