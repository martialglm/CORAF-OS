import React from 'react';
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm font-medium",
              trendUp ? "text-emerald-600" : "text-rose-600"
            )}>
              <span>{trendUp ? '↑' : '↓'} {trend}</span>
              <span className="text-slate-400">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}