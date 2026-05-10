import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { projectUpdateSchema } from "@/lib/validations"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id, userId: session.user.id },
    include: {
      credentials: true,
      tasks: { orderBy: { sortOrder: "asc" } },
      notes: {
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      },
    },
  })

  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })

  return Response.json(project)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })
  if (existing.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = projectUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const project = await prisma.project.update({
    where: { id },
    data: parsed.data,
  })

  return Response.json(project)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })
  if (existing.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  await prisma.project.delete({ where: { id } })

  return Response.json({ ok: true })
}
