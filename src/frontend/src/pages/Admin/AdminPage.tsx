import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, TestTube2, FileText, Users } from 'lucide-react';
import { AdminBenchesPanel } from './components/AdminBenchesPanel';
import { AdminDocumentsPanel } from './components/AdminDocumentsPanel';
import { AdminUsersPanel } from './components/AdminUsersPanel';
import { useI18n } from '../../i18n/useI18n';

export default function AdminPage() {
  const { t } = useI18n();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          {t('admin.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('admin.description')}
        </p>
      </div>

      <Tabs defaultValue="benches" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="benches">
            <TestTube2 className="h-4 w-4 mr-2" />
            {t('admin.tabBenches')}
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            {t('admin.tabDocuments')}
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            {t('admin.tabUsers')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="benches">
          <AdminBenchesPanel />
        </TabsContent>

        <TabsContent value="documents">
          <AdminDocumentsPanel />
        </TabsContent>

        <TabsContent value="users">
          <AdminUsersPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
