import AdminGate from '../../components/admin/AdminGate';
import { Settings } from 'lucide-react';
import { AdminBenchesPanel } from './components/AdminBenchesPanel';
import { AdminDocumentsPanel } from './components/AdminDocumentsPanel';
import { AdminUsersPanel } from './components/AdminUsersPanel';

export default function AdminPage() {
  return (
    <AdminGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Administration
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage system configuration, users, and data
          </p>
        </div>

        <div className="space-y-6">
          <AdminBenchesPanel />
          <AdminDocumentsPanel />
          <AdminUsersPanel />
        </div>
      </div>
    </AdminGate>
  );
}
