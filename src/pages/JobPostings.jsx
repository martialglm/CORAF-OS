import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Briefcase, MapPin, Calendar, Users, Pencil, Trash2, Eye } from 'lucide-react';
import { cn } from "@/lib/utils";
import moment from 'moment';
import JobPostingForm from '@/components/jobs/JobPostingForm';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const statusColors = {
  ouvert: "bg-emerald-100 text-emerald-700",
  ferme: "bg-slate-100 text-slate-700",
  pourvu: "bg-blue-100 text-blue-700",
};

const departmentLabels = {
  direction_generale: 'Direction Générale',
  informatique: 'Informatique',
  production: 'Production',
  rh: 'Ressources Humaines',
  comptabilite: 'Comptabilité',
  logistique: 'Logistique',
  maintenance: 'Maintenance',
  qualite: 'Qualité',
  commercial: 'Commercial',
  securite: 'Sécurité',
};

export default function JobPostings() {
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [search, setSearch] = useState('');

  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobPostings'],
    queryFn: () => base44.entities.JobPosting.list('-created_date')
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => base44.entities.JobApplication.list()
  });

  const handleDelete = async (job) => {
    if (confirm('Supprimer cette offre ?')) {
      await base44.entities.JobPosting.delete(job.id);
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
    }
  };

  const filteredJobs = jobs.filter(job => {
    return !search || 
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      departmentLabels[job.department]?.toLowerCase().includes(search.toLowerCase());
  });

  const getApplicationCount = (jobId) => {
    return applications.filter(a => a.job_posting_id === jobId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offres d'emploi</h1>
          <p className="text-slate-500 mt-1">Gérez les postes à pourvoir</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle offre
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Postes ouverts', value: jobs.filter(j => j.status === 'ouvert').length, color: 'emerald' },
          { label: 'Candidatures', value: applications.length, color: 'violet' },
          { label: 'Postes pourvus', value: jobs.filter(j => j.status === 'pourvu').length, color: 'blue' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{stat.label}</span>
              <span className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher une offre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))
        ) : filteredJobs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            Aucune offre trouvée
          </div>
        ) : (
          filteredJobs.map(job => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge className={statusColors[job.status]}>
                    {job.status === 'ouvert' ? 'Ouvert' : job.status === 'pourvu' ? 'Pourvu' : 'Fermé'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingJob(job);
                        setShowForm(true);
                      }}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(job)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg mt-2">{job.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <Briefcase className="h-4 w-4" />
                  {departmentLabels[job.department] || job.department}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="capitalize">{job.site === 'les_deux' ? 'Usine & Direction' : job.site}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>
                      {job.deadline ? `Jusqu'au ${moment(job.deadline).format('DD/MM/YYYY')}` : 'Sans limite'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>{getApplicationCount(job.id)} candidature(s)</span>
                  </div>
                </div>

                <p className="text-sm text-slate-500 mt-4 line-clamp-2">
                  {job.description}
                </p>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {job.contract_type}
                  </Badge>
                  {job.positions_count > 1 && (
                    <span className="text-xs text-slate-500">{job.positions_count} postes</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <JobPostingForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingJob(null);
        }}
        job={editingJob}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['jobPostings'] })}
      />
    </div>
  );
}