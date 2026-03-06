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

export default function NetworkDeviceForm({ open, onClose, device, onSuccess }) {
  const [formData, setFormData] = useState(device || {
    name: '', ip_address: '', mac_address: '', device_type: 'poste_travail',
    status: 'inconnu', hostname: '', os: '', manufacturer: '', site: '',
    subnet: '', notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = { ...formData, last_seen: new Date().toISOString() };
    if (device?.id) {
      await base44.entities.NetworkDevice.update(device.id, data);
    } else {
      await base44.entities.NetworkDevice.create(data);
    }
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{device ? 'Modifier l\'équipement' : 'Ajouter un équipement réseau'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Adresse IP *</Label>
              <Input value={formData.ip_address} onChange={e => setFormData({ ...formData, ip_address: e.target.value })} required placeholder="192.168.1.x" className="mt-1.5" />
            </div>
            <div>
              <Label>Nom / Hostname</Label>
              <Input value={formData.hostname || formData.name} onChange={e => setFormData({ ...formData, hostname: e.target.value, name: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label>Adresse MAC</Label>
              <Input value={formData.mac_address} onChange={e => setFormData({ ...formData, mac_address: e.target.value })} placeholder="AA:BB:CC:DD:EE:FF" className="mt-1.5" />
            </div>
            <div>
              <Label>Type *</Label>
              <Select value={formData.device_type} onValueChange={v => setFormData({ ...formData, device_type: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="routeur">Routeur</SelectItem>
                  <SelectItem value="switch">Switch</SelectItem>
                  <SelectItem value="serveur">Serveur</SelectItem>
                  <SelectItem value="poste_travail">Poste de travail</SelectItem>
                  <SelectItem value="imprimante">Imprimante</SelectItem>
                  <SelectItem value="point_acces_wifi">Borne WiFi</SelectItem>
                  <SelectItem value="camera">Caméra</SelectItem>
                  <SelectItem value="firewall">Firewall</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_ligne">En ligne</SelectItem>
                  <SelectItem value="hors_ligne">Hors ligne</SelectItem>
                  <SelectItem value="inconnu">Inconnu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Site</Label>
              <Select value={formData.site} onValueChange={v => setFormData({ ...formData, site: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="direction">Direction</SelectItem>
                  <SelectItem value="usine">Usine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sous-réseau</Label>
              <Input value={formData.subnet} onChange={e => setFormData({ ...formData, subnet: e.target.value })} placeholder="192.168.1.0/24" className="mt-1.5" />
            </div>
            <div>
              <Label>Fabricant</Label>
              <Input value={formData.manufacturer} onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label>Système d'exploitation</Label>
              <Input value={formData.os} onChange={e => setFormData({ ...formData, os: e.target.value })} className="mt-1.5" />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} className="mt-1.5" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {device ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}