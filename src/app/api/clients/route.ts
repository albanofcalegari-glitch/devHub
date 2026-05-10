import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clientSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const status = req.nextUrl.searchParams.get("status")

  const clients = await prisma.client.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      projects: {
        include: {
          project: {
            select: { id: true, name: true, slug: true, color: true },
          },
        },
      },
      _count: { select: { payments: true } },
    },
    orderBy: { name: "asc" },
  })

  return Response.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = clientSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const client = await prisma.client.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  })

  return Response.json(client, { status: 201 })
}
