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

const categories = [
  { value: "AUTH", label: "Auth" },
  { value: "CRUD", label: "CRUD" },
  { value: "PAYMENTS", label: "Pagos" },
  { value: "EMAIL", label: "Email" },
  { value: "FILE_UPLOAD", label: "Archivos" },
  { value: "DATABASE", label: "Base de datos" },
  { value: "DEPLOYMENT", label: "Deploy" },
  { value: "TESTING", label: "Testing" },
  { value: "UI_COMPONENT", label: "UI Component" },
  { value: "INTEGRATION", label: "Integracion" },
  { value: "OTHER", label: "Otro" },
]

interface ModuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function ModuleFormDialog({ open, onOpenChange, onSaved }: ModuleFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("OTHER")
  const [icon, setIcon] = useState("puzzle")
  const [stackStr, setStackStr] = useState("")
  const [content, setContent] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, description, category, icon, content,
        stackCompat: stackStr.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    })

    if (res.ok) {
      toast.success("Modulo creado")
      onSaved()
      onOpenChange(false)
      setName(""); setDescription(""); setContent(""); setStackStr("")
    } else {
      const data = await res.json()
      toast.error(data.error || "Error al crear modulo")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-heading)]">
            Nuevo modulo
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descripcion</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icono (lucide)</Label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="puzzle" />
            </div>
            <div className="space-y-2">
              <Label>Stack compatible</Label>
              <Input value={stackStr} onChange={(e) => setStackStr(e.target.value)} placeholder="Next.js, Prisma" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Contenido / Documentacion</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="Documenta aqui el modulo, patrones, snippets..." required />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear modulo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
