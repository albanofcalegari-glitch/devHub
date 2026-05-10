import { Sidebar } from "@/components/layout/sidebar"
import { MobileHeader } from "@/components/layout/sidebar-mobile"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar className="hidden lg:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader className="lg:hidden" />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
