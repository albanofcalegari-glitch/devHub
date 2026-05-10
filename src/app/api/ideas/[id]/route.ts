import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ideaSchema } from "@/lib/validations"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const idea = await prisma.projectIdea.findUnique({
    where: { id, userId: session.user.id },
  })

  if (!idea) return Response.json({ error: "Idea no encontrada" }, { status: 404 })

  return Response.json(idea)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.projectIdea.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: "Idea no encontrada" }, { status: 404 })
  if (existing.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = ideaSchema.partial().safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const idea = await prisma.projectIdea.update({
    where: { id },
    data: parsed.data,
  })

  return Response.json(idea)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.projectIdea.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: "Idea no encontrada" }, { status: 404 })
  if (existing.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  await prisma.projectIdea.delete({ where: { id } })

  return Response.json({ ok: true })
}
