import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { paymentPlanSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const status = req.nextUrl.searchParams.get("status")

  const plans = await prisma.paymentPlan.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      client: {
        select: { id: true, name: true, company: true },
      },
      project: {
        select: { id: true, name: true, slug: true, color: true },
      },
      _count: { select: { installments: true } },
      installments: {
        select: { status: true, amount: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(plans)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { installments: installmentsData, ...planData } = body

  const parsed = paymentPlanSchema.safeParse(planData)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const plan = await prisma.paymentPlan.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  })

  if (Array.isArray(installmentsData) && installmentsData.length > 0) {
    await prisma.installment.createMany({
      data: installmentsData.map((inst: any) => ({
        number: inst.number,
        label: inst.label,
        amount: inst.amount,
        dueDate: new Date(inst.dueDate),
        status: inst.status || "PENDING",
        planId: plan.id,
      })),
    })
  }

  const fullPlan = await prisma.paymentPlan.findUnique({
    where: { id: plan.id },
    include: {
      client: {
        select: { id: true, name: true, company: true },
      },
      project: {
        select: { id: true, name: true, slug: true, color: true },
      },
      installments: { orderBy: { number: "asc" } },
    },
  })

  return Response.json(fullPlan, { status: 201 })
}
