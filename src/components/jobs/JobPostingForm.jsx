import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function JobPostingForm({ open, onClose, job, onSuccess }) {
  const [formData, setFormData] = useState(job || {
    title: '',
    department: '',
    site: '',
    contract_type: 'cdi',
    description: '',
    requirements: '',
    salary_range: '',
    status: 'ouvert',
    deadline: '',
    positions_count: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      ...formData,
      positions_count: parseInt(formData.positions_count) || 1,
    };

    if (job) {
      await base44.entities.JobPosting.update(job.id, data);
    } else {
      await base44.entities.JobPosting.create(data);
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
            {job ? 'Modifier l\'offre' : 'Nouvelle offre d\'emploi'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Titre du poste *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Technicien informatique"
                required
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
                  <SelectItem value="les_deux">Les deux sites</SelectItem>
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
                </SelectContent>
              </Select>
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
                  <SelectItem value="ouvert">Ouvert</SelectItem>
                  <SelectItem value="ferme">Fermé</SelectItem>
                  <SelectItem value="pourvu">Pourvu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deadline">Date limite</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="positions_count">Nombre de postes</Label>
              <Input
                id="positions_count"
                type="number"
                min="1"
                value={formData.positions_count}
                onChange={(e) => setFormData({...formData, positions_count: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="salary_range">Fourchette salariale</Label>
              <Input
                id="salary_range"
                value={formData.salary_range}
                onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                placeholder="1500 - 2000 USD"
                className="mt-1.5"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description du poste *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Décrivez les responsabilités et missions..."
                rows={4}
                required
                className="mt-1.5"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="requirements">Exigences</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                placeholder="Formation, expérience, compétences requises..."
                rows={4}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {job ? 'Mettre à jour' : 'Publier l\'offre'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}