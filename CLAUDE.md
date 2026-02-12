# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev            # Start dev server (Vite)
bun build          # Type-check (tsc -b) + production build
bun lint           # ESLint
bun preview        # Preview production build
```

TypeScript is strict (`noUnusedLocals`, `noUnusedParameters` enabled). `tsc -b` is run as part of `bun build` — any unused imports or variables will fail the build.

## Path Aliases

Configured in `vite.config.ts` and both tsconfig files:

| Alias          | Resolves to              |
|----------------|--------------------------|
| `@/`           | `./src/`                 |
| `@PublicPages` | `./src/pages/public`     |
| `@PrivatePages`| `./src/pages/private`    |

All imports across the app use `@/`. There are no barrel files at the top level.

## Architecture

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · Radix UI · React Router v7

### App shell and routing (`src/App.tsx` → `src/routes/AppRoutes.tsx`)

`App.tsx` wraps the router in `AuthProvider` and `CalculatorProvider`. All route definitions live in `AppRoutes.tsx` using React Router v7 layout routes:

```
<Routes>
  /                           → Login (public, duplicate)
  /login                      → Login (public)
  (pathless)                  → PrivateRoute (auth guard)
    (pathless)                → PrivateLayout (shared sidebar shell)
      /dashboard              → Dashboard
      /calculadora            → Calculator (stepper)
        /datosGenerales       → GeneralData (main form)
        /cotizacion           → Cotizacion (RequireCalculatorData)
        /InformeCostoMensual  → InformeCostoMensual (RequireCalculatorData)
```

- **PrivateRoute** (`src/guards/PrivateRoute.tsx`) — reads `useAuth().user`. Redirects to `/login` if null.
- **RequireCalculatorData** (`src/guards/RequireCalculatorData.tsx`) — checks `isDataPersisted`. Redirects to `/calculadora/datosGenerales` if no data.
- **PrivateLayout** (`src/layouts/PrivateLayout.tsx`) — renders `SidebarProvider` + `AppSidebar` + `SidebarInset` with a header (SidebarTrigger) and a content area wrapping `<Outlet />`.
- Adding a new private page = one `<Route>` child under PrivateLayout. The sidebar, header, and auth guard come for free.

### Auth (`src/contexts/AuthContext.tsx`)

`AuthProvider` is the single source of truth for session state. It hydrates from `sessionStorage` on mount and exposes `{ user, login, logout }`. No component touches `sessionStorage` directly — everything goes through `useAuth()`.

- `login(username)` → writes sessionStorage + sets state
- `logout()` → clears sessionStorage + sets state to null
- `useAuth()` throws if called outside the provider tree (dev safety net)

### Calculator State (`src/contexts/CalculatorContext.tsx`)

`CalculatorProvider` manages the general data form state. Persists to `sessionStorage` with versioning (`v1`).

Exposes: `{ generalData, setGeneralData, updateGeneralData, clearData, isDataPersisted }`

- `updateGeneralData(partial)` — merges partial updates into current state
- `isDataPersisted` — derived boolean used by `RequireCalculatorData` guard
- Data is stored as: `{ version: "v1", data: GeneralDataForm, timestamp: number }`

### Page layout convention (`src/pages/`)

```
pages/
├── public/
│   └── Login/
│       ├── Login.tsx          # presentational page
│       └── useLogin.ts        # page-level hook (form state + calls useAuth)
└── private/
    ├── Dashboard/
    │   └── Dashboard.tsx
    └── Calculator/
        ├── Calculator.tsx     # stepper shell
        └── Components/
            ├── GenralData/    # see below
            ├── Cotizacion/
            └── InformeCostoMensual/
