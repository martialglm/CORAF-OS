import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Mail, Phone, Building2, Calendar, CreditCard, Briefcase } from 'lucide-react';
import moment from 'moment';
import { cn } from "@/lib/utils";

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

export default function EmployeeDetails({ employee, onClose, onEdit }) {
  if (!employee) return null;

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Sheet open={!!employee} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={employee.photo_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl">
                  {getInitials(employee.first_name, employee.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl">
                  {employee.first_name} {employee.last_name}
                </SheetTitle>
                <p className="text-sm text-slate-500">{employee.matricule}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onEdit(employee)}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={statusColors[employee.status]}>
              {employee.status}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {employee.contract_type}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Contact</h4>
            <div className="space-y-2">
              <a 
                href={`mailto:${employee.email}`}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Mail className="h-5 w-5 text-slate-400" />
                <span className="text-slate-600">{employee.email}</span>
              </a>
              {employee.phone && (
                <a 
                  href={`tel:${employee.phone}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Phone className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-600">{employee.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Info professionnelle */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Informations professionnelles</h4>
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs text-slate-500">Département</p>
                <p className="font-medium text-slate-900 mt-1">
                  {departmentLabels[employee.department] || employee.department}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Poste</p>
                <p className="font-medium text-slate-900 mt-1">{employee.position || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Site</p>
                <p className="font-medium text-slate-900 mt-1 capitalize">{employee.site || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Badge</p>
                <p className="font-medium text-slate-900 mt-1">{employee.badge_number || '-'}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Dates importantes</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Calendar className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Date d'embauche</p>
                  <p className="font-medium text-slate-900">
                    {employee.hire_date ? moment(employee.hire_date).format('DD MMMM YYYY') : 'Non spécifiée'}
                  </p>
                </div>
              </div>
              {employee.hire_date && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Ancienneté</p>
                    <p className="font-medium text-slate-900">
                      {moment(employee.hire_date).fromNow(true)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}