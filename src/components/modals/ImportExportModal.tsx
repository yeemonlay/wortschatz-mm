import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileJson,
  Download,
  AlertCircle,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { VocabularyWord, CEFRLevel, VocabularyCategory, WordType } from '@/types';
import { batchImportVocabulary, getVocabularyList } from '@/services/vocabularyService';
import initialVocabularyData from '@/database/initialVocabulary.json';
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
  const [rawText, setRawText] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Parse raw JSON or CSV into partial vocabulary objects
  const parseData = async (content: string, type: 'json' | 'csv') => {
    setError(null);
    setImportStatus(null);
    let parsed: Partial<VocabularyWord>[] = [];

    try {
      if (type === 'json') {
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          parsed = data;
        } else if (data.words && Array.isArray(data.words)) {
          parsed = data.words;
        } else {
          throw new Error('JSON must be an array of vocabulary entries.');
        }
      } else {
        // Simple CSV parser
        const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) throw new Error('CSV must contain a header and at least one row.');

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
        
        parsed = lines.slice(1).map((line) => {
          // Match commas outside quotes
          const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) =>
            v.trim().replace(/^["']|["']$/g, '')
          );
          const obj: any = {};
          headers.forEach((h, i) => {
            if (cols[i] !== undefined) {
              if (h === 'german' || h === 'word') obj.german = cols[i];
              else if (h === 'english' || h === 'translation') obj.english = cols[i];
              else if (h === 'myanmar' || h === 'burmese') obj.myanmar = cols[i];
              else if (h === 'type' || h === 'wordtype') obj.type = cols[i] as WordType;
              else if (h === 'article' || h === 'gender') obj.article = cols[i];
              else if (h === 'plural') obj.plural = cols[i];
              else if (h === 'level' || h === 'cefr') obj.level = cols[i] as CEFRLevel;
              else if (h === 'category') obj.category = cols[i] as VocabularyCategory;
              else if (h === 'example' || h === 'examplegerman') obj.exampleGerman = cols[i];
              else if (h === 'exampleenglish') obj.exampleEnglish = cols[i];
              else if (h === 'examplemyanmar') obj.exampleMyanmar = cols[i];
              else if (h === 'remark') obj.remark = cols[i];
            }
          });
          return obj;
        });
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
            type: (item.type || 'noun') as WordType,
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
      setError(err.message || 'Failed to parse file.');
      setStagedEntries([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.endsWith('.csv');
    const isJson = file.name.endsWith('.json');

    if (!isCsv && !isJson) {
      setError('Please select a valid .json or .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseData(content, isJson ? 'json' : 'csv');
    };
    reader.readAsText(file);
  };

  const handleTextParse = () => {
    if (!rawText.trim()) return;
    const isJson = rawText.trim().startsWith('[') || rawText.trim().startsWith('{');
    parseData(rawText, isJson ? 'json' : 'csv');
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
      setRawText('');
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
          <div>
            <h2 className="text-xl font-black text-slate-900">In-App Import / Export (Option B)</h2>
            <p className="text-xs text-slate-500">
              Atomic batch write to Cloud Firestore with duplicate detection
            </p>
          </div>
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
            Import & Validate (.JSON / .CSV)
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
            One-Click JSON Backup
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
                accept=".json,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drop <span className="text-indigo-600">.json</span> /{' '}
                <span className="text-indigo-600">.csv</span> file
              </p>
              <p className="text-[11px] text-slate-500">
                Missing level defaults to <strong>'A1'</strong> • Missing category defaults to{' '}
                <strong>'other'</strong>
              </p>
            </div>

            {/* Quick Load Goethe A1 Dataset & Paste Raw JSON/CSV Toggle */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setStagedEntries(
                    (initialVocabularyData as VocabularyWord[]).map((w) => ({
                      raw: w,
                      status: 'new',
                    }))
                  );
                  setImportStatus('Loaded 376 Goethe A1 items from populated dataset ready to commit.');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all border border-amber-300 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Quick-Load Goethe A1 (376 Words)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPasteArea(!showPasteArea)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{showPasteArea ? 'Hide Paste Area' : 'Or Paste JSON / CSV Directly'}</span>
              </button>
            </div>

            {showPasteArea && (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`[{"german": "der Hund", "english": "dog", "myanmar": "ခွေး", "level": "A1", "category": "nature"}]`}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleTextParse}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
                >
                  Parse & Stage
                </button>
              </div>
            )}

            {/* Validation Stats */}
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
                    className="px-5 py-2.5 rounded-2xl text-xs font-extrabold bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
                  >
                    {loading ? 'Writing to Firestore...' : 'Commit Batch Write to Firestore'}
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
              <h3 className="text-base font-extrabold text-slate-900">
                One-Click JSON Database Backup
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Exports all vocabulary items (nouns, verbs, adjectives, sentences) with their CEFR
                levels, 16 categories, and dual Myanmar & English translations.
              </p>
            </div>
            <button
              onClick={handleExportDownload}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? 'Preparing Snapshot...' : 'Download JSON Snapshot'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
