import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { taskSchema } from "@/lib/validations"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })
  if (project.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const status = req.nextUrl.searchParams.get("status")

  const tasks = await prisma.projectTask.findMany({
    where: {
      projectId: id,
      parentId: null,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      subtasks: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  })

  return Response.json(tasks)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })
  if (project.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = taskSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const parentId = body.parentId || null
  const task = await prisma.projectTask.create({
    data: {
      ...parsed.data,
      parentId,
      projectId: id,
    },
  })

  return Response.json(task, { status: 201 })
}
