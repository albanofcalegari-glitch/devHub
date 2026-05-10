import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

interface TaskDef {
  title: string
  description?: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority: number
}

interface ProjectTasks {
  slug: string
  progress: number
  tasks: TaskDef[]
}

const projectTasks: ProjectTasks[] = [
  {
    slug: "turnit",
    progress: 88,
    tasks: [
      { title: "Sistema de turnos multi-tenant core", status: "DONE", priority: 2 },
      { title: "Auth con roles (owner, empleado, cliente)", status: "DONE", priority: 2 },
      { title: "Booking publico con seleccion de servicio y horario", status: "DONE", priority: 2 },
      { title: "Work Orders fase 1 - frontend", status: "DONE", priority: 1 },
      { title: "Integracion Mercado Pago (checkout + webhooks)", status: "DONE", priority: 2 },
      { title: "Auth emails + reportes + 10 mejoras UX", status: "DONE", priority: 1 },
      { title: "Programa de fidelidad (loyalty)", status: "DONE", priority: 1 },
      { title: "OTP owner + Google Calendar sync", status: "DONE", priority: 1 },
      { title: "Pagina de mantenimiento", status: "DONE", priority: 0 },
      { title: "Deploy produccion VPS (Docker/PM2)", status: "DONE", priority: 2 },
      { title: "Verificacion OTP email en booking publico", description: "Plan disenado, pendiente desarrollo. Validar email del cliente antes de confirmar turno", status: "TODO", priority: 1 },
      { title: "Mejoras de dashboard owner", description: "Graficos de ocupacion, metricas de ingresos, tendencias semanales/mensuales", status: "TODO", priority: 1 },
      { title: "Integracion Google Calendar bidireccional", description: "Sincronizar turnos con GCal del owner. Ya hay sync basico, falta bidireccional", status: "IN_PROGRESS", priority: 1 },
      { title: "Integracion Microsoft Outlook Calendar", description: "Mismo concepto que GCal pero con Microsoft Graph API", status: "TODO", priority: 1 },
      { title: "Notificaciones push / email recordatorio", description: "Recordar al cliente 24h y 1h antes del turno", status: "TODO", priority: 0 },
      { title: "Setup Mercado Pago productivo", description: "Migrar de credenciales test a produccion", status: "TODO", priority: 2 },
    ],
  },
  {
    slug: "trading-assist",
    progress: 62,
    tasks: [
      { title: "Backend FastAPI + PostgreSQL core", status: "DONE", priority: 2 },
      { title: "Frontend React con charts interactivos", status: "DONE", priority: 2 },
      { title: "ML Fase 1 - LightGBM (29k rows, lift x1.41)", status: "DONE", priority: 2 },
      { title: "Soportes dinamicos (3 trendlines log-space)", status: "DONE", priority: 1 },
      { title: "Resistencias dinamicas con toggle W/D", status: "DONE", priority: 1 },
      { title: "Minimos historicos 52w con alertas", status: "DONE", priority: 1 },
      { title: "UT Bot trailing stop overlay", status: "DONE", priority: 1 },
      { title: "Watchlist + price levels + trendlines polyline", status: "DONE", priority: 1 },
      { title: "Movimientos (log trades) gated por usuario", status: "DONE", priority: 1 },
      { title: "Pivots overlay + S/R visual fixes", status: "DONE", priority: 1 },
      { title: "Alertas Telegram S/R breakout (cron diario)", status: "DONE", priority: 1 },
      { title: "Short CP descendente (diagonal)", status: "DONE", priority: 0 },
      { title: "Deploy VPS Hostinger (Ubuntu 24.04)", status: "DONE", priority: 2 },
      { title: "Backfill historico Yahoo masivo", description: "~12,200 tickers sin historico. Script backfill_history.py listo pero pendiente ejecucion masiva", status: "TODO", priority: 1 },
      { title: "ML Fase 2 - incorporar features tecnicos nuevos", description: "Cada feature aprobado (soportes, resistencias, UT bot) debe sumarse como variable al modelo ML", status: "TODO", priority: 2 },
      { title: "Tuneo resistencias DIS/INTC", description: "Palancas: lock decline_start + NO_BODY_CROSS_TOL_PCT. Pendiente decision", status: "TODO", priority: 0 },
      { title: "Canales de precio (Track B)", description: "Prototipo visual hecho, zonas en pausa", status: "TODO", priority: 1 },
      { title: "Portfolio tracker con P&L", description: "Vincular movimientos con precios actuales para ver rendimiento", status: "TODO", priority: 1 },
      { title: "Screener con filtros multiples", description: "Filtrar tickers por combinacion de indicadores tecnicos", status: "TODO", priority: 1 },
      { title: "Autenticacion multi-usuario", description: "Actualmente gated por username hardcodeado, migrar a auth real", status: "TODO", priority: 0 },
    ],
  },
  {
    slug: "ai-travel-assistant",
    progress: 3,
    tasks: [
      { title: "Definir MVP y features core", description: "Investigar mercado, definir diferencial, elegir stack", status: "TODO", priority: 2 },
      { title: "Disenar modelo de datos", description: "Viajes, itinerarios, reservas, preferencias del usuario", status: "TODO", priority: 1 },
      { title: "Scaffold proyecto", status: "TODO", priority: 1 },
      { title: "Integracion con APIs de vuelos/hoteles", description: "Evaluar Amadeus, Skyscanner, Booking APIs", status: "TODO", priority: 1 },
      { title: "Motor de recomendaciones IA", description: "Usar contexto de preferencias para sugerir destinos y actividades", status: "TODO", priority: 2 },
      { title: "UI de planificacion de viaje", status: "TODO", priority: 1 },
    ],
  },
  {
    slug: "infofiscal",
    progress: 60,
    tasks: [
      { title: "Backend Flask + SQLite", status: "DONE", priority: 2 },
      { title: "CRUD de clientes y facturas", status: "DONE", priority: 2 },
      { title: "Integracion AFIP WSFEv1", status: "DONE", priority: 2 },
      { title: "Generacion de facturas electronicas", status: "DONE", priority: 2 },
      { title: "Reportes basicos", status: "DONE", priority: 1 },
      { title: "Dashboard contable", status: "DONE", priority: 1 },
      { title: "Migrar de SQLite a PostgreSQL", description: "Para escalar y mejorar concurrencia", status: "TODO", priority: 1 },
      { title: "Modernizar frontend", description: "Actualmente Flask templates, migrar a React o Next.js", status: "TODO", priority: 1 },
      { title: "Modulo de gastos y compras", status: "TODO", priority: 1 },
      { title: "Integracion AFIP WS de consulta CUIT", status: "TODO", priority: 0 },
    ],
  },
  {
    slug: "pawtalk",
    progress: 18,
    tasks: [
      { title: "UI React + Vite scaffold", status: "DONE", priority: 2 },
      { title: "Captura y visualizacion de audio", status: "DONE", priority: 2 },
      { title: "Deteccion basica de ladridos", status: "DONE", priority: 1 },
      { title: "Login y admin dashboard UI", status: "DONE", priority: 1 },
      { title: "Onboarding de perros", status: "DONE", priority: 1 },
      { title: "Separar voz humana de sonido canino", description: "Feature ML: usar voz humana como contexto para estudiar reacciones del perro", status: "TODO", priority: 2 },
      { title: "Backend con base de datos", description: "Actualmente solo frontend, necesita persistencia", status: "TODO", priority: 2 },
      { title: "Modelo ML clasificacion de sonidos caninos", description: "Entrenar modelo para distinguir tipos de ladrido/vocalizacion", status: "TODO", priority: 2 },
      { title: "Sistema de interpretacion", description: "Mapear clasificaciones a emociones/intenciones del perro", status: "TODO", priority: 1 },
      { title: "Historial de sesiones de audio", status: "TODO", priority: 1 },
      { title: "Deploy produccion", status: "TODO", priority: 1 },
    ],
  },
  {
    slug: "baryresto",
    progress: 22,
    tasks: [
      { title: "Scaffold Next.js 14 + Prisma + Auth.js v5", status: "DONE", priority: 2 },
      { title: "Spec MVP completo documentado", status: "DONE", priority: 2 },
      { title: "Seed super-admin y owner demo", status: "DONE", priority: 1 },
      { title: "Modelo de datos multi-tenant", status: "DONE", priority: 2 },
      { title: "Auth multi-rol (super-admin, owner, mozo)", status: "IN_PROGRESS", priority: 2 },
      { title: "Gestion de mesas y layout del salon", status: "TODO", priority: 2 },
      { title: "Carta digital con categorias", description: "Menu con fotos, precios, variantes, disponibilidad", status: "TODO", priority: 2 },
      { title: "Sistema de pedidos (comanda)", description: "Mozo toma pedido en tablet, va a cocina", status: "TODO", priority: 2 },
      { title: "Facturacion y cierre de mesa", status: "TODO", priority: 1 },
      { title: "Dashboard owner con metricas", description: "Ventas diarias, platos mas vendidos, ocupacion", status: "TODO", priority: 1 },
      { title: "Reservas online", status: "TODO", priority: 1 },
      { title: "QR de mesa para carta y pedido", status: "TODO", priority: 0 },
    ],
  },
  {
    slug: "finanzas",
    progress: 82,
    tasks: [
      { title: "Auth NextAuth v5 con credentials", status: "DONE", priority: 2 },
      { title: "Dashboard con graficos por moneda", status: "DONE", priority: 2 },
      { title: "CRUD transacciones (ingresos/gastos)", status: "DONE", priority: 2 },
      { title: "Categorias con colores e iconos", status: "DONE", priority: 1 },
      { title: "Multi-moneda (ARS, USD, EUR, BRL)", status: "DONE", priority: 2 },
      { title: "Cierres mensuales", status: "DONE", priority: 1 },
      { title: "Listas de compras", status: "DONE", priority: 1 },
      { title: "Importar tickets via OCR (Tesseract)", status: "DONE", priority: 1 },
      { title: "Detector de fugas de dinero", status: "DONE", priority: 1 },
      { title: "Deploy VPS produccion", status: "DONE", priority: 2 },
      { title: "Presupuestos mensuales por categoria", description: "Definir limite por categoria y alertar cuando se acerca", status: "TODO", priority: 1 },
      { title: "Metas de ahorro", description: "Definir objetivo y trackear progreso mensual", status: "TODO", priority: 1 },
      { title: "Exportar a Excel/PDF", status: "TODO", priority: 0 },
      { title: "Graficos de tendencia interanual", status: "TODO", priority: 0 },
    ],
  },
  {
    slug: "walletbind",
    progress: 20,
    tasks: [
      { title: "Scaffold NestJS + Prisma", status: "DONE", priority: 2 },
      { title: "Modelo de datos (companies, users, wallets, cards)", status: "DONE", priority: 2 },
      { title: "Auth con roles (admin, operator, viewer)", status: "DONE", priority: 2 },
      { title: "Sistema de ledger doble entrada", status: "DONE", priority: 2 },
      { title: "BIND API client wrapper", status: "DONE", priority: 1 },
      { title: "Obtener credenciales BIND reales", description: "Pendiente contacto con BIND para acceso sandbox/produccion", status: "TODO", priority: 2 },
      { title: "Integracion transferencias CBU/CVU via BIND", description: "Estructura creada, falta testear con credenciales reales", status: "TODO", priority: 2 },
      { title: "Frontend Next.js dashboard", description: "UI para operadores y admins", status: "TODO", priority: 2 },
      { title: "Gestion de tarjetas virtuales", status: "TODO", priority: 1 },
      { title: "Crypto holdings tracking", status: "TODO", priority: 0 },
      { title: "Audit log y compliance", description: "Modelo existe, falta UI y reportes", status: "TODO", priority: 1 },
    ],
  },
]

async function main() {
  for (const pt of projectTasks) {
    const project = await prisma.project.findUnique({ where: { slug: pt.slug } })
    if (!project) {
      console.log(`  Proyecto ${pt.slug} no encontrado, saltando`)
      continue
    }

    await prisma.project.update({
      where: { id: project.id },
      data: { progress: pt.progress },
    })

    const existingTasks = await prisma.projectTask.count({ where: { projectId: project.id } })
    if (existingTasks > 0) {
      console.log(`  ${pt.slug}: ya tiene ${existingTasks} tareas, saltando`)
      continue
    }

    for (let i = 0; i < pt.tasks.length; i++) {
      const task = pt.tasks[i]
      await prisma.projectTask.create({
        data: {
          title: task.title,
          description: task.description || null,
          status: task.status,
          priority: task.priority,
          sortOrder: i,
          projectId: project.id,
          completedAt: task.status === "DONE" ? new Date() : null,
        },
      })
    }

    const done = pt.tasks.filter((t) => t.status === "DONE").length
    console.log(`  ${pt.slug}: ${pt.tasks.length} tareas (${done} done), progreso ${pt.progress}%`)
  }

  console.log("\nSeed de tareas completado!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
