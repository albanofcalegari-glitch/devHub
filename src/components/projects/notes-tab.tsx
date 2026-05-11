"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pin, Trash2, Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn, formatRelativeDate } from "@/lib/utils"

interface Note {
  id: string
  title: string
  content: string
  pinned: boolean
  createdAt: string
  updatedAt: string
  createdBy?: { name: string } | null
  updatedBy?: { name: string } | null
}

interface NotesTabProps {
  projectId: string
  notes: Note[]
  onUpdate: () => void
}

export function NotesTab({ projectId, notes, onUpdate }: NotesTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  async function togglePin(note: Note) {
    await fetch(`/api/projects/${projectId}/notes/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: note.title, content: note.content, pinned: !note.pinned }),
    })
    onUpdate()
  }

  async function deleteNote(noteId: string) {
    if (!confirm("Eliminar esta nota?")) return
    await fetch(`/api/projects/${projectId}/notes/${noteId}`, { method: "DELETE" })
    toast.success("Nota eliminada")
    onUpdate()
  }

  function authorLine(note: Note) {
    const parts: string[] = []
    if (note.createdBy) parts.push(`por ${note.createdBy.name}`)
    if (note.updatedBy && note.updatedBy.name !== note.createdBy?.name) {
      parts.push(`editado por ${note.updatedBy.name}`)
    }
    return parts.length > 0 ? ` · ${parts.join(" · ")}` : ""
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditingNote(null); setShowForm(true) }} className="bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Nueva nota
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Sin notas aun. Agrega ideas, observaciones o recordatorios.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notes.map((note) => (
            <Card key={note.id} className={cn("group", note.pinned && "border-primary/30")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {note.pinned && <Pin className="h-3.5 w-3.5 text-primary rotate-45" />}
                    <h4 className="font-medium text-sm">{note.title}</h4>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePin(note)}>
                      <Pin className={cn("h-3 w-3", note.pinned ? "text-primary" : "text-muted-foreground")} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingNote(note); setShowForm(true) }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteNote(note.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {note.content}
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {formatRelativeDate(note.updatedAt)}{authorLine(note)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NoteFormDialog
        projectId={projectId}
        open={showForm}
        onOpenChange={setShowForm}
        onSaved={onUpdate}
        note={editingNote}
      />
    </div>
  )
}

function NoteFormDialog({ projectId, open, onOpenChange, onSaved, note }: {
  projectId: string; open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void; note: Note | null
}) {
  const isEdit = !!note
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")

  useState(() => {
    if (note) { setTitle(note.title); setContent(note.content) }
    else { setTitle(""); setContent("") }
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const url = isEdit ? `/api/projects/${projectId}/notes/${note.id}` : `/api/projects/${projectId}/notes`
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, pinned: note?.pinned ?? false }),
    })
    if (res.ok) {
      toast.success(isEdit ? "Nota actualizada" : "Nota creada")
      onSaved()
      onOpenChange(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar nota" : "Nueva nota"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Titulo</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Contenido</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} required />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Guardar" : "Crear nota"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
