import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileJson,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { VocabularyWord, CEFRLevel, VocabularyCategory, WordType } from '@/types';
import { batchImportVocabulary, getVocabularyList } from '@/services/vocabularyService';
import { cn } from '@/utils/cn';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

interface StagedEntry {
  raw: Partial<VocabularyWord>;
  status: 'new' | 'duplicate' | 'fallback';
  reason?: string;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [overwriteDuplicates, setOverwriteDuplicates] = useState(false);
  const [stagedEntries, setStagedEntries] = useState<StagedEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Parse raw JSON into partial vocabulary objects
  const parseData = async (content: string) => {
    setError(null);
    setImportStatus(null);
    let parsed: Partial<VocabularyWord>[] = [];

    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        parsed = data;
      } else if (data.words && Array.isArray(data.words)) {
        parsed = data.words;
      } else {
        throw new Error('JSON must be an array of vocabulary entries.');
      }

      // Validate against current DB entries for duplicate detection
      const existing = await getVocabularyList();
      const existingMap = new Set(existing.map((w) => w.german.trim().toLowerCase()));

      const staged: StagedEntry[] = parsed.map((item) => {
        const german = item.german?.trim().toLowerCase() || '';
        const isDup = existingMap.has(german);
        const hasFallback = !item.level || !item.category;

        return {
          raw: {
            ...item,
            level: (item.level || 'A1') as CEFRLevel,
            category: (item.category || 'other') as VocabularyCategory,
            type: (item.type === 'phrase' ? 'sentence' : (item.type || 'noun')) as WordType,
          },
          status: isDup ? 'duplicate' : hasFallback ? 'fallback' : 'new',
          reason: isDup
            ? 'Word already in dictionary'
            : hasFallback
            ? 'Defaulted level/category'
            : undefined,
        };
      });

      setStagedEntries(staged);
    } catch (err: any) {
      setError(err.message || 'Failed to parse JSON.');
      setStagedEntries([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Please select a valid .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseData(content);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (stagedEntries.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const rawList = stagedEntries.map((s) => s.raw);
      const res = await batchImportVocabulary(rawList, overwriteDuplicates);
      setImportStatus(
        `Batch commit successful: ${res.added} added, ${res.updated} updated, ${res.skipped} skipped.`
      );
      setStagedEntries([]);
      if (onImportComplete) onImportComplete();
    } catch (err: any) {
      setError(err.message || 'Batch commit failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const words = await getVocabularyList();
      const jsonStr = JSON.stringify(words, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wortschatz-mm-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Export failed.');
    } finally {
      setLoading(false);
    }
  };

  const totalFound = stagedEntries.length;
  const validNew = stagedEntries.filter((s) => s.status === 'new').length;
  const duplicates = stagedEntries.filter((s) => s.status === 'duplicate').length;
  const fallbacks = stagedEntries.filter((s) => s.status === 'fallback').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[32px] max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Import/Export</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('import')}
            className={cn(
              'py-2 rounded-xl text-xs font-black transition-all',
              activeTab === 'import'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Import (JSON)
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={cn(
              'py-2 rounded-xl text-xs font-black transition-all',
              activeTab === 'export'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Export (JSON)
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {importStatus && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {activeTab === 'import' ? (
          <div className="space-y-4">
            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 bg-indigo-50/40 rounded-3xl p-6 text-center space-y-1.5 cursor-pointer hover:bg-indigo-50/70 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drop <span className="text-indigo-600">.json</span> file
              </p>
            </div>

            {/* Validation Stats & Preview */}
            {stagedEntries.length > 0 && (
              <>
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-2.5 text-center">
                    <div className="text-xl font-black text-sky-900">{totalFound}</div>
                    <div className="text-[10px] font-bold text-sky-700">Total Found</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 text-center">
                    <div className="text-xl font-black text-emerald-900">{validNew}</div>
                    <div className="text-[10px] font-bold text-emerald-700">Valid New</div>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-2.5 text-center">
                    <div className="text-xl font-black text-rose-900">{duplicates}</div>
                    <div className="text-[10px] font-bold text-rose-700">Duplicates</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 text-center">
                    <div className="text-xl font-black text-amber-900">{fallbacks}</div>
                    <div className="text-[10px] font-bold text-amber-700">Fallback ('other')</div>
                  </div>
                </div>

                {/* Overwrite Toggle */}
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">
                      Overwrite existing duplicates
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Default: Skip items matching existing German words
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={overwriteDuplicates}
                    onChange={(e) => setOverwriteDuplicates(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 rounded"
                  />
                </label>

                {/* Staged Items Preview */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    Validation Preview ({stagedEntries.length} items)
                  </div>
                  <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs">
                    {stagedEntries.slice(0, 50).map((item, idx) => (
                      <div key={idx} className="px-4 py-2 flex items-center justify-between">
                        <div className="truncate mr-2">
                          <strong className="text-slate-900">{item.raw.german}</strong>{' '}
                          <span className="text-slate-400">&rarr;</span> {item.raw.english}{' '}
                          {item.raw.myanmar && <span className="text-amber-700">({item.raw.myanmar})</span>}{' '}
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold ml-1">
                            {item.raw.level} • {item.raw.category}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-black shrink-0',
                            item.status === 'new'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'duplicate'
                              ? overwriteDuplicates
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {item.status === 'new'
                            ? 'NEW'
                            : item.status === 'duplicate'
                            ? overwriteDuplicates
                              ? 'OVERWRITE'
                              : 'DUPLICATE (SKIP)'
                            : 'FALLBACK OK'}
                        </span>
                      </div>
                    ))}
                    {stagedEntries.length > 50 && (
                      <div className="p-2 text-center text-xs text-slate-400">
                        ... and {stagedEntries.length - 50} more items
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStagedEntries([])}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitImport}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-2xl text-xs font-extrabold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    {loading ? 'Importing words...' : 'Import Words'}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Export Subview */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <FileJson className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">
                Export all vocabulary items
              </p>
            </div>
            <button
              onClick={handleExportDownload}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-extrabold hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? 'Exporting...' : 'Download JSON'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
