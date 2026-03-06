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
import { Loader2, Upload } from 'lucide-react';

const categories = [
  { value: 'equipement_it', label: 'Équipement IT' },
  { value: 'fournitures', label: 'Fournitures' },
  { value: 'services', label: 'Services' },
  { value: 'salaires', label: 'Salaires' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'energie', label: 'Énergie' },
  { value: 'transport', label: 'Transport' },
  { value: 'autre', label: 'Autre' },
];

export default function InvoiceForm({ open, onClose, invoice, onSuccess }) {
  const [formData, setFormData] = useState(invoice || {
    invoice_number: '',
    type: 'sortie',
    vendor_or_client: '',
    amount: '',
    currency: 'USD',
    status: 'en_attente',
    issue_date: '',
    due_date: '',
    paid_date: '',
    category: '',
    description: '',
    attachment_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const generateInvoiceNumber = () => {
    const prefix = formData.type === 'entree' ? 'FAC-E' : 'FAC-S';
    const num = String(Date.now()).slice(-6);
    return `${prefix}-${num}`;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, attachment_url: file_url });
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      ...formData,
      invoice_number: formData.invoice_number || generateInvoiceNumber(),
      amount: parseFloat(formData.amount) || 0,
    };

    if (invoice) {
      await base44.entities.Invoice.update(invoice.id, data);
    } else {
      await base44.entities.Invoice.create(data);
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
            {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice_number">N° de facture</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                placeholder="Auto-généré si vide"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entree">Entrée (Client)</SelectItem>
                  <SelectItem value="sortie">Sortie (Fournisseur)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="vendor_or_client">
                {formData.type === 'entree' ? 'Client' : 'Fournisseur'}
              </Label>
              <Input
                id="vendor_or_client"
                value={formData.vendor_or_client}
                onChange={(e) => setFormData({...formData, vendor_or_client: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="amount">Montant *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Devise</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({...formData, currency: value})}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CDF">CDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Catégorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
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
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="payee">Payée</SelectItem>
                  <SelectItem value="en_retard">En retard</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="issue_date">Date d'émission</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="due_date">Date d'échéance</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="mt-1.5"
              />
            </div>

            {formData.status === 'payee' && (
              <div>
                <Label htmlFor="paid_date">Date de paiement</Label>
                <Input
                  id="paid_date"
                  type="date"
                  value={formData.paid_date}
                  onChange={(e) => setFormData({...formData, paid_date: e.target.value})}
                  className="mt-1.5"
                />
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="mt-1.5"
              />
            </div>

            <div className="col-span-2">
              <Label>Pièce jointe</Label>
              <div className="mt-1.5 flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">{uploading ? 'Téléchargement...' : 'Joindre un fichier'}</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {formData.attachment_url && (
                  <a 
                    href={formData.attachment_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Voir le fichier
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || uploading} className="bg-amber-600 hover:bg-amber-700">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {invoice ? 'Mettre à jour' : 'Créer la facture'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}