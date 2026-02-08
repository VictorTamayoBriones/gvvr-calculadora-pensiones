import { AlertCircle, HelpCircle } from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AlertMessageProps {
  message: string
  variant: "error" | "warning" | "info" | "required"
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AlertMessage({ message, variant }: AlertMessageProps) {
  if (variant === "required") {
    return (
      <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
        <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    )
  }

  const variantClasses = {
    error:
      "bg-destructive/10 border-destructive text-destructive",
    warning:
      "bg-amber-50 dark:bg-amber-950/30 border-amber-500 dark:border-amber-500/50 text-amber-900 dark:text-amber-200",
    info:
      "bg-red-50 dark:bg-red-950/30 border-red-500 dark:border-red-500/50 text-red-900 dark:text-red-200",
  }

  return (
    <div
      className={`rounded-lg border p-4 mb-4 flex items-start gap-3 ${variantClasses[variant]}`}
    >
      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
