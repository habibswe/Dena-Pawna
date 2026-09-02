import { getBackupLogs } from './actions';
import { BackupRestoreClient } from '@/components/admin/backup-restore-client';

export const dynamic = 'force-dynamic';

export default async function AdminBackupsPage() {
  const initialLogs = await getBackupLogs();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Backup & Data Recovery</h2>
        <p className="text-muted-foreground">Export 1-click system backups, restore data, and view audit history logs.</p>
      </div>

      <BackupRestoreClient initialLogs={initialLogs} />
    </div>
  );
}
