"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, User, Shield, Mail, CheckCircle } from "lucide-react"
import { toast } from "sonner"

type Step = "password" | "otp" | "new-password"

export default function ConfiguracionPage() {
  const { data: session } = useSession()
  const [step, setStep] = useState<Step>("password")
  const [currentPassword, setCurrentPassword] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword) return
    setLoading(true)

    const verifyRes = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, verify: true }),
    })

    if (!verifyRes.ok) {
      const data = await verifyRes.json()
      toast.error(data.error || "Contrasena incorrecta")
      setLoading(false)
      return
    }

    const otpRes = await fetch("/api/auth/send-otp", { method: "POST" })
    if (otpRes.ok) {
      toast.success("Codigo enviado a tu email")
      setStep("otp")
    } else {
      toast.error("Error al enviar el codigo")
    }
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!otpCode) return
    setLoading(true)

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: otpCode }),
    })

    if (res.ok) {
      toast.success("Codigo verificado")
      setStep("new-password")
    } else {
      const data = await res.json()
      toast.error(data.error || "Codigo invalido")
    }
    setLoading(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Las contrasenas no coinciden")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Minimo 6 caracteres")
      return
    }
    setLoading(true)

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    if (res.ok) {
      toast.success("Contrasena actualizada correctamente")
      setStep("password")
      setCurrentPassword("")
      setOtpCode("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      const data = await res.json()
      toast.error(data.error || "Error al cambiar contrasena")
    }
    setLoading(false)
  }

  async function handleResendOtp() {
    setLoading(true)
    const res = await fetch("/api/auth/send-otp", { method: "POST" })
    if (res.ok) {
      toast.success("Nuevo codigo enviado")
    } else {
      toast.error("Error al reenviar")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
          Configuracion
        </h1>
        <p className="text-muted-foreground mt-1">Ajustes de la cuenta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nombre</span>
            <span>{session?.user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{session?.user?.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Cambiar contrasena
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <span className={step === "password" ? "text-primary font-medium" : ""}>1. Verificar identidad</span>
            <span>&rarr;</span>
            <span className={step === "otp" ? "text-primary font-medium" : ""}>2. Codigo OTP</span>
            <span>&rarr;</span>
            <span className={step === "new-password" ? "text-primary font-medium" : ""}>3. Nueva contrasena</span>
          </div>

          {step === "password" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Contrasena actual</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Enviar codigo de verificacion
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ingresa el codigo de 6 digitos enviado a <strong>{session?.user?.email}</strong>
              </p>
              <div className="space-y-2">
                <Label>Codigo OTP</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || otpCode.length !== 6} className="bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Verificar
                </Button>
                <Button type="button" variant="outline" onClick={handleResendOtp} disabled={loading}>
                  Reenviar
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setStep("password"); setOtpCode("") }}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {step === "new-password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Nueva contrasena</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmar contrasena</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cambiar contrasena
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-xs text-muted-foreground text-center">
          DevHub v0.1.0 &middot; Qngine
        </CardContent>
      </Card>
    </div>
  )
}
