import { cn } from "@/lib/utils"

const statusConfig = {
  ACTIVE: { label: "Activo", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  IN_DEVELOPMENT: { label: "En desarrollo", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  PRODUCTION: { label: "Producción", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  PAUSED: { label: "Pausado", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  PLANNING: { label: "Planificando", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  DONE: { label: "Terminado", className: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
}

export function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status]
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  )
}

const ideaStatusConfig = {
  IDEA: { label: "Idea", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  EVALUATING: { label: "Evaluando", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  APPROVED: { label: "Aprobada", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  DISCARDED: { label: "Descartada", className: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
}

export function IdeaStatusBadge({ status }: { status: keyof typeof ideaStatusConfig }) {
  const config = ideaStatusConfig[status]
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  )
}
