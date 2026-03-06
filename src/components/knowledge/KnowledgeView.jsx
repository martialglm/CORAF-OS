import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, Tag } from 'lucide-react';
import moment from 'moment';
import { cn } from "@/lib/utils";

const categoryColors = {
  guide: "bg-blue-100 text-blue-700",
  faq: "bg-violet-100 text-violet-700",
  procedure: "bg-emerald-100 text-emerald-700",
  solution: "bg-amber-100 text-amber-700",
  documentation: "bg-slate-100 text-slate-700",
};

export default function KnowledgeView({ article, onClose }) {
  if (!article) return null;

  return (
    <Sheet open={!!article} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={categoryColors[article.category]}>
              {article.category}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views || 0} vues
            </Badge>
          </div>
          <SheetTitle className="text-2xl text-left">{article.title}</SheetTitle>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {moment(article.created_date).format('DD MMMM YYYY')}
            </span>
          </div>
          {article.tags?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-slate-400" />
              {article.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </SheetHeader>

        <div className="mt-8 prose prose-slate max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-slate-900">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-slate-800">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700">{children}</h3>,
              p: ({ children }) => <p className="mb-4 text-slate-600 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-slate-600">{children}</li>,
              code: ({ inline, children }) => 
                inline ? (
                  <code className="px-1.5 py-0.5 bg-slate-100 rounded text-sm font-mono text-slate-800">{children}</code>
                ) : (
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-4">
                    <code className="font-mono text-sm">{children}</code>
                  </pre>
                ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 my-4">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {children}
                </a>
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </SheetContent>
    </Sheet>
  );
}