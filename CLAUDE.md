@AGENTS.md

# DevHub - Centro de Comando de Desarrollo (Qngine)

## Stack
- Next.js 16 (App Router) + TypeScript
- Prisma 7 + PostgreSQL (adapter pattern con @prisma/adapter-pg)
- Tailwind CSS v4 + shadcn/ui v4 (@base-ui, NO usa asChild — usar render prop)
- NextAuth v5 beta (Credentials provider, JWT strategy)
- Zod v4 para validaciones

## Comandos
- `npm run dev` — Servidor de desarrollo
- `npx prisma migrate dev` — Migraciones
- `npx prisma db seed` — Seed de datos
- `npx prisma studio` — UI de la base de datos
- `npx next build` — Build de produccion

## Convenciones
- UI en espanol (es-AR)
- DB columns: snake_case (via @map en Prisma)
- TypeScript strict mode
- Route group (app) para paginas autenticadas con layout sidebar
- Desktop-first layout con sidebar colapsable en mobile
- Paleta Qngine: primary #7c5cfc, dark bg #07070f, light bg #f5f5ff
- Fonts: Syne (headings), DM Sans (body)

## Estructura
- `src/app/(app)/` — Paginas autenticadas (dashboard, proyectos, modulos, ideas, configuracion)
- `src/app/login/` — Login (fuera del route group)
- `src/app/api/` — API routes (projects, modules, ideas, search, auth)
- `src/components/` — Componentes (dashboard/, projects/, modules/, layout/, ui/)
- `src/lib/` — Utilidades (prisma, auth, utils, validations)

## Credenciales dev
- Email: albano.f.calegari@gmail.com
- Password: 123456
- DB: postgresql://postgres:postgres@localhost:5432/devhub

## Notas importantes
- shadcn/ui v4 usa @base-ui. NO usar `asChild` prop — usar `render` prop
- Prisma 7: datasource URL NO va en schema.prisma, va en prisma.config.ts
- Select onValueChange puede pasar null — siempre filtrar con `(v) => v && setState(v)`
