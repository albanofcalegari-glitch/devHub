"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ClientFormDialog } from "@/components/clients/client-form"
import { Input } from "@/components/ui/input"
import { Plus, Loader2, Users, Search } from "lucide-react"

interface ClientProject {
  id: string
  project: {
    id: string
    name: string
    slug: string
    color: string
  }
}

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  status: "LEAD" | "ACTIVE" | "INACTIVE"
  notes: string | null
  projects: ClientProject[]
  _count: { payments: number }
}

const statusColors: Record<string, string> = {
  LEAD: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  INACTIVE: "bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400",
}

const statusLabels: Record<string, string> = {
  LEAD: "Lead",
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
}

const avatarColors: Record<string, string> = {
  LEAD: "bg-blue-500",
  ACTIVE: "bg-green-500",
  INACTIVE: "bg-gray-400",
}

export default function ClientesPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")

  function loadClients() {
    setLoading(true)
    const url = statusFilter === "ALL" ? "/api/clients" : `/api/clients?status=${statusFilter}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadClients()
  }, [statusFilter])

  const filtered = clients.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.projects.some((cp) => cp.project.name.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
            Clientes
          </h1>
          <p className="text-muted-foreground mt-1">{clients.length} clientes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="pl-9 w-48"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { if (!v) return; setStatusFilter(v) }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="LEAD">Leads</SelectItem>
              <SelectItem value="ACTIVE">Activos</SelectItem>
              <SelectItem value="INACTIVE">Inactivos</SelectItem>
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
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Users className="h-12 w-12 mb-4 opacity-40" />
          <p className="text-lg font-medium">Sin clientes</p>
          <p className="text-sm mt-1">Agrega tu primer cliente para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <Card
              key={client.id}
              className="group hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full"
              onClick={() => router.push(`/clientes/${client.id}`)}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-semibold text-sm ${avatarColors[client.status]}`}
                    >
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold font-[family-name:var(--font-heading)] text-base truncate">
                        {client.name}
                      </h3>
                      {client.company && (
                        <p className="text-xs text-muted-foreground truncate">{client.company}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColors[client.status]}>
                    {statusLabels[client.status]}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  {client.email && <p className="truncate">{client.email}</p>}
                  {client.phone && <p>{client.phone}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {Array.isArray(client.projects) && client.projects.length > 0 ? (
                    client.projects.map((cp) => (
                      <span
                        key={cp.id}
                        className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-muted"
                      >
                        <span
                          className="inline-block h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: cp.project.color }}
                        />
                        {cp.project.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin proyectos</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClientFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSaved={loadClients}
      />
    </div>
  )
}
