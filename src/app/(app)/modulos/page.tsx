"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Plus, Loader2, Puzzle, Shield, Database, CreditCard, Mail, Upload, Server, TestTube, Component, Link2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { ModuleFormDialog } from "@/components/modules/module-form"

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  AUTH: Shield, CRUD: Database, PAYMENTS: CreditCard, EMAIL: Mail,
  FILE_UPLOAD: Upload, DATABASE: Database, DEPLOYMENT: Server,
  TESTING: TestTube, UI_COMPONENT: Component, INTEGRATION: Link2, OTHER: MoreHorizontal,
}

const categoryLabels: Record<string, string> = {
  AUTH: "Auth", CRUD: "CRUD", PAYMENTS: "Pagos", EMAIL: "Email",
  FILE_UPLOAD: "Archivos", DATABASE: "Base de datos", DEPLOYMENT: "Deploy",
  TESTING: "Testing", UI_COMPONENT: "UI", INTEGRATION: "Integracion", OTHER: "Otro",
}

interface Module {
  id: string
  name: string
  description: string
  category: string
  icon: string
  stackCompat: string[]
  _count: { steps: number }
}

export default function ModulosPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [showForm, setShowForm] = useState(false)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [moduleDetail, setModuleDetail] = useState<Record<string, unknown> | null>(null)

  function loadModules() {
    setLoading(true)
    const url = categoryFilter === "ALL" ? "/api/modules" : `/api/modules?category=${categoryFilter}`
    fetch(url).then((r) => r.json()).then((data) => setModules(Array.isArray(data) ? data : [])).finally(() => setLoading(false))
  }

  useEffect(() => { loadModules() }, [categoryFilter])

  useEffect(() => {
    if (selectedModule) {
      fetch(`/api/modules/${selectedModule}`).then((r) => r.json()).then(setModuleDetail)
    } else {
      setModuleDetail(null)
    }
  }, [selectedModule])

  async function deleteModule(id: string) {
    if (!confirm("Eliminar este modulo?")) return
    const res = await fetch(`/api/modules/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Modulo eliminado")
      setSelectedModule(null)
      loadModules()
    }
  }

  if (selectedModule && moduleDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedModule(null)} className="mb-2">
              &larr; Volver
            </Button>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
              {moduleDetail.name as string}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{moduleDetail.description as string}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{categoryLabels[(moduleDetail.category as string)] || moduleDetail.category as string}</Badge>
            <Button variant="destructive" size="sm" onClick={() => deleteModule(moduleDetail.id as string)}>Eliminar</Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {((moduleDetail.stackCompat as string[]) || []).map((s) => (
            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {moduleDetail.content as string}
            </div>
          </CardContent>
        </Card>
        {((moduleDetail.steps as Array<{ id: string; title: string; content: string }>) || []).length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Pasos de implementacion</h3>
            {((moduleDetail.steps as Array<{ id: string; title: string; content: string; sortOrder: number }>) || []).map((step, i) => (
              <Card key={step.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{i + 1}</span>
                    <h4 className="font-medium text-sm">{step.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{step.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
            Modulos de Desarrollo
          </h1>
          <p className="text-muted-foreground mt-1">Biblioteca de building blocks reutilizables</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
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
      ) : modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Sin modulos aun. Crea el primero para empezar tu biblioteca.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = categoryIcons[mod.category] || Puzzle
            return (
              <Card key={mod.id} className="group hover:border-primary/30 transition-all cursor-pointer" onClick={() => setSelectedModule(mod.id)}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm">{mod.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{mod.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {mod.stackCompat.slice(0, 3).map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">{s}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">{categoryLabels[mod.category] || mod.category}</Badge>
                    <span>{mod._count.steps} pasos</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ModuleFormDialog open={showForm} onOpenChange={setShowForm} onSaved={loadModules} />
    </div>
  )
}
