import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { moduleStepSchema } from "@/lib/validations"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id, stepId } = await params

  const module = await prisma.devModule.findUnique({ where: { id } })
  if (!module) return Response.json({ error: "Modulo no encontrado" }, { status: 404 })
  if (module.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const existing = await prisma.devModuleStep.findUnique({ where: { id: stepId } })
  if (!existing || existing.moduleId !== id) {
    return Response.json({ error: "Step no encontrado" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = moduleStepSchema.partial().safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const step = await prisma.devModuleStep.update({
    where: { id: stepId },
    data: parsed.data,
  })

  return Response.json(step)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id, stepId } = await params

  const module = await prisma.devModule.findUnique({ where: { id } })
  if (!module) return Response.json({ error: "Modulo no encontrado" }, { status: 404 })
  if (module.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const existing = await prisma.devModuleStep.findUnique({ where: { id: stepId } })
  if (!existing || existing.moduleId !== id) {
    return Response.json({ error: "Step no encontrado" }, { status: 404 })
  }

  await prisma.devModuleStep.delete({ where: { id: stepId } })

  return Response.json({ ok: true })
}