```

Each page is a simple component that renders its own content. Layout chrome is provided by `PrivateLayout`. Pages that need local logic use a co-located custom hook.

### Calculator Components — GenralData

The most developed module. Follows a **layered architecture** with high cohesion and low coupling:

```
GenralData/
├── GeneralData.tsx              # Orchestrator component (form shell + submit)
├── useGeneralData.ts            # Orchestrator hook (validation coordination + navigation)
├── constants.ts                 # Business rules & domain constants
├── validators.ts                # Pure field validator functions
├── components/
│   ├── DatosPersonalesSection.tsx   # Section: personal data fields
│   ├── ModalidadSection.tsx         # Section: financing modality selector
│   ├── AnalisisFinancieroSection.tsx# Section: financial analysis display
│   ├── FormInput.tsx                # Reusable input with validation display
│   ├── AlertMessage.tsx             # Alert variants (error/warning/info/required)
│   ├── ModalidadSelector.tsx        # Select with tooltips and descriptions
│   ├── ResumenFinanciero.tsx        # Financial summary table
│   ├── EstadoFinanciamiento.tsx     # Financing status badge
│   ├── AccionRequerida.tsx          # Action required message
│   ├── DetalleCalculoPrestamo.tsx   # Loan calculation breakdown
│   ├── useDatosPersonales.ts        # Hook: personal data logic + auto-calculations
│   ├── useModalidad.ts              # Hook: modality selection logic
│   ├── useAnalisisFinanciero.ts     # Hook: memoized financial results
│   └── index.ts                     # Barrel export
├── hooks/
│   ├── useAutoCalculatedFields.ts   # 5 hooks for derived field calculations
│   └── useAutoUpdateModalidad.ts    # Hook: auto-updates modality on option change
└── utils/
    ├── financialCalculations.ts     # Pure functions: loan, total, sufficiency
    ├── modalidadCalculations.ts     # Pure functions: available modalities logic
    └── dateCalculations.ts          # Pure functions: age, dates from CURP
```

**Data flow pattern:** `GeneralData` (orchestrator) → passes `onChange(field, value)` callbacks down → sections emit changes up → `useGeneralData` calls `updateGeneralData` on the context. Sections register their `validate()` functions via `onValidationReady` callbacks so the parent can trigger full-form validation on submit.

### Calculator Components — InformeCostoMensual

The monthly cost report module. Follows the same layered pattern as GenralData:

```
InformeCostoMensual/
├── InformeCostoMensual.tsx        # Orchestrator component (report layout)
├── useInformeCostoMensual.ts      # Orchestrator hook (validations + date handlers)
├── style.css                      # Custom CSS (exception to Tailwind-only pattern)
├── calculoMontoPension.ts         # Pure functions: pension amount from age/year lookup
├── tablaPensiones.ts              # Pension amounts table (TABLA_PENSIONES[year][age])
├── lineaTiempoRetoma.ts           # Pure functions: RETOMA payment timeline generation
└── components/
    ├── InformacionAsesor.tsx       # Section: advisor info (read-only)
    ├── InformacionCliente.tsx      # Section: client data + vigencia status
    ├── VigenciaDerechosInfo.tsx    # Vigencia de derechos display
    ├── InformacionContrato.tsx     # Section: contract dates (editable)
    ├── PeriodoEjercicio.tsx        # Section: exercise period display
    ├── DatosPension.tsx           # Section: pension amount calculation display
    ├── PresupuestoInicial.tsx      # Section: initial budget + loan input
    ├── Modalidades.tsx            # Section: modality-specific payment tables
    ├── ValidationMessages.tsx      # Reusable validation message renderer
    └── index.ts                    # Barrel export
```

**Key business logic files:**
- `tablaPensiones.ts` — `TABLA_PENSIONES[year][age]` lookup table (ages 60–83, years 2023–2027). Updated periodically with official IMSS pension amounts.
- `calculoMontoPension.ts` — calculates pension amount: `edadAlPensionarse = edadActual + añosAdicionales(fechaInicio, fechaFin)`, then looks up `TABLA_PENSIONES[añoPension][edadAlPensionarse]`.
- `lineaTiempoRetoma.ts` — generates RETOMA payment schedules (14–18 months). First month has a special price based on current date; subsequent months use year-based pricing from `PRECIOS_ANUALES`. Adds gestoría (fixed $18,000 for 14-month contracts, variable otherwise).

**`useInformeCostoMensual` orchestrates three validation groups** (all memoized): `validacionesCliente` (age/weeks requirements), `validacionesContrato` (date coherence, minimum 14 months), `validacionesPresupuesto` (budget sufficiency per modality). Each returns `{ errores, advertencias, info }`.

### Helpers (`src/helpers/`)

- `verifyCURP.ts` — CURP format validation
- `extractBirthdateFromCURP.ts` — extracts birthdate from CURP characters
- `formatText.ts` — `addComa()` for Mexican number formatting (thousands separator)

### Global Constants (`src/constants.ts`)

App-wide constants like `COSTO_GESTORIA` ($18,000). Module-specific constants live in their own `constants.ts` files (e.g., `GenralData/constants.ts` for modalities).

### Models (`src/models/calculator.types.ts`)

```typescript
type Modalidad =
  | "FINANCIADO 1"
  | "FINANCIADO 100"
  | "REACTIVA TRADICIONAL"
  | "REACTIVA FINANCIADO 100"

