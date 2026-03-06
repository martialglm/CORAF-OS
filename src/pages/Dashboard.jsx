import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Ticket, Users, FileText, DoorOpen, AlertCircle, CheckCircle2, Clock, TrendingUp, Crown } from 'lucide-react';
import { useCurrentUser } from '@/components/common/useCurrentUser';
import { Badge } from "@/components/ui/badge";
import StatCard from '@/components/dashboard/StatCard';
import RecentTickets from '@/components/dashboard/RecentTickets';
import AccessChart from '@/components/dashboard/AccessChart';
import { Skeleton } from "@/components/ui/skeleton";

const roleLabels = {
  super_admin: { label: 'Super Administrateur', color: 'bg-red-100 text-red-800 border border-red-200' },
  admin: { label: 'Administrateur', color: 'bg-slate-800 text-white' },
  superviseur: { label: 'Superviseur', color: 'bg-violet-100 text-violet-800' },
  technicien: { label: 'Technicien', color: 'bg-blue-100 text-blue-800' },
  client: { label: 'Client', color: 'bg-emerald-100 text-emerald-800' },
  vigile: { label: 'Vigile', color: 'bg-amber-100 text-amber-800' },
};

export default function Dashboard() {
  const { user, role, isSuperAdmin, isAdmin, getTicketFilter, canViewFinance, canViewHR } = useCurrentUser();
  const { data: tickets = [], isLoading: loadingTickets } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list('-created_date', 10)
  });

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list()
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list()
  });

  const { data: accessLogs = [], isLoading: loadingAccess } = useQuery({
    queryKey: ['accessLogs'],
    queryFn: () => base44.entities.AccessLog.list('-created_date', 100)
  });

  const visibleTickets = getTicketFilter(tickets);
  const openTickets = visibleTickets.filter(t => ['nouveau', 'en_cours', 'en_attente'].includes(t.status)).length;
  const criticalTickets = visibleTickets.filter(t => t.priority === 'critique' && t.status !== 'ferme').length;
  const activeEmployees = employees.filter(e => e.status === 'actif').length;
  const pendingInvoices = invoices.filter(i => i.status === 'en_attente').length;
  const rc = roleLabels[role] || roleLabels.client;

  // Chart data
  const chartData = [
    { name: 'Lun', usine: 45, direction: 32 },
    { name: 'Mar', usine: 52, direction: 38 },
    { name: 'Mer', usine: 48, direction: 35 },
    { name: 'Jeu', usine: 61, direction: 42 },
    { name: 'Ven', usine: 55, direction: 40 },
    { name: 'Sam', usine: 20, direction: 12 },
    { name: 'Dim', usine: 5, direction: 3 },
  ];

  const isLoading = loadingTickets || loadingEmployees || loadingInvoices || loadingAccess;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Bienvenue, {user?.full_name?.split(' ')[0] || 'sur CORAF ITSM Pro'}</h1>
            <p className="text-blue-100 mt-1">
              {isSuperAdmin
                ? 'Vue globale Super Administrateur — Accès complet à tous les modules et utilisateurs'
                : isAdmin
                ? 'Tableau de bord Administrateur — Gestion complète du système'
                : `Tableau de bord — ${user?.department || 'CORAF ITSM Pro'}`}
            </p>
          </div>
          <Badge className={`${rc.color} text-sm px-4 py-2 font-medium shrink-0`}>
            {isSuperAdmin && <Crown className="h-4 w-4 mr-1.5 inline" />}
            {rc.label}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Tickets ouverts"
              value={openTickets}
              icon={Ticket}
              trend={criticalTickets > 0 ? `${criticalTickets} critique(s)` : null}
              trendUp={false}
              color="blue"
            />
            {canViewHR && (
              <StatCard
                title="Employés actifs"
                value={activeEmployees}
                icon={Users}
                color="emerald"
              />
            )}
            {canViewFinance && (
              <StatCard
                title="Factures en attente"
                value={pendingInvoices}
                icon={FileText}
                color="amber"
              />
            )}
            <StatCard
              title="Entrées aujourd'hui"
              value={accessLogs.filter(a => 
                new Date(a.timestamp).toDateString() === new Date().toDateString()
              ).length}
              icon={DoorOpen}
              color="violet"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTickets tickets={tickets} />
        </div>
        <div>
          <AccessChart data={chartData} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Nouveau ticket', icon: Ticket, color: 'bg-blue-500', page: 'Tickets' },
          { label: 'Ajouter employé', icon: Users, color: 'bg-emerald-500', page: 'Employees' },
          { label: 'Nouvelle facture', icon: FileText, color: 'bg-amber-500', page: 'Accounting' },
          { label: 'Enregistrer entrée', icon: DoorOpen, color: 'bg-violet-500', page: 'AccessControl' },
        ].map((action) => (
          <a
            key={action.label}
            href={`/${action.page}`}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group"
          >
            <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="font-medium text-slate-700">{action.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}