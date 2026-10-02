import { CalculatorView, calculatorMetadata } from "@/app/(content)/_views/calculator";

export const metadata = calculatorMetadata("es");

export default function Page() {
  return <CalculatorView locale="es" />;
}
