import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const q = req.nextUrl.searchParams.get("q")
  if (!q || q.trim().length === 0) {
    return Response.json({ projects: [], modules: [], ideas: [] })
  }

  const [projects, modules, ideas] = await Promise.all([
    prisma.project.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
    }),
    prisma.devModule.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
    }),
    prisma.projectIdea.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return Response.json({ projects, modules, ideas })
}
