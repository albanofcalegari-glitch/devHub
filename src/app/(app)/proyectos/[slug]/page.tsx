"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { OverviewTab } from "@/components/projects/overview-tab"
import { ArchitectureTab } from "@/components/projects/architecture-tab"
import { CredentialsTab } from "@/components/projects/credentials-tab"
import { TasksTab } from "@/components/projects/tasks-tab"
import { NotesTab } from "@/components/projects/notes-tab"
import { StatusBadge } from "@/components/projects/status-badge"
import { ArrowLeft, Loader2 } from "lucide-react"

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  function loadProject() {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((projects: Array<{ slug: string; id: string }>) => {
        const found = projects.find((p) => p.slug === params.slug)
        if (found) {
          return fetch(`/api/projects/${found.id}`).then((r) => r.json())
        }
        return null
      })
      .then((data) => {
        if (data) setProject(data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProject()
  }, [params.slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Proyecto no encontrado</p>
        <Button variant="ghost" onClick={() => router.push("/proyectos")} className="mt-4">
          Volver a proyectos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/proyectos")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
              {project.name}
            </h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {project.description}
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="arquitectura">Arquitectura</TabsTrigger>
          <TabsTrigger value="credenciales">Credenciales</TabsTrigger>
          <TabsTrigger value="plan">Plan de Desarrollo</TabsTrigger>
          <TabsTrigger value="notas">Ideas / Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <OverviewTab project={project} onUpdate={loadProject} />
        </TabsContent>
        <TabsContent value="arquitectura">
          <ArchitectureTab projectId={project.id} architecture={project.architecture} onUpdate={loadProject} />
        </TabsContent>
        <TabsContent value="credenciales">
          <CredentialsTab projectId={project.id} credentials={project.credentials || []} onUpdate={loadProject} />
        </TabsContent>
        <TabsContent value="plan">
          <TasksTab projectId={project.id} tasks={project.tasks || []} onUpdate={loadProject} />
        </TabsContent>
        <TabsContent value="notas">
          <NotesTab projectId={project.id} notes={project.notes || []} onUpdate={loadProject} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
