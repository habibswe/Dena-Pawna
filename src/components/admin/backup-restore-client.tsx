'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, History, Loader2, CheckCircle2, FileJson, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  exportSystemBackup, 
  restoreSystemBackup, 
  getBackupLogs, 
  deleteBackupLog, 
  clearAllBackupLogs 
} from '@/app/super-admin/(dashboard)/backups/actions';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface BackupLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
}

export function BackupRestoreClient({ initialLogs }: { initialLogs: BackupLog[] }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<any | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [logs, setLogs] = useState<BackupLog[]>(initialLogs);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isDeletingAction, setIsDeletingAction] = useState(false);
  const router = useRouter();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await exportSystemBackup();
      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (res.backup) {
        const jsonString = JSON.stringify(res.backup, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
        link.href = url;
        link.download = `denapawna-system-backup-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('System backup downloaded successfully!');
        
        // Immediate log update without page refresh
        const freshLogs = await getBackupLogs();
        setLogs(freshLogs);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to export backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a valid JSON backup file.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text || text.trim() === '') {
          toast.error('The selected file is empty.');
          setSelectedFile(null);
          setParsedBackup(null);
          return;
        }

        const json = JSON.parse(text);
        
        // Extract data payload regardless of wrapping structure
        let extractedData: any = null;
        if (json.data && typeof json.data === 'object') {
          extractedData = json.data;
        } else if (json.backup?.data && typeof json.backup.data === 'object') {
          extractedData = json.backup.data;
        } else if (json.backup && typeof json.backup === 'object') {
          extractedData = json.backup;
        } else if (Array.isArray(json)) {
          extractedData = { transactions: json };
        } else if (typeof json === 'object' && json !== null) {
          extractedData = json;
        }

        if (!extractedData) {
          toast.error('Invalid backup format: unable to extract data payload.');
          setSelectedFile(null);
          setParsedBackup(null);
          return;
        }

        setParsedBackup({ data: extractedData });
      } catch (e: any) {
        toast.error('Failed to parse backup JSON file: ' + (e.message || 'Invalid JSON'));
        setSelectedFile(null);
        setParsedBackup(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!parsedBackup) return;
    try {
      setIsRestoring(true);
      const res = await restoreSystemBackup(parsedBackup);
      if (res.error) {
        toast.error(res.error);
      } else if (res.success) {
        const c = res.counts || {};
        toast.success(`Restored: ${c.accounts || 0} accounts, ${c.transactions || 0} transactions, ${c.people || 0} people, ${c.categories || 0} categories, ${c.budgets || 0} budgets.`);
        setSelectedFile(null);
        setParsedBackup(null);
        setIsConfirmOpen(false);
        
        // Immediate log update without page refresh
        const freshLogs = await getBackupLogs();
        setLogs(freshLogs);
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore backup');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteSingleLog = async () => {
    if (!deletingLogId) return;
    try {
      setIsDeletingAction(true);
      const res = await deleteBackupLog(deletingLogId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Log entry deleted.');
        setLogs(prev => prev.filter(l => l.id !== deletingLogId));
        setDeletingLogId(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete log');
    } finally {
      setIsDeletingAction(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setIsDeletingAction(true);
      const res = await clearAllBackupLogs();
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('All backup & restore logs cleared.');
        setLogs([]);
        setIsClearAllOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to clear logs');
    } finally {
      setIsDeletingAction(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cards Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Card */}
        <Card className="glass-panel border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Export System Backup</CardTitle>
                <CardDescription>Download full JSON snapshot of all system tables</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generates a complete offline backup file containing all user accounts, transaction ledgers, people records, categories, and budgets.
            </p>
            <Button onClick={handleExport} disabled={isExporting} className="w-full gap-2 font-semibold">
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isExporting ? 'Generating Backup...' : 'Download System Backup (.json)'}
            </Button>
          </CardContent>
        </Card>

        {/* Restore Card */}
        <Card className="glass-panel border-amber-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 p-2.5 rounded-xl">
                <Upload className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Restore System Backup</CardTitle>
                <CardDescription>Upload a JSON backup file to restore records</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a previously downloaded `.json` system backup file to restore all missing records safely.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-sm cursor-pointer text-muted-foreground"
              />
              {selectedFile && parsedBackup && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                  <p className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <FileJson className="h-4 w-4" /> Ready to Restore: {selectedFile.name}
                  </p>
                  <p className="text-muted-foreground">
                    Contains {parsedBackup.data?.accounts?.length || 0} accounts, {parsedBackup.data?.transactions?.length || 0} transactions, {parsedBackup.data?.people?.length || 0} people, {parsedBackup.data?.categories?.length || 0} categories.
                  </p>
                </div>
              )}
              <Button
                onClick={() => setIsConfirmOpen(true)}
                disabled={!parsedBackup || isRestoring}
                variant="destructive"
                className="w-full gap-2 font-semibold"
              >
                {isRestoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isRestoring ? 'Restoring System Data...' : 'Restore System Data'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log History Table */}
      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Backup & Restore Activity History
            </CardTitle>
            <CardDescription>System log of all previous backup exports and restore operations</CardDescription>
          </div>
          {logs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClearAllOpen(true)}
              className="text-destructive hover:bg-destructive/10 border-destructive/20 gap-1 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear History
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto border-y">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Summary Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isExport = log.action === 'BACKUP_EXPORT';
                  const summary = log.details?.summary || {};
                  return (
                    <tr key={log.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-semibold">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isExport 
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {isExport ? <Download className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                          {isExport ? 'EXPORT BACKUP' : 'RESTORE IMPORT'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.created_at), 'dd MMM yyyy, hh:mm:ss a')}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        Profiles: {summary.profiles || 0} | People: {summary.people || 0} | Categories: {summary.categories || 0} | Accounts: {summary.accounts || 0} | Txs: {summary.transactions || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Success
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingLogId(log.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No backup or restore activity logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Restore Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => !isRestoring && setIsConfirmOpen(false)}
        onConfirm={handleConfirmRestore}
        title="Confirm System Data Restore?"
        description="This operation will restore all profiles, people, accounts, categories, budgets, and transactions from the selected backup file. Are you sure you want to proceed?"
        isDeleting={isRestoring}
      />

      {/* Confirm Delete Single Log */}
      <ConfirmDialog
        isOpen={!!deletingLogId}
        onClose={() => !isDeletingAction && setDeletingLogId(null)}
        onConfirm={handleDeleteSingleLog}
        title="Delete Log Entry?"
        description="Are you sure you want to delete this backup activity log? This cannot be undone."
        isDeleting={isDeletingAction}
      />

      {/* Confirm Clear All Logs */}
      <ConfirmDialog
        isOpen={isClearAllOpen}
        onClose={() => !isDeletingAction && setIsClearAllOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All Backup Logs?"
        description="Are you sure you want to delete all backup and restore activity history logs?"
        isDeleting={isDeletingAction}
      />
    </div>
  );
}
