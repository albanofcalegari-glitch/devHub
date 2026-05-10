"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Copy, Eye, EyeOff, Trash2, Key, Database, Globe, Server, Loader2 } from "lucide-react"
import { toast } from "sonner"

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  database: Database,
  api: Key,
  hosting: Server,
  general: Globe,
}

interface Credential {
  id: string
  label: string
  category: string
  url?: string | null
  username?: string | null
  password?: string | null
  apiKey?: string | null
  notes?: string | null
}

interface CredentialsTabProps {
  projectId: string
  credentials: Credential[]
  onUpdate: () => void
}

export function CredentialsTab({ projectId, credentials, onUpdate }: CredentialsTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set())

  function toggleVisible(id: string) {
    setVisibleIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success("Copiado al portapapeles")
  }

  async function handleDelete(credId: string) {
    if (!confirm("Eliminar esta credencial?")) return
    const res = await fetch(`/api/projects/${projectId}/credentials/${credId}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Credencial eliminada")
      onUpdate()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(true)} className="bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Agregar
        </Button>
      </div>

      {credentials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Sin credenciales. Agrega URLs, usuarios y passwords de tus sistemas.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {credentials.map((cred) => {
            const Icon = categoryIcons[cred.category] || Globe
            const isVisible = visibleIds.has(cred.id)
            return (
              <Card key={cred.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{cred.label}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{cred.category}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleVisible(cred.id)}>
                        {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(cred.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {cred.url && (
                      <CredField label="URL" value={cred.url} visible={isVisible} onCopy={() => copyToClipboard(cred.url!)} />
                    )}
                    {cred.username && (
                      <CredField label="Usuario" value={cred.username} visible={isVisible} onCopy={() => copyToClipboard(cred.username!)} />
                    )}
                    {cred.password && (
                      <CredField label="Password" value={cred.password} visible={isVisible} onCopy={() => copyToClipboard(cred.password!)} />
                    )}
                    {cred.apiKey && (
                      <CredField label="API Key" value={cred.apiKey} visible={isVisible} onCopy={() => copyToClipboard(cred.apiKey!)} />
                    )}
                  </div>
                  {cred.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{cred.notes}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CredentialFormDialog projectId={projectId} open={showForm} onOpenChange={setShowForm} onSaved={onUpdate} />
    </div>
  )
}

function CredField({ label, value, visible, onCopy }: { label: string; value: string; visible: boolean; onCopy: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground w-16 shrink-0">{label}:</span>
      <span className="font-mono text-xs truncate">{visible ? value : "********"}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onCopy}>
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  )
}

function CredentialFormDialog({ projectId, open, onOpenChange, onSaved }: { projectId: string; open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false)
  const [label, setLabel] = useState("")
  const [category, setCategory] = useState("general")
  const [url, setUrl] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [notes, setNotes] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/projects/${projectId}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label, category,
        url: url || null, username: username || null,
        password: password || null, apiKey: apiKey || null,
        notes: notes || null,
      }),
    })
    if (res.ok) {
      toast.success("Credencial creada")
      onSaved()
      onOpenChange(false)
      setLabel(""); setUrl(""); setUsername(""); setPassword(""); setApiKey(""); setNotes("")
    } else {
      toast.error("Error al crear credencial")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva credencial</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="PostgreSQL Prod" required />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="database">Base de datos</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="hosting">Hosting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear credencial
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
