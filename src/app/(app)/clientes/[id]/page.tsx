"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ClientFormDialog } from "@/components/clients/client-form"
import { PaymentFormDialog } from "@/components/clients/payment-form"
import {
  ArrowLeft, Loader2, Mail, Phone, Building2, StickyNote,
  Plus, FolderKanban, CreditCard, Pencil,
} from "lucide-react"
import { toast } from "sonner"

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ClientProject {
  id: string
  project: {
    id: string
    name: string
    slug: string
    color: string
    icon: string
  }
}

interface Payment {
  id: string
  amount: number
  currency: string
  description: string
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
  paidAt: string | null
  createdAt: string
}

interface ClientDetail {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  status: "LEAD" | "ACTIVE" | "INACTIVE"
  notes: string | null
  projects: ClientProject[]
  payments: Payment[]
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

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED: "bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400",
}

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  OVERDUE: "Vencido",
  CANCELLED: "Cancelado",
}

const avatarColors: Record<string, string> = {
  LEAD: "bg-blue-500",
  ACTIVE: "bg-green-500",
  INACTIVE: "bg-gray-400",
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [allProjects, setAllProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [linkingProject, setLinkingProject] = useState(false)

  function loadClient() {
    setLoading(true)
    fetch(`/api/clients/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) setClient(data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadClient()
  }, [params.id])

  function handleOpenProjectDialog() {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const linkedIds = new Set(
            (client?.projects ?? []).map((cp) => cp.project.id)
          )
          setAllProjects(data.filter((p: any) => !linkedIds.has(p.id)))
        }
      })
    setSelectedProjectId("")
    setShowProjectDialog(true)
  }

  async function handleLinkProject() {
    if (!selectedProjectId || !client) return
    setLinkingProject(true)

    const res = await fetch(`/api/clients/${client.id}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: selectedProjectId }),
    })

    if (res.ok) {
      toast.success("Proyecto vinculado")
      setShowProjectDialog(false)
      loadClient()
    } else {
      const data = await res.json()
      toast.error(data.error || "Error al vincular proyecto")
    }
    setLinkingProject(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Button variant="ghost" onClick={() => router.push("/clientes")} className="mt-4">
          Volver a clientes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/clientes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-white font-bold text-lg ${avatarColors[client.status]}`}
          >
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                {client.name}
              </h1>
              <Badge className={statusColors[client.status]}>
                {statusLabels[client.status]}
              </Badge>
            </div>
            {client.company && (
              <p className="text-sm text-muted-foreground">{client.company}</p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowEditForm(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Contact Info Card */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold font-[family-name:var(--font-heading)] text-base">
            Contacto
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {client.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${client.email}`} className="hover:text-foreground transition-colors truncate">
                  {client.email}
                </a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${client.phone}`} className="hover:text-foreground transition-colors">
                  {client.phone}
                </a>
              </div>
            )}
            {client.company && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" />
                <span>{client.company}</span>
              </div>
            )}
          </div>
          {client.notes && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground pt-2 border-t">
              <StickyNote className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linked Projects */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold font-[family-name:var(--font-heading)] text-base">
                Proyectos vinculados
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={handleOpenProjectDialog}>
              <Plus className="h-3 w-3 mr-1" />
              Agregar
            </Button>
          </div>
          {Array.isArray(client.projects) && client.projects.length > 0 ? (
            <div className="space-y-2">
              {client.projects.map((cp) => (
                <Link
                  key={cp.id}
                  href={`/proyectos/${cp.project.slug}`}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: cp.project.color }}
                  />
                  <span className="font-medium">{cp.project.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin proyectos vinculados</p>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold font-[family-name:var(--font-heading)] text-base">
                Pagos
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPaymentForm(true)}>
              <Plus className="h-3 w-3 mr-1" />
              Nuevo pago
            </Button>
          </div>
          {Array.isArray(client.payments) && client.payments.length > 0 ? (
            <div className="space-y-2">
              {client.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{payment.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(payment.createdAt).toLocaleDateString("es-AR")}
                      {payment.paidAt && (
                        <> — Pagado {new Date(payment.paidAt).toLocaleDateString("es-AR")}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="font-semibold tabular-nums">
                      {payment.currency} {payment.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                    <Badge className={paymentStatusColors[payment.status]}>
                      {paymentStatusLabels[payment.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Client Dialog */}
      <ClientFormDialog
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSaved={loadClient}
        client={client}
      />

      {/* Payment Form Dialog */}
      <PaymentFormDialog
        open={showPaymentForm}
        onOpenChange={setShowPaymentForm}
        onSaved={loadClient}
        clientId={client.id}
      />

      {/* Link Project Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">
              Vincular proyecto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {allProjects.length > 0 ? (
              <>
                <div className="space-y-2">
                  <Label>Proyecto</Label>
                  <Select value={selectedProjectId} onValueChange={(v) => { if (!v) return; setSelectedProjectId(v) }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProjects.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white"
                  disabled={!selectedProjectId || linkingProject}
                  onClick={handleLinkProject}
                >
                  {linkingProject && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Vincular
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay proyectos disponibles para vincular
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

