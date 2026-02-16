import { getAdminConfig } from "@/contexts/AdminConfigContext"

export const COSTO_GESTORIA = 18000;

export function getCostoGestoria(): number {
  return getAdminConfig().costoGestoria
}
