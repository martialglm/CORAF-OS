import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Plus, Search, MoreVertical, Eye, Pencil, Trash2, Mail, Phone, Building2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeeDetails from '@/components/employees/EmployeeDetails';
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  actif: "bg-emerald-100 text-emerald-700",
  conge: "bg-amber-100 text-amber-700",
  suspendu: "bg-red-100 text-red-700",
  demission: "bg-slate-100 text-slate-700",
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

export default function Employees() {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date')
  });

  const handleDelete = async (employee) => {
    if (confirm('Supprimer cet employé ?')) {
      await base44.entities.Employee.delete(employee.id);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = !search || 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase()) ||
      emp.matricule?.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des employés</h1>
          <p className="text-slate-500 mt-1">Répertoire du personnel CORAF</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel employé
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total employés', value: employees.length, color: 'blue' },
          { label: 'Actifs', value: employees.filter(e => e.status === 'actif').length, color: 'emerald' },
          { label: 'En congé', value: employees.filter(e => e.status === 'conge').length, color: 'amber' },
          { label: 'Usine', value: employees.filter(e => e.site === 'usine').length, color: 'violet' },
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
              placeholder="Rechercher par nom, email, matricule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les départements</SelectItem>
              {Object.entries(departmentLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="conge">En congé</SelectItem>
              <SelectItem value="suspendu">Suspendu</SelectItem>
              <SelectItem value="demission">Démission</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Employé</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-16 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  Aucun employé trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map(employee => (
                <TableRow 
                  key={employee.id} 
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.photo_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {getInitials(employee.first_name, employee.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-xs text-slate-500">{employee.matricule}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {departmentLabels[employee.department] || employee.department}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {employee.position || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Building2 className="h-3 w-3" />
                      <span className="capitalize">{employee.site || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[employee.status]}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <a 
                        href={`mailto:${employee.email}`} 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg hover:bg-slate-100"
                      >
                        <Mail className="h-4 w-4 text-slate-400" />
                      </a>
                      {employee.phone && (
                        <a 
                          href={`tel:${employee.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg hover:bg-slate-100"
                        >
                          <Phone className="h-4 w-4 text-slate-400" />
                        </a>
                      )}
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
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployee(employee);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setEditingEmployee(employee);
                          setShowForm(true);
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(employee);
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

      <EmployeeForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['employees'] })}
      />

      <EmployeeDetails
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onEdit={(emp) => {
          setSelectedEmployee(null);
          setEditingEmployee(emp);
          setShowForm(true);
        }}
      />
    </div>
  );
}