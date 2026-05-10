"use client"

import { useEffect, useState } from "react"
import { ProjectCard } from "@/components/dashboard/project-card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { ProjectFormDialog } from "@/components/projects/project-form"

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

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [showForm, setShowForm] = useState(false)

  function loadProjects() {
    setLoading(true)
    const url = statusFilter === "ALL" ? "/api/projects" : `/api/projects?status=${statusFilter}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProjects()
  }, [statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
            Proyectos
          </h1>
          <p className="text-muted-foreground mt-1">{projects.length} proyectos</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="ACTIVE">Activos</SelectItem>
              <SelectItem value="PAUSED">Pausados</SelectItem>
              <SelectItem value="PLANNING">Planificando</SelectItem>
              <SelectItem value="DONE">Terminados</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSaved={loadProjects}
      />
    </div>
  )
}
