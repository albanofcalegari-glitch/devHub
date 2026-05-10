"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IdeaStatusBadge } from "@/components/projects/status-badge"
import { Plus, Trash2, Pencil, Lightbulb, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatRelativeDate } from "@/lib/utils"

const priorityLabels = ["Baja", "Media", "Alta"]
const priorityColors = ["bg-gray-500/10 text-gray-500", "bg-yellow-500/10 text-yellow-500", "bg-red-500/10 text-red-500"]

interface Idea {
  id: string
  title: string
  description: string
  status: "IDEA" | "EVALUATING" | "APPROVED" | "DISCARDED"
  suggestedStack: string[]
  priority: number
  notes?: string | null
  createdAt: string
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [showForm, setShowForm] = useState(false)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)

  function loadIdeas() {
    setLoading(true)
    const url = statusFilter === "ALL" ? "/api/ideas" : `/api/ideas?status=${statusFilter}`
    fetch(url).then((r) => r.json()).then((data) => setIdeas(Array.isArray(data) ? data : [])).finally(() => setLoading(false))
  }

  useEffect(() => { loadIdeas() }, [statusFilter])

  async function deleteIdea(id: string) {
    if (!confirm("Eliminar esta idea?")) return
    const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Idea eliminada"); loadIdeas() }
  }

  async function updateStatus(idea: Idea, newStatus: string) {
    await fetch(`/api/ideas/${idea.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    loadIdeas()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
            Ideas de Proyectos
          </h1>
          <p className="text-muted-foreground mt-1">Backlog de conceptos y futuros proyectos</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="IDEA">Ideas</SelectItem>
              <SelectItem value="EVALUATING">Evaluando</SelectItem>
              <SelectItem value="APPROVED">Aprobadas</SelectItem>
              <SelectItem value="DISCARDED">Descartadas</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditingIdea(null); setShowForm(true) }} className="bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nueva idea
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : ideas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            Sin ideas aun. Anota tu proximo proyecto!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ideas.map((idea) => (
            <Card key={idea.id} className="group">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary shrink-0" />
                    <h3 className="font-semibold text-sm">{idea.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <IdeaStatusBadge status={idea.status} />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingIdea(idea); setShowForm(true) }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteIdea(idea.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{idea.description}</p>
                {idea.suggestedStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {idea.suggestedStack.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">{s}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className={priorityColors[idea.priority]}>
                    Prioridad: {priorityLabels[idea.priority]}
                  </span>
                  <span>{formatRelativeDate(idea.createdAt)}</span>
                </div>
                <div className="flex gap-1">
                  {(["IDEA", "EVALUATING", "APPROVED", "DISCARDED"] as const).filter((s) => s !== idea.status).map((s) => (
                    <Button key={s} variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => updateStatus(idea, s)}>
                      {s === "IDEA" ? "Idea" : s === "EVALUATING" ? "Evaluar" : s === "APPROVED" ? "Aprobar" : "Descartar"}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <IdeaFormDialog open={showForm} onOpenChange={setShowForm} onSaved={loadIdeas} idea={editingIdea} />
    </div>
  )
}

function IdeaFormDialog({ open, onOpenChange, onSaved, idea }: {
  open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void; idea: Idea | null
}) {
  const isEdit = !!idea
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(idea?.title ?? "")
  const [description, setDescription] = useState(idea?.description ?? "")
  const [status, setStatus] = useState(idea?.status ?? "IDEA")
  const [priority, setPriority] = useState(idea?.priority ?? 1)
  const [stackStr, setStackStr] = useState(idea?.suggestedStack?.join(", ") ?? "")
  const [notes, setNotes] = useState(idea?.notes ?? "")

  useState(() => {
    if (idea) {
      setTitle(idea.title); setDescription(idea.description)
      setStatus(idea.status); setPriority(idea.priority)
      setStackStr(idea.suggestedStack?.join(", ") ?? ""); setNotes(idea.notes ?? "")
    } else {
      setTitle(""); setDescription(""); setStatus("IDEA"); setPriority(1); setStackStr(""); setNotes("")
    }
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const url = isEdit ? `/api/ideas/${idea.id}` : "/api/ideas"
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, description, status, priority,
        suggestedStack: stackStr.split(",").map((s) => s.trim()).filter(Boolean),
        notes: notes || null,
      }),
    })
    if (res.ok) {
      toast.success(isEdit ? "Idea actualizada" : "Idea creada")
      onSaved()
      onOpenChange(false)
    } else {
      toast.error("Error al guardar")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-heading)]">
            {isEdit ? "Editar idea" : "Nueva idea"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Titulo</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sistema para consultorios medicos" required />
          </div>
          <div className="space-y-2">
            <Label>Descripcion</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe la idea del proyecto..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDEA">Idea</SelectItem>
                  <SelectItem value="EVALUATING">Evaluando</SelectItem>
                  <SelectItem value="APPROVED">Aprobada</SelectItem>
                  <SelectItem value="DISCARDED">Descartada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={String(priority)} onValueChange={(v) => v != null && setPriority(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Baja</SelectItem>
                  <SelectItem value="1">Media</SelectItem>
                  <SelectItem value="2">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Stack sugerido</Label>
            <Input value={stackStr} onChange={(e) => setStackStr(e.target.value)} placeholder="Next.js, Prisma, PostgreSQL" />
          </div>
          <div className="space-y-2">
            <Label>Notas adicionales</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Guardar" : "Crear idea"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
