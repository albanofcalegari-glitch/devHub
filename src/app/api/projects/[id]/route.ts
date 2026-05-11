import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { projectUpdateSchema } from "@/lib/validations"
import { authorizeProject } from "@/lib/project-auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const authorized = await authorizeProject(id, session.user.id)
  if (!authorized) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      credentials: true,
      tasks: {
        orderBy: { sortOrder: "asc" },
        include: {
          createdBy: { select: { name: true } },
          updatedBy: { select: { name: true } },
        },
      },
      notes: {
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
        include: {
          createdBy: { select: { name: true } },
          updatedBy: { select: { name: true } },
        },
      },
    },
  })

  return Response.json(project)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const project = await authorizeProject(id, session.user.id)
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })

  const body = await req.json()
  const parsed = projectUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const updated = await prisma.project.update({
    where: { id },
    data: parsed.data,
  })

  return Response.json(updated)
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
  if (existing.userId !== session.user.id) return Response.json({ error: "Solo el dueño puede eliminar el proyecto" }, { status: 403 })

  await prisma.project.delete({ where: { id } })

  return Response.json({ ok: true })
}
