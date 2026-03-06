import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, CheckCircle2, XCircle, Loader2, Search } from 'lucide-react';
import { cn } from "@/lib/utils";

const statusColors = {
  actif: "bg-emerald-100 text-emerald-700",
  inactif: "bg-slate-100 text-slate-700",
  perdu: "bg-red-100 text-red-700",
  suspendu: "bg-amber-100 text-amber-700",
};

export default function BadgeManagement({ employees = [] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list('-created_date'),
  });

  const handleToggleStatus = async (badge) => {
    const newStatus = badge.status === 'actif' ? 'suspendu' : 'actif';
    await base44.entities.Badge.update(badge.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['badges'] });
  };

  const handleDelete = async (badge) => {
    if (confirm(`Supprimer le badge ${badge.badge_number} ?`)) {
      await base44.entities.Badge.delete(badge.id);
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    }
  };

  const filteredBadges = badges.filter(b =>
    !search ||
    b.badge_number?.toLowerCase().includes(search.toLowerCase()) ||
    b.owner_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
        <p className="text-sm text-violet-800 font-medium">
          🔐 Gestion des badges — Département Informatique
        </p>
        <p className="text-xs text-violet-600 mt-1">
          Seul le département IT peut créer, activer et désactiver les badges d'accès.
          Les vigiles utilisent les badges pour scanner les entrées/sorties.
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher badge ou propriétaire..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau badge
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>N° Badge</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sites autorisés</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Activé par</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBadges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                  Aucun badge enregistré
                </TableCell>
              </TableRow>
            ) : (
              filteredBadges.map(badge => (
                <TableRow key={badge.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono font-bold text-slate-800">{badge.badge_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{badge.owner_name || '-'}</p>
                      <p className="text-xs text-slate-400">{badge.owner_email || ''}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{badge.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(badge.access_sites || []).map(site => (
                        <span key={site} className={cn("text-xs px-2 py-0.5 rounded-full capitalize",
                          site === 'usine' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {site}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[badge.status]}>
                      {badge.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{badge.activated_by || '-'}</TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {badge.expiry_date || 'Permanent'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleStatus(badge)}>
                          {badge.status === 'actif' ? (
                            <><XCircle className="h-4 w-4 mr-2 text-red-500" />Suspendre</>
                          ) : (
                            <><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />Activer</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditingBadge(badge); setShowForm(true); }}>
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(badge)}>
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

      <BadgeForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingBadge(null); }}
        badge={editingBadge}
        employees={employees}
        currentUserEmail={null}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['badges'] })}
      />
    </div>
  );
}

function BadgeForm({ open, onClose, badge, employees, currentUserEmail, onSuccess }) {
  const [formData, setFormData] = useState(badge || {
    badge_number: '',
    type: 'employe',
    status: 'inactif',
    owner_name: '',
    owner_email: '',
    employee_id: '',
    access_sites: [],
    expiry_date: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleEmployeeSelect = (empId) => {
    const emp = employees.find(e => e.id === empId);
    setFormData({
      ...formData,
      employee_id: empId,
      owner_name: emp ? `${emp.first_name} ${emp.last_name}` : '',
      owner_email: emp?.email || '',
      access_sites: emp?.site ? [emp.site] : [],
    });
  };

  const toggleSite = (site) => {
    const sites = formData.access_sites || [];
    setFormData({
      ...formData,
      access_sites: sites.includes(site) ? sites.filter(s => s !== site) : [...sites, site],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      ...formData,
      activated_by: formData.status === 'actif' ? (badge?.activated_by || currentUserEmail || 'IT') : badge?.activated_by,
      activated_date: formData.status === 'actif' && !badge?.activated_date ? new Date().toISOString() : badge?.activated_date,
    };
    if (badge?.id) {
      await base44.entities.Badge.update(badge.id, data);
    } else {
      await base44.entities.Badge.create(data);
    }
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{badge ? 'Modifier le badge' : 'Créer un badge'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>N° de badge *</Label>
              <Input
                value={formData.badge_number}
                onChange={e => setFormData({ ...formData, badge_number: e.target.value })}
                placeholder="B-001"
                required
                className="mt-1.5 font-mono"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employe">Employé</SelectItem>
                  <SelectItem value="visiteur">Visiteur</SelectItem>
                  <SelectItem value="prestataire">Prestataire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'employe' && (
              <div className="col-span-2">
                <Label>Employé</Label>
                <Select value={formData.employee_id} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.first_name} {e.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.type !== 'employe' && (
              <>
                <div>
                  <Label>Nom</Label>
                  <Input value={formData.owner_name} onChange={e => setFormData({ ...formData, owner_name: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={formData.owner_email} onChange={e => setFormData({ ...formData, owner_email: e.target.value })} className="mt-1.5" />
                </div>
              </>
            )}

            <div className="col-span-2">
              <Label>Sites d'accès autorisés</Label>
              <div className="flex gap-3 mt-2">
                {['direction', 'usine'].map(site => (
                  <button
                    key={site}
                    type="button"
                    onClick={() => toggleSite(site)}
                    className={cn(
                      "flex-1 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all",
                      formData.access_sites?.includes(site)
                        ? site === 'usine' ? "border-amber-500 bg-amber-50 text-amber-700" : "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {site}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">✅ Actif</SelectItem>
                  <SelectItem value="inactif">⬜ Inactif</SelectItem>
                  <SelectItem value="suspendu">🔴 Suspendu</SelectItem>
                  <SelectItem value="perdu">⚠️ Perdu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date d'expiration</Label>
              <Input type="date" value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} className="mt-1.5" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {badge ? 'Mettre à jour' : 'Créer le badge'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}