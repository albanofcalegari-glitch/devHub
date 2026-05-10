"use client"

import { useEffect, useState } from "react"
import { ProjectCard } from "@/components/dashboard/project-card"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { Loader2 } from "lucide-react"

interface Project {
  id: string
  name: string
  slug: string
  description: string
  status: "ACTIVE" | "PAUSED" | "PLANNING" | "DONE"
  progress: number
  color: string
  icon: string
  stack: string[]
  _count: { tasks: number; notes: number; credentials: number }
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [modules, setModules] = useState<{ length: number }>({ length: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/modules").then((r) => r.json()),
    ])
      .then(([projectsData, modulesData]) => {
        setProjects(Array.isArray(projectsData) ? projectsData : [])
        setModules({ length: Array.isArray(modulesData) ? modulesData.length : 0 })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const active = projects.filter((p) => p.status === "ACTIVE").length
  const paused = projects.filter((p) => p.status === "PAUSED").length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Centro de comando de desarrollo
        </p>
      </div>

      <StatsOverview
        total={projects.length}
        active={active}
        paused={paused}
        modules={modules.length}
      />

      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-4">
          Proyectos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  )
}
