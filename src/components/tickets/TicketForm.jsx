import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const types = [
  { value: 'incident', label: 'Incident' },
  { value: 'demande', label: 'Demande de service' },
  { value: 'probleme', label: 'Problème' },
  { value: 'changement', label: 'Changement' },
];

const priorities = [
  { value: 'critique', label: 'Critique' },
  { value: 'haute', label: 'Haute' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'basse', label: 'Basse' },
];

const categories = [
  { value: 'materiel', label: 'Matériel' },
  { value: 'logiciel', label: 'Logiciel' },
  { value: 'reseau', label: 'Réseau' },
  { value: 'securite', label: 'Sécurité' },
  { value: 'email', label: 'Email' },
  { value: 'telephonie', label: 'Téléphonie' },
  { value: 'autre', label: 'Autre' },
];

const sites = [
  { value: 'usine', label: 'Usine' },
  { value: 'direction', label: 'Direction' },
  { value: 'autre', label: 'Autre' },
];

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

export default function TicketForm({ open, onClose, ticket, onSuccess, currentUser }) {
  const isClient = currentUser?.role === 'client';

  const [formData, setFormData] = useState(ticket || {
    title: '',
    description: '',
    type: 'incident',
    priority: isClient ? 'moyenne' : 'moyenne',
    category: '',
    site: currentUser?.site || '',
    requester_name: isClient ? (currentUser?.full_name || '') : '',
    requester_email: isClient ? (currentUser?.email || '') : '',
    requester_department: isClient ? (currentUser?.department || '') : '',
    target_department: 'informatique',
  });
  const [loading, setLoading] = useState(false);

  const generateReference = () => {
    const prefix = formData.type === 'incident' ? 'INC' :
      formData.type === 'demande' ? 'REQ' :
      formData.type === 'probleme' ? 'PRB' : 'CHG';
    const num = String(Date.now()).slice(-6);
    return `${prefix}-${num}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      reference: ticket?.reference || generateReference(),
      status: ticket?.status || 'nouveau',
    };

    if (ticket) {
      await base44.entities.Ticket.update(ticket.id, data);
    } else {
      await base44.entities.Ticket.create(data);
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
            {ticket ? 'Modifier le ticket' : 'Nouveau ticket'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Résumé du problème"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Type *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {types.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priorité *</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {/* Clients ne peuvent pas mettre critique */}
                  {priorities.filter(p => !isClient || p.value !== 'critique').map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Catégorie</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Site</Label>
              <Select value={formData.site} onValueChange={(v) => setFormData({ ...formData, site: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {sites.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez le problème en détail..."
                rows={4}
                className="mt-1.5"
              />
            </div>

            {/* Infos demandeur - pré-remplies pour le client, modifiables pour admin/superviseur */}
            <div className="col-span-2 border-t pt-4">
              <h4 className="font-medium text-slate-900 mb-4">Informations du demandeur</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={formData.requester_name}
                    onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                    readOnly={isClient}
                    className={`mt-1.5 ${isClient ? 'bg-slate-50' : ''}`}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.requester_email}
                    onChange={(e) => setFormData({ ...formData, requester_email: e.target.value })}
                    readOnly={isClient}
                    className={`mt-1.5 ${isClient ? 'bg-slate-50' : ''}`}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Département</Label>
                  {isClient ? (
                    <Input value={formData.requester_department} readOnly className="mt-1.5 bg-slate-50" />
                  ) : (
                    <Select value={formData.requester_department} onValueChange={(v) => setFormData({ ...formData, requester_department: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                      <SelectContent>
                        {departments.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {ticket ? 'Mettre à jour' : 'Créer le ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}