import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const { projectId } = await req.json()

  if (!projectId) {
    return Response.json({ error: "projectId requerido" }, { status: 400 })
  }

  const client = await prisma.client.findUnique({ where: { id } })
  if (!client) return Response.json({ error: "Cliente no encontrado" }, { status: 404 })
  if (client.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })
  if (project.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const clientProject = await prisma.clientProject.upsert({
    where: {
      clientId_projectId: { clientId: id, projectId },
    },
    update: {},
    create: { clientId: id, projectId },
  })

  return Response.json(clientProject, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const { projectId } = await req.json()

  if (!projectId) {
    return Response.json({ error: "projectId requerido" }, { status: 400 })
  }

  const client = await prisma.client.findUnique({ where: { id } })
  if (!client) return Response.json({ error: "Cliente no encontrado" }, { status: 404 })
  if (client.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  await prisma.clientProject.delete({
    where: {
      clientId_projectId: { clientId: id, projectId },
    },
  })

  return Response.json({ ok: true })
}
