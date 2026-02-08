import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, ExternalLink } from 'lucide-react';
import { useGetAllTestBenches } from '../../hooks/useQueries';
import { searchBenches } from '../../utils/search';
import { AddBenchModal } from './components/AddBenchModal';
import { BenchPhoto } from './components/BenchPhoto';
import { useI18n } from '../../i18n/useI18n';

export function BenchListPage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { data: benches = [], isLoading } = useGetAllTestBenches();

  const filteredBenches = searchQuery.trim()
    ? searchBenches(benches, searchQuery)
    : benches;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t('benches.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('benches.title')}</h1>
        <p className="text-muted-foreground">{t('benches.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('benches.search')}</CardTitle>
          <CardDescription>
            {t('benches.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('benches.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('benches.addNew')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {benches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-2">{t('benches.noBenches')}</p>
            <p className="text-muted-foreground mb-4">{t('benches.noBenchesDesc')}</p>
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('benches.addNew')}
            </Button>
          </CardContent>
        </Card>
      ) : filteredBenches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-2">{t('benches.noResults')}</p>
            <p className="text-muted-foreground">{t('benches.noResultsDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBenches.map((bench) => (
            <Card key={bench.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <BenchPhoto
                photo={bench.photo}
                alt={bench.name}
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <CardTitle className="line-clamp-1">{bench.name}</CardTitle>
                <CardDescription className="line-clamp-2">{bench.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bench.agileCode && (
                  <div className="text-sm">
                    <span className="font-medium">{t('benches.agileCode')}:</span>{' '}
                    <span className="text-muted-foreground">{bench.agileCode}</span>
                  </div>
                )}
                {bench.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {bench.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag.tagName}
                      </Badge>
                    ))}
                    {bench.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{bench.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <Link to="/benches/$benchId" params={{ benchId: bench.id }} className="flex-1">
                    <Button variant="default" className="w-full">
                      {t('benches.viewDetails')}
                    </Button>
                  </Link>
                </div>
                {(bench.plmAgileUrl || bench.decawebUrl) && (
                  <div className="flex gap-2">
                    {bench.plmAgileUrl && (
                      <a
                        href={bench.plmAgileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {t('benches.plmAgile')}
                        </Button>
                      </a>
                    )}
                    {bench.decawebUrl && (
                      <a
                        href={bench.decawebUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {t('benches.decaweb')}
                        </Button>
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddBenchModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
}
