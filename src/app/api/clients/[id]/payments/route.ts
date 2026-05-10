import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clientPaymentSchema } from "@/lib/validations"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const client = await prisma.client.findUnique({ where: { id } })
  if (!client) return Response.json({ error: "Cliente no encontrado" }, { status: 404 })
  if (client.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const payments = await prisma.clientPayment.findMany({
    where: { clientId: id },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(payments)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const client = await prisma.client.findUnique({ where: { id } })
  if (!client) return Response.json({ error: "Cliente no encontrado" }, { status: 404 })
  if (client.userId !== session.user.id) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = clientPaymentSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const payment = await prisma.clientPayment.create({
    data: {
      ...parsed.data,
      paidAt: parsed.data.paidAt ? new Date(parsed.data.paidAt) : null,
      clientId: id,
    },
  })

  return Response.json(payment, { status: 201 })
}
