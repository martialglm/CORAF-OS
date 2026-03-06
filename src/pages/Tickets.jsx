import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Eye, Pencil, Trash2, Clock, UserPlus, ShieldAlert } from 'lucide-react';
import { cn } from "@/lib/utils";
import moment from 'moment';
import TicketForm from '@/components/tickets/TicketForm';
import TicketDetails from '@/components/tickets/TicketDetails';
import AssignAgentsModal from '@/components/tickets/AssignAgentsModal';
import { useCurrentUser } from '@/components/common/useCurrentUser';
import { Skeleton } from "@/components/ui/skeleton";

const priorityColors = {
  critique: "bg-red-100 text-red-700 border-red-200",
  haute: "bg-orange-100 text-orange-700 border-orange-200",
  moyenne: "bg-yellow-100 text-yellow-700 border-yellow-200",
  basse: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusColors = {
  nouveau: "bg-blue-100 text-blue-700",
  assigne: "bg-violet-100 text-violet-700",
  en_cours: "bg-indigo-100 text-indigo-700",
  en_attente: "bg-amber-100 text-amber-700",
  resolu: "bg-emerald-100 text-emerald-700",
  ferme: "bg-slate-100 text-slate-700",
};

const statusLabels = {
  nouveau: 'Nouveau',
  assigne: 'Assigné',
  en_cours: 'En cours',
  en_attente: 'En attente',
  resolu: 'Résolu',
  ferme: 'Fermé',
};

const typeLabels = {
  incident: 'Incident', demande: 'Demande', probleme: 'Problème', changement: 'Changement',
};

export default function Tickets() {
  const { user, isAdmin, isSuperviseur, isTechnicien, isClient, canAssignTickets, canSeeAllTickets, department } = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assigningTicket, setAssigningTicket] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: allTickets = [], isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list('-created_date')
  });

  const handleDelete = async (ticket) => {
    if (confirm('Supprimer ce ticket ?')) {
      await base44.entities.Ticket.delete(ticket.id);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    }
  };

  // Filtrage par rôle
  const roleFilteredTickets = allTickets.filter(ticket => {
    if (isAdmin) return true;
    if (isSuperviseur) {
      // Superviseur voit les tickets de son département + ceux IT
      return ticket.requester_department === department || 
             ticket.target_department === department ||
             ticket.supervisor_email === user?.email;
    }
    if (isTechnicien) {
      // Technicien voit uniquement les tickets qui lui sont assignés
      return ticket.assigned_agents?.includes(user?.email) ||
             ticket.assigned_to === user?.email;
    }
    if (isClient) {
      // Client voit uniquement ses propres tickets
      return ticket.requester_email === user?.email ||
             ticket.created_by === user?.email;
    }
    return false;
  });

  const filteredTickets = roleFilteredTickets.filter(ticket => {
    const matchesSearch = !search ||
      ticket.title?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.reference?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.requester_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesDept = deptFilter === 'all' || ticket.requester_department === deptFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesDept;
  });

  const stats = {
    nouveau: roleFilteredTickets.filter(t => t.status === 'nouveau').length,
    assigne: roleFilteredTickets.filter(t => t.status === 'assigne').length,
    en_cours: roleFilteredTickets.filter(t => t.status === 'en_cours').length,
    resolu: roleFilteredTickets.filter(t => t.status === 'resolu').length,
  };

  // Bandeau rôle
  const roleBanner = {
    admin: { label: 'Vue Administrateur – Tous les tickets', color: 'bg-slate-900 text-white' },
    superviseur: { label: `Vue Superviseur – Département : ${department || '?'}`, color: 'bg-violet-600 text-white' },
    technicien: { label: `Vue Technicien – Tickets assignés à vous`, color: 'bg-blue-600 text-white' },
    client: { label: `Vue Client – Mes tickets`, color: 'bg-emerald-600 text-white' },
  };
  const banner = roleBanner[user?.role];

  const departments = [...new Set(allTickets.map(t => t.requester_department).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      {banner && (
        <div className={cn("rounded-xl px-5 py-3 flex items-center gap-2 text-sm font-medium", banner.color)}>
          <ShieldAlert className="h-4 w-4" />
          {banner.label}
          <span className="ml-auto opacity-75">{roleFilteredTickets.length} ticket(s) visible(s)</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des tickets</h1>
          <p className="text-slate-500 mt-1">Incidents et demandes de service</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Nouveau', value: stats.nouveau, color: 'blue' },
          { label: 'Assigné', value: stats.assigne, color: 'violet' },
          { label: 'En cours', value: stats.en_cours, color: 'indigo' },
          { label: 'Résolus', value: stats.resolu, color: 'emerald' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{stat.label}</span>
              <span className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {(isAdmin || isSuperviseur) && (
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous départements</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              {Object.entries(statusLabels).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              <SelectItem value="critique">Critique</SelectItem>
              <SelectItem value="haute">Haute</SelectItem>
              <SelectItem value="moyenne">Moyenne</SelectItem>
              <SelectItem value="basse">Basse</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Référence</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Demandeur</TableHead>
              {(isAdmin || isSuperviseur) && <TableHead>Agents</TableHead>}
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
              ))
            ) : filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                  Aucun ticket trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map(ticket => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <TableCell className="font-mono text-xs text-slate-500">{ticket.reference}</TableCell>
                  <TableCell className="font-medium max-w-[180px] truncate">{ticket.title}</TableCell>
                  <TableCell className="text-sm text-slate-600">{typeLabels[ticket.type]}</TableCell>
                  <TableCell>
                    <Badge className={cn("border text-xs", priorityColors[ticket.priority])}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", statusColors[ticket.status])}>
                      {statusLabels[ticket.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{ticket.requester_name}</p>
                      <p className="text-xs text-slate-400">{ticket.requester_department}</p>
                    </div>
                  </TableCell>
                  {(isAdmin || isSuperviseur) && (
                    <TableCell>
                      {ticket.assigned_agents?.length > 0 ? (
                        <span className="text-xs text-violet-700 bg-violet-50 px-2 py-1 rounded-full">
                          {ticket.assigned_agents.length} agent(s)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Non assigné</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {moment(ticket.created_date).fromNow()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}>
                          <Eye className="h-4 w-4 mr-2" /> Voir
                        </DropdownMenuItem>
                        {canAssignTickets && ticket.status === 'nouveau' && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setAssigningTicket(ticket); }}>
                            <UserPlus className="h-4 w-4 mr-2" /> Assigner agents
                          </DropdownMenuItem>
                        )}
                        {(isAdmin || ticket.created_by === user?.email) && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setEditingTicket(ticket);
                            setShowForm(true);
                          }}>
                            <Pencil className="h-4 w-4 mr-2" /> Modifier
                          </DropdownMenuItem>
                        )}
                        {isAdmin && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(ticket); }} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TicketForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingTicket(null); }}
        ticket={editingTicket}
        currentUser={user}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['tickets'] })}
      />

      <TicketDetails
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onEdit={(ticket) => { setSelectedTicket(null); setEditingTicket(ticket); setShowForm(true); }}
        onUpdate={() => queryClient.invalidateQueries({ queryKey: ['tickets'] })}
        currentUser={user}
      />

      {assigningTicket && (
        <AssignAgentsModal
          open={!!assigningTicket}
          onClose={() => setAssigningTicket(null)}
          ticket={assigningTicket}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['tickets'] })}
        />
      )}
    </div>
  );
}