import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle } from 'lucide-react';
import {
  VocabularyWord,
  WordType,
  CEFRLevel,
  VocabularyCategory,
  GermanArticle,
  CATEGORIES_META,
  CEFR_LEVELS_LIST,
} from '@/types';
import { addVocabularyWord, updateVocabularyWord, deleteVocabularyWord } from '@/services/vocabularyService';
import { cn } from '@/utils/cn';

interface WordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWord?: VocabularyWord | null;
  onSaved?: () => void;
}

export const WordFormModal: React.FC<WordFormModalProps> = ({
  isOpen,
  onClose,
  editingWord,
  onSaved,
}) => {
  const [wordType, setWordType] = useState<WordType>('noun');
  const [level, setLevel] = useState<CEFRLevel>('A1');
  const [category, setCategory] = useState<VocabularyCategory>('greetings');
  const [article, setArticle] = useState<GermanArticle>('der');
  const [german, setGerman] = useState('');
  const [english, setEnglish] = useState('');
  const [myanmar, setMyanmar] = useState('');
  const [plural, setPlural] = useState('');
  const [conjugationSummary, setConjugationSummary] = useState('');
  const [comparativeSummary, setComparativeSummary] = useState('');
  const [exampleGerman, setExampleGerman] = useState('');
  const [exampleEnglish, setExampleEnglish] = useState('');
  const [exampleMyanmar, setExampleMyanmar] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingWord) {
      setWordType(editingWord.type || 'noun');
      setLevel(editingWord.level || 'A1');
      setCategory(editingWord.category || 'other');
      setArticle(editingWord.article || 'der');
      setGerman(editingWord.german || '');
      setEnglish(editingWord.english || '');
      setMyanmar(editingWord.myanmar || '');
      setPlural(editingWord.plural || '');
      setConjugationSummary(editingWord.conjugationSummary || '');
      setComparativeSummary(editingWord.comparativeSummary || '');
      setExampleGerman(editingWord.exampleGerman || '');
      setExampleEnglish(editingWord.exampleEnglish || '');
      setExampleMyanmar(editingWord.exampleMyanmar || '');
      setRemark(editingWord.remark || '');
    } else {
      // Reset form
      setWordType('noun');
      setLevel('A1');
      setCategory('greetings');
      setArticle('der');
      setGerman('');
      setEnglish('');
      setMyanmar('');
      setPlural('');
      setConjugationSummary('');
      setComparativeSummary('');
      setExampleGerman('');
      setExampleEnglish('');
      setExampleMyanmar('');
      setRemark('');
    }
    setError(null);
  }, [editingWord, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: Omit<VocabularyWord, 'id' | 'createdAt' | 'updatedAt'> = {
        type: wordType,
        level,
        category,
        german: german.trim(),
        english: english.trim(),
        myanmar: myanmar.trim(),
        exampleGerman: exampleGerman.trim() || undefined,
        exampleEnglish: exampleEnglish.trim() || undefined,
        exampleMyanmar: exampleMyanmar.trim() || undefined,
        remark: remark.trim() || undefined,
        ...(wordType === 'noun' && {
          article,
          plural: plural.trim() || undefined,
        }),
        ...(wordType === 'verb' && {
          conjugationSummary: conjugationSummary.trim() || undefined,
        }),
        ...(wordType === 'adjective' && {
          comparativeSummary: comparativeSummary.trim() || undefined,
        }),
      };

      if (editingWord) {
        await updateVocabularyWord(editingWord.id, payload);
      } else {
        await addVocabularyWord(payload);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error('Save word error:', err);
      setError(err.message || 'Failed to save vocabulary entry.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingWord) return;
    if (!window.confirm(`Are you sure you want to delete "${editingWord.german}"?`)) return;

    setLoading(true);
    try {
      await deleteVocabularyWord(editingWord.id);
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete word.');
    } finally {
      setLoading(false);
    }
  };

  const wordTypes: { id: WordType; label: string }[] = [
    { id: 'noun', label: 'Noun' },
    { id: 'verb', label: 'Verb' },
    { id: 'adjective', label: 'Adjective' },
    { id: 'phrase', label: 'Phrase' },
    { id: 'sentence', label: 'Sentence' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-[32px] max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {editingWord ? 'Edit Vocabulary Entry' : 'Add New Vocabulary Entry'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Word Type Pills */}
          <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-2xl">
            {wordTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setWordType(t.id)}
                className={cn(
                  'py-2 rounded-xl text-xs font-black transition-all text-center',
                  wordType === t.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* CEFR Level & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                CEFR Level *
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CEFRLevel)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800"
              >
                {CEFR_LEVELS_LIST.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl} ({lvl === 'A1' ? 'Beginner' : lvl === 'A2' ? 'Elementary' : lvl === 'B1' ? 'Intermediate' : lvl === 'B2' ? 'Upper' : lvl === 'C1' ? 'Advanced' : 'Mastery'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VocabularyCategory)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800"
              >
                {Object.entries(CATEGORIES_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.emoji} {meta.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Noun Article + German Word */}
          <div className="grid grid-cols-12 gap-3">
            {wordType === 'noun' && (
              <div className="col-span-4">
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                  Article *
                </label>
                <select
                  value={article}
                  onChange={(e) => setArticle(e.target.value as GermanArticle)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-900"
                >
                  <option value="der">der (Masc)</option>
                  <option value="die">die (Fem)</option>
                  <option value="das">das (Neut)</option>
                </select>
              </div>
            )}
            <div className={wordType === 'noun' ? 'col-span-8' : 'col-span-12'}>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                German Word / Phrase *
              </label>
              <input
                type="text"
                required
                value={german}
                onChange={(e) => setGerman(e.target.value)}
                placeholder="e.g. Apfel, lernen, gemütlich"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Translations: English & Myanmar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                English Translation *
              </label>
              <input
                type="text"
                required
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                placeholder="e.g. apple, to learn, cozy"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                Myanmar Translation (မြန်မာ)
              </label>
              <input
                type="text"
                value={myanmar}
                onChange={(e) => setMyanmar(e.target.value)}
                placeholder="e.g. ပန်းသီး, လေ့လာသည်"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Dynamic Extra Field depending on Word Type */}
          {wordType === 'noun' && (
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                Plural Form
              </label>
              <input
                type="text"
                value={plural}
                onChange={(e) => setPlural(e.target.value)}
                placeholder="e.g. die Äpfel, Bücher"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium"
              />
            </div>
          )}

          {wordType === 'verb' && (
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                Conjugations (3rd person • Präteritum • Partizip II)
              </label>
              <input
                type="text"
                value={conjugationSummary}
                onChange={(e) => setConjugationSummary(e.target.value)}
                placeholder="e.g. lernt • lernte • hat gelernt"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium"
              />
            </div>
          )}

          {wordType === 'adjective' && (
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                Comparative & Superlative Forms
              </label>
              <input
                type="text"
                value={comparativeSummary}
                onChange={(e) => setComparativeSummary(e.target.value)}
                placeholder="e.g. schneller • am schnellsten"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium"
              />
            </div>
          )}

          {/* Example Sentences */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-black uppercase text-slate-500">
              Example Sentence & Translations
            </span>
            <input
              type="text"
              value={exampleGerman}
              onChange={(e) => setExampleGerman(e.target.value)}
              placeholder="German: Ich esse jeden Morgen einen Apfel."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={exampleEnglish}
                onChange={(e) => setExampleEnglish(e.target.value)}
                placeholder="English: I eat an apple every morning."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
              />
              <input
                type="text"
                value={exampleMyanmar}
                onChange={(e) => setExampleMyanmar(e.target.value)}
                placeholder="Myanmar: ကျွန်တော် မနက်တိုင်း ပန်းသီးတစ်လုံး စားသည်။"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Grammar Remark */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
              Grammar Remark / Learning Tip
            </label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Nouns ending in -ung or -heit are always feminine ('die')"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {editingWord ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-2xl text-xs font-extrabold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving...' : editingWord ? 'Update Entry' : 'Save Entry'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
