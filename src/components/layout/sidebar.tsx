"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  FolderKanban,
  Puzzle,
  Lightbulb,
  Users,
  Receipt,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { Tesseract } from "@/components/brand/tesseract"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/cobros", label: "Cobros", icon: Receipt },
  { href: "/modulos", label: "Modulos", icon: Puzzle },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/configuracion", label: "Config", icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        "w-64 border-r border-sidebar-border bg-sidebar flex flex-col h-full",
        className
      )}
    >
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-3">
          <Tesseract size={48} />
          <div>
            <span className="text-lg font-bold font-[family-name:var(--font-heading)] bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] bg-clip-text text-transparent">
              DevHub
            </span>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Qngine
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <ThemeToggle />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </button>
      </div>
    </aside>
  )
}
