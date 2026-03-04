import React from "react";
import { PROSPECT_STEPS } from "@/lib/prospect-steps";
import { cn } from "@/lib/utils";

// Colors defined here so Tailwind scans them (lib/ is not in content config)
const STEP_COLORS: Record<string, { bg: string; text: string; activeBg: string }> = {
  created:      { bg: "bg-slate-100",   text: "text-slate-600",   activeBg: "bg-slate-500" },
  contacted:    { bg: "bg-orange-100",  text: "text-orange-600",  activeBg: "bg-orange-500" },
  page_viewed:  { bg: "bg-blue-100",    text: "text-blue-600",    activeBg: "bg-blue-500" },
  claimed:      { bg: "bg-green-100",   text: "text-green-600",   activeBg: "bg-green-500" },
  demo_viewed:  { bg: "bg-emerald-100", text: "text-emerald-600", activeBg: "bg-emerald-500" },
  configured:   { bg: "bg-violet-100",  text: "text-violet-600",  activeBg: "bg-violet-500" },
  product_used: { bg: "bg-pink-100",    text: "text-pink-600",    activeBg: "bg-pink-500" },
};

interface ProspectStepperProps {
  currentStep: number;
}

export function ProspectStepper({ currentStep }: ProspectStepperProps) {
  return (
    <div className="flex flex-col gap-1">
      {/* Row 1: circles + lines, aligned on center of circles */}
      <div className="flex items-center gap-1">
        {PROSPECT_STEPS.map((step, i) => {
          const colors = STEP_COLORS[step.key];
          const isDone = i <= currentStep;
          const isCurrent = i === currentStep;
          return (
            <React.Fragment key={step.key}>
              {i > 0 && (
                <div
                  className={cn(
                    "h-0.5 w-4 rounded-full transition-colors sm:w-6",
                    isDone ? colors.activeBg : "bg-slate-200",
                  )}
                />
              )}
              <div
                className={cn(
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isCurrent
                    ? `${colors.activeBg} text-white`
                    : isDone
                    ? `${colors.bg} ${colors.text}`
                    : "bg-slate-100 text-slate-300",
                )}
              >
                {i + 1}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {/* Row 2: labels aligned under each circle */}
      <div className="flex items-start gap-1">
        {PROSPECT_STEPS.map((step, i) => {
          const colors = STEP_COLORS[step.key];
          const isDone = i <= currentStep;
          const isCurrent = i === currentStep;
          return (
            <React.Fragment key={step.key}>
              {i > 0 && <div className="w-4 sm:w-6" />}
              <span
                className={cn(
                  "w-6 text-center text-[8px] font-medium leading-tight",
                  isCurrent ? colors.text : isDone ? "text-slate-500" : "text-slate-300",
                )}
              >
                {step.label}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

interface ProspectStepperGlobalProps {
  stepCounts: number[];
}

export function ProspectStepperGlobal({ stepCounts }: ProspectStepperGlobalProps) {
  return (
    <div className="flex w-full items-center">
      {PROSPECT_STEPS.map((step, i) => {
        const colors = STEP_COLORS[step.key];
        const count = stepCounts[i] ?? 0;
        return (
          <React.Fragment key={step.key}>
            {i > 0 && (
              <div className="h-0.5 flex-1 rounded-full bg-slate-200" />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white",
                  colors.activeBg,
                )}
              >
                {count}
              </div>
              <span className={cn("whitespace-nowrap text-xs font-medium", colors.text)}>
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