interface GeneralDataForm {
  nombreAsesor, nombreCliente, nss, curp, semanasCotizadas,
  fechaBaja, saldoAfore, fechaInicioContrato, modalidad,
  fechaNacimiento, edad, leyAplicable, sinVigenciaDerechos,
  fechaFirmaContrato, fechaFinContrato, totalMeses,
  semanasAlFinal, prestamoFinanciero, montoTotalInvertir
}
```

`Modalidad` is defined in `GenralData/constants.ts` and re-exported from `@/models`.

### Shared components (`src/components/`)

- `AppSidebar.tsx` — the app sidebar. Nav items use React Router `<Link>` (no full-page reloads). Logout calls `useAuth().logout()`. The `menuItems` array is static at module scope.
- `ui/` — shadcn primitives. Do not hand-edit unless fixing a confirmed bug. Add new components with `npx shadcn add <name>`.

**Known pattern in shadcn components:** Components that support `asChild` delegate to Radix `Slot`. `sidebar.tsx` imports `Slot` from `@radix-ui/react-slot` (not the `radix-ui` barrel). The barrel import gives a namespace object, not the component — other shadcn files that need Slot should follow the same direct-import pattern.

### Styling

Tailwind v4 with CSS-variable theming in `src/index.css`. The `@theme inline` block maps custom properties to Tailwind color tokens. Dark mode via `.dark` class. No `tailwind.config.*` file — all config is inline.

**Exception:** `InformeCostoMensual/style.css` uses custom CSS for print-oriented report layout. New calculator modules should prefer Tailwind classes.

### Sidebar system

`SidebarProvider` lives in `PrivateLayout`. `<Sidebar>` and `<SidebarInset>` are siblings inside the provider's wrapper div. The sidebar collapses to an icon rail on desktop and renders in a `Sheet` (slide-over) on mobile. The rail uses `group-data-[...]` Tailwind modifiers to inherit state from the parent `group peer` wrapper.

## Business Logic Documentation

All business rules and domain documentation live in `docs/`. Key files:

| File | Content |
|------|---------|
| `docs/reglas_negocio_datos_generales.md` | General data validation rules |
| `docs/reglas_combo_modalidad.md` | Modality selector rules |
| `docs/reglas-modalidad-C17.md` | C17 modality rules |
| `docs/calculo_k25_completo.md` | K25 pension reference value |
| `docs/prestamo_financiero_completo.md` | Loan calculation rules |
| `docs/reglas-linea-tiempo-retoma.md` | Timeline calculation rules |
| `docs/REGLAS_NEGOCIO_CLIENTE.md` | Client validation rules |
| `docs/REGLAS_NEGOCIO_CONTRATO.md` | Contract rules |
| `docs/REGLAS_NEGOCIO_PRESUPUESTO.md` | Budget rules |
| `docs/IMPLEMENTACION_PRESUPUESTO.md` | Budget implementation details |
| `docs/REGLAS_VALIDACIONES_FLUJOS_MONTO_PENSION.md` | Pension amount validation flows |
| `docs/CALCULO_GESTORIA.md` | Gestoría fee calculation rules |
| `docs/documentacion_tecnica_datos_generales.md` | Technical docs for general data |
| `docs/analisis-tecnico-migracion-f100.md` | F100 migration analysis |
