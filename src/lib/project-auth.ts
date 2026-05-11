import { prisma } from "./prisma"

export async function authorizeProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { userId },
        { collaborators: { some: { id: userId } } },
      ],
    },
  })
  return project
}
