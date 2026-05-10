"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlanFormDialog } from "@/components/cobros/plan-form"
import {
  ArrowLeft,
  Loader2,
  Pencil,
  CreditCard,
  StickyNote,
  Check,
  Undo2,
  FolderKanban,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Installment {
  id: string
  number: number
  label: string
  amount: number
  dueDate: string
  paidAt: string | null
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
  notes: string | null
}

interface PlanClient {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  status: string
}

interface PlanProject {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

interface PlanDetail {
  id: string
  title: string
  description: string | null
  totalAmount: number
  currency: string
  paymentMethod: string | null
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"
  notes: string | null
  client: PlanClient
  project: PlanProject | null
  installments: Installment[]
  createdAt: string
}

const planStatusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CANCELLED: "bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400",
}

const planStatusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
}

const instStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED: "bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400",
}

const instStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  OVERDUE: "Vencido",
  CANCELLED: "Cancelado",
}

function getDisplayStatus(inst: Installment): string {
  if (
    inst.status === "PENDING" &&
    new Date(inst.dueDate) < new Date()
  ) {
    return "OVERDUE"
  }
  return inst.status
}

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [plan, setPlan] = useState<PlanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function loadPlan() {
    setLoading(true)
    fetch(`/api/payment-plans/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) setPlan(data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPlan()
  }, [params.id])

  async function toggleInstallment(inst: Installment) {
    if (!plan) return
    setTogglingId(inst.id)

    const newStatus = inst.status === "PAID" ? "PENDING" : "PAID"

    const res = await fetch(
      `/api/payment-plans/${plan.id}/installments/${inst.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }
    )

    if (res.ok) {
      toast.success(
        newStatus === "PAID" ? "Cuota marcada como pagada" : "Cuota revertida a pendiente"
      )
      loadPlan()
    } else {
      const data = await res.json()
      toast.error(data.error || "Error al actualizar cuota")
    }
    setTogglingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Plan no encontrado</p>
        <Button
          variant="ghost"
          onClick={() => router.push("/cobros")}
          className="mt-4"
        >
          Volver a cobros
        </Button>
      </div>
    )
  }

  const installments = Array.isArray(plan.installments)
    ? plan.installments
    : []
  const paidAmount = installments
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + i.amount, 0)
  const paidCount = installments.filter((i) => i.status === "PAID").length
  const totalCount = installments.length
  const pct = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/cobros")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
              {plan.title}
            </h1>
            <Badge className={planStatusColors[plan.status]}>
              {planStatusLabels[plan.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Link
              href={`/clientes/${plan.client.id}`}
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              {plan.client.name}
            </Link>
            {plan.project && (
              <>
                <span>-</span>
                <Link
                  href={`/proyectos/${plan.project.slug}`}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors underline-offset-2 hover:underline"
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: plan.project.color }}
                  />
                  {plan.project.name}
                </Link>
              </>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowEditForm(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Plan info card */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold font-[family-name:var(--font-heading)] text-base">
              Detalle del plan
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Monto total
              </p>
              <p className="font-bold text-lg tabular-nums">
                {plan.currency}{" "}
                {plan.totalAmount.toLocaleString("es-AR")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Moneda</p>
              <p className="font-medium">{plan.currency}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Medio de pago
              </p>
              <p className="font-medium">
                {plan.paymentMethod || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Creado</p>
              <p className="font-medium">
                {new Date(plan.createdAt).toLocaleDateString("es-AR")}
              </p>
            </div>
          </div>
          {plan.notes && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground pt-3 border-t">
              <StickyNote className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="whitespace-pre-wrap">{plan.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress card */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Total cobrado:{" "}
              <span className="font-bold tabular-nums">
                ${paidAmount.toLocaleString("es-AR")}
              </span>{" "}
              /{" "}
              <span className="tabular-nums">
                ${plan.totalAmount.toLocaleString("es-AR")}
              </span>
            </p>
            <span className="text-xs text-muted-foreground">
              {paidCount}/{totalCount} cuotas ({pct}%)
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                plan.status === "COMPLETED" ? "bg-blue-500" : "bg-primary"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Installments list */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold font-[family-name:var(--font-heading)] text-base">
              Cuotas
            </h2>
          </div>
          {installments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Este plan no tiene cuotas registradas
            </p>
          ) : (
            <div className="space-y-2">
              {installments.map((inst) => {
                const displayStatus = getDisplayStatus(inst)
                const isToggling = togglingId === inst.id

                return (
                  <div
                    key={inst.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg text-sm transition-colors",
                      displayStatus === "PAID"
                        ? "bg-green-50/50 dark:bg-green-900/10"
                        : displayStatus === "OVERDUE"
                          ? "bg-red-50/50 dark:bg-red-900/10"
                          : "bg-muted/30"
                    )}
                  >
                    {/* Toggle button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 shrink-0 rounded-full border",
                        inst.status === "PAID"
                          ? "border-green-500 bg-green-500 text-white hover:bg-green-600"
                          : "border-muted-foreground/30 hover:border-primary hover:text-primary"
                      )}
                      disabled={
                        isToggling || inst.status === "CANCELLED"
                      }
                      onClick={() => toggleInstallment(inst)}
                    >
                      {isToggling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : inst.status === "PAID" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Undo2 className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
                      )}
                    </Button>

                    {/* Number + Label */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{inst.number}
                        </span>
                        <span
                          className={cn(
                            "font-medium truncate",
                            inst.status === "PAID" &&
                              "line-through text-muted-foreground"
                          )}
                        >
                          {inst.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>
                          Vence:{" "}
                          {new Date(inst.dueDate).toLocaleDateString("es-AR")}
                        </span>
                        {inst.paidAt && (
                          <span>
                            - Pagado:{" "}
                            {new Date(inst.paidAt).toLocaleDateString("es-AR")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <span className="font-semibold tabular-nums shrink-0">
                      {plan.currency}{" "}
                      {inst.amount.toLocaleString("es-AR")}
                    </span>

                    {/* Status badge */}
                    <Badge className={instStatusColors[displayStatus]}>
                      {instStatusLabels[displayStatus]}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <PlanFormDialog
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSaved={loadPlan}
        plan={plan}
      />
    </div>
  )
}
