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

## Path Alias

A single alias is configured in `vite.config.ts` and both tsconfig files:

| Alias | Resolves to |
|-------|-------------|
| `@/`  | `./src/`    |

All imports across the app use `@/`. There are no barrel files.

## Architecture

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · Radix UI · React Router v7

### App shell and routing (`src/App.tsx` → `src/routes/AppRoutes.tsx`)

`App.tsx` wraps the router in `AuthProvider` (see Auth below). All route definitions live in `AppRoutes.tsx` using React Router v7 layout routes:

```
<Routes>
  /login          → Login (public)
  (pathless)      → PrivateRoute (auth guard)
    (pathless)    → PrivateLayout (shared sidebar shell)
      /dashboard  → Dashboard (page content only)
```

- **PrivateRoute** (`src/guards/PrivateRoute.tsx`) — reads `useAuth().user`. Redirects to `/login` if null, otherwise renders `<Outlet />`.
- **PrivateLayout** (`src/layouts/PrivateLayout.tsx`) — renders `SidebarProvider` + `AppSidebar` + `SidebarInset` with a header (SidebarTrigger) and a content area wrapping `<Outlet />`.
- Adding a new private page = one `<Route>` child under PrivateLayout. The sidebar, header, and auth guard come for free.

### Auth (`src/contexts/AuthContext.tsx`)

`AuthProvider` is the single source of truth for session state. It hydrates from `sessionStorage` on mount and exposes `{ user, login, logout }`. No component touches `sessionStorage` directly — everything goes through `useAuth()`.

- `login(username)` → writes sessionStorage + sets state
- `logout()` → clears sessionStorage + sets state to null
- `useAuth()` throws if called outside the provider tree (dev safety net)

### Page layout convention (`src/pages/`)

```
pages/
├── public/
│   └── Login/
│       ├── Login.tsx         # presentational page
│       └── useLogin.ts       # page-level hook (form state + calls useAuth)
└── private/
    └── Dashboard/
        └── Dashboard.tsx     # content only — no layout wrapper needed
```

Each page is a simple component that renders its own content (including its `<h1>` title). Layout chrome (sidebar, header, trigger) is provided by `PrivateLayout`. Pages that need local logic use a co-located custom hook (e.g. `useLogin.ts`).

### Shared components (`src/components/`)

- `AppSidebar.tsx` — the app sidebar. Nav items use React Router `<Link>` (no full-page reloads). Logout calls `useAuth().logout()`. The `menuItems` array is static at module scope.
- `ui/` — shadcn primitives. Do not hand-edit unless fixing a confirmed bug. Add new components with `npx shadcn add <name>`.

**Known pattern in shadcn components:** Components that support `asChild` delegate to Radix `Slot`. `sidebar.tsx` imports `Slot` from `@radix-ui/react-slot` (not the `radix-ui` barrel). The barrel import gives a namespace object, not the component — other shadcn files that need Slot should follow the same direct-import pattern.

### Styling

Tailwind v4 with CSS-variable theming in `src/index.css`. The `@theme inline` block maps custom properties to Tailwind color tokens. Dark mode via `.dark` class. No `tailwind.config.*` file — all config is inline.

### Sidebar system

`SidebarProvider` lives in `PrivateLayout`. `<Sidebar>` and `<SidebarInset>` are siblings inside the provider's wrapper div. The sidebar collapses to an icon rail on desktop and renders in a `Sheet` (slide-over) on mobile. The rail uses `group-data-[...]` Tailwind modifiers to inherit state from the parent `group peer` wrapper.
