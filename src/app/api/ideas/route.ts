import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ideaSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const status = req.nextUrl.searchParams.get("status")

  const ideas = await prisma.projectIdea.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as any } : {}),
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  })

  return Response.json(ideas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = ideaSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const idea = await prisma.projectIdea.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  })

  return Response.json(idea, { status: 201 })
}
