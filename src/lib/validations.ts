import { z } from "zod"

export const projectSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Solo minusculas, numeros y guiones"),
  description: z.string().min(1, "Descripcion requerida").max(500),
  status: z.enum(["ACTIVE", "IN_DEVELOPMENT", "PAUSED", "PLANNING", "DONE"]),
  progress: z.number().int().min(0).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color hex invalido"),
  icon: z.string().min(1).max(50),
  stack: z.array(z.string()),
  repoUrl: z.string().url().nullable().optional(),
  prodUrl: z.string().url().nullable().optional(),
  devUrl: z.string().url().nullable().optional(),
  stagingUrl: z.string().url().nullable().optional(),
  brief: z.string().nullable().optional(),
  architecture: z.string().nullable().optional(),
})

export const projectUpdateSchema = projectSchema.partial()

export const credentialSchema = z.object({
  label: z.string().min(1, "Label requerido").max(100),
  category: z.string().min(1).max(50),
  url: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  apiKey: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const taskSchema = z.object({
  title: z.string().min(1, "Titulo requerido").max(200),
  description: z.string().nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.number().int().min(0).max(2),
  sortOrder: z.number().int().optional(),
  category: z.string().max(50).nullable().optional(),
})

export const noteSchema = z.object({
  title: z.string().min(1, "Titulo requerido").max(200),
  content: z.string().min(1, "Contenido requerido"),
  pinned: z.boolean().optional(),
})

export const moduleSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  description: z.string().min(1, "Descripcion requerida").max(500),
  category: z.enum([
    "AUTH", "CRUD", "PAYMENTS", "EMAIL", "FILE_UPLOAD",
    "DATABASE", "DEPLOYMENT", "TESTING", "UI_COMPONENT",
    "INTEGRATION", "OTHER",
  ]),
  content: z.string().min(1),
  stackCompat: z.array(z.string()),
  icon: z.string().min(1).max(50),
})

export const moduleStepSchema = z.object({
  title: z.string().min(1, "Titulo requerido").max(200),
  content: z.string().min(1),
  sortOrder: z.number().int().optional(),
})

export const ideaSchema = z.object({
  title: z.string().min(1, "Titulo requerido").max(200),
  description: z.string().min(1, "Descripcion requerida"),
  status: z.enum(["IDEA", "EVALUATING", "APPROVED", "DISCARDED"]),
  suggestedStack: z.array(z.string()).optional(),
  priority: z.number().int().min(0).max(2).optional(),
  notes: z.string().nullable().optional(),
})

export const clientSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  company: z.string().max(100).nullable().optional(),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]),
  notes: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
})

export const clientPaymentSchema = z.object({
  amount: z.number().positive("Monto debe ser positivo"),
  currency: z.string().min(1).max(5).optional(),
  description: z.string().min(1, "Descripcion requerida").max(300),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]),
  paidAt: z.string().nullable().optional(),
})

export const paymentPlanSchema = z.object({
  title: z.string().min(1, "Titulo requerido").max(200),
  description: z.string().nullable().optional(),
  totalAmount: z.number().positive("Monto debe ser positivo"),
  currency: z.string().min(1).max(5).optional(),
  paymentMethod: z.string().max(50).nullable().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]),
  clientId: z.string().min(1, "Cliente requerido"),
  projectId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const installmentSchema = z.object({
  number: z.number().int().min(1),
  label: z.string().min(1).max(100),
  amount: z.number().positive(),
  dueDate: z.string().min(1, "Fecha requerida"),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]),
  notes: z.string().nullable().optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>
export type CredentialInput = z.infer<typeof credentialSchema>
export type TaskInput = z.infer<typeof taskSchema>
export type NoteInput = z.infer<typeof noteSchema>
export type ModuleInput = z.infer<typeof moduleSchema>
export type ModuleStepInput = z.infer<typeof moduleStepSchema>
export type IdeaInput = z.infer<typeof ideaSchema>
export type ClientInput = z.infer<typeof clientSchema>
export type ClientPaymentInput = z.infer<typeof clientPaymentSchema>
export type PaymentPlanInput = z.infer<typeof paymentPlanSchema>
export type InstallmentInput = z.infer<typeof installmentSchema>
