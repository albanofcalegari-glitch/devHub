"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Eye, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ArchitectureTabProps {
  projectId: string
  architecture: string | null
  onUpdate: () => void
}

export function ArchitectureTab({ projectId, architecture, onUpdate }: ArchitectureTabProps) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(architecture || "")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setContent(architecture || "")
  }, [architecture])

  const handleSave = useCallback(async () => {
    setSaving(true)
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ architecture: content }),
    })
    if (res.ok) {
      toast.success("Arquitectura guardada")
      setEditing(false)
      onUpdate()
    } else {
      toast.error("Error al guardar")
    }
    setSaving(false)
  }, [content, projectId, onUpdate])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Documentacion de arquitectura
        </CardTitle>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Vista previa
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white">
                {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                Guardar
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Documenta aqui la arquitectura del proyecto, decisiones tecnicas, estructura de carpetas, flujos principales..."
            className="min-h-[400px] font-mono text-sm"
          />
        ) : content ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-12">
            Sin documentacion aun. Hace click en &quot;Editar&quot; para agregar.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
