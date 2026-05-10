import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { installmentSchema } from "@/lib/validations"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; installmentId: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id, installmentId } = await params

  // Verify plan exists and belongs to user
  const plan = await prisma.paymentPlan.findUnique({ where: { id } })
  if (!plan) return Response.json({ error: "Plan no encontrado" }, { status: 404 })
  if (plan.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  // Verify installment exists and belongs to this plan
  const existing = await prisma.installment.findUnique({ where: { id: installmentId } })
  if (!existing) return Response.json({ error: "Cuota no encontrada" }, { status: 404 })
  if (existing.planId !== id) return Response.json({ error: "Cuota no pertenece a este plan" }, { status: 400 })

  const body = await req.json()
  const parsed = installmentSchema.partial().safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const updateData: any = { ...parsed.data }

  // Handle dueDate string -> Date conversion
  if (updateData.dueDate) {
    updateData.dueDate = new Date(updateData.dueDate)
  }

  // Auto-set paidAt based on status changes
  if (updateData.status === "PAID" && !existing.paidAt && !updateData.paidAt) {
    updateData.paidAt = new Date()
  } else if (updateData.status && updateData.status !== "PAID" && existing.status === "PAID") {
    updateData.paidAt = null
  }

  const installment = await prisma.installment.update({
    where: { id: installmentId },
    data: updateData,
  })

  // Auto-update plan status based on all installments
  const allInstallments = await prisma.installment.findMany({
    where: { planId: id },
  })

  const allPaid = allInstallments.every((inst) => inst.status === "PAID")

  if (allPaid && plan.status !== "COMPLETED") {
    await prisma.paymentPlan.update({
      where: { id },
      data: { status: "COMPLETED" },
    })
  } else if (!allPaid && plan.status === "COMPLETED") {
    await prisma.paymentPlan.update({
      where: { id },
      data: { status: "ACTIVE" },
    })
  }

  return Response.json(installment)
}
