"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Menu, LayoutDashboard, FolderKanban, Puzzle, Lightbulb, Users, Receipt, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
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

export function MobileHeader({ className }: { className?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className={cn("flex items-center justify-between p-4 border-b border-border", className)}>
      <Link href="/" className="flex items-center gap-2">
        <Tesseract size={42} />
        <span className="text-lg font-bold font-[family-name:var(--font-heading)] bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] bg-clip-text text-transparent">
          DevHub
        </span>
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" />}>
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
          <div className="flex flex-col h-full">
            <div className="p-6 pb-4 border-b border-border flex items-center gap-3">
              <Tesseract size={42} />
              <div>
                <span className="text-lg font-bold font-[family-name:var(--font-heading)] bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] bg-clip-text text-transparent">
                  DevHub
                </span>
                <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                  Qngine
                </p>
              </div>
            </div>
            <nav className="flex-1 px-3 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-3 border-t border-border space-y-1">
              <ThemeToggle />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-accent hover:text-foreground w-full transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesion
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
