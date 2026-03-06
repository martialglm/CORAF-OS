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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MoreVertical, ShieldCheck, Loader2, UserPlus, Info } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useCurrentUser } from '@/components/common/useCurrentUser';
import { toast } from "sonner";

const roleConfig = {
  super_admin: { label: 'Super Administrateur', color: 'bg-red-100 text-red-800 border-red-200', desc: 'Vue globale, gestion des rôles et de tous les modules' },
  admin: { label: 'Administrateur', color: 'bg-slate-800 text-white', desc: 'Accès complet à tous les modules sauf gestion super admin' },
  superviseur: { label: 'Superviseur', color: 'bg-violet-100 text-violet-800 border-violet-200', desc: 'Tickets & actifs de son département, assignation agents' },
  technicien: { label: 'Technicien', color: 'bg-blue-100 text-blue-800 border-blue-200', desc: 'Tickets assignés, actifs de son site' },
  client: { label: 'Client', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: 'Ses propres tickets uniquement' },
  vigile: { label: 'Vigile', color: 'bg-amber-100 text-amber-800 border-amber-200', desc: 'Scan badges entrées/sorties uniquement' },
};

const deptLabels = {
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

const permissionsMatrix = [
  { module: 'Tickets', super_admin: '✅ Tous', admin: '✅ Tous', superviseur: '✅ Son département', technicien: '✅ Assignés à lui', client: '✅ Ses tickets', vigile: '❌' },
  { module: 'Actifs IT', super_admin: '✅ Tous', admin: '✅ Tous', superviseur: '✅ Son site', technicien: '✅ Son site', client: '✅ Assignés à lui', vigile: '❌' },
  { module: 'Réseau', super_admin: '✅', admin: '✅', superviseur: '✅ IT only', technicien: '✅ IT only', client: '❌', vigile: '❌' },
  { module: 'RH', super_admin: '✅', admin: '✅', superviseur: '👁 Lecture', technicien: '❌', client: '❌', vigile: '❌' },
  { module: 'Comptabilité', super_admin: '✅', admin: '✅', superviseur: '❌', technicien: '❌', client: '❌', vigile: '❌' },
  { module: 'Accès / Badges', super_admin: '✅', admin: '✅', superviseur: '✅ IT only', technicien: '✅ IT only', client: '❌', vigile: '✅ Scan only' },
  { module: 'Gestion utilisateurs', super_admin: '✅', admin: '✅', superviseur: '❌', technicien: '❌', client: '❌', vigile: '❌' },
];

export default function UserManagement() {
  const { isSuperAdmin, isAdmin, canManageUsers, user: currentUser } = useCurrentUser();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('client');
  const [inviting, setInviting] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center h-64 flex-col gap-3">
        <ShieldCheck className="h-12 w-12 text-slate-300" />
        <p className="text-slate-500 font-medium">Accès réservé aux Administrateurs</p>
      </div>
    );
  }

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, inviteRole === 'super_admin' ? 'admin' : inviteRole);
    toast.success(`Invitation envoyée à ${inviteEmail}`);
    setInviteEmail('');
    setInviting(false);
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const handleUpdateRole = async (userId, newRole, extras = {}) => {
    await base44.entities.User.update(userId, { role: newRole, ...extras });
    queryClient.invalidateQueries({ queryKey: ['users'] });
    setEditingUser(null);
    toast.success('Rôle mis à jour');
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
          <p className="text-slate-500 mt-1">Rôles et permissions par département</p>
        </div>
        <Button variant="outline" onClick={() => setShowMatrix(!showMatrix)}>
          <Info className="h-4 w-4 mr-2" />
          {showMatrix ? 'Masquer' : 'Voir'} les permissions
        </Button>
      </div>

      {/* Permissions Matrix */}
      {showMatrix && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b">
            <h3 className="font-semibold text-slate-800">Matrice des permissions CORAF ITSM</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-3 font-medium text-slate-600 w-36">Module</th>
                  {Object.keys(roleConfig).map(r => (
                    <th key={r} className="px-3 py-3 text-center">
                      <Badge className={cn("text-xs border", roleConfig[r].color)}>{roleConfig[r].label}</Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map(row => (
                  <tr key={row.module} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{row.module}</td>
                    {Object.keys(roleConfig).map(r => (
                      <td key={r} className="px-3 py-3 text-center text-xs text-slate-600">{row[r]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(roleConfig).map(([key, cfg]) => (
          <div key={key} className="bg-white rounded-xl border border-slate-100 p-3 text-center">
            <Badge className={cn("text-xs border mb-2", cfg.color)}>{cfg.label}</Badge>
            <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === key).length}</p>
            <p className="text-xs text-slate-400 mt-1">utilisateur(s)</p>
          </div>
        ))}
      </div>

      {/* Invite User */}
      {canManageUsers && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Inviter un utilisateur
          </h3>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Email de l'utilisateur..."
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              required
              className="flex-1 bg-white"
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleConfig)
                  .filter(([k]) => isSuperAdmin ? true : k !== 'super_admin')
                  .map(([k, cfg]) => (
                    <SelectItem key={k} value={k}>{cfg.label}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={inviting} className="bg-blue-600 hover:bg-blue-700">
              {inviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Inviter
            </Button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tous les rôles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {Object.entries(roleConfig).map(([k, cfg]) => (
              <SelectItem key={k} value={k}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Permissions clés</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Chargement...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Aucun utilisateur trouvé</TableCell></TableRow>
            ) : (
              filtered.map(u => {
                const rc = roleConfig[u.role] || roleConfig.client;
                const isMe = u.email === currentUser?.email;
                return (
                  <TableRow key={u.id} className={cn("hover:bg-slate-50", isMe && "bg-blue-50/50")}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
                            {getInitials(u.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            {u.full_name || 'Sans nom'}
                            {isMe && <span className="ml-2 text-xs text-blue-500">(vous)</span>}
                          </p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border text-xs", rc.color)}>{rc.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {deptLabels[u.department] || u.department || <span className="text-slate-300">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 capitalize">
                      {u.site || <span className="text-slate-300">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
                      {rc.desc}
                    </TableCell>
                    <TableCell>
                      {/* Can't edit super_admin unless you ARE super_admin */}
                      {(isSuperAdmin || (isAdmin && u.role !== 'super_admin')) && !isMe && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingUser(u)}>
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Modifier le rôle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Role Dialog */}
      {editingUser && (
        <EditRoleDialog
          user={editingUser}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateRole}
        />
      )}
    </div>
  );
}

function EditRoleDialog({ user, isSuperAdmin, onClose, onSave }) {
  const [role, setRole] = useState(user.role || 'client');
  const [department, setDepartment] = useState(user.department || '');
  const [site, setSite] = useState(user.site || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(user.id, role, { department, site });
    setSaving(false);
  };

  const rc = roleConfig[role];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le rôle</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-slate-900">{user.full_name || 'Sans nom'}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div>
            <Label>Rôle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleConfig)
                  .filter(([k]) => isSuperAdmin ? true : k !== 'super_admin')
                  .map(([k, cfg]) => (
                    <SelectItem key={k} value={k}>{cfg.label}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {rc && (
              <p className="text-xs text-slate-500 mt-1.5">{rc.desc}</p>
            )}
          </div>

          <div>
            <Label>Département</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries({
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
                }).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Site</Label>
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direction">Direction</SelectItem>
                <SelectItem value="usine">Usine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}