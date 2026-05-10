"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface PaymentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  clientId: string
}

export function PaymentFormDialog({ open, onOpenChange, onSaved, clientId }: PaymentFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("ARS")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("PENDING")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const paidAt = status === "PAID" ? new Date().toISOString() : null

    const body = {
      amount: parseFloat(amount),
      currency,
      description,
      status,
      paidAt,
    }

    const res = await fetch(`/api/clients/${clientId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      toast.success("Pago registrado")
      onSaved()
      onOpenChange(false)
      setAmount("")
      setDescription("")
      setStatus("PENDING")
      setCurrency("ARS")
    } else {
      const data = await res.json()
      toast.error(data.error || "Error al registrar pago")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-heading)]">
            Nuevo pago
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select value={currency} onValueChange={(v) => { if (!v) return; setCurrency(v) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">ARS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descripcion</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripcion del pago" required />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={status} onValueChange={(v) => { if (!v) return; setStatus(v) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="PAID">Pagado</SelectItem>
                <SelectItem value="OVERDUE">Vencido</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {status === "PAID" && (
            <p className="text-xs text-muted-foreground">
              La fecha de pago se registrara automaticamente como ahora.
            </p>
          )}
          <Button type="submit" className="w-full bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar pago
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
