import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { noteSchema } from "@/lib/validations"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id, noteId } = await params

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })
  if (project.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const existing = await prisma.projectNote.findUnique({ where: { id: noteId } })
  if (!existing || existing.projectId !== id) {
    return Response.json({ error: "Nota no encontrada" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = noteSchema.partial().safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const note = await prisma.projectNote.update({
    where: { id: noteId },
    data: parsed.data,
  })

  return Response.json(note)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id, noteId } = await params

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })
  if (project.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const existing = await prisma.projectNote.findUnique({ where: { id: noteId } })
  if (!existing || existing.projectId !== id) {
    return Response.json({ error: "Nota no encontrada" }, { status: 404 })
  }

  await prisma.projectNote.delete({ where: { id: noteId } })

  return Response.json({ ok: true })
}
