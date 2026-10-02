import { CalculatorView, calculatorMetadata } from "@/app/(content)/_views/calculator";

export const metadata = calculatorMetadata("en");

export default function Page() {
  return <CalculatorView locale="en" />;
}
