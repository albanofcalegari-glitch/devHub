"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { PlanFormDialog } from "@/components/cobros/plan-form"
import { Plus, Loader2, Receipt, DollarSign, Clock, FileCheck2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlanInstallment {
  status: string
  amount: number
}

interface PlanClient {
  id: string
  name: string
  company: string | null
}

interface PlanProject {
  id: string
  name: string
  slug: string
  color: string
}

interface PaymentPlan {
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
  _count: { installments: number }
  installments: PlanInstallment[]
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

export default function CobrosPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<PaymentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [showForm, setShowForm] = useState(false)

  function loadPlans() {
    setLoading(true)
    const url =
      statusFilter === "ALL"
        ? "/api/payment-plans"
        : `/api/payment-plans?status=${statusFilter}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPlans()
  }, [statusFilter])

  const totalCobrado = plans.reduce((sum, plan) => {
    const paid = Array.isArray(plan.installments)
      ? plan.installments
          .filter((inst) => inst.status === "PAID")
          .reduce((s, inst) => s + inst.amount, 0)
      : 0
    return sum + paid
  }, 0)

  const totalPendiente = plans.reduce((sum, plan) => {
    const pending = Array.isArray(plan.installments)
      ? plan.installments
          .filter((inst) => inst.status === "PENDING" || inst.status === "OVERDUE")
          .reduce((s, inst) => s + inst.amount, 0)
      : 0
    return sum + pending
  }, 0)

  const planesActivos = plans.filter((p) => p.status === "ACTIVE").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
            Cobros
          </h1>
          <p className="text-muted-foreground mt-1">
            Planes de pago y cuotas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              if (!v) return
              setStatusFilter(v)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="ACTIVE">Activos</SelectItem>
              <SelectItem value="COMPLETED">Completados</SelectItem>
              <SelectItem value="CANCELLED">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo plan
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {!loading && plans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total cobrado</p>
                <p className="text-lg font-bold tabular-nums">
                  ${totalCobrado.toLocaleString("es-AR")}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendiente</p>
                <p className="text-lg font-bold tabular-nums">
                  ${totalPendiente.toLocaleString("es-AR")}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileCheck2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Planes activos</p>
                <p className="text-lg font-bold tabular-nums">
                  {planesActivos}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plans grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Receipt className="h-12 w-12 mb-4 opacity-40" />
          <p className="text-lg font-medium">Sin planes de cobro</p>
          <p className="text-sm mt-1">
            Crea tu primer plan de pago para empezar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const paid = Array.isArray(plan.installments)
              ? plan.installments.filter((i) => i.status === "PAID").length
              : 0
            const total = plan._count.installments
            const pct = total > 0 ? Math.round((paid / total) * 100) : 0

            return (
              <Card
                key={plan.id}
                className="group hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full"
                onClick={() => router.push(`/cobros/${plan.id}`)}
              >
                <CardContent className="p-5 space-y-3">
                  {/* Title + Status */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold font-[family-name:var(--font-heading)] text-base truncate">
                        {plan.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {plan.client.name}
                      </p>
                    </div>
                    <Badge className={planStatusColors[plan.status]}>
                      {planStatusLabels[plan.status]}
                    </Badge>
                  </div>

                  {/* Project */}
                  {plan.project && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: plan.project.color }}
                      />
                      <span className="truncate">{plan.project.name}</span>
                    </div>
                  )}

                  {/* Amount */}
                  <p className="text-lg font-bold tabular-nums">
                    {plan.currency}{" "}
                    {plan.totalAmount.toLocaleString("es-AR")}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {paid}/{total} cuotas
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          plan.status === "COMPLETED"
                            ? "bg-blue-500"
                            : "bg-primary"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  {plan.paymentMethod && (
                    <p className="text-xs text-muted-foreground">
                      {plan.paymentMethod}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <PlanFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSaved={loadPlans}
      />
    </div>
  )
}
