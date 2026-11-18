import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { VocabularyWord } from '@/types';

const COLLECTION_NAME = 'vocabulary';

// Subscribe to real-time updates directly from Cloud Firestore
export const subscribeToVocabulary = (
  callback: (words: VocabularyWord[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('german', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const words: VocabularyWord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
        } as VocabularyWord;
      });
      callback(words);
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      callback([]);
      if (onError) onError(error);
    }
  );
};

// Fetch vocabulary directly from Cloud Firestore
export const getVocabularyList = async (): Promise<VocabularyWord[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('german', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as VocabularyWord[];
};

// Add a single word to Firestore
export const addVocabularyWord = async (
  wordData: Omit<VocabularyWord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const colRef = collection(db, COLLECTION_NAME);
  const newDocRef = doc(colRef);
  const now = Date.now();

  const newWord: VocabularyWord = {
    ...wordData,
    id: newDocRef.id,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, newWord);
  return newDocRef.id;
};

// Update an existing word in Firestore
export const updateVocabularyWord = async (
  id: string,
  wordData: Partial<VocabularyWord>
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...wordData,
    updatedAt: Date.now(),
  });
};

// Delete a word from Firestore
export const deleteVocabularyWord = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

export interface BatchImportResult {
  total: number;
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}

// Atomic batch write to Cloud Firestore with duplicate detection
export const batchImportVocabulary = async (
  rawEntries: Partial<VocabularyWord>[],
  overwriteDuplicates: boolean = false
): Promise<BatchImportResult> => {
  const currentWords = await getVocabularyList().catch(() => []);
  const existingMap = new Map<string, VocabularyWord>();

  currentWords.forEach((w) => {
    if (w.german) {
      existingMap.set(w.german.trim().toLowerCase(), w);
    }
  });

  const toAdd: VocabularyWord[] = [];
  const toUpdate: { id: string; data: Partial<VocabularyWord> }[] = [];
  let skipped = 0;
  const errors: string[] = [];
  const now = Date.now();

  for (const raw of rawEntries) {
    if (!raw.german || !raw.english) {
      errors.push(`Skipped row missing German word or English translation.`);
      continue;
    }

    const normKey = raw.german.trim().toLowerCase();
    const existing = existingMap.get(normKey);

    if (existing) {
      if (overwriteDuplicates) {
        toUpdate.push({
          id: existing.id,
          data: {
            ...raw,
            updatedAt: now,
          },
        });
      } else {
        skipped++;
      }
    } else {
      const newDocRef = doc(collection(db, COLLECTION_NAME));
      const wordObj: VocabularyWord = {
        id: raw.id || newDocRef.id,
        german: raw.german.trim(),
        english: raw.english.trim(),
        myanmar: raw.myanmar ? raw.myanmar.trim() : '',
        type: raw.type || 'noun',
        level: raw.level || 'A1',
        category: raw.category || 'other',
        article: raw.article,
        plural: raw.plural,
        exampleGerman: raw.exampleGerman,
        exampleEnglish: raw.exampleEnglish,
        exampleMyanmar: raw.exampleMyanmar,
        conjugationSummary: raw.conjugationSummary,
        comparativeSummary: raw.comparativeSummary,
        remark: raw.remark,
        createdAt: now,
        updatedAt: now,
      };
      toAdd.push(wordObj);
      existingMap.set(normKey, wordObj);
    }
  }

  // Chunk operations into batches of <= 450 (Firestore limit is 500)
  const CHUNK_SIZE = 450;
  let addedCount = 0;
  let updatedCount = 0;

  // Process Additions
  for (let i = 0; i < toAdd.length; i += CHUNK_SIZE) {
    const chunk = toAdd.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((w) => {
      const docRef = doc(db, COLLECTION_NAME, w.id);
      batch.set(docRef, w);
    });
    await batch.commit();
    addedCount += chunk.length;
  }

  // Process Updates
  for (let i = 0; i < toUpdate.length; i += CHUNK_SIZE) {
    const chunk = toUpdate.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((item) => {
      const docRef = doc(db, COLLECTION_NAME, item.id);
      batch.update(docRef, item.data);
    });
    await batch.commit();
    updatedCount += chunk.length;
  }

  return {
    total: rawEntries.length,
    added: addedCount,
    updated: updatedCount,
    skipped,
    errors,
  };
};
