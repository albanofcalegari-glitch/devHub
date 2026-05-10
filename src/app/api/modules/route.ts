import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { moduleSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const category = req.nextUrl.searchParams.get("category")

  const modules = await prisma.devModule.findMany({
    where: {
      userId: session.user.id,
      ...(category ? { category: category as any } : {}),
    },
    include: {
      _count: {
        select: { steps: true },
      },
    },
    orderBy: { name: "asc" },
  })

  return Response.json(modules)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = moduleSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const module = await prisma.devModule.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  })

  return Response.json(module, { status: 201 })
}
