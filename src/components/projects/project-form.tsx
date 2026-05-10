"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { slugify } from "@/lib/utils"

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  project?: {
    id: string
    name: string
    slug: string
    description: string
    status: string
    progress: number
    color: string
    icon: string
    stack: string[]
    repoUrl?: string | null
    prodUrl?: string | null
    devUrl?: string | null
  }
}

export function ProjectFormDialog({ open, onOpenChange, onSaved, project }: ProjectFormDialogProps) {
  const isEdit = !!project
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(project?.name ?? "")
  const [slug, setSlug] = useState(project?.slug ?? "")
  const [description, setDescription] = useState(project?.description ?? "")
  const [status, setStatus] = useState(project?.status ?? "PLANNING")
  const [progress, setProgress] = useState(project?.progress ?? 0)
  const [color, setColor] = useState(project?.color ?? "#7c5cfc")
  const [icon, setIcon] = useState(project?.icon ?? "folder")
  const [stackStr, setStackStr] = useState(project?.stack?.join(", ") ?? "")
  const [repoUrl, setRepoUrl] = useState(project?.repoUrl ?? "")
  const [prodUrl, setProdUrl] = useState(project?.prodUrl ?? "")
  const [devUrl, setDevUrl] = useState(project?.devUrl ?? "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const body = {
      name,
      slug: slug || slugify(name),
      description,
      status,
      progress,
      color,
      icon,
      stack: stackStr.split(",").map((s) => s.trim()).filter(Boolean),
      repoUrl: repoUrl || null,
      prodUrl: prodUrl || null,
      devUrl: devUrl || null,
    }

    const url = isEdit ? `/api/projects/${project.id}` : "/api/projects"
    const method = isEdit ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      toast.success(isEdit ? "Proyecto actualizado" : "Proyecto creado")
      onSaved()
      onOpenChange(false)
    } else {
      const data = await res.json()
      toast.error(data.error || "Error al guardar")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-heading)]">
            {isEdit ? "Editar proyecto" : "Nuevo proyecto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => { setName(e.target.value); if (!isEdit) setSlug(slugify(e.target.value)) }} required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descripcion</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="IN_DEVELOPMENT">En desarrollo</SelectItem>
                  <SelectItem value="PAUSED">Pausado</SelectItem>
                  <SelectItem value="PLANNING">Planificando</SelectItem>
                  <SelectItem value="DONE">Terminado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Progreso (%)</Label>
              <Input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 p-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Stack (separado por comas)</Label>
            <Input value={stackStr} onChange={(e) => setStackStr(e.target.value)} placeholder="Next.js, Prisma, PostgreSQL" />
          </div>
          <div className="space-y-2">
            <Label>Icono (lucide)</Label>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="folder, wallet, trending-up" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Repo URL</Label>
              <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Prod URL</Label>
              <Input value={prodUrl} onChange={(e) => setProdUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Dev URL</Label>
              <Input value={devUrl} onChange={(e) => setDevUrl(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Guardar cambios" : "Crear proyecto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
