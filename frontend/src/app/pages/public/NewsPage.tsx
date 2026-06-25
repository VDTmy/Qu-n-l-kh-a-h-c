import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { NewsCard } from '../../components/ui/NewsCard';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { BackButton } from '../../components/ui/BackButton';
import { newsApi } from '../../services/adminApi';
import { NewsArticle, assetUrl } from '../../services/api';
import { Calendar, Newspaper } from 'lucide-react';

export function NewsListPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    newsApi.list()
      .then(data => { setArticles((data as NewsArticle[]).filter(a => a.is_published)); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1>Tin tức</h1>
          <p className="text-sm text-muted-foreground mt-1">Cập nhật kiến thức và xu hướng giáo dục mới nhất</p>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={() => location.reload()} /> : articles.length === 0 ? (
          <EmptyState title="Chưa có tin tức" icon={Newspaper} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {articles.map(a => <NewsCard key={a.id} article={a} />)}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

export function NewsDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    newsApi.get(Number(id))
      .then(a => { setArticle(a); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  if (loading) return <PublicLayout><LoadingState /></PublicLayout>;
  if (error) return <PublicLayout><div className="max-w-3xl mx-auto px-4 py-8"><ErrorState error={error} /></div></PublicLayout>;
  if (!article) return null;

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-4"><BackButton to="/news" /></div>
        {article.category && (
          <span className="inline-block text-xs bg-accent text-white px-2 py-0.5 rounded-full mb-3">{article.category}</span>
        )}
        <h1 className="mb-3">{article.title}</h1>
        {article.created_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Calendar className="w-4 h-4" />
            {new Date(article.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        )}
        {article.thumbnail_url && (
          <img src={assetUrl(article.thumbnail_url)} alt={article.title} className="w-full rounded-xl mb-6 aspect-video object-cover" />
        )}
        <div className="prose max-w-none text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      </div>
    </PublicLayout>
  );
}
