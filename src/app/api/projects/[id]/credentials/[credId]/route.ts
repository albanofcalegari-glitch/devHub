import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { credentialSchema } from "@/lib/validations"
import { authorizeProject } from "@/lib/project-auth"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; credId: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id, credId } = await params

  const project = await authorizeProject(id, session.user.id)
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })

  const existing = await prisma.projectCredential.findUnique({ where: { id: credId } })
  if (!existing || existing.projectId !== id) {
    return Response.json({ error: "Credencial no encontrada" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = credentialSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const credential = await prisma.projectCredential.update({
    where: { id: credId },
    data: parsed.data,
  })

  return Response.json(credential)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; credId: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id, credId } = await params

  const project = await authorizeProject(id, session.user.id)
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })

  const existing = await prisma.projectCredential.findUnique({ where: { id: credId } })
  if (!existing || existing.projectId !== id) {
    return Response.json({ error: "Credencial no encontrada" }, { status: 404 })
  }

  await prisma.projectCredential.delete({ where: { id: credId } })

  return Response.json({ ok: true })
}
