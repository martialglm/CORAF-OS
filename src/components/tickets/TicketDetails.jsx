import React, { useState } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { Pencil, Clock, User, MapPin, Tag, AlertCircle, CheckCircle2, Loader2, MessageSquare, UserPlus } from 'lucide-react';
import moment from 'moment';
import { cn } from "@/lib/utils";
import TicketWorkflow from './TicketWorkflow';
import AssignAgentsModal from './AssignAgentsModal';

const priorityColors = {
  critique: "bg-red-100 text-red-700 border-red-200",
  haute: "bg-orange-100 text-orange-700 border-orange-200",
  moyenne: "bg-yellow-100 text-yellow-700 border-yellow-200",
  basse: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusColors = {
  nouveau: "bg-blue-100 text-blue-700",
  assigne: "bg-violet-100 text-violet-700",
  en_cours: "bg-indigo-100 text-indigo-700",
  en_attente: "bg-amber-100 text-amber-700",
  resolu: "bg-emerald-100 text-emerald-700",
  ferme: "bg-slate-100 text-slate-700",
};

export default function TicketDetails({ ticket, onClose, onEdit, onUpdate, currentUser }) {
  const [comment, setComment] = useState('');
  const [resolution, setResolution] = useState(ticket?.resolution || '');
  const [saving, setSaving] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  if (!ticket) return null;

  const role = currentUser?.role || 'client';
  const isAdmin = role === 'admin';
  const isSuperviseur = role === 'superviseur';
  const isTechnicien = role === 'technicien';
  const isClient = role === 'client';

  const canChangeStatus = isAdmin || isSuperviseur || isTechnicien;
  const canResolve = isAdmin || isTechnicien || isSuperviseur;
  const canClose = isAdmin || isClient || isSuperviseur;
  const canAssign = isAdmin || isSuperviseur;

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    await base44.entities.Ticket.update(ticket.id, {
      status: newStatus,
      resolved_date: newStatus === 'resolu' ? new Date().toISOString() : ticket.resolved_date
    });
    setSaving(false);
    onUpdate();
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    const comments = [...(ticket.comments || []), {
      author: currentUser?.full_name || currentUser?.email,
      role: role,
      content: comment,
      date: new Date().toISOString(),
    }];
    await base44.entities.Ticket.update(ticket.id, { comments });
    setComment('');
    setSaving(false);
    onUpdate();
  };

  const handleSaveResolution = async () => {
    setSaving(true);
    await base44.entities.Ticket.update(ticket.id, { resolution, status: 'resolu', resolved_date: new Date().toISOString() });
    setSaving(false);
    onUpdate();
  };

  const handleClientClose = async () => {
    setSaving(true);
    await base44.entities.Ticket.update(ticket.id, { status: 'ferme', closed_by_client: true });
    setSaving(false);
    onUpdate();
    onClose();
  };

  const roleColors = {
    admin: "bg-slate-800 text-white",
    superviseur: "bg-violet-600 text-white",
    technicien: "bg-blue-600 text-white",
    client: "bg-emerald-600 text-white",
  };

  return (
    <>
      <Sheet open={!!ticket} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-mono text-slate-400">{ticket.reference}</span>
                <SheetTitle className="text-xl mt-1">{ticket.title}</SheetTitle>
              </div>
              {(isAdmin || ticket.created_by === currentUser?.email) && (
                <Button variant="outline" size="sm" onClick={() => onEdit(ticket)}>
                  <Pencil className="h-4 w-4 mr-2" /> Modifier
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={cn("border", priorityColors[ticket.priority])}>
                <AlertCircle className="h-3 w-3 mr-1" />{ticket.priority}
              </Badge>
              <Badge className={statusColors[ticket.status]}>
                {ticket.status?.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">{ticket.type}</Badge>
            </div>

            {/* Workflow */}
            <div className="mt-2">
              <TicketWorkflow status={ticket.status} />
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-400" />
                <div>
                  <span className="text-slate-600">{ticket.requester_name || 'N/A'}</span>
                  <span className="block text-xs text-slate-400">{ticket.requester_department}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">{moment(ticket.created_date).format('DD/MM/YYYY HH:mm')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 capitalize">{ticket.site || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 capitalize">{ticket.category || '-'}</span>
              </div>
            </div>

            {/* Agents assignés */}
            {(isAdmin || isSuperviseur || isTechnicien) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900">Agents assignés</h4>
                  {canAssign && (
                    <Button size="sm" variant="outline" onClick={() => setShowAssign(true)}>
                      <UserPlus className="h-4 w-4 mr-1" /> Assigner
                    </Button>
                  )}
                </div>
                {ticket.assigned_agents?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {ticket.assigned_agents.map(email => (
                      <span key={email} className="text-xs bg-violet-50 text-violet-700 px-3 py-1 rounded-full border border-violet-200">
                        {email}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Aucun agent assigné</p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Description</h4>
              <p className="text-slate-600 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">
                {ticket.description || 'Aucune description.'}
              </p>
            </div>

            {/* Changer statut (superviseur/technicien/admin) */}
            {canChangeStatus && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Changer le statut</h4>
                <Select value={ticket.status} onValueChange={handleStatusChange} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isAdmin && <SelectItem value="nouveau">Nouveau</SelectItem>}
                    {canAssign && <SelectItem value="assigne">Assigné</SelectItem>}
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    {canResolve && <SelectItem value="resolu">Résolu</SelectItem>}
                    {isAdmin && <SelectItem value="ferme">Fermé</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Résolution (technicien/superviseur/admin) */}
            {canResolve && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Résolution</h4>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Décrivez la solution appliquée..."
                  rows={3}
                />
                <Button onClick={handleSaveResolution} size="sm" className="mt-2 bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Marquer comme résolu
                </Button>
              </div>
            )}

            {/* Bouton fermeture client */}
            {isClient && ticket.status === 'resolu' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="font-medium text-emerald-800">Votre problème est résolu ?</p>
                <p className="text-sm text-emerald-600 mt-1">
                  {ticket.resolution || 'Le technicien a marqué ce ticket comme résolu.'}
                </p>
                <Button onClick={handleClientClose} className="mt-3 bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmer et fermer le ticket
                </Button>
              </div>
            )}

            {/* Commentaires */}
            <div>
              <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Historique des échanges
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {(ticket.comments || []).length === 0 ? (
                  <p className="text-sm text-slate-400">Aucun commentaire</p>
                ) : (
                  (ticket.comments || []).map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={cn("px-2 py-0.5 rounded text-xs font-medium h-fit mt-1 shrink-0", roleColors[c.role] || "bg-slate-200 text-slate-700")}>
                        {c.role}
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-700">{c.author}</span>
                          <span className="text-xs text-slate-400">{moment(c.date).fromNow()}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={handleAddComment} size="sm" disabled={saving || !comment.trim()} className="self-end">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Envoyer'}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {showAssign && (
        <AssignAgentsModal
          open={showAssign}
          onClose={() => setShowAssign(false)}
          ticket={ticket}
          onSuccess={() => { onUpdate(); setShowAssign(false); }}
        />
      )}
    </>
  );
}