import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { taskSchema } from "@/lib/validations"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id, taskId } = await params

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })
  if (project.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const existing = await prisma.projectTask.findUnique({ where: { id: taskId } })
  if (!existing || existing.projectId !== id) {
    return Response.json({ error: "Tarea no encontrada" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = taskSchema.partial().safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const data: any = { ...parsed.data }

  // Handle completedAt based on status transitions
  if (parsed.data.status === "DONE" && existing.status !== "DONE") {
    data.completedAt = new Date()
  } else if (parsed.data.status && parsed.data.status !== "DONE" && existing.status === "DONE") {
    data.completedAt = null
  }

  const task = await prisma.projectTask.update({
    where: { id: taskId },
    data,
    include: { subtasks: { orderBy: { sortOrder: "asc" } } },
  })

  return Response.json(task)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id, taskId } = await params

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })
  if (project.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const existing = await prisma.projectTask.findUnique({ where: { id: taskId } })
  if (!existing || existing.projectId !== id) {
    return Response.json({ error: "Tarea no encontrada" }, { status: 404 })
  }

  await prisma.projectTask.delete({ where: { id: taskId } })

  return Response.json({ ok: true })
}
