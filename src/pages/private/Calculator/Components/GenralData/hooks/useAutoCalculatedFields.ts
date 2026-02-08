import { useEffect } from "react"
import type { GeneralDataForm } from "@/models"
import {
  extraerDatosNacimientoDesdeCURP,
  calcularSinVigenciaDerechos,
  calcularLeyAplicable,
  calcularFechaInicioContrato,
  calcularDatosFinContrato,
} from "../utils/dateCalculations"

// ---------------------------------------------------------------------------
// Hook: Auto-calculate edad and fechaNacimiento from CURP
// ---------------------------------------------------------------------------
export function useAutoCalcularEdadYFechaNacimiento(
  curp: string,
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void
) {
  useEffect(() => {
    const datos = extraerDatosNacimientoDesdeCURP(curp)

    if (!datos) {
      // Limpiar campos si CURP es inválido
      if (generalData.fechaNacimiento || generalData.edad) {
        setGeneralData({ ...generalData, fechaNacimiento: "", edad: "" })
      }
      return
    }

    // Actualizar solo si los valores han cambiado
    if (
      generalData.fechaNacimiento !== datos.fechaNacimiento ||
      generalData.edad !== datos.edad
    ) {
      setGeneralData({
        ...generalData,
        fechaNacimiento: datos.fechaNacimiento,
        edad: datos.edad,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curp])
}

// ---------------------------------------------------------------------------
// Hook: Auto-calculate sinVigenciaDerechos from fechaBaja
// ---------------------------------------------------------------------------
export function useAutoCalcularSinVigenciaDerechos(
  fechaBaja: string,
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void
) {
  useEffect(() => {
    const sinVigencia = calcularSinVigenciaDerechos(fechaBaja)

    if (sinVigencia === null) {
      // Limpiar campo si no hay fecha de baja
      if (generalData.sinVigenciaDerechos) {
        setGeneralData({ ...generalData, sinVigenciaDerechos: "" })
      }
      return
    }

    // Actualizar solo si el valor ha cambiado
    if (generalData.sinVigenciaDerechos !== sinVigencia) {
      setGeneralData({ ...generalData, sinVigenciaDerechos: sinVigencia })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaBaja])
}

// ---------------------------------------------------------------------------
// Hook: Auto-calculate leyAplicable
// ---------------------------------------------------------------------------
export function useAutoCalcularLeyAplicable(
  fechaNacimiento: string,
  semanasCotizadas: string,
  fechaBaja: string,
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void
) {
  useEffect(() => {
    const semanas = Number(semanasCotizadas) || 0
    const ley = calcularLeyAplicable(fechaNacimiento, semanas, fechaBaja)

    if (ley === null) {
      // Limpiar campo si faltan datos
      if (generalData.leyAplicable) {
        setGeneralData({ ...generalData, leyAplicable: "" })
      }
      return
    }

    // Actualizar solo si el valor ha cambiado
    if (generalData.leyAplicable !== ley) {
      setGeneralData({ ...generalData, leyAplicable: ley })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaNacimiento, semanasCotizadas, fechaBaja])
}

// ---------------------------------------------------------------------------
// Hook: Auto-calculate fechaInicioContrato from fechaFirmaContrato
// ---------------------------------------------------------------------------
export function useAutoCalcularFechaInicioContrato(
  fechaFirmaContrato: string,
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void
) {
  useEffect(() => {
    const fechaInicio = calcularFechaInicioContrato(fechaFirmaContrato)

    if (fechaInicio === null) {
      // Limpiar campo si no hay fecha de firma
      if (generalData.fechaInicioContrato) {
        setGeneralData({ ...generalData, fechaInicioContrato: "" })
      }
      return
    }

    // Actualizar solo si el valor ha cambiado
    if (generalData.fechaInicioContrato !== fechaInicio) {
      setGeneralData({ ...generalData, fechaInicioContrato: fechaInicio })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaFirmaContrato])
}

// ---------------------------------------------------------------------------
// Hook: Auto-calculate fechaFinContrato and semanasAlFinal
// ---------------------------------------------------------------------------
export function useAutoCalcularDatosFinContrato(
  fechaInicioContrato: string,
  totalMeses: string,
  semanasCotizadas: string,
  generalData: GeneralDataForm,
  setGeneralData: (data: GeneralDataForm) => void
) {
  useEffect(() => {
    const meses = Number(totalMeses) || 0
    const semanasIniciales = Number(semanasCotizadas) || 0

    const datos = calcularDatosFinContrato(fechaInicioContrato, meses, semanasIniciales)

    if (datos === null) {
      // Limpiar campos si faltan datos
      if (generalData.fechaFinContrato || generalData.semanasAlFinal) {
        setGeneralData({
          ...generalData,
          fechaFinContrato: "",
          semanasAlFinal: "",
        })
      }
      return
    }

    // Actualizar solo si los valores han cambiado
    if (
      generalData.fechaFinContrato !== datos.fechaFin ||
      generalData.semanasAlFinal !== String(datos.semanasFinales)
    ) {
      setGeneralData({
        ...generalData,
        fechaFinContrato: datos.fechaFin,
        semanasAlFinal: String(datos.semanasFinales),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaInicioContrato, totalMeses, semanasCotizadas])
}
