import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { paymentPlanSchema } from "@/lib/validations"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const plan = await prisma.paymentPlan.findUnique({
    where: { id },
    include: {
      client: true,
      project: {
        select: { id: true, name: true, slug: true, color: true, icon: true },
      },
      installments: { orderBy: { number: "asc" } },
    },
  })

  if (!plan) return Response.json({ error: "Plan no encontrado" }, { status: 404 })
  if (plan.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  return Response.json(plan)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.paymentPlan.findUnique({
    where: { id },
    include: { installments: true },
  })
  if (!existing) return Response.json({ error: "Plan no encontrado" }, { status: 404 })
  if (existing.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = paymentPlanSchema.partial().safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const updateData = { ...parsed.data }

  // Auto-update plan status: if all installments are PAID, set COMPLETED
  if (existing.installments.length > 0) {
    const allPaid = existing.installments.every((inst) => inst.status === "PAID")
    if (allPaid && !updateData.status) {
      updateData.status = "COMPLETED"
    }
  }

  const plan = await prisma.paymentPlan.update({
    where: { id },
    data: updateData,
    include: {
      client: true,
      project: {
        select: { id: true, name: true, slug: true, color: true, icon: true },
      },
      installments: { orderBy: { number: "asc" } },
    },
  })

  return Response.json(plan)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.paymentPlan.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: "Plan no encontrado" }, { status: 404 })
  if (existing.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  await prisma.paymentPlan.delete({ where: { id } })

  return Response.json({ ok: true })
}
