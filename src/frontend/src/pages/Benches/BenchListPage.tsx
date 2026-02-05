import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllTestBenches } from '../../hooks/useQueries';
import { Search, TestTube2, ExternalLink, Plus } from 'lucide-react';
import { searchBenches } from '../../utils/search';
import { AddBenchModal } from './components/AddBenchModal';
import { BenchPhoto } from './components/BenchPhoto';

export default function BenchListPage() {
  const navigate = useNavigate();
  const { data: benches, isLoading } = useGetAllTestBenches();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredBenches = useMemo(() => {
    if (!benches) return [];
    if (!searchQuery.trim()) return benches;
    return searchBenches(benches, searchQuery);
  }, [benches, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading test benches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube2 className="h-8 w-8" />
            Test Benches
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage electronic test bench records
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bench
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Search by bench name, AGILE code, tags, or description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search test benches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBenches.map((bench) => (
          <Card
            key={bench.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate({ to: '/benches/$benchId', params: { benchId: bench.id } })}
          >
            <CardHeader>
              <div className="aspect-video w-full bg-muted rounded-md overflow-hidden mb-3">
                <BenchPhoto
                  photo={bench.photo}
                  alt={bench.name}
                  className="w-full h-full"
                />
              </div>
              <CardTitle className="flex items-start justify-between gap-2">
                <span className="line-clamp-1">{bench.name}</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {bench.description || 'No description available'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bench.agileCode && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">AGILE Code:</span>
                  <code className="font-mono font-semibold">{bench.agileCode}</code>
                </div>
              )}
              {bench.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bench.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
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
              {bench.plmAgileUrl && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a
                    href={bench.plmAgileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View in PLM Agile
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBenches.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <TestTube2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No test benches match your search' : 'No test benches available'}
            </p>
          </CardContent>
        </Card>
      )}

      <AddBenchModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
