import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from 'lucide-react';
import moment from 'moment';
import { cn } from "@/lib/utils";

const priorityColors = {
  critique: "bg-red-100 text-red-700",
  haute: "bg-orange-100 text-orange-700",
  moyenne: "bg-yellow-100 text-yellow-700",
  basse: "bg-slate-100 text-slate-700",
};

const statusColors = {
  nouveau: "bg-blue-100 text-blue-700",
  en_cours: "bg-violet-100 text-violet-700",
  en_attente: "bg-amber-100 text-amber-700",
  resolu: "bg-emerald-100 text-emerald-700",
  ferme: "bg-slate-100 text-slate-700",
};

export default function RecentTickets({ tickets = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Tickets récents</h3>
        <Link 
          to={createPageUrl('Tickets')}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Voir tout <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {tickets.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500">
            Aucun ticket récent
          </div>
        ) : (
          tickets.slice(0, 5).map((ticket) => (
            <div key={ticket.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{ticket.reference}</span>
                    <Badge className={cn("text-xs", priorityColors[ticket.priority])}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mt-1 truncate">{ticket.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    {moment(ticket.created_date).fromNow()}
                    <span>•</span>
                    <span>{ticket.requester_name}</span>
                  </div>
                </div>
                <Badge className={cn("shrink-0", statusColors[ticket.status])}>
                  {ticket.status?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}