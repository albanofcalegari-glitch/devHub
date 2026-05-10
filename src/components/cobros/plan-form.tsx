"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Loader2, Sparkles, Trash2 } from "lucide-react"
import { toast } from "sonner"

/* eslint-disable @typescript-eslint/no-explicit-any */

interface InstallmentRow {
  number: number
  label: string
  amount: number
  dueDate: string
}

interface PlanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  plan?: {
    id: string
    title: string
    description: string | null
    totalAmount: number
    currency: string
    paymentMethod: string | null
    status: string
    notes: string | null
    client: { id: string; name: string }
    project: { id: string; name: string } | null
  } | null
}

interface ClientOption {
  id: string
  name: string
  company: string | null
}

interface ProjectOption {
  id: string
  name: string
  slug: string
}

export function PlanFormDialog({
  open,
  onOpenChange,
  onSaved,
  plan,
}: PlanFormDialogProps) {
  const isEdit = !!plan

  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [projects, setProjects] = useState<ProjectOption[]>([])

  // Plan fields
  const [title, setTitle] = useState("")
  const [clientId, setClientId] = useState("")
  const [projectId, setProjectId] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [currency, setCurrency] = useState("ARS")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [notes, setNotes] = useState("")

  // Installment generator (create only)
  const [adelanto, setAdelanto] = useState("")
  const [numCuotas, setNumCuotas] = useState("")
  const [installments, setInstallments] = useState<InstallmentRow[]>([])

  useEffect(() => {
    if (open) {
      // Reset form
      setTitle(plan?.title ?? "")
      setClientId(plan?.client?.id ?? "")
      setProjectId(plan?.project?.id ?? "")
      setTotalAmount(plan?.totalAmount?.toString() ?? "")
      setCurrency(plan?.currency ?? "ARS")
      setPaymentMethod(plan?.paymentMethod ?? "")
      setNotes(plan?.notes ?? "")
      setAdelanto("")
      setNumCuotas("")
      setInstallments([])

      // Load clients and projects
      fetch("/api/clients")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setClients(data)
        })
      fetch("/api/projects")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setProjects(data)
        })
    }
  }, [open, plan])

  function generateInstallments() {
    const total = parseFloat(totalAmount)
    if (!total || total <= 0) {
      toast.error("Ingresa un monto total valido")
      return
    }

    const n = parseInt(numCuotas)
    if (!n || n <= 0) {
      toast.error("Ingresa una cantidad de cuotas valida")
      return
    }

    const adelantoAmount = parseFloat(adelanto) || 0
    const remaining = total - adelantoAmount

    if (remaining < 0) {
      toast.error("El adelanto no puede superar el monto total")
      return
    }

    const rows: InstallmentRow[] = []
    let num = 1

    // Adelanto
    if (adelantoAmount > 0) {
      const today = new Date()
      rows.push({
        number: num,
        label: "Adelanto",
        amount: Math.round(adelantoAmount * 100) / 100,
        dueDate: today.toISOString().split("T")[0],
      })
      num++
    }

    // Monthly installments
    const cuotaAmount = Math.round((remaining / n) * 100) / 100
    const now = new Date()

    for (let i = 0; i < n; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + 1 + i, now.getDate())
      rows.push({
        number: num,
        label: `Cuota ${i + 1}`,
        amount: cuotaAmount,
        dueDate: date.toISOString().split("T")[0],
      })
      num++
    }

    // Adjust last cuota for rounding differences
    const totalGenerated = rows.reduce((s, r) => s + r.amount, 0)
    const diff = Math.round((total - totalGenerated) * 100) / 100
    if (diff !== 0 && rows.length > 0) {
      rows[rows.length - 1].amount =
        Math.round((rows[rows.length - 1].amount + diff) * 100) / 100
    }

    setInstallments(rows)
  }

  function updateInstallmentField(
    index: number,
    field: keyof InstallmentRow,
    value: string | number
  ) {
    setInstallments((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    )
  }

  function removeInstallment(index: number) {
    setInstallments((prev) => {
      const next = prev.filter((_, i) => i !== index)
      // Re-number
      return next.map((row, i) => ({ ...row, number: i + 1 }))
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const planBody: any = {
      title,
      clientId,
      totalAmount: parseFloat(totalAmount),
      currency,
      paymentMethod: paymentMethod || null,
      notes: notes || null,
    }

    if (projectId && projectId !== "__none__") {
      planBody.projectId = projectId
    } else {
      planBody.projectId = null
    }

    if (isEdit) {
      // Edit: PUT plan fields only
      const res = await fetch(`/api/payment-plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planBody),
      })

      if (res.ok) {
        toast.success("Plan actualizado")
        onSaved()
        onOpenChange(false)
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al guardar")
      }
    } else {
      // Create: POST with installments
      const body = {
        ...planBody,
        installments: installments.map((row) => ({
          number: row.number,
          label: row.label,
          amount: row.amount,
          dueDate: row.dueDate,
          status: "PENDING",
        })),
      }

      const res = await fetch("/api/payment-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success("Plan creado")
        onSaved()
        onOpenChange(false)
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al crear plan")
      }
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-heading)]">
            {isEdit ? "Editar plan de cobro" : "Nuevo plan de cobro"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Titulo</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Desarrollo web — Cliente X"
              required
            />
          </div>

          {/* Client + Project */}
          <div className="border-t pt-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={clientId}
                onValueChange={(v) => {
                  if (!v) return
                  setClientId(v)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.company ? ` (${c.company})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Proyecto{" "}
                <span className="text-muted-foreground text-xs">
                  (opcional)
                </span>
              </Label>
              <Select
                value={projectId}
                onValueChange={(v) => {
                  if (!v) return
                  setProjectId(v)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ninguno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Ninguno</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount + Currency + Payment method */}
          <div className="border-t pt-4" />
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Monto total</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select
                value={currency}
                onValueChange={(v) => {
                  if (!v) return
                  setCurrency(v)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">ARS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Medio de pago</Label>
              <Select
                value={paymentMethod || "__none__"}
                onValueChange={(v) => {
                  if (!v) return
                  setPaymentMethod(v === "__none__" ? "" : v)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">-</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="MercadoPago">MercadoPago</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-4" />
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas sobre el plan..."
            />
          </div>

          {/* Installment generator — create mode only */}
          {!isEdit && (
            <div className="space-y-4 rounded-lg border p-5">
              <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">
                Generador de cuotas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Adelanto{" "}
                    <span className="text-muted-foreground text-xs">
                      (opcional)
                    </span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={adelanto}
                    onChange={(e) => setAdelanto(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cantidad de cuotas</Label>
                  <Input
                    type="number"
                    min="1"
                    value={numCuotas}
                    onChange={(e) => setNumCuotas(e.target.value)}
                    placeholder="Ej: 6"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={generateInstallments}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generar cuotas
              </Button>

              {/* Preview list */}
              {installments.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs text-muted-foreground font-medium">
                    Vista previa ({installments.length} cuotas)
                  </p>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {installments.map((row, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30"
                      >
                        <span className="text-xs font-mono text-muted-foreground w-6 shrink-0">
                          #{row.number}
                        </span>
                        <Input
                          value={row.label}
                          onChange={(e) =>
                            updateInstallmentField(idx, "label", e.target.value)
                          }
                          className="h-7 text-xs flex-1 min-w-0"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={row.amount}
                          onChange={(e) =>
                            updateInstallmentField(
                              idx,
                              "amount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-7 text-xs w-24 shrink-0"
                        />
                        <Input
                          type="date"
                          value={row.dueDate}
                          onChange={(e) =>
                            updateInstallmentField(idx, "dueDate", e.target.value)
                          }
                          className="h-7 text-xs w-36 shrink-0"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeInstallment(idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-right tabular-nums">
                    Total cuotas: $
                    {installments
                      .reduce((s, r) => s + r.amount, 0)
                      .toLocaleString("es-AR")}
                  </p>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white"
            disabled={loading || !clientId || !title}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Guardar cambios" : "Crear plan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
