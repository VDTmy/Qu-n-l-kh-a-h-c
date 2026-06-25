import { Link } from 'react-router';
import { Calendar, Newspaper } from 'lucide-react';
import { NewsArticle, assetUrl } from '../../services/api';

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      to={`/news/${article.id}`}
      className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col"
    >
      <div className="aspect-video bg-secondary relative overflow-hidden">
        {article.thumbnail_url ? (
          <img
            src={assetUrl(article.thumbnail_url)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Newspaper className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        {article.category && (
          <span className="absolute top-2 left-2 bg-accent text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {article.category}
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{article.summary}</p>
        {article.created_at && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(article.created_at).toLocaleDateString('vi-VN')}
          </div>
        )}
      </div>
    </Link>
  );
}
