import { Outlet } from "react-router";
import { useCalculator } from "@/contexts/CalculatorContext";
import { Stepper } from "@/components/ui/stepper";

function CalculatorStepper() {
  const { isDataPersisted } = useCalculator();

  const steps = [
    {
      label: "Datos Generales",
      path: "/calculadora/datosGenerales",
      disabled: false
    },
    {
      label: "Informe Costo Mensual",
      path: "/calculadora/InformeCostoMensual",
      disabled: !isDataPersisted
    },
    {
      label: "Cotización",
      path: "/calculadora/cotizacion",
      disabled: !isDataPersisted
    }
  ];

  return (
    <div className="w-full mb-8 flex justify-center">
      <div className="w-full max-w-4xl">
        <Stepper steps={steps} />
      </div>
    </div>
  );
}

export default function Calculator() {
  return (
    <>
      <CalculatorStepper />
      <Outlet />
    </>
  )
}
