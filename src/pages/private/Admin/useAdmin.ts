import { useState, useCallback } from "react"
import { useAdminConfig, type AdminConfig, type ConfigSection } from "@/contexts/AdminConfigContext"

export function useAdmin() {
  const { config, updateConfig, resetSection } = useAdminConfig()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    validaciones: true,
    calculosPrestamo: false,
    costosGestoria: false,
    preciosAnuales: false,
    preciosPrimerMes: false,
    tablaPensiones: false,
  })

  const toggleSection = useCallback((section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }, [])

  const handleSave = useCallback(
    (_section: ConfigSection, values: Partial<AdminConfig>) => {
      updateConfig(values)
    },
    [updateConfig]
  )

  const handleReset = useCallback(
    (section: ConfigSection) => {
      resetSection(section)
    },
    [resetSection]
  )

  return {
    config,
    openSections,
    toggleSection,
    handleSave,
    handleReset,
  }
}
