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

export default function AssetForm({ open, onClose, asset, onSuccess }) {
  const [formData, setFormData] = useState(asset || {
    asset_tag: '',
    name: '',
    type: 'ordinateur',
    status: 'en_stock',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    warranty_end: '',
    assigned_to: '',
    location: '',
    purchase_price: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      ...formData,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
    };

    if (asset) {
      await base44.entities.Asset.update(asset.id, data);
    } else {
      await base44.entities.Asset.create(data);
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
            {asset ? 'Modifier l\'actif' : 'Nouvel actif IT'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="asset_tag">Numéro d'inventaire *</Label>
              <Input
                id="asset_tag"
                value={formData.asset_tag}
                onChange={(e) => setFormData({...formData, asset_tag: e.target.value})}
                placeholder="IT-001"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="PC Bureau RH"
                required
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
                  <SelectItem value="ordinateur">Ordinateur</SelectItem>
                  <SelectItem value="imprimante">Imprimante</SelectItem>
                  <SelectItem value="serveur">Serveur</SelectItem>
                  <SelectItem value="reseau">Équipement réseau</SelectItem>
                  <SelectItem value="telephone">Téléphone</SelectItem>
                  <SelectItem value="logiciel">Logiciel</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
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
                  <SelectItem value="en_stock">En stock</SelectItem>
                  <SelectItem value="en_service">En service</SelectItem>
                  <SelectItem value="en_maintenance">En maintenance</SelectItem>
                  <SelectItem value="hors_service">Hors service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand">Marque</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder="Dell, HP, Lenovo..."
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="model">Modèle</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                placeholder="OptiPlex 7090"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="serial_number">Numéro de série</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Emplacement</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({...formData, location: value})}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usine">Usine</SelectItem>
                  <SelectItem value="direction">Direction</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="purchase_date">Date d'achat</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="warranty_end">Fin de garantie</Label>
              <Input
                id="warranty_end"
                type="date"
                value={formData.warranty_end}
                onChange={(e) => setFormData({...formData, warranty_end: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="assigned_to">Assigné à</Label>
              <Input
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                placeholder="Nom de l'employé"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="purchase_price">Prix d'achat (USD)</Label>
              <Input
                id="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Informations supplémentaires..."
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {asset ? 'Mettre à jour' : 'Créer l\'actif'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}