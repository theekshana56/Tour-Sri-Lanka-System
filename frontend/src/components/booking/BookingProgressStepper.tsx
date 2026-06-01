import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Choose Places" },
  { id: 2, label: "Trip Details" },
  { id: 3, label: "Book Now" },
];

export function BookingProgressStepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Booking progress" className="mb-8">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((step, index) => {
          const completed = step.id < currentStep;
          const current = step.id === currentStep;
          const upcoming = step.id > currentStep;

          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition",
                    completed && "bg-emerald-600 text-white",
                    current && "bg-blue-600 text-white ring-4 ring-blue-100",
                    upcoming && "bg-muted text-muted-foreground"
                  )}
                >
                  {completed ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    current && "text-blue-700",
                    completed && "text-emerald-700",
                    upcoming && "text-muted-foreground"
                  )}
                >
                  {step.label}
                  {current && " ←"}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mb-5 hidden h-0.5 w-8 sm:block md:w-16",
                    completed ? "bg-emerald-400" : "bg-muted"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
