import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { projectSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const status = req.nextUrl.searchParams.get("status")

  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      _count: {
        select: {
          tasks: true,
          notes: true,
          credentials: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })

  return Response.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = projectSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  })

  return Response.json(project, { status: 201 })
}
