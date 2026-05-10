"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/projects/status-badge"
import {
  CalendarClock, TrendingUp, Plane, FileText, Dog, Utensils,
  Wallet, CreditCard, Folder, Code, Briefcase, Globe,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  "calendar-clock": CalendarClock,
  "trending-up": TrendingUp,
  plane: Plane,
  "file-text": FileText,
  dog: Dog,
  utensils: Utensils,
  wallet: Wallet,
  "credit-card": CreditCard,
  folder: Folder,
  code: Code,
  briefcase: Briefcase,
  globe: Globe,
}

interface ProjectCardProps {
  project: {
    id: string
    name: string
    slug: string
    description: string
    status: "ACTIVE" | "PAUSED" | "PLANNING" | "DONE"
    progress: number
    color: string
    icon: string
    stack: string[]
    _count?: { tasks: number; notes: number; credentials: number }
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const Icon = iconMap[project.icon] || Folder

  return (
    <Link href={`/proyectos/${project.slug}`}>
      <Card className="group hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full">
        <div className="h-1 rounded-t-xl" style={{ backgroundColor: project.color }} />
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${project.color}15` }}
              >
                <Icon className="h-5 w-5" style={{ color: project.color }} />
              </div>
              <div>
                <h3 className="font-semibold font-[family-name:var(--font-heading)] text-base">
                  {project.name}
                </h3>
              </div>
            </div>
            <StatusBadge status={project.status} />
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {project.stack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tech}
              </Badge>
            ))}
            {project.stack.length > 4 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                +{project.stack.length - 4}
              </Badge>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progreso</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
