import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { Pencil, Mail, Phone, Briefcase, Calendar, FileText, Loader2 } from 'lucide-react';
import moment from 'moment';
import { cn } from "@/lib/utils";

const statusColors = {
  recue: "bg-slate-100 text-slate-700",
  en_cours: "bg-blue-100 text-blue-700",
  entretien: "bg-violet-100 text-violet-700",
  acceptee: "bg-emerald-100 text-emerald-700",
  refusee: "bg-red-100 text-red-700",
};

const statusLabels = {
  recue: 'Reçue',
  en_cours: 'En cours',
  entretien: 'Entretien',
  acceptee: 'Acceptée',
  refusee: 'Refusée',
};

export default function ApplicationDetails({ application, onClose, onEdit, onUpdate }) {
  const [notes, setNotes] = useState(application?.notes || '');
  const [interviewDate, setInterviewDate] = useState(application?.interview_date || '');
  const [saving, setSaving] = useState(false);

  if (!application) return null;

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.JobApplication.update(application.id, { 
      notes,
      interview_date: interviewDate
    });
    setSaving(false);
    onUpdate();
  };

  return (
    <Sheet open={!!application} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xl">
                  {getInitials(application.first_name, application.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl">
                  {application.first_name} {application.last_name}
                </SheetTitle>
                <p className="text-sm text-slate-500 mt-1">{application.job_title}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onEdit(application)}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>

          <Badge className={cn("w-fit", statusColors[application.status])}>
            {statusLabels[application.status]}
          </Badge>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Contact</h4>
            <div className="space-y-2">
              <a 
                href={`mailto:${application.email}`}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Mail className="h-5 w-5 text-slate-400" />
                <span className="text-slate-600">{application.email}</span>
              </a>
              {application.phone && (
                <a 
                  href={`tel:${application.phone}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Phone className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-600">{application.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* CV */}
          {application.cv_url && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">CV</h4>
              <a 
                href={application.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-blue-700 font-medium">Télécharger le CV</span>
              </a>
            </div>
          )}

          {/* Lettre de motivation */}
          {application.cover_letter && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Lettre de motivation</h4>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {application.cover_letter}
                </p>
              </div>
            </div>
          )}

          {/* Entretien */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Planifier un entretien</h4>
            <Input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Notes internes</h4>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter des notes sur le candidat..."
              rows={4}
            />
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </div>

          {/* Timeline */}
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4" />
              <span>Candidature reçue le {moment(application.created_date).format('DD MMMM YYYY')}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}