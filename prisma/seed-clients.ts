import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const user = await prisma.user.findFirst()
  if (!user) { console.log("No hay usuario"); return }

  const existing = await prisma.client.findFirst({ where: { userId: user.id, name: "Branco Myrco" } })
  if (existing) { console.log("Branco Myrco ya existe, saltando"); return }

  const turnit = await prisma.project.findUnique({ where: { slug: "turnit" } })

  const client = await prisma.client.create({
    data: {
      name: "Branco Myrco",
      email: "branco.myrco@gmail.com",
      phone: "+54 11 1234-5678",
      company: "Barberia Branco",
      status: "ACTIVE",
      notes: "Primer cliente. Usa TurnIT para gestion de turnos de su barberia.",
      userId: user.id,
    },
  })

  if (turnit) {
    await prisma.clientProject.create({
      data: { clientId: client.id, projectId: turnit.id },
    })
    console.log("Branco Myrco vinculado a TurnIT")
  }

  await prisma.clientPayment.create({
    data: {
      amount: 50000,
      currency: "ARS",
      description: "Setup inicial TurnIT + configuracion",
      status: "PAID",
      paidAt: new Date("2025-12-01"),
      clientId: client.id,
    },
  })

  await prisma.clientPayment.create({
    data: {
      amount: 15000,
      currency: "ARS",
      description: "Mantenimiento mensual - Enero 2026",
      status: "PAID",
      paidAt: new Date("2026-01-15"),
      clientId: client.id,
    },
  })

  await prisma.clientPayment.create({
    data: {
      amount: 15000,
      currency: "ARS",
      description: "Mantenimiento mensual - Mayo 2026",
      status: "PENDING",
      clientId: client.id,
    },
  })

  console.log("Cliente Branco Myrco creado con 3 pagos")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
