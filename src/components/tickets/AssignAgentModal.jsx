import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Check, UserPlus } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function AssignAgentsModal({ open, onClose, ticket, onSuccess }) {
  const [selected, setSelected] = useState(ticket?.assigned_agents || []);
  const [saving, setSaving] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const agents = users.filter(u => 
    (u.role === 'technicien' || u.role === 'superviseur') && 
    u.department === 'informatique'
  );

  const toggle = (email) => {
    setSelected(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email) 
        : [...prev, email]
    );
  };

  const handleAssign = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    await base44.entities.Ticket.update(ticket.id, {
      assigned_agents: selected,
      assigned_to: selected[0],
      status: 'assigne',
      supervisor_email: ticket.supervisor_email,
    });
    setSaving(false);
    onSuccess();
    onClose();
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Assigner des agents
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 mb-1">
          <p className="text-sm text-slate-500">Ticket : <span className="font-medium text-slate-800">{ticket?.title}</span></p>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {agents.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              Aucun technicien disponible dans le département IT
            </p>
          ) : (
            agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => toggle(agent.email)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                  selected.includes(agent.email)
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={cn(
                    "text-white text-sm",
                    selected.includes(agent.email) ? "bg-blue-600" : "bg-slate-400"
                  )}>
                    {getInitials(agent.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">{agent.full_name || agent.email}</p>
                  <p className="text-xs text-slate-500 capitalize">{agent.role}</p>
                </div>
                {selected.includes(agent.email) && (
                  <Check className="h-5 w-5 text-blue-600 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t">
            <span className="text-xs text-slate-500">{selected.length} sélectionné(s)</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleAssign} disabled={saving || selected.length === 0} className="bg-blue-600 hover:bg-blue-700">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assigner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}