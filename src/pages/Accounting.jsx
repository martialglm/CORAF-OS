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
import { Plus, Search, MoreVertical, Pencil, Trash2, TrendingUp, TrendingDown, FileText, DollarSign } from 'lucide-react';
import { cn } from "@/lib/utils";
import moment from 'moment';
import InvoiceForm from '@/components/accounting/InvoiceForm';
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  en_attente: "bg-amber-100 text-amber-700",
  payee: "bg-emerald-100 text-emerald-700",
  annulee: "bg-slate-100 text-slate-700",
  en_retard: "bg-red-100 text-red-700",
};

const statusLabels = {
  en_attente: 'En attente',
  payee: 'Payée',
  annulee: 'Annulée',
  en_retard: 'En retard',
};

const categoryLabels = {
  equipement_it: 'Équipement IT',
  fournitures: 'Fournitures',
  services: 'Services',
  salaires: 'Salaires',
  maintenance: 'Maintenance',
  energie: 'Énergie',
  transport: 'Transport',
  autre: 'Autre',
};

export default function Accounting() {
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date')
  });

  const handleDelete = async (invoice) => {
    if (confirm('Supprimer cette facture ?')) {
      await base44.entities.Invoice.delete(invoice.id);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = !search || 
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.vendor_or_client?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalEntrees = invoices.filter(i => i.type === 'entree' && i.status === 'payee')
    .reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalSorties = invoices.filter(i => i.type === 'sortie' && i.status === 'payee')
    .reduce((sum, i) => sum + (i.amount || 0), 0);
  const enAttente = invoices.filter(i => i.status === 'en_attente')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Comptabilité</h1>
          <p className="text-slate-500 mt-1">Gestion des factures et paiements</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Entrées (payées)</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {totalEntrees.toLocaleString()} USD
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Sorties (payées)</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {totalSorties.toLocaleString()} USD
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Solde</p>
              <p className={cn(
                "text-2xl font-bold mt-1",
                totalEntrees - totalSorties >= 0 ? "text-emerald-600" : "text-red-600"
              )}>
                {(totalEntrees - totalSorties).toLocaleString()} USD
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">En attente</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {enAttente.toLocaleString()} USD
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par numéro, fournisseur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="entree">Entrées</SelectItem>
              <SelectItem value="sortie">Sorties</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="payee">Payée</SelectItem>
              <SelectItem value="en_retard">En retard</SelectItem>
              <SelectItem value="annulee">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>N° Facture</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Fournisseur/Client</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-12 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  Aucune facture trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map(invoice => (
                <TableRow key={invoice.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-sm">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>
                    <Badge className={invoice.type === 'entree' 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-red-100 text-red-700"
                    }>
                      {invoice.type === 'entree' ? '↓ Entrée' : '↑ Sortie'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {invoice.vendor_or_client}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {categoryLabels[invoice.category] || invoice.category}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {invoice.amount?.toLocaleString()} {invoice.currency}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {invoice.due_date ? moment(invoice.due_date).format('DD/MM/YYYY') : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingInvoice(invoice);
                          setShowForm(true);
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(invoice)} className="text-red-600">
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

      <InvoiceForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingInvoice(null);
        }}
        invoice={editingInvoice}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['invoices'] })}
      />
    </div>
  );
}