import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Monitor, Printer, Server, Wifi, Phone, Package, Pencil, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import AssetForm from '@/components/assets/AssetForm';
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from '@/components/common/useCurrentUser';
import { ShieldAlert } from 'lucide-react';

const typeIcons = {
  ordinateur: Monitor,
  imprimante: Printer,
  serveur: Server,
  reseau: Wifi,
  telephone: Phone,
  logiciel: Package,
  autre: Package,
};

const statusColors = {
  en_service: "bg-emerald-100 text-emerald-700",
  en_maintenance: "bg-amber-100 text-amber-700",
  hors_service: "bg-red-100 text-red-700",
  en_stock: "bg-slate-100 text-slate-700",
};

export default function Assets() {
  const { canManageAssets, canViewAssets, isSuperAdmin, isAdmin, getAssetFilter, user } = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: allAssets = [], isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list('-created_date')
  });

  const assets = getAssetFilter(allAssets);

  const handleDelete = async (asset) => {
    if (confirm('Supprimer cet actif ?')) {
      await base44.entities.Asset.delete(asset.id);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !search || 
      asset.name?.toLowerCase().includes(search.toLowerCase()) ||
      asset.asset_tag?.toLowerCase().includes(search.toLowerCase()) ||
      asset.serial_number?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventaire des actifs IT</h1>
          <p className="text-slate-500 mt-1">Gérez votre parc informatique</p>
        </div>
        {canManageAssets && (
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel actif
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'En service', value: assets.filter(a => a.status === 'en_service').length, color: 'emerald' },
          { label: 'En maintenance', value: assets.filter(a => a.status === 'en_maintenance').length, color: 'amber' },
          { label: 'Hors service', value: assets.filter(a => a.status === 'hors_service').length, color: 'red' },
          { label: 'En stock', value: assets.filter(a => a.status === 'en_stock').length, color: 'slate' },
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
              placeholder="Rechercher par nom, tag, numéro de série..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="ordinateur">Ordinateur</SelectItem>
              <SelectItem value="imprimante">Imprimante</SelectItem>
              <SelectItem value="serveur">Serveur</SelectItem>
              <SelectItem value="reseau">Réseau</SelectItem>
              <SelectItem value="telephone">Téléphone</SelectItem>
              <SelectItem value="logiciel">Logiciel</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="en_service">En service</SelectItem>
              <SelectItem value="en_maintenance">En maintenance</SelectItem>
              <SelectItem value="hors_service">Hors service</SelectItem>
              <SelectItem value="en_stock">En stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))
        ) : filteredAssets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            Aucun actif trouvé
          </div>
        ) : (
          filteredAssets.map(asset => {
            const Icon = typeIcons[asset.type] || Package;
            return (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{asset.name}</h3>
                        <p className="text-sm text-slate-500">{asset.asset_tag}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                       {canManageAssets && (
                         <DropdownMenuItem onClick={() => {
                           setEditingAsset(asset);
                           setShowForm(true);
                         }}>
                           <Pencil className="h-4 w-4 mr-2" />
                           Modifier
                         </DropdownMenuItem>
                       )}
                       {(isAdmin || isSuperAdmin) && (
                         <DropdownMenuItem onClick={() => handleDelete(asset)} className="text-red-600">
                           <Trash2 className="h-4 w-4 mr-2" />
                           Supprimer
                         </DropdownMenuItem>
                       )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Marque</span>
                      <span className="text-slate-900">{asset.brand || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Modèle</span>
                      <span className="text-slate-900">{asset.model || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Site</span>
                      <span className="text-slate-900 capitalize">{asset.location || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Assigné à</span>
                      <span className="text-slate-900">{asset.assigned_to || '-'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <Badge className={statusColors[asset.status]}>
                      {asset.status?.replace('_', ' ')}
                    </Badge>
                    {asset.serial_number && (
                      <span className="text-xs font-mono text-slate-400">{asset.serial_number}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <AssetForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAsset(null);
        }}
        asset={editingAsset}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['assets'] })}
      />
    </div>
  );
}