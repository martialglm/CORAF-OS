import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function VisitorRegistration({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_company: '',
    visitor_reason: '',
    site: '',
    entry_point: 'entree_principale',
    action: 'entree',
    authorized_by: '',
    badge_number: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.AccessLog.create({
      ...formData,
      is_visitor: true,
      timestamp: new Date().toISOString(),
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enregistrer un visiteur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Action */}
          <div className="flex gap-3">
            {['entree', 'sortie'].map(a => (
              <button
                key={a}
                type="button"
                onClick={() => setFormData({ ...formData, action: a })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-medium transition-all",
                  formData.action === a
                    ? a === 'entree' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-red-500 bg-red-50 text-red-700"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                {a === 'entree' ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>

          <div>
            <Label>Nom du visiteur *</Label>
            <Input value={formData.visitor_name} onChange={e => setFormData({ ...formData, visitor_name: e.target.value })} required className="mt-1.5" />
          </div>
          <div>
            <Label>Entreprise</Label>
            <Input value={formData.visitor_company} onChange={e => setFormData({ ...formData, visitor_company: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Motif</Label>
            <Textarea value={formData.visitor_reason} onChange={e => setFormData({ ...formData, visitor_reason: e.target.value })} rows={2} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Site *</Label>
              <Select value={formData.site} onValueChange={v => setFormData({ ...formData, site: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="usine">Usine</SelectItem>
                  <SelectItem value="direction">Direction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Badge visiteur</Label>
              <Input value={formData.badge_number} onChange={e => setFormData({ ...formData, badge_number: e.target.value })} placeholder="V-001" className="mt-1.5 font-mono" />
            </div>
          </div>
          <div>
            <Label>Autorisé par</Label>
            <Input value={formData.authorized_by} onChange={e => setFormData({ ...formData, authorized_by: e.target.value })} className="mt-1.5" />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading} className={formData.action === 'entree' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}