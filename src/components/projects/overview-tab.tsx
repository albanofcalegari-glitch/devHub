"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { ProjectFormDialog } from "./project-form"
import { ExternalLink, GitBranch, Pencil, Globe, Monitor, Save, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface OverviewTabProps {
  project: any
  onUpdate: () => void
}

export function OverviewTab({ project, onUpdate }: OverviewTabProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [editingBrief, setEditingBrief] = useState(false)
  const [briefContent, setBriefContent] = useState(project.brief || "")
  const [savingBrief, setSavingBrief] = useState(false)
  const stack: string[] = project.stack || []

  const urls = [
    { label: "Produccion", url: project.prodUrl, icon: Globe },
    { label: "Desarrollo", url: project.devUrl, icon: Monitor },
    { label: "Repositorio", url: project.repoUrl, icon: GitBranch },
  ].filter((u) => u.url)

  const handleSaveBrief = useCallback(async () => {
    setSavingBrief(true)
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief: briefContent }),
    })
    if (res.ok) {
      toast.success("Brief guardado")
      setEditingBrief(false)
      onUpdate()
    } else {
      toast.error("Error al guardar")
    }
    setSavingBrief(false)
  }, [briefContent, project.id, onUpdate])

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Editar
        </Button>
      </div>

      {/* Brief del proyecto */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Brief del proyecto
          </CardTitle>
          <div className="flex gap-2">
            {editingBrief ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setEditingBrief(false)}>
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Vista previa
                </Button>
                <Button size="sm" onClick={handleSaveBrief} disabled={savingBrief} className="bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white">
                  {savingBrief ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                  Guardar
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => { setBriefContent(project.brief || ""); setEditingBrief(true) }}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingBrief ? (
            <Textarea
              value={briefContent}
              onChange={(e) => setBriefContent(e.target.value)}
              placeholder="Descripcion general del proyecto, componentes principales, base de datos, integraciones..."
              className="min-h-[300px] font-mono text-sm"
            />
          ) : project.brief ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {project.brief}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Sin brief aun. Hace click en &quot;Editar&quot; para agregar documentacion del proyecto.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Stack</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stack.map((tech) => (
              <Badge key={tech} variant="secondary">{tech}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Progreso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Avance general</span>
              <span className="font-semibold">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {urls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">URLs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {urls.map((u) => {
              const Icon = u.icon
              return (
                <a
                  key={u.label}
                  href={u.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Icon className="h-4 w-4" />
                  {u.label}: <span className="text-foreground/70">{u.url}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )
            })}
          </CardContent>
        </Card>
      )}

      <ProjectFormDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        onSaved={onUpdate}
        project={project}
      />
    </div>
  )
}
