"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FolderKanban, Activity, PauseCircle, Puzzle } from "lucide-react"

interface StatsOverviewProps {
  total: number
  active: number
  paused: number
  modules: number
}

const stats = [
  { key: "total", label: "Proyectos", icon: FolderKanban, color: "#7c5cfc" },
  { key: "active", label: "Activos", icon: Activity, color: "#22c55e" },
  { key: "paused", label: "Pausados", icon: PauseCircle, color: "#eab308" },
  { key: "modules", label: "Modulos", icon: Puzzle, color: "#3b82f6" },
] as const

export function StatsOverview({ total, active, paused, modules }: StatsOverviewProps) {
  const values = { total, active, paused, modules }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.key}>
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <Icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                  {values[stat.key]}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
