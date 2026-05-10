import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { hash } from "bcryptjs"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await hash("123456", 12)

  const user = await prisma.user.upsert({
    where: { email: "albano.f.calegari@gmail.com" },
    update: {},
    create: {
      email: "albano.f.calegari@gmail.com",
      password: hashedPassword,
      name: "Albano Calegari",
    },
  })

  const projects = [
    {
      name: "TurnIT",
      slug: "turnit",
      description: "SaaS de gestion de turnos multi-tenant y multi-rubro",
      status: "ACTIVE" as const,
      progress: 40,
      color: "#3B82F6",
      icon: "calendar-clock",
      stack: ["NestJS", "Next.js", "Prisma", "SQL Server", "TypeScript"],
      prodUrl: "http://31.97.167.30:8080/",
      devUrl: "http://localhost:3000",
    },
    {
      name: "trading-assist",
      slug: "trading-assist",
      description: "Plataforma de analisis tecnico + Machine Learning para trading",
      status: "ACTIVE" as const,
      progress: 55,
      color: "#22C55E",
      icon: "trending-up",
      stack: ["Python", "FastAPI", "React", "LightGBM", "PostgreSQL"],
      prodUrl: "http://31.97.167.30:5000/",
    },
    {
      name: "ai-travel-assistant",
      slug: "ai-travel-assistant",
      description: "Asistente de viajes inteligente con IA",
      status: "PLANNING" as const,
      progress: 5,
      color: "#F97316",
      icon: "plane",
      stack: ["TBD"],
    },
    {
      name: "InfoFiscal",
      slug: "infofiscal",
      description: "Sistema contable con integracion AFIP WSFEv1",
      status: "PAUSED" as const,
      progress: 60,
      color: "#64748B",
      icon: "file-text",
      stack: ["Python", "Flask", "SQLite", "AFIP WS"],
    },
    {
      name: "PawTalk",
      slug: "pawtalk",
      description: "Comunicacion canina con Machine Learning y analisis de audio",
      status: "ACTIVE" as const,
      progress: 15,
      color: "#EAB308",
      icon: "dog",
      stack: ["React", "Vite", "TypeScript", "ML", "Audio API"],
      prodUrl: "https://pawtalk.com.ar",
    },
    {
      name: "barYResto",
      slug: "baryresto",
      description: "SaaS para gestion integral de bares y restaurantes",
      status: "ACTIVE" as const,
      progress: 20,
      color: "#EF4444",
      icon: "utensils",
      stack: ["Next.js 14", "Prisma", "Auth.js v5", "PostgreSQL"],
    },
    {
      name: "Finanzas",
      slug: "finanzas",
      description: "Control de finanzas personales multi-moneda con dashboard y graficos",
      status: "ACTIVE" as const,
      progress: 75,
      color: "#7C5CFC",
      icon: "wallet",
      stack: ["Next.js 16", "Prisma 7", "PostgreSQL", "NextAuth v5", "shadcn v4"],
      devUrl: "http://localhost:3000",
      prodUrl: "http://31.97.167.30:3002/",
    },
    {
      name: "walletBIND",
      slug: "walletbind",
      description: "Billetera corporativa digital con integracion BIND PSP",
      status: "ACTIVE" as const,
      progress: 20,
      color: "#06B6D4",
      icon: "credit-card",
      stack: ["NestJS", "Prisma", "Next.js", "TypeScript", "BIND API"],
    },
  ]

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: {
        ...project,
        stack: project.stack,
        userId: user.id,
      },
    })
  }

  const modules = [
    {
      name: "Auth NextAuth v5",
      description: "Autenticacion completa con Credentials provider y JWT",
      category: "AUTH" as const,
      icon: "shield",
      stackCompat: ["Next.js", "NextAuth v5", "Prisma", "bcryptjs"],
      content: `## Setup

1. Instalar: next-auth@beta bcryptjs @types/bcryptjs
2. Crear lib/auth.ts con Credentials provider
3. Crear lib/auth-types.ts para extender Session y JWT
4. Crear middleware.ts para proteger rutas
5. Crear app/api/auth/[...nextauth]/route.ts
6. Crear app/login/page.tsx
7. Crear components/providers.tsx con SessionProvider

## Patron de auth en API routes

const session = await auth()
if (!session?.user) return Response.json({ error: "No autorizado" }, { status: 401 })`,
    },
    {
      name: "CRUD Generico con Prisma",
      description: "Patron ABM completo con validacion Zod y API routes",
      category: "CRUD" as const,
      icon: "database",
      stackCompat: ["Next.js", "Prisma", "Zod", "TypeScript"],
      content: `## Estructura

- prisma/schema.prisma: modelo con UUID, timestamps, @map
- src/lib/validations.ts: schema Zod para create/update
- src/app/api/[recurso]/route.ts: GET (list) + POST (create)
- src/app/api/[recurso]/[id]/route.ts: GET + PUT + DELETE

## Patron API

1. Verificar auth con auth()
2. Validar body con schema.safeParse()
3. Ejecutar query Prisma
4. Retornar Response.json()`,
    },
    {
      name: "Cobros Mercado Pago",
      description: "Integracion de pagos con Mercado Pago Checkout Pro y webhooks",
      category: "PAYMENTS" as const,
      icon: "credit-card",
      stackCompat: ["Next.js", "NestJS", "Mercado Pago SDK"],
      content: `## Componentes

- SDK: mercadopago (npm)
- Checkout Pro: crear preferencia con items
- Webhook: endpoint POST para notificaciones IPN
- Estados: approved, pending, rejected

## Flujo

1. Frontend solicita checkout
2. Backend crea preferencia MP
3. Redirigir usuario a init_point
4. MP notifica via webhook
5. Backend actualiza estado de pago`,
    },
  ]

  for (const mod of modules) {
    await prisma.devModule.upsert({
      where: { name: mod.name },
      update: {},
      create: {
        ...mod,
        stackCompat: mod.stackCompat,
        userId: user.id,
      },
    })
  }

  console.log("Seed completado:")
  console.log(`  - Usuario: ${user.email}`)
  console.log(`  - Proyectos: ${projects.length}`)
  console.log(`  - Modulos: ${modules.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
