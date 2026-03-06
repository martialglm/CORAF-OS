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
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function AccessForm({ open, onClose, type, employees = [], onSuccess }) {
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    badge_number: '',
    site: '',
    entry_point: '',
    action: 'entree',
    visitor_name: '',
    visitor_company: '',
    visitor_reason: '',
    is_visitor: type === 'visitor',
    authorized_by: '',
  });
  const [loading, setLoading] = useState(false);

  const handleEmployeeSelect = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    setFormData({
      ...formData,
      employee_id: employeeId,
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : '',
      badge_number: emp?.badge_number || '',
      site: emp?.site || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      ...formData,
      timestamp: new Date().toISOString(),
      is_visitor: type === 'visitor',
    };

    await base44.entities.AccessLog.create(data);
    
    setLoading(false);
    onSuccess();
    onClose();
    // Reset form
    setFormData({
      employee_id: '',
      employee_name: '',
      badge_number: '',
      site: '',
      entry_point: '',
      action: 'entree',
      visitor_name: '',
      visitor_company: '',
      visitor_reason: '',
      is_visitor: type === 'visitor',
      authorized_by: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {type === 'visitor' ? 'Enregistrer un visiteur' : 'Enregistrer un mouvement'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, action: 'entree'})}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                formData.action === 'entree' 
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 hover:border-emerald-200"
              )}
            >
              <LogIn className="h-5 w-5" />
              <span className="font-medium">Entrée</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, action: 'sortie'})}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                formData.action === 'sortie' 
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-slate-200 hover:border-red-200"
              )}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sortie</span>
            </button>
          </div>

          <div className="space-y-4">
            {type === 'employee' ? (
              <>
                <div>
                  <Label>Employé *</Label>
                  <Select
                    value={formData.employee_id}
                    onValueChange={handleEmployeeSelect}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Sélectionner un employé..." />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.filter(e => e.status === 'actif').map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} {emp.badge_number ? `(${emp.badge_number})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="visitor_name">Nom du visiteur *</Label>
                  <Input
                    id="visitor_name"
                    value={formData.visitor_name}
                    onChange={(e) => setFormData({...formData, visitor_name: e.target.value})}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="visitor_company">Entreprise</Label>
                  <Input
                    id="visitor_company"
                    value={formData.visitor_company}
                    onChange={(e) => setFormData({...formData, visitor_company: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="visitor_reason">Motif de la visite</Label>
                  <Textarea
                    id="visitor_reason"
                    value={formData.visitor_reason}
                    onChange={(e) => setFormData({...formData, visitor_reason: e.target.value})}
                    rows={2}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="authorized_by">Autorisé par</Label>
                  <Input
                    id="authorized_by"
                    value={formData.authorized_by}
                    onChange={(e) => setFormData({...formData, authorized_by: e.target.value})}
                    placeholder="Nom de l'employé responsable"
                    className="mt-1.5"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Site *</Label>
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
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Point d'entrée</Label>
                <Select
                  value={formData.entry_point}
                  onValueChange={(value) => setFormData({...formData, entry_point: value})}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entree_principale">Entrée principale</SelectItem>
                    <SelectItem value="entree_secondaire">Entrée secondaire</SelectItem>
                    <SelectItem value="parking">Parking</SelectItem>
                    <SelectItem value="entree_vip">Entrée VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {type === 'visitor' && (
              <div>
                <Label htmlFor="badge_number">Badge visiteur</Label>
                <Input
                  id="badge_number"
                  value={formData.badge_number}
                  onChange={(e) => setFormData({...formData, badge_number: e.target.value})}
                  placeholder="V-001"
                  className="mt-1.5"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={formData.action === 'entree' 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "bg-red-600 hover:bg-red-700"
              }
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}