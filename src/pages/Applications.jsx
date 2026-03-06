import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Eye, Pencil, Trash2, Mail, FileText, Calendar } from 'lucide-react';
import { cn } from "@/lib/utils";
import moment from 'moment';
import ApplicationForm from '@/components/applications/ApplicationForm';
import ApplicationDetails from '@/components/applications/ApplicationDetails';
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  recue: "bg-slate-100 text-slate-700",
  en_cours: "bg-blue-100 text-blue-700",
  entretien: "bg-violet-100 text-violet-700",
  acceptee: "bg-emerald-100 text-emerald-700",
  refusee: "bg-red-100 text-red-700",
};

const statusLabels = {
  recue: 'Reçue',
  en_cours: 'En cours',
  entretien: 'Entretien',
  acceptee: 'Acceptée',
  refusee: 'Refusée',
};

export default function Applications() {
  const [showForm, setShowForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => base44.entities.JobApplication.list('-created_date')
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobPostings'],
    queryFn: () => base44.entities.JobPosting.list()
  });

  const handleDelete = async (application) => {
    if (confirm('Supprimer cette candidature ?')) {
      await base44.entities.JobApplication.delete(application.id);
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  };

  const handleStatusChange = async (application, newStatus) => {
    await base44.entities.JobApplication.update(application.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['applications'] });
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !search || 
      `${app.first_name} ${app.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      app.email?.toLowerCase().includes(search.toLowerCase()) ||
      app.job_title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidatures</h1>
          <p className="text-slate-500 mt-1">Gérez les candidatures reçues</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle candidature
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Reçues', value: applications.filter(a => a.status === 'recue').length, color: 'slate' },
          { label: 'En cours', value: applications.filter(a => a.status === 'en_cours').length, color: 'blue' },
          { label: 'Entretien', value: applications.filter(a => a.status === 'entretien').length, color: 'violet' },
          { label: 'Acceptées', value: applications.filter(a => a.status === 'acceptee').length, color: 'emerald' },
          { label: 'Refusées', value: applications.filter(a => a.status === 'refusee').length, color: 'red' },
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par nom, email, poste..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Candidat</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Entretien</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-16 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  Aucune candidature trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map(application => (
                <TableRow 
                  key={application.id} 
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedApplication(application)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                          {getInitials(application.first_name, application.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">
                          {application.first_name} {application.last_name}
                        </p>
                        <p className="text-xs text-slate-500">{application.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {application.job_title}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {moment(application.created_date).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Badge className={cn("cursor-pointer", statusColors[application.status])}>
                          {statusLabels[application.status]}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <DropdownMenuItem 
                            key={value}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(application, value);
                            }}
                          >
                            {label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {application.interview_date 
                      ? moment(application.interview_date).format('DD/MM/YYYY HH:mm')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplication(application);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </DropdownMenuItem>
                        {application.cv_url && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            window.open(application.cv_url, '_blank');
                          }}>
                            <FileText className="h-4 w-4 mr-2" />
                            Voir CV
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setEditingApplication(application);
                          setShowForm(true);
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(application);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ApplicationForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingApplication(null);
        }}
        application={editingApplication}
        jobs={jobs}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['applications'] })}
      />

      <ApplicationDetails
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onEdit={(app) => {
          setSelectedApplication(null);
          setEditingApplication(app);
          setShowForm(true);
        }}
        onUpdate={() => queryClient.invalidateQueries({ queryKey: ['applications'] })}
      />
    </div>
  );
}