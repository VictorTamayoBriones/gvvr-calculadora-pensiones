import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { cn } from "@/lib/utils"

interface FirstOfMonthPickerProps {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    error?: string
    className?: string
}

const MONTHS = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
]

export function FirstOfMonthPicker({
    id,
    label,
    value,
    onChange,
    error,
    className,
}: FirstOfMonthPickerProps) {
    // Parse initial value
    const [year, month] = React.useMemo(() => {
        if (!value) return ["", ""]
        const parts = value.split("-")
        if (parts.length < 2) return ["", ""]
        return [parts[0], parts[1]]
    }, [value])

    // Generate years: Current Year - 1, Current Year, Current Year + 1
    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear()
        const start = currentYear - 1
        const end = currentYear + 1
        const arr = []

        // Order: Next Year -> Current Year -> Prev Year (descending)
        for (let i = end; i >= start; i--) {
            arr.push(String(i))
        }
        return arr
    }, [])

    const handleMonthChange = (newMonth: string) => {
        const currentYear = year || new Date().getFullYear().toString()
        onChange(`${currentYear}-${newMonth}-01`)
    }

    const handleYearChange = (newYear: string) => {
        const currentMonth = month || "01"
        onChange(`${newYear}-${currentMonth}-01`)
    }

    return (
        <Field data-invalid={!!error}>
            <FieldLabel htmlFor={`${id}-month`}>{label}</FieldLabel>
            <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
                <Select value={month} onValueChange={handleMonthChange}>
                    <SelectTrigger id={`${id}-month`} className="w-full">
                        <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                        {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                                {m.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={year} onValueChange={handleYearChange}>
                    <SelectTrigger id={`${id}-year`} className="w-full sm:w-32 shrink-0">
                        <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((y) => (
                            <SelectItem key={y} value={y}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {error && <FieldError>{error}</FieldError>}
        </Field>
    )
}
