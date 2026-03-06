import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const departments = [
  { value: 'direction_generale', label: 'Direction Générale' },
  { value: 'informatique', label: 'Informatique' },
  { value: 'production', label: 'Production' },
  { value: 'rh', label: 'Ressources Humaines' },
  { value: 'comptabilite', label: 'Comptabilité' },
  { value: 'logistique', label: 'Logistique' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'qualite', label: 'Qualité' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'securite', label: 'Sécurité' },
];

export default function EmployeeForm({ open, onClose, employee, onSuccess }) {
  const [formData, setFormData] = useState(employee || {
    matricule: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    site: '',
    hire_date: '',
    status: 'actif',
    contract_type: 'cdi',
    salary: '',
    badge_number: '',
  });
  const [loading, setLoading] = useState(false);

  const generateMatricule = () => {
    const prefix = 'COR';
    const num = String(Date.now()).slice(-6);
    return `${prefix}-${num}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      ...formData,
      matricule: formData.matricule || generateMatricule(),
      salary: formData.salary ? parseFloat(formData.salary) : null,
    };

    if (employee) {
      await base44.entities.Employee.update(employee.id, data);
    } else {
      await base44.entities.Employee.create(data);
    }
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {employee ? 'Modifier l\'employé' : 'Nouvel employé'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Nom *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Département *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({...formData, department: value})}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="position">Poste</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="Technicien, Manager..."
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Site</Label>
              <Select
                value={formData.site}
                onValueChange={(value) => setFormData({...formData, site: value})}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usine">Usine</SelectItem>
                  <SelectItem value="direction">Direction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type de contrat</Label>
              <Select
                value={formData.contract_type}
                onValueChange={(value) => setFormData({...formData, contract_type: value})}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cdi">CDI</SelectItem>
                  <SelectItem value="cdd">CDD</SelectItem>
                  <SelectItem value="stage">Stage</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hire_date">Date d'embauche</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="conge">En congé</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                  <SelectItem value="demission">Démission</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="badge_number">Numéro de badge</Label>
              <Input
                id="badge_number"
                value={formData.badge_number}
                onChange={(e) => setFormData({...formData, badge_number: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="salary">Salaire (USD)</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {employee ? 'Mettre à jour' : 'Créer l\'employé'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}