import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { credentialSchema } from "@/lib/validations"
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

  const credentials = await prisma.projectCredential.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(credentials)
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
  const parsed = credentialSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const credential = await prisma.projectCredential.create({
    data: {
      ...parsed.data,
      projectId: id,
    },
  })

  return Response.json(credential, { status: 201 })
}
