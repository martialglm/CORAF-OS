import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, BookOpen, Eye, Pencil, Trash2, FileText, HelpCircle, Lightbulb, Bookmark } from 'lucide-react';
import { cn } from "@/lib/utils";
import moment from 'moment';
import KnowledgeForm from '@/components/knowledge/KnowledgeForm';
import KnowledgeView from '@/components/knowledge/KnowledgeView';
import { Skeleton } from "@/components/ui/skeleton";

const categoryIcons = {
  guide: BookOpen,
  faq: HelpCircle,
  procedure: FileText,
  solution: Lightbulb,
  documentation: Bookmark,
};

const categoryColors = {
  guide: "bg-blue-100 text-blue-700",
  faq: "bg-violet-100 text-violet-700",
  procedure: "bg-emerald-100 text-emerald-700",
  solution: "bg-amber-100 text-amber-700",
  documentation: "bg-slate-100 text-slate-700",
};

export default function Knowledge() {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [viewingArticle, setViewingArticle] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['knowledge'],
    queryFn: () => base44.entities.KnowledgeArticle.list('-created_date')
  });

  const handleDelete = async (article) => {
    if (confirm('Supprimer cet article ?')) {
      await base44.entities.KnowledgeArticle.delete(article.id);
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    }
  };

  const handleView = async (article) => {
    await base44.entities.KnowledgeArticle.update(article.id, { 
      views: (article.views || 0) + 1 
    });
    setViewingArticle(article);
    queryClient.invalidateQueries({ queryKey: ['knowledge'] });
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = !search || 
      article.title?.toLowerCase().includes(search.toLowerCase()) ||
      article.content?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    const isPublished = article.status === 'publie';
    return matchesSearch && matchesCategory && isPublished;
  });

  const categories = ['guide', 'faq', 'procedure', 'solution', 'documentation'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Base de connaissances</h1>
          <p className="text-slate-500 mt-1">Guides, FAQ et documentation technique</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un article..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter('all')}
            >
              Tous
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))
        ) : filteredArticles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            Aucun article trouvé
          </div>
        ) : (
          filteredArticles.map(article => {
            const Icon = categoryIcons[article.category] || BookOpen;
            return (
              <Card 
                key={article.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleView(article)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-2 rounded-lg", categoryColors[article.category])}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge className={categoryColors[article.category]} variant="secondary">
                        {article.category}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleView(article);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setEditingArticle(article);
                          setShowForm(true);
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(article);
                        }} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg mt-3 line-clamp-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {article.content?.replace(/[#*_`]/g, '').slice(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
                    <span>{moment(article.created_date).format('DD/MM/YYYY')}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views || 0} vues
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <KnowledgeForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingArticle(null);
        }}
        article={editingArticle}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['knowledge'] })}
      />

      <KnowledgeView
        article={viewingArticle}
        onClose={() => setViewingArticle(null)}
      />
    </div>
  );
}