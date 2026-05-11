"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, CheckCircle2, Circle, Clock, Loader2, GripVertical, Tag, Filter, Pencil, ListChecks, Square, SquareCheckBig } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Status = "TODO" | "IN_PROGRESS" | "DONE"

const statusConfig: Record<Status, { label: string; icon: typeof Circle; color: string; bg: string }> = {
  TODO: { label: "Por hacer", icon: Circle, color: "text-muted-foreground", bg: "bg-muted/30" },
  IN_PROGRESS: { label: "En progreso", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/5" },
  DONE: { label: "Hecho", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/5" },
}

const priorityLabels = ["Baja", "Media", "Alta"]
const priorityColors = ["text-gray-500", "text-yellow-500", "text-red-500"]

const categoryColors = [
  "bg-blue-500/15 text-blue-500 border-blue-500/30",
  "bg-purple-500/15 text-purple-500 border-purple-500/30",
  "bg-pink-500/15 text-pink-500 border-pink-500/30",
  "bg-orange-500/15 text-orange-500 border-orange-500/30",
  "bg-teal-500/15 text-teal-500 border-teal-500/30",
  "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
  "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  "bg-rose-500/15 text-rose-500 border-rose-500/30",
]

function getCategoryColor(category: string, allCategories: string[]): string {
  const idx = allCategories.indexOf(category)
  return categoryColors[idx % categoryColors.length]
}

interface Subtask {
  id: string
  title: string
  status: Status
}

interface Task {
  id: string
  title: string
  description?: string | null
  status: Status
  priority: number
  category?: string | null
  subtasks?: Subtask[]
  createdBy?: { name: string } | null
  updatedBy?: { name: string } | null
}

interface TasksTabProps {
  projectId: string
  tasks: Task[]
  onUpdate: () => void
}

export function TasksTab({ projectId, tasks, onUpdate }: TasksTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<Status | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const dragCounters = useRef<Record<string, number>>({ TODO: 0, IN_PROGRESS: 0, DONE: 0 })

  const allCategories = useMemo(() => {
    const cats = new Set<string>()
    tasks.forEach((t) => { if (t.category) cats.add(t.category) })
    return Array.from(cats).sort()
  }, [tasks])

  const filteredTasks = categoryFilter === "ALL"
    ? tasks
    : tasks.filter((t) => t.category === categoryFilter)

  async function moveTask(taskId: string, newStatus: Status) {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    onUpdate()
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" })
    toast.success("Tarea eliminada")
    onUpdate()
  }

  function handleCardClick(e: React.MouseEvent, task: Task) {
    if ((e.target as HTMLElement).closest("button")) return
    setEditingTask(task)
  }

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("text/plain", taskId)
    e.dataTransfer.effectAllowed = "move"
    setTimeout(() => setDraggingId(taskId), 0)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDropTarget(null)
    dragCounters.current = { TODO: 0, IN_PROGRESS: 0, DONE: 0 }
  }

  function handleDragEnter(status: Status) {
    dragCounters.current[status]++
    setDropTarget(status)
  }

  function handleDragLeave(status: Status) {
    dragCounters.current[status]--
    if (dragCounters.current[status] <= 0) {
      dragCounters.current[status] = 0
      if (dropTarget === status) setDropTarget(null)
    }
  }

  function handleDrop(e: React.DragEvent, status: Status) {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("text/plain")
    if (taskId) moveTask(taskId, status)
    setDraggingId(null)
    setDropTarget(null)
    dragCounters.current = { TODO: 0, IN_PROGRESS: 0, DONE: 0 }
  }

  const groups: Record<Status, Task[]> = {
    TODO: filteredTasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: filteredTasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: filteredTasks.filter((t) => t.status === "DONE"),
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nueva tarea
        </Button>

        {allCategories.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setCategoryFilter("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                  categoryFilter === "ALL"
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                )}
              >
                Todas
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? "ALL" : cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                    categoryFilter === cat
                      ? getCategoryColor(cat, allCategories)
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["TODO", "IN_PROGRESS", "DONE"] as const).map((status) => {
          const config = statusConfig[status]
          const Icon = config.icon
          const isOver = dropTarget === status && draggingId !== null
          const draggingTask = draggingId ? tasks.find((t) => t.id === draggingId) : null
          const isOriginColumn = draggingTask?.status === status

          return (
            <div
              key={status}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move" }}
              onDragEnter={() => handleDragEnter(status)}
              onDragLeave={() => handleDragLeave(status)}
              onDrop={(e) => handleDrop(e, status)}
              className={cn(
                "rounded-xl p-3 transition-all duration-200 min-h-[200px]",
                config.bg,
                isOver && !isOriginColumn && "ring-2 ring-primary/50 scale-[1.01]",
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="text-sm font-semibold">{config.label}</span>
                <Badge variant="secondary" className="text-xs ml-auto">{groups[status].length}</Badge>
              </div>
              <div className="space-y-2">
                {groups[status].map((task) => {
                  const subs = task.subtasks || []
                  const subsDone = subs.filter((s) => s.status === "DONE").length
                  return (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => handleCardClick(e, task)}
                      className={cn(
                        "group cursor-grab active:cursor-grabbing transition-all duration-150",
                        "hover:shadow-md hover:border-primary/20",
                        draggingId === task.id && "opacity-40 scale-95 rotate-1",
                      )}
                    >
                      <CardContent className="p-3 space-y-1.5">
                        <div className="flex items-start gap-1.5">
                          <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium leading-tight", status === "DONE" && "line-through text-muted-foreground")}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                            )}
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingTask(task)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteTask(task.id)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pl-5">
                          <span className={cn("text-[10px] font-medium", priorityColors[task.priority])}>
                            {priorityLabels[task.priority]}
                          </span>
                          {task.category && (
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", getCategoryColor(task.category, allCategories))}>
                              {task.category}
                            </Badge>
                          )}
                          {subs.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                              <ListChecks className="h-3 w-3" />
                              {subsDone}/{subs.length}
                            </span>
                          )}
                          {(task.updatedBy || task.createdBy) && (
                            <span className="text-[10px] text-muted-foreground/70 ml-auto">
                              {task.updatedBy ? task.updatedBy.name : task.createdBy?.name}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                {isOver && !isOriginColumn && (
                  <div className="border-2 border-dashed border-primary/30 rounded-lg h-16 flex items-center justify-center text-xs text-primary/50">
                    Soltar aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <TaskFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        projectId={projectId}
        existingCategories={allCategories}
        onSaved={onUpdate}
        task={null}
      />

      <TaskFormDialog
        open={!!editingTask}
        onOpenChange={(v) => { if (!v) setEditingTask(null) }}
        projectId={projectId}
        existingCategories={allCategories}
        onSaved={onUpdate}
        task={editingTask}
      />
    </div>
  )
}

function TaskFormDialog({ open, onOpenChange, projectId, existingCategories, onSaved, task }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  projectId: string
  existingCategories: string[]
  onSaved: () => void
  task: Task | null
}) {
  const isEdit = !!task
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<Status>("TODO")
  const [priority, setPriority] = useState(1)
  const [category, setCategory] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtask, setNewSubtask] = useState("")
  const [addingSubtask, setAddingSubtask] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? "")
      setStatus(task.status)
      setPriority(task.priority)
      setCategory(task.category ?? "")
      setSubtasks(task.subtasks || [])
      setNewCategory("")
      setShowNewCategory(false)
      setNewSubtask("")
    } else {
      setTitle("")
      setDescription("")
      setStatus("TODO")
      setPriority(1)
      setCategory("")
      setSubtasks([])
      setNewCategory("")
      setShowNewCategory(false)
      setNewSubtask("")
    }
  }, [task, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    const finalCategory = showNewCategory ? newCategory.trim() : category

    const url = isEdit ? `/api/projects/${projectId}/tasks/${task.id}` : `/api/projects/${projectId}/tasks`
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        category: finalCategory || null,
      }),
    })
    if (res.ok) {
      toast.success(isEdit ? "Tarea actualizada" : "Tarea creada")
      onSaved()
      onOpenChange(false)
    } else {
      toast.error("Error al guardar")
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!task || !confirm("Eliminar esta tarea?")) return
    const res = await fetch(`/api/projects/${projectId}/tasks/${task.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Tarea eliminada")
      onSaved()
      onOpenChange(false)
    }
  }

  async function addSubtask() {
    if (!task || !newSubtask.trim()) return
    setAddingSubtask(true)
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newSubtask.trim(),
        status: "TODO",
        priority: 0,
        parentId: task.id,
      }),
    })
    if (res.ok) {
      const created = await res.json()
      setSubtasks((prev) => [...prev, created])
      setNewSubtask("")
      onSaved()
    }
    setAddingSubtask(false)
  }

  async function toggleSubtask(sub: Subtask) {
    const newStatus = sub.status === "DONE" ? "TODO" : "DONE"
    await fetch(`/api/projects/${projectId}/tasks/${sub.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    setSubtasks((prev) => prev.map((s) => s.id === sub.id ? { ...s, status: newStatus } : s))
    onSaved()
  }

  async function deleteSubtask(subId: string) {
    await fetch(`/api/projects/${projectId}/tasks/${subId}`, { method: "DELETE" })
    setSubtasks((prev) => prev.filter((s) => s.id !== subId))
    onSaved()
  }

  const subsDone = subtasks.filter((s) => s.status === "DONE").length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-heading)]">
            {isEdit ? "Editar tarea" : "Nueva tarea"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Titulo</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Implementar feature X" required />
          </div>
          <div className="space-y-2">
            <Label>Descripcion <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Detalles adicionales..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {isEdit && (
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={status} onValueChange={(v) => { if (v) setStatus(v as Status) }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">Por hacer</SelectItem>
                    <SelectItem value="IN_PROGRESS">En progreso</SelectItem>
                    <SelectItem value="DONE">Hecho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
            <div className={cn("space-y-2", !isEdit && "col-span-1")}>
              <Label className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Categoria
              </Label>
              {showNewCategory ? (
                <div className="flex gap-1">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Backend, UX..."
                    className="h-9"
                  />
                  <Button type="button" variant="ghost" size="sm" className="h-9 px-2 shrink-0" onClick={() => { setShowNewCategory(false); setNewCategory("") }}>
                    x
                  </Button>
                </div>
              ) : (
                <Select value={category || "_none"} onValueChange={(v) => {
                  if (!v) return
                  if (v === "_new") { setShowNewCategory(true); setCategory("") }
                  else if (v === "_none") setCategory("")
                  else setCategory(v)
                }}>
                  <SelectTrigger><SelectValue placeholder="Sin categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sin categoria</SelectItem>
                    {existingCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    <SelectItem value="_new">+ Nueva categoria...</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {isEdit && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <ListChecks className="h-4 w-4" />
                  Subtareas
                  {subtasks.length > 0 && (
                    <span className="text-xs text-muted-foreground font-normal">({subsDone}/{subtasks.length})</span>
                  )}
                </Label>
              </div>

              {subtasks.length > 0 && (
                <div className="w-full bg-muted/50 rounded-full h-1.5 mb-2">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${subtasks.length > 0 ? (subsDone / subtasks.length) * 100 : 0}%` }}
                  />
                </div>
              )}

              <div className="space-y-1">
                {subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 group/sub py-1 px-1 rounded hover:bg-muted/50">
                    <button type="button" onClick={() => toggleSubtask(sub)} className="shrink-0">
                      {sub.status === "DONE" ? (
                        <SquareCheckBig className="h-4 w-4 text-green-500" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <span className={cn("text-sm flex-1", sub.status === "DONE" && "line-through text-muted-foreground")}>
                      {sub.title}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover/sub:opacity-100 shrink-0"
                      onClick={() => deleteSubtask(sub.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Agregar subtarea..."
                  className="h-8 text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubtask() } }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 shrink-0"
                  onClick={addSubtask}
                  disabled={addingSubtask || !newSubtask.trim()}
                >
                  {addingSubtask ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear tarea"}
            </Button>
            {isEdit && (
              <Button type="button" variant="destructive" size="icon" onClick={handleDelete} className="shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
