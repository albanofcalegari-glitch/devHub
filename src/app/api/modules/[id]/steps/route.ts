import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { moduleStepSchema } from "@/lib/validations"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const module = await prisma.devModule.findUnique({ where: { id } })
  if (!module) return Response.json({ error: "Modulo no encontrado" }, { status: 404 })
  if (module.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const steps = await prisma.devModuleStep.findMany({
    where: { moduleId: id },
    orderBy: { sortOrder: "asc" },
  })

  return Response.json(steps)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const module = await prisma.devModule.findUnique({ where: { id } })
  if (!module) return Response.json({ error: "Modulo no encontrado" }, { status: 404 })
  if (module.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = moduleStepSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const step = await prisma.devModuleStep.create({
    data: {
      ...parsed.data,
      moduleId: id,
    },
  })

  return Response.json(step, { status: 201 })
}
