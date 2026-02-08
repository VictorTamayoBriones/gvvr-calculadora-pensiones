import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import type { ChangeEvent } from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FormInputProps {
  id: string
  name: string
  label: string
  value: string
  placeholder?: string
  type?: string
  inputMode?: "text" | "numeric" | "decimal"
  maxLength?: number
  error?: string
  touched?: boolean
  tooltip?: {
    title: string
    items?: string[]
  }
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: ChangeEvent<HTMLInputElement>) => void
  prefix?: string
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function FormInput({
  id,
  name,
  label,
  value,
  placeholder,
  type = "text",
  inputMode = "text",
  maxLength,
  error,
  touched,
  tooltip,
  onChange,
  onBlur,
  prefix,
  className,
}: FormInputProps) {
  const hasError = touched && error

  return (
    <Field data-invalid={hasError ? "true" : undefined}>
      <div className="flex items-center gap-1.5">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="font-medium mb-1">{tooltip.title}</p>
              {tooltip.items && (
                <ul className="text-xs space-y-1 list-disc list-inside">
                  {tooltip.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {prefix ? (
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
            {prefix}
          </span>
          <Input
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            inputMode={inputMode}
            maxLength={maxLength}
            className={`pl-7 ${className || ""}`}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={!!hasError}
          />
        </div>
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          className={className}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={!!hasError}
        />
      )}

      {hasError && <FieldError>{error}</FieldError>}
    </Field>
  )
}
