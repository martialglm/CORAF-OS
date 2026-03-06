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

export default function ApplicationForm({ open, onClose, application, jobs = [], onSuccess }) {
  const [formData, setFormData] = useState(application || {
    job_posting_id: '',
    job_title: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cv_url: '',
    cover_letter: '',
    status: 'recue',
    notes: '',
    interview_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, cv_url: file_url });
    setUploading(false);
  };

  const handleJobSelect = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    setFormData({
      ...formData,
      job_posting_id: jobId,
      job_title: job?.title || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (application) {
      await base44.entities.JobApplication.update(application.id, formData);
    } else {
      await base44.entities.JobApplication.create(formData);
    }
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  const openJobs = jobs.filter(j => j.status === 'ouvert');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {application ? 'Modifier la candidature' : 'Nouvelle candidature'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Poste *</Label>
              <Select
                value={formData.job_posting_id}
                onValueChange={handleJobSelect}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionner un poste..." />
                </SelectTrigger>
                <SelectContent>
                  {openJobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Nom *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div className="col-span-2">
              <Label>CV</Label>
              <div className="mt-1.5 flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">{uploading ? 'Téléchargement...' : 'Télécharger CV'}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {formData.cv_url && (
                  <a 
                    href={formData.cv_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Voir le CV
                  </a>
                )}
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="cover_letter">Lettre de motivation</Label>
              <Textarea
                id="cover_letter"
                value={formData.cover_letter}
                onChange={(e) => setFormData({...formData, cover_letter: e.target.value})}
                rows={4}
                className="mt-1.5"
              />
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
                  <SelectItem value="recue">Reçue</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="entretien">Entretien</SelectItem>
                  <SelectItem value="acceptee">Acceptée</SelectItem>
                  <SelectItem value="refusee">Refusée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="interview_date">Date d'entretien</Label>
              <Input
                id="interview_date"
                type="datetime-local"
                value={formData.interview_date}
                onChange={(e) => setFormData({...formData, interview_date: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Commentaires sur le candidat..."
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || uploading} className="bg-violet-600 hover:bg-violet-700">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {application ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}