import React from 'react';
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

const steps = [
  { key: 'nouveau', label: 'Créé', desc: 'Client' },
  { key: 'assigne', label: 'Assigné', desc: 'Superviseur' },
  { key: 'en_cours', label: 'En cours', desc: 'Technicien' },
  { key: 'resolu', label: 'Résolu', desc: 'Technicien' },
  { key: 'ferme', label: 'Fermé', desc: 'Client/Admin' },
];

const order = ['nouveau', 'assigne', 'en_cours', 'en_attente', 'resolu', 'ferme'];

export default function TicketWorkflow({ status }) {
  const currentIndex = order.indexOf(status);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, i) => {
        const stepIndex = order.indexOf(step.key);
        const isDone = currentIndex >= stepIndex && status !== 'en_attente';
        const isCurrent = step.key === status || (status === 'en_attente' && step.key === 'en_cours');

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all",
                isDone ? "bg-blue-600 border-blue-600" : 
                isCurrent ? "bg-white border-blue-600" : 
                "bg-white border-slate-200"
              )}>
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : (
                  <Circle className={cn("h-3 w-3", isCurrent ? "text-blue-600" : "text-slate-300")} />
                )}
              </div>
              <span className={cn("text-xs mt-1 font-medium", 
                isDone || isCurrent ? "text-blue-700" : "text-slate-400"
              )}>
                {step.label}
              </span>
              <span className="text-xs text-slate-400">{step.desc}</span>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className={cn("h-4 w-4 mb-4 shrink-0", 
                currentIndex > order.indexOf(step.key) ? "text-blue-400" : "text-slate-200"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}