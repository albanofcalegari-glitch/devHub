import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { noteSchema } from "@/lib/validations"
import { authorizeProject } from "@/lib/project-auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const project = await authorizeProject(id, session.user.id)
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })

  const notes = await prisma.projectNote.findMany({
    where: { projectId: id },
    include: {
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  })

  return Response.json(notes)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const project = await authorizeProject(id, session.user.id)
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })

  const body = await req.json()
  const parsed = noteSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const note = await prisma.projectNote.create({
    data: {
      ...parsed.data,
      projectId: id,
      createdById: session.user.id,
    },
    include: {
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
    },
  })

  return Response.json(note, { status: 201 })
}
