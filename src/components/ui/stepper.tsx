import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";

interface Step {
    label: string;
    path: string;
    disabled?: boolean;
}

interface StepperProps {
    steps: Step[];
    className?: string; // Allow custom classes
}

export function Stepper({ steps, className }: StepperProps) {
    const location = useLocation();

    return (
        <nav aria-label="Progress" className={cn("w-full overflow-hidden rounded-md bg-muted", className)}>
            <ol role="list" className="flex flex-col sm:flex-row w-full sm:items-stretch">
                {steps.map((step, index) => {
                    // Check if current step matches path
                    const isActive = location.pathname.startsWith(step.path) || location.pathname === step.path;

                    return (
                        <li
                            key={step.path}
                            className={cn(
                                "relative flex-1 group", // Base styles
                                // z-index scaling to ensure overlaps stack correctly (highest index first)
                                "z-[var(--z-index)]",
                            )}
                            style={{ "--z-index": steps.length - index } as React.CSSProperties}
                        >
                            <Link
                                to={step.disabled ? "#" : step.path}
                                onClick={(e) => step.disabled && e.preventDefault()}
                                className={cn(
                                    "relative flex items-center justify-center w-full h-full px-4 py-3 text-sm font-medium transition-colors",

                                    // Desktop Skew Logic
                                    "sm:transform sm:-skew-x-12 sm:border-r sm:border-r-background/20",

                                    // First Item Adjustment: Shift left to create straight edge due to overflow clipping
                                    index === 0 && "sm:-ml-4 sm:pl-8 sm:w-[calc(100%+1rem)]",

                                    // Active State
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:text-foreground",

                                    // Disabled State
                                    step.disabled ? "pointer-events-none opacity-50" : "cursor-pointer",
                                )}
                                aria-current={isActive ? "step" : undefined}
                            >
                                {/* Un-skew text content so it remains upright */}
                                <span className="sm:transform sm:skew-x-12 text-center whitespace-nowrap">
                                    {step.label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
